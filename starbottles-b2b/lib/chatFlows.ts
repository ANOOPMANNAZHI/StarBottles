// ── Types ────────────────────────────────────────────────────────────────────

export type ChatState =
  | 'greeting'
  | 'subcategory'
  | 'loading'
  | 'products_shown'
  | 'quote_form'
  | 'submitted'

export type ChatProduct = {
  id: number
  item_code: string
  title: string
  display_name: string | null
  category: { id: number; name: string } | null
  material: string
  capacity: string
  first_image: string | null
  share_url: string
}

export type ChatMessage = {
  id: string
  from: 'bot' | 'user'
  text?: string
  quickReplies?: Array<{ label: string; value: string }>
  products?: ChatProduct[]
  showForm?: boolean
}

export type ChatSession = {
  state: ChatState
  messages: ChatMessage[]
  selectedIndustry?: string
  selectedProduct?: { name: string }
}

export type LeadFormData = {
  phone: string
  name: string
  email: string
  business_type: string
  message: string
}

// ── Industry flows config ─────────────────────────────────────────────────────

export const industryFlows: Record<string, {
  label: string
  subcategories: Record<string, string>
}> = {
  cosmetics: {
    label: 'Cosmetics',
    subcategories: {
      'Lotion Bottles':  'lotion bottle',
      'Cream Jars':      'cream jar',
      'Pump Bottles':    'pump bottle',
      'Serum Bottles':   'serum bottle',
    },
  },
  pharma: {
    label: 'Pharma',
    subcategories: {
      'Amber PET Bottles':  'amber pet bottle',
      'Dropper Bottles':    'dropper bottle',
      'Syrup Bottles':      'syrup bottle',
      'Tablet Containers':  'tablet container',
    },
  },
  food: {
    label: 'Food',
    subcategories: {
      'Honey Jars':     'honey jar',
      'Spice Jars':     'spice jar',
      'Sauce Bottles':  'sauce bottle',
      'Oil Bottles':    'oil bottle',
    },
  },
  homeCare: {
    label: 'Home Care',
    subcategories: {
      'Trigger Spray Bottles':  'trigger spray',
      'Flip-Top Bottles':       'flip top bottle',
      'Refill Containers':      'refill container',
    },
  },
  ayurveda: {
    label: 'Ayurveda',
    subcategories: {
      'Syrup Bottles':  'syrup bottle',
      'Oil Bottles':    'oil bottle',
      'Herbal Jars':    'herbal jar',
    },
  },
}

export const INDUSTRY_BUTTONS = [
  { label: '💄 Cosmetics',  value: 'cosmetics' },
  { label: '💊 Pharma',     value: 'pharma' },
  { label: '🍯 Food',       value: 'food' },
  { label: '🧹 Home Care',  value: 'homeCare' },
  { label: '🌿 Ayurveda',   value: 'ayurveda' },
  { label: '🔍 Other',      value: '__other__' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

let _id = 0
export function createMessage(
  from: 'bot' | 'user',
  partial: Partial<ChatMessage>
): ChatMessage {
  return { id: `msg_${++_id}_${Date.now()}`, from, ...partial }
}

export const INITIAL_MESSAGE: ChatMessage = createMessage('bot', {
  text: "Hi! I'm StarBot 👋\n\nI help wholesale buyers find the right packaging. What industry are you in?",
  quickReplies: INDUSTRY_BUTTONS,
})

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
