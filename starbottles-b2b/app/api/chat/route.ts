import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildSystemPrompt } from '@/lib/chatPrompt'
import type { ChatProduct } from '@/lib/chatFlows'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ── Rate limiter (30 req / IP / hour) ─────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 30
const RATE_WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

// ── Semantic query expansion ───────────────────────────────────────────────────
// Maps use-case keywords → product search terms the backend understands.
// "Bottle for coconut oil" → detects 'oil' → also searches 'oil bottle', 'boston bottle'
const SEMANTIC_MAP: Array<{ triggers: string[]; terms: string[] }> = [
  { triggers: ['coconut','olive','sesame','castor','mustard','oil'],       terms: ['oil bottle', 'boston bottle', 'hdpe bottle'] },
  { triggers: ['honey','jam','preserve','spread'],                          terms: ['honey jar', 'wide mouth jar', 'boston jar'] },
  { triggers: ['shampoo','conditioner','hair wash','hair oil'],             terms: ['pump bottle', 'lotion bottle', 'flip top bottle'] },
  { triggers: ['cream','moisturizer','lotion','face','body lotion'],        terms: ['cream jar', 'lotion bottle', 'airless pump'] },
  { triggers: ['serum','essence','toner','mist'],                           terms: ['serum bottle', 'dropper bottle', 'spray bottle'] },
  { triggers: ['spray','cleaner','disinfect','floor','glass cleaner'],      terms: ['trigger spray', 'spray bottle', 'hdpe bottle'] },
  { triggers: ['pharma','medicine','syrup','tablet','capsule','drug'],      terms: ['amber bottle', 'pharma bottle', 'dropper bottle'] },
  { triggers: ['dropper','eye drop','ear drop'],                            terms: ['dropper bottle', 'amber dropper', 'pet dropper'] },
  { triggers: ['ayurveda','herbal','organic','kadha','churna'],             terms: ['syrup bottle', 'oil bottle', 'herbal jar'] },
  { triggers: ['spice','masala','powder','chilli','turmeric'],              terms: ['spice jar', 'wide mouth jar', 'flip cap jar'] },
  { triggers: ['sauce','ketchup','pickle','chutney','mustard'],             terms: ['sauce bottle', 'squeeze bottle', 'flip top'] },
  { triggers: ['cosmetic','makeup','foundation','kajal'],                   terms: ['cosmetic bottle', 'pump bottle', 'airless bottle'] },
  { triggers: ['sanitizer','hand wash','liquid soap','soap'],               terms: ['pump bottle', 'flip top bottle', 'lotion pump'] },
  { triggers: ['perfume','fragrance','deo','deodorant'],                    terms: ['spray bottle', 'fine mist sprayer', 'pet bottle'] },
  { triggers: ['supplement','protein','nutraceutical','vitamin'],           terms: ['tablet container', 'hdpe jar', 'wide mouth jar'] },
  { triggers: ['baby','infant','child','kids'],                             terms: ['pet bottle', 'wide mouth bottle', 'pp bottle'] },
]

// Common typo corrections
const TYPO_MAP: Record<string, string> = {
  pharama: 'pharma', pharmaa: 'pharma', phamra: 'pharma',
  bottel: 'bottle', bottl: 'bottle', bootle: 'bottle',
  contaner: 'container', containr: 'container',
  plastik: 'plastic', plasic: 'plastic',
  cosmatic: 'cosmetic', cosmetik: 'cosmetic',
  ayurveda: 'ayurveda', ayurvedic: 'ayurveda',
}

const STOP_WORDS = new Set([
  'i','a','an','the','my','our','your','some','any','this','that','these','those',
  'need','want','looking','find','show','get','give','help','seeking','require',
  'for','me','us','please','can','could','would','should','will','do','does',
  'have','has','with','in','on','at','to','of','by','from','like','also','too',
  'and','or','but','is','are','am','be','been','being','was','were',
  'hi','hello','hey','ok','okay','thanks','thank','good','great','nice',
  'bottle','jar','container','packaging', // too generic alone — kept in semantic results
])

function correctTypos(message: string): string {
  return message.toLowerCase().split(/\s+/).map(w => TYPO_MAP[w] ?? w).join(' ')
}

// Extract size/capacity from message: "500ml", "1L", "250 ml", "2ltr" etc.
function extractCapacity(message: string): string | null {
  const match = message.match(/\b(\d+(?:\.\d+)?)\s*(ml|l\b|ltr|litre|liter|oz|cc)\b/i)
  return match ? `${match[1]}${match[2].toLowerCase().replace('litre','l').replace('liter','l').replace('ltr','l')}` : null
}

function expandToSearchTerms(message: string): string[] {
  const corrected = correctTypos(message)
  const lower = corrected.toLowerCase()

  // Base term: strip stop words from corrected message
  const base = corrected.split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w))
    .join(' ')

  const terms = new Set<string>()
  if (base) terms.add(base)

  // Semantic expansion
  for (const { triggers, terms: mapped } of SEMANTIC_MAP) {
    if (triggers.some(t => lower.includes(t))) {
      mapped.forEach(t => terms.add(t))
    }
  }

  // If a capacity is mentioned, add it as a standalone fallback search
  // so "500ml honey bottle" → also searches "500ml" to find any similar-sized product
  const capacity = extractCapacity(message)
  if (capacity) terms.add(capacity)

  // Also add the use-case search WITHOUT the capacity so we find all sizes
  // e.g. "500ml honey bottle" → also searches "honey bottle" (any size)
  if (capacity) {
    const withoutSize = base.replace(new RegExp(capacity, 'gi'), '').trim()
    if (withoutSize.length > 1) terms.add(withoutSize)
  }

  // Fallback: if only stop words remain, use original stripped message
  if (terms.size === 0) {
    const fallback = message.trim().toLowerCase().split(/\s+/)
      .filter(w => w.length > 1).join(' ')
    if (fallback) terms.add(fallback)
  }

  return Array.from(terms).slice(0, 5) // max 5 parallel searches
}

// ── Fetch products for a single search term ───────────────────────────────────
async function searchProducts(term: string): Promise<ChatProduct[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/v1/products?search=${encodeURIComponent(term)}&per_page=6`,
      { headers: { Accept: 'application/json' } }
    )
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

// ── Rule-based fallback response (used when OpenAI is unavailable) ────────────
function buildFallbackMessage(query: string, products: ChatProduct[]): string {
  if (products.length === 0) {
    return "I couldn't find an exact match. Please browse our full catalog or contact our team on WhatsApp for assistance."
  }
  const capacity = extractCapacity(query)
  if (capacity) {
    const exact = products.some(p => p.capacity?.toLowerCase().includes(capacity.toLowerCase()))
    if (!exact) {
      return `We don't have an exact ${capacity} match, but here are our closest options. Our team can advise on the best fit for your requirement.`
    }
  }
  return `Here are our best matching products for your requirement:`
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { message: "You've sent too many messages. Please try again in an hour.", products: [], show_rfq: false },
      { status: 429 }
    )
  }

  try {
    const { query, messages = [] } = await req.json()

    if (!query?.trim()) {
      return NextResponse.json({ message: 'Empty query', products: [], show_rfq: false }, { status: 400 })
    }

    // 1. Expand query into multiple semantic search terms
    const searchTerms = expandToSearchTerms(query)

    // 2. Run all searches in parallel
    const resultSets = await Promise.all(searchTerms.map(searchProducts))

    // 3. Deduplicate by product ID, preserve relevance order
    const seen = new Set<number>()
    const products: ChatProduct[] = []
    for (const batch of resultSets) {
      for (const p of batch) {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          products.push(p)
        }
      }
    }
    const uniqueProducts = products.slice(0, 10)

    // 4. Try GPT-4o — fall back to rule-based if unavailable
    let message: string
    let matchedProducts: ChatProduct[]

    try {
      const systemPrompt = buildSystemPrompt(uniqueProducts)
      const conversationMessages = (messages as { role: string; content: string }[])
        .slice(-10)
        .map(m => ({
          role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
          content: m.content,
        }))

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationMessages,
          { role: 'user', content: query },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
        temperature: 0.3,
      })

      const raw = completion.choices[0]?.message?.content ?? '{}'
      let parsed: { message?: string; product_names?: string[]; show_rfq?: boolean }
      try {
        parsed = JSON.parse(raw)
      } catch {
        parsed = { message: raw, product_names: [], show_rfq: false }
      }

      const mentionedNames = (parsed.product_names ?? []).map((n: string) => n.toLowerCase())
      matchedProducts = mentionedNames.length > 0
        ? uniqueProducts.filter(p => {
            const name = (p.display_name || p.title).toLowerCase()
            return mentionedNames.some(n => name.includes(n) || n.includes(name))
          })
        : uniqueProducts.slice(0, 4)

      message = parsed.message ?? buildFallbackMessage(query, matchedProducts)

      return NextResponse.json({ message, products: matchedProducts, show_rfq: parsed.show_rfq ?? false })

    } catch (aiErr: unknown) {
      // OpenAI unavailable (expired key, no credits, rate limit, timeout)
      // Silently fall back — user sees search results with a template message
      const isAiError = aiErr instanceof Error && (
        aiErr.message.includes('401') ||
        aiErr.message.includes('429') ||
        aiErr.message.includes('insufficient_quota') ||
        aiErr.message.includes('invalid_api_key') ||
        aiErr.message.includes('API key')
      )
      if (isAiError) {
        console.warn('[/api/chat] OpenAI unavailable — using rule-based fallback')
      } else {
        console.error('[/api/chat] OpenAI error:', aiErr)
      }

      matchedProducts = uniqueProducts.slice(0, 4)
      return NextResponse.json({
        message: buildFallbackMessage(query, matchedProducts),
        products: matchedProducts,
        show_rfq: false,
      })
    }
  } catch (err) {
    // Outer catch: request parsing or network errors (not OpenAI)
    console.error('[/api/chat error]', err)
    return NextResponse.json(
      { message: 'Something went wrong. Please try again or contact us on WhatsApp.', products: [], show_rfq: false },
      { status: 500 }
    )
  }
}
