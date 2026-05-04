import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are PTMOS, a peptide protocol tracking assistant and research companion.
Your job is to:
1. Help users LOG their data via structured tools (doses, water, weight, sleep, symptoms, inventory)
2. Provide EDUCATIONAL summaries about peptides and compounds using published research
3. Help users SET UP tracking templates for compounds they choose to track
4. Answer questions about a user's own logged data
LOGGING BEHAVIOR:
- When a user says they did something (took a dose, drank water, weighed themselves), call the appropriate tool immediately
- Do NOT ask for confirmation before calling a logging tool — the app handles confirmation UI
- Parse natural language amounts: "a gallon" = 128 oz, "a liter" = 33.8 oz, "half liter" = 16.9 oz
- For dose logging: if compound is clear but amount is missing, ask ONLY for the amount, nothing else
- For water: accept oz, mL, liters, gallons — always store as oz (convert internally)
- For weight: default to lbs unless user specifies kg
EDUCATIONAL BEHAVIOR:
- When asked about a peptide/compound, provide a factual educational summary
- Include: mechanism, research context, half-life, administration notes from published trials
- You MAY reference clinical trial dose ranges as educational/historical context with a disclaimer
- Always include: "This is educational information only. Consult a licensed clinician before use."
- Do NOT say "I can't answer that" for factual educational questions about compounds
PROTOCOL SETUP BEHAVIOR:
- When a user wants to "start tracking" or "add a protocol," help them create a tracking template
- Ask for: compound name (if not provided), dose amount, dose unit, frequency, time of day
- Do NOT prescribe. Say: "I'll set up a tracking template with whatever schedule you confirm."
- Never suggest a dose. Let the user provide the dose they have chosen.
STRICT LIMITS — never violate:
- Never say "you should take X mg"
- Never say "I recommend X"
- Never diagnose symptoms
- Never suggest where to purchase compounds
- If asked for purchase links: "I'm not able to help with sourcing. You can ask your provider."
- If asked "what dose should I take?": "I can't recommend a dose — that's between you and your clinician. For educational context, published trials used [range] but that is not a recommendation."
TONE:
- Short, direct, mobile-friendly
- Friendly but not overly enthusiastic
- No unnecessary disclaimers on simple logging actions`

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
      name: 'log_water',
      description: 'Log water intake the user drank. Convert all units to oz before calling.',
      parameters: {
        type: 'object',
        properties: {
          amount_oz: { type: 'number', description: 'Amount in fluid ounces. Convert: 1 gallon=128oz, 1 liter=33.8oz, 1 mL=0.0338oz, 1 cup=8oz' },
        },
        required: ['amount_oz'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_weight',
      description: 'Log the user body weight',
      parameters: {
        type: 'object',
        properties: {
          value: { type: 'number', description: 'Weight value' },
          unit: { type: 'string', enum: ['lbs', 'kg'], description: 'Unit, default lbs' },
        },
        required: ['value'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_symptom',
      description: 'Log a symptom or side effect',
      parameters: {
        type: 'object',
        properties: {
          symptom: { type: 'string', description: 'Symptom name or description' },
          severity: { type: 'number', description: 'Severity 1-10 if mentioned' },
          notes: { type: 'string', description: 'Any extra notes' },
        },
        required: ['symptom'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_steps',
      description: 'Log step count for today',
      parameters: {
        type: 'object',
        properties: {
          steps: { type: 'number', description: 'Number of steps. Parse "1K" as 1000, "10K" as 10000.' },
        },
        required: ['steps'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_sleep',
      description: 'Log hours of sleep',
      parameters: {
        type: 'object',
        properties: {
          hours: { type: 'number', description: 'Hours slept' },
        },
        required: ['hours'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_inventory',
      description: 'Add a new vial or compound to the user inventory',
      parameters: {
        type: 'object',
        properties: {
          peptide_name: { type: 'string', description: 'Compound name e.g. BPC-157' },
          vial_mg: { type: 'number', description: 'Vial size in mg' },
          quantity: { type: 'number', description: 'Number of vials, default 1' },
          bac_water_ml: { type: 'number', description: 'BAC water used for reconstitution if mentioned' },
        },
        required: ['peptide_name', 'vial_mg'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reconstitute',
      description: 'Calculate reconstitution concentration. Call when user has a vial size and water volume.',
      parameters: {
        type: 'object',
        properties: {
          peptide: { type: 'string', description: 'Peptide name if mentioned' },
          vialMg: { type: 'number', description: 'Vial size in mg' },
          waterMl: { type: 'number', description: 'BAC water volume in mL' },
        },
        required: ['vialMg', 'waterMl'],
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

    const { message, context, imageBase64 } = await req.json() as {
      message: string
      imageBase64?: string | null
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

    const userContent: unknown[] = imageBase64
      ? [
          { type: 'text', text: message || 'Describe this image and help me log or understand it.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'low' } },
        ]
      : [{ type: 'text', text: message }]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: imageBase64 ? 'gpt-4o' : 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + '\n\n' + contextBlock },
          { role: 'user', content: userContent },
        ],
        tools: TOOLS,
        tool_choice: 'auto',
        max_tokens: 300,
      }),
    })

    const data = await response.json()

    // Surface OpenAI errors clearly
    if (!response.ok || data.error) {
      const errMsg = data.error?.message ?? `OpenAI error ${response.status}`
      console.error('[chat-ai] OpenAI error:', JSON.stringify(data.error))
      return new Response(
        JSON.stringify({ type: 'fallback', reason: errMsg }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

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
      JSON.stringify({ type: 'message', text: choice?.message?.content ?? "I couldn't understand that." }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (e) {
    return new Response(
      JSON.stringify({ type: 'fallback', reason: String(e) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
