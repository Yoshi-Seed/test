import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Survey {
  id: string
  title: string
  description: string | null
  status: 'draft' | 'published' | 'closed'
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  survey_id: string
  question_no: number
  type: 'single' | 'multiple' | 'open'
  title: string
  options: string[]
  created_at: string
}

export interface Response {
  id: string
  survey_id: string
  answers: Record<string, string | string[]>
  submitted_at: string
}
