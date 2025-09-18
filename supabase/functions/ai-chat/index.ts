// supabase/functions/ai-chat/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatRequest {
  message: string
  towerId: string
  studentName: string
  selectedSources: string[]
  gradeLevel?: string
}

interface TowerContext {
  tower: {
    name: string
    ports: number
    created_at: string
  }
  vitals: any[]
  plantings: any[]
  harvests: any[]
  photos: any[]
  pest_logs: any[]
  waste_logs: any[]
}

Deno.serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, towerId, studentName, selectedSources, gradeLevel }: ChatRequest = await req.json()

    if (!message || !towerId || !studentName) {
      throw new Error("Message, tower ID, and student name are required.")
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get tower context using existing function
    const { data: towerData, error: towerError } = await supabase
      .rpc('get_tower_resources', { p_tower_id: towerId })

    if (towerError) {
      throw new Error(`Failed to fetch tower data: ${towerError.message}`)
    }

    // Build context from selected sources
    const context = buildContextFromSources(towerData, selectedSources)
    
    // Build the prompt for Gemini
    const prompt = buildEducationalPrompt(context, message, studentName, gradeLevel)

    // Call Gemini API
    const geminiResponse = await callGeminiAPI(prompt)

    // Log usage for tracking
    await logUsage(supabase, {
      towerId,
      studentName,
      promptTokens: estimateTokens(prompt),
      responseTokens: estimateTokens(geminiResponse),
      message,
      selectedSources
    })

    return new Response(
      JSON.stringify({
        success: true,
        response: geminiResponse,
        context: {
          towerName: context.tower.name,
          sourcesUsed: selectedSources.length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('AI Chat error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function buildContextFromSources(towerData: any, selectedSources: string[]): TowerContext {
  return {
    tower: {
      name: towerData.tower_name || 'Unknown Tower',
      ports: towerData.ports || 0,
      created_at: towerData.created_at || new Date().toISOString()
    },
    vitals: towerData.tower_vitals?.filter((v: any) => 
      selectedSources.includes(`vital-${v.id}`)
    ) || [],
    plantings: towerData.plantings?.filter((p: any) => 
      selectedSources.includes(`planting-${p.id}`)
    ) || [],
    harvests: towerData.harvests?.filter((h: any) => 
      selectedSources.includes(`harvest-${h.id}`)
    ) || [],
    photos: towerData.tower_photos?.filter((p: any) => 
      selectedSources.includes(`photo-${p.id}`)
    ) || [],
    pest_logs: towerData.pest_logs?.filter((p: any) => 
      selectedSources.includes(`pest-${p.id}`)
    ) || [],
    waste_logs: towerData.waste_logs?.filter((w: any) => 
      selectedSources.includes(`waste-${w.id}`)
    ) || []
  }
}

function buildEducationalPrompt(context: TowerContext, message: string, studentName: string, gradeLevel?: string): string {
  const gradePrompt = getGradeLevelPrompt(gradeLevel)
  
  return `You are an AI research assistant helping students explore their hydroponic tower data. 

STUDENT CONTEXT:
- Student: ${studentName}
- Grade Level: ${gradeLevel || 'Elementary'}
- Tower: ${context.tower.name} (${context.tower.ports} ports)

EDUCATIONAL GUIDELINES:
${gradePrompt}

TOWER DATA CONTEXT:
${JSON.stringify(context, null, 2)}

INSTRUCTIONS:
1. Answer the student's question using the tower data provided
2. Use age-appropriate language and explanations
3. Encourage scientific thinking and observation
4. If data is missing, suggest what the student could observe or measure
5. Connect findings to broader scientific concepts when appropriate
6. Be encouraging and supportive

STUDENT QUESTION: ${message}

RESPONSE:`
}

function getGradeLevelPrompt(gradeLevel?: string): string {
  const prompts = {
    'K-2': 'Use simple words and short sentences. Focus on colors, shapes, and basic concepts. Use lots of encouragement.',
    '3-5': 'Use age-appropriate vocabulary. Include simple explanations of scientific concepts. Ask follow-up questions.',
    '6-8': 'Use more complex vocabulary. Include scientific reasoning and cause-and-effect relationships.',
    '9-12': 'Use advanced vocabulary. Include detailed scientific explanations and analysis.'
  }
  return prompts[gradeLevel as keyof typeof prompts] || prompts['3-5']
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    }
  )

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${errorData}`)
  }

  const data = await response.json()
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API')
  }

  return data.candidates[0].content.parts[0].text
}

function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

async function logUsage(supabase: any, usage: {
  towerId: string
  studentName: string
  promptTokens: number
  responseTokens: number
  message: string
  selectedSources: string[]
}) {
  try {
    const totalTokens = usage.promptTokens + usage.responseTokens
    const estimatedCost = totalTokens * 0.0000025 // Gemini 1.5 Flash pricing

    await supabase.from('ai_usage_logs').insert({
      tower_id: usage.towerId,
      student_name: usage.studentName,
      prompt_tokens: usage.promptTokens,
      response_tokens: usage.responseTokens,
      total_tokens: totalTokens,
      estimated_cost: estimatedCost,
      message: usage.message,
      sources_used: usage.selectedSources.length,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log usage:', error)
    // Don't throw - logging failure shouldn't break the chat
  }
}