import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase, Question } from '@/lib/supabase'
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react'

interface QuestionForm {
  id?: string
  question_no: number
  type: 'single' | 'multiple' | 'open'
  title: string
  options: string[]
}

export default function SurveyCreate() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { question_no: 1, type: 'single', title: '', options: ['', ''] }
  ])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEditing) {
      fetchSurvey()
    }
  }, [id])

  async function fetchSurvey() {
    const { data: survey } = await supabase
      .from('mini_surveys')
      .select('*')
      .eq('id', id)
      .single()

    if (survey) {
      setTitle(survey.title)
      setDescription(survey.description || '')

      const { data: questionsData } = await supabase
        .from('mini_survey_questions')
        .select('*')
        .eq('survey_id', id)
        .order('question_no', { ascending: true })

      if (questionsData && questionsData.length > 0) {
        setQuestions(questionsData.map(q => ({
          id: q.id,
          question_no: q.question_no,
          type: q.type,
          title: q.title,
          options: q.options || ['', '']
        })))
      }
    }
  }

  function addQuestion() {
    if (questions.length >= 5) {
      alert('設問は最大5問までです')
      return
    }
    setQuestions([
      ...questions,
      { question_no: questions.length + 1, type: 'single', title: '', options: ['', ''] }
    ])
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) return
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions.map((q, i) => ({ ...q, question_no: i + 1 })))
  }

  function updateQuestion(index: number, field: keyof QuestionForm, value: any) {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setQuestions(newQuestions)
  }

  function addOption(questionIndex: number) {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.push('')
    setQuestions(newQuestions)
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    const newQuestions = [...questions]
    if (newQuestions[questionIndex].options.length <= 2) return
    newQuestions[questionIndex].options.splice(optionIndex, 1)
    setQuestions(newQuestions)
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  async function handleSave() {
    if (!title.trim()) {
      alert('タイトルを入力してください')
      return
    }

    for (const q of questions) {
      if (!q.title.trim()) {
        alert('すべての設問に質問文を入力してください')
        return
      }
      if (q.type !== 'open' && q.options.some(o => !o.trim())) {
        alert('すべての選択肢を入力してください')
        return
      }
    }

    setSaving(true)

    try {
      let surveyId = id

      if (isEditing) {
        await supabase
          .from('mini_surveys')
          .update({
            title,
            description: description || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        // Delete existing questions and recreate
        await supabase
          .from('mini_survey_questions')
          .delete()
          .eq('survey_id', id)
      } else {
        const { data: newSurvey } = await supabase
          .from('mini_surveys')
          .insert({
            title,
            description: description || null,
            status: 'draft'
          })
          .select()
          .single()

        surveyId = newSurvey?.id
      }

      // Insert questions
      if (surveyId) {
        await supabase.from('mini_survey_questions').insert(
          questions.map(q => ({
            survey_id: surveyId,
            question_no: q.question_no,
            type: q.type,
            title: q.title,
            options: q.type === 'open' ? [] : q.options.filter(o => o.trim())
          }))
        )
      }

      navigate('/')
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          戻る
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            {isEditing ? 'Surveyを編集' : '新規Survey作成'}
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 商品満足度調査"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明文（任意）
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="回答者に表示される説明文"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GripVertical size={20} className="text-gray-400" />
                  <span className="font-semibold text-gray-900">Q{question.question_no}</span>
                </div>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    質問文 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={question.title}
                    onChange={(e) => updateQuestion(qIndex, 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="質問を入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    回答タイプ
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="single">単一選択（ラジオボタン）</option>
                    <option value="multiple">複数選択（チェックボックス）</option>
                    <option value="open">自由記述（テキスト）</option>
                  </select>
                </div>

                {question.type !== 'open' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      選択肢
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm w-6">{oIndex + 1}.</span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`選択肢${oIndex + 1}`}
                          />
                          {question.options.length > 2 && (
                            <button
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addOption(qIndex)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      + 選択肢を追加
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {questions.length < 5 && (
          <button
            onClick={addQuestion}
            className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            設問を追加（最大5問）
          </button>
        )}

        <div className="mt-8 flex items-center justify-end gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 text-gray-600 hover:text-gray-900"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
