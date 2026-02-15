import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, Survey, Question } from '@/lib/supabase'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function SurveyAnswer() {
  const { id } = useParams()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSurvey()
  }, [id])

  async function fetchSurvey() {
    setLoading(true)
    setError(null)

    const { data: surveyData, error: surveyError } = await supabase
      .from('mini_surveys')
      .select('*')
      .eq('id', id)
      .single()

    if (surveyError || !surveyData) {
      setError('Surveyが見つかりません')
      setLoading(false)
      return
    }

    if (surveyData.status !== 'published') {
      setError('このSurveyは現在回答を受け付けていません')
      setLoading(false)
      return
    }

    setSurvey(surveyData)

    const { data: questionsData } = await supabase
      .from('mini_survey_questions')
      .select('*')
      .eq('survey_id', id)
      .order('question_no', { ascending: true })

    if (questionsData) {
      setQuestions(questionsData)
      // Initialize answers
      const initialAnswers: Record<string, string | string[]> = {}
      questionsData.forEach(q => {
        initialAnswers[q.id] = q.type === 'multiple' ? [] : ''
      })
      setAnswers(initialAnswers)
    }

    setLoading(false)
  }

  function handleSingleAnswer(questionId: string, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  function handleMultipleAnswer(questionId: string, value: string, checked: boolean) {
    setAnswers(prev => {
      const current = (prev[questionId] as string[]) || []
      if (checked) {
        return { ...prev, [questionId]: [...current, value] }
      } else {
        return { ...prev, [questionId]: current.filter(v => v !== value) }
      }
    })
  }

  function handleOpenAnswer(questionId: string, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validation
    for (const question of questions) {
      const answer = answers[question.id]
      if (question.type === 'multiple') {
        if ((answer as string[]).length === 0) {
          alert(`Q${question.question_no}を選択してください`)
          return
        }
      } else {
        if (!answer || (typeof answer === 'string' && !answer.trim())) {
          alert(`Q${question.question_no}に回答してください`)
          return
        }
      }
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.from('mini_survey_responses').insert({
        survey_id: id,
        answers
      })

      if (error) throw error

      setSubmitted(true)
    } catch (err) {
      console.error('Submit error:', err)
      alert('送信に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">エラー</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">回答を送信しました</h2>
          <p className="text-gray-600">ご協力ありがとうございました。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{survey?.title}</h1>
          {survey?.description && (
            <p className="text-gray-600">{survey.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded mb-2">
                  Q{question.question_no}
                </span>
                <h3 className="text-lg font-medium text-gray-900">{question.title}</h3>
              </div>

              {question.type === 'single' && (
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleSingleAnswer(question.id, e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'multiple' && (
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={option}
                        checked={(answers[question.id] as string[])?.includes(option)}
                        onChange={(e) => handleMultipleAnswer(question.id, e.target.value, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'open' && (
                <textarea
                  value={answers[question.id] as string}
                  onChange={(e) => handleOpenAnswer(question.id, e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="回答を入力してください"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '送信中...' : '回答を送信'}
          </button>
        </form>
      </div>
    </div>
  )
}
