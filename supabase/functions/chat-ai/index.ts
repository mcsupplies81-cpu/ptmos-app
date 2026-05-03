import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are PTMOS, a peptide protocol tracking assistant.
You help users log their doses, symptoms, weight, sleep, and lifestyle data.
You answer questions about their personal tracking data.
You provide motivational insights based on their logged data.

STRICT RULES — never violate these:
- Never recommend, prescribe, or suggest specific peptide dosages
- Never recommend starting, stopping, or changing a protocol
- Never diagnose symptoms or suggest medical treatment
- If asked for medical advice, say: "I can help you track data and prepare questions for your provider, but I can't give medical advice."
- Only log what the user explicitly tells you — never infer a dose amount

When the user wants to LOG something, call the appropriate tool.
When the user asks a QUESTION about their data, answer conversationally using the context provided.
Keep responses short and conversational. This is a mobile app.`

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'log_dose',
      description: 'Log a peptide or compound dose the user just took',
      parameters: {
        type: 'object',
        properties: {
          peptide: { type: 'string', description: 'Name of the compound e.g. BPC-157' },
          amount: { type: 'number', description: 'Numeric dose amount' },
          unit: { type: 'string', enum: ['mcg', 'mg', 'IU', 'mL'], description: 'Dose unit' },
          site: { type: 'string', description: 'Injection site if mentioned e.g. right abdomen' },
        },
        required: ['amount', 'unit'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_symptom',
      description: 'Log a symptom or side effect the user is experiencing',
      parameters: {
        type: 'object',
        properties: {
          symptom: { type: 'string', description: 'Symptom name or description' },
          severity: { type: 'number', description: 'Severity 1-10 if mentioned' },
        },
        required: ['symptom'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_weight',
      description: 'Log the user\'s body weight',
      parameters: {
        type: 'object',
        properties: {
          value: { type: 'number', description: 'Weight in lbs' },
        },
        required: ['value'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_sleep',
      description: 'Log how many hours the user slept',
      parameters: {
        type: 'object',
        properties: {
          hours: { type: 'number', description: 'Hours of sleep' },
        },
        required: ['hours'],
      },
    },
  },
]

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openaiKey || openaiKey === 'placeholder') {
      return new Response(
        JSON.stringify({ type: 'fallback', reason: 'AI not configured yet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const { message, context } = await req.json() as {
      message: string
      context: {
        protocols: Array<{ name: string; dose_amount: number; dose_unit: string; frequency: string; status: string }>
        recentDoses: Array<{ peptide_name: string | null; amount: number; unit: string; logged_at: string }>
        adherencePct: number
        streakDays: number
      }
    }

    const contextBlock = `
USER DATA CONTEXT:
- Active protocols: ${context.protocols.filter(p => p.status === 'active').map(p => `${p.name} ${p.dose_amount}${p.dose_unit} ${p.frequency}`).join(', ') || 'none'}
- 7-day adherence: ${context.adherencePct}%
- Current streak: ${context.streakDays} days
- Recent doses: ${context.recentDoses.slice(0, 3).map(d => `${d.peptide_name ?? 'unknown'} ${d.amount}${d.unit} on ${d.logged_at.slice(0, 10)}`).join(', ') || 'none'}
`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + '\n\n' + contextBlock },
          { role: 'user', content: message },
        ],
        tools: TOOLS,
        tool_choice: 'auto',
        max_tokens: 300,
      }),
    })

    const data = await response.json()
    const choice = data.choices?.[0]

    if (choice?.message?.tool_calls?.[0]) {
      const tc = choice.message.tool_calls[0]
      let payload: Record<string, unknown> = {}
      try { payload = JSON.parse(tc.function.arguments) } catch {}
      return new Response(
        JSON.stringify({ type: 'action', intent: tc.function.name, payload }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ type: 'message', text: choice?.message?.content ?? "I couldn't process that." }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (e) {
    return new Response(
      JSON.stringify({ type: 'fallback', reason: String(e) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
