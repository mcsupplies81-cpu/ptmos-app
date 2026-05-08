import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are an AI research companion built into PT-OS, a peptide protocol tracking app. You help users understand peptide research, optimize their protocols, log health metrics, and get the most from their self-optimization journey.
You have deep knowledge of peptide research including but not limited to: BPC-157, TB-500, CJC-1295, Ipamorelin, Sermorelin, Hexarelin, GHRP-2, GHRP-6, Tesamorelin, Epithalon, Selank, Semax, PT-141, Melanotan II, AOD-9604, GHK-Cu, Thymosin Alpha-1, NAD+, 5-Amino-1MQ, and others. You understand typical protocols, dosing ranges from published research, common stacks, injection timing, reconstitution, storage, and reported outcomes.
You can discuss: mechanism of action, research-backed dosing windows, synergistic stacks, cycle lengths, PCT, peptide storage, reconstitution math, injury recovery protocols, sleep optimization, GH pulse timing, and lifestyle factors that affect outcomes.
Always frame your responses as educational information based on research literature and community experience — not medical advice. Remind users to consult a healthcare provider for medical decisions when relevant, but don't repeat this disclaimer on every message — once per conversation is enough.
You are conversational, knowledgeable, and direct. Match the user's tone. If they're casual, be casual. Don't be overly cautious or hedge every sentence. Be the informed research buddy they don't have in real life.
When the user asks about their specific protocols or metrics, use the context provided below about their current stack and recent activity to give personalized, relevant responses.
If the user's message is a logging request (took a dose, drank water, weighed in, etc.), extract that intent and return it in the structured JSON format. For all other messages, respond conversationally in plain text.`

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

    const { message, context, imageBase64, systemPrompt, userContext } = await req.json() as {
      message: string
      imageBase64?: string | null
      systemPrompt?: string
      userContext?: string
      context: {
        protocols: Array<{ name: string; dose_amount: number; dose_unit: string; frequency: string; time_of_day?: string; status: string; compound_description?: string | null }>
        recentDoses: Array<{ peptide_name: string | null; amount: number; unit: string; logged_at: string }>
        lifestyleToday?: { water_oz: number | null; sleep_hours: number | null; weight_lbs: number | null; steps: number | null } | null
        recentSymptoms?: Array<{ symptom: string; severity: number; logged_at: string }>
        goal?: string | null
        userContext?: string
        adherencePct: number
        streakDays: number
      }
    }

    const activeProtocols = context.protocols.filter(p => p.status === 'active')
    const contextBlock = userContext || context.userContext || `
[USER CONTEXT]
Goal: ${context.goal ?? 'not set'}
Active protocols: ${activeProtocols.map(p => `${p.name} ${p.dose_amount}${p.dose_unit} ${p.frequency}${p.time_of_day ? ` at ${p.time_of_day}` : ''}${p.compound_description ? ` — ${p.compound_description}` : ''}`).join(', ') || 'none'}
Today: water ${context.lifestyleToday?.water_oz ?? 'not logged'}oz, sleep ${context.lifestyleToday?.sleep_hours ?? 'not logged'}h, weight ${context.lifestyleToday?.weight_lbs ?? 'not logged'}lbs, steps ${context.lifestyleToday?.steps ?? 'not logged'}
Recent symptoms: ${(context.recentSymptoms ?? []).slice(0, 3).map(s => `${s.symptom} (${s.severity}/10) on ${s.logged_at.slice(0, 10)}`).join(', ') || 'none'}
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
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: (systemPrompt ?? SYSTEM_PROMPT) + '\n\n' + contextBlock + `\n- 7-day adherence: ${context.adherencePct}%\n- Current streak: ${context.streakDays} days\n- Recent doses: ${context.recentDoses.slice(0, 7).map(d => `${d.peptide_name ?? 'unknown'} ${d.amount}${d.unit} on ${d.logged_at.slice(0, 10)}`).join(', ') || 'none'}` },
          { role: 'user', content: userContent },
        ],
        tools: TOOLS,
        tool_choice: 'auto',
        max_tokens: 300,
        stream: true,
      }),
    })

    if (!response.ok || !response.body) {
      let errMsg = `OpenAI error ${response.status}`
      try {
        const data = await response.json()
        errMsg = data.error?.message ?? errMsg
        console.error('[chat-ai] OpenAI error:', JSON.stringify(data.error))
      } catch {
        errMsg = await response.text().catch(() => errMsg)
      }
      return new Response(
        JSON.stringify({ type: 'fallback', reason: errMsg }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()

    type ToolCallDelta = {
      id?: string
      type?: string
      function: {
        name?: string
        arguments: string
      }
    }
    const toolCalls: ToolCallDelta[] = []

    const sendDone = async () => {
      const toolCall = toolCalls.find(tc => tc.function.name)
      if (toolCall?.function.name) {
        let payload: Record<string, unknown> = {}
        try { payload = JSON.parse(toolCall.function.arguments || '{}') } catch {}
        await writer.write(encoder.encode(`event: action\ndata: ${JSON.stringify({ type: 'action', intent: toolCall.function.name, payload })}\n\n`))
      }
      await writer.write(encoder.encode('data: [DONE]\n\n'))
    }

    ;(async () => {
      const reader = response.body!.getReader()
      let buffer = ''
      let doneSent = false

      const processLine = async (rawLine: string) => {
        const line = rawLine.trimEnd()
        if (!line.startsWith('data: ')) return
        const data = line.slice(6)
        if (data === '[DONE]') {
          doneSent = true
          await sendDone()
          return
        }

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta
          const content = delta?.content
          if (typeof content === 'string' && content.length > 0) {
            await writer.write(encoder.encode(`data: ${content}\n\n`))
          }

          for (const toolDelta of delta?.tool_calls ?? []) {
            const index = toolDelta.index ?? 0
            toolCalls[index] ??= { function: { arguments: '' } }
            if (toolDelta.id) toolCalls[index].id = toolDelta.id
            if (toolDelta.type) toolCalls[index].type = toolDelta.type
            if (toolDelta.function?.name) toolCalls[index].function.name = toolDelta.function.name
            if (toolDelta.function?.arguments) toolCalls[index].function.arguments += toolDelta.function.arguments
          }
        } catch (e) {
          console.error('[chat-ai] stream parse error:', e)
        }
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) await processLine(line)
        }

        const remaining = buffer + decoder.decode()
        if (remaining) {
          for (const line of remaining.split('\n')) await processLine(line)
        }
        if (!doneSent) await sendDone()
      } catch (e) {
        console.error('[chat-ai] stream error:', e)
        await writer.write(encoder.encode(`event: error\ndata: ${JSON.stringify({ type: 'error', reason: String(e) })}\n\n`))
      } finally {
        await writer.close()
      }
    })()

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })

  } catch (e) {
    return new Response(
      JSON.stringify({ type: 'fallback', reason: String(e) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
