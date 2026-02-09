import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Coins } from 'lucide-react'
import Layout from './Layout'

const miniSurveyQuestionSet = [
  {
    id: 'q1',
    type: 'single',
    question: '現在の主な勤務形態を選択してください。',
    options: ['病院勤務', 'クリニック勤務', 'その他']
  },
  {
    id: 'q2',
    type: 'multi',
    question: '日常診療で重視している情報源をすべて選択してください。',
    options: ['学会発表', '論文', '同僚医師の意見', '製薬企業の情報提供']
  },
  {
    id: 'q3',
    type: 'scale',
    question: 'オンライン診療への関心度を教えてください。',
    scaleMin: 1,
    scaleMax: 5
  },
  {
    id: 'q4',
    type: 'text',
    question: 'ミニサーベイに関するご意見があれば記載してください。'
  }
]

function MiniSurveyAnswer({ onLogout }) {
  const { surveyId } = useParams()
  const navigate = useNavigate()

  const [responseStatus, setResponseStatus] = useState(
    surveyId === 'MS-2026-002' ? 'answered' : 'unanswered'
  )
  const [answers, setAnswers] = useState({ q1: '', q2: [], q3: '', q4: '' })
  const [errors, setErrors] = useState({})

  const isAnswered = responseStatus === 'answered'

  const surveyTitle = useMemo(
    () => `Mini Survey (${surveyId})`,
    [surveyId]
  )

  const handleSingleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleMultiAnswer = (questionId, value) => {
    setAnswers((prev) => {
      const currentValues = prev[questionId]
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value]

      return { ...prev, [questionId]: updatedValues }
    })
  }

  const validateAnswers = () => {
    const validationErrors = {}

    miniSurveyQuestionSet.forEach((question) => {
      const answer = answers[question.id]

      if (question.type === 'multi' && answer.length === 0) {
        validationErrors[question.id] = '1つ以上選択してください。'
      }

      if (question.type !== 'multi' && String(answer).trim() === '') {
        validationErrors[question.id] = 'この質問は必須です。'
      }
    })

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (isAnswered) {
      return
    }

    if (!validateAnswers()) {
      return
    }

    setResponseStatus('answered')
    navigate(`/mini-survey/${surveyId}/complete`, {
      state: {
        surveyId,
        awardedPoints: 100
      }
    })
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{surveyTitle}</h1>
          <p className="text-gray-600">質問にご回答ください（全問必須）</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-primary-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">回答ステータス</p>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              isAnswered ? 'bg-gray-100 text-gray-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isAnswered ? '回答済み' : '未回答'}
            </span>
          </div>
          {isAnswered && (
            <p className="mt-3 text-sm text-gray-600 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
              このMini Surveyには既に回答済みです。
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {miniSurveyQuestionSet.map((question, index) => (
            <div key={question.id} className="p-6">
              <p className="text-base font-semibold text-gray-900 mb-4">
                Q{index + 1}. {question.question}
              </p>

              {question.type === 'single' && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label key={option} className="flex items-center text-sm text-gray-700">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleSingleAnswer(question.id, option)}
                        disabled={isAnswered}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'multi' && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label key={option} className="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        value={option}
                        checked={answers[question.id].includes(option)}
                        onChange={() => handleMultiAnswer(question.id, option)}
                        disabled={isAnswered}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'scale' && (
                <div className="flex items-center space-x-2">
                  {Array.from(
                    { length: question.scaleMax - question.scaleMin + 1 },
                    (_, offset) => question.scaleMin + offset
                  ).map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => handleSingleAnswer(question.id, String(score))}
                      disabled={isAnswered}
                      className={`w-10 h-10 rounded-md border text-sm font-semibold ${
                        answers[question.id] === String(score)
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'text' && (
                <textarea
                  value={answers[question.id]}
                  onChange={(event) => handleSingleAnswer(question.id, event.target.value)}
                  rows={4}
                  disabled={isAnswered}
                  placeholder="ご記入ください"
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              )}

              {errors[question.id] && (
                <p className="text-sm text-red-600 mt-3">{errors[question.id]}</p>
              )}
            </div>
          ))}

          <div className="p-6 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-600 flex items-center">
              <Coins className="h-4 w-4 mr-1 text-yellow-500" />
              回答完了で100pt付与
            </p>
            <button
              type="submit"
              disabled={isAnswered}
              className={`px-6 py-2 rounded-md text-sm font-semibold ${
                isAnswered
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isAnswered ? '回答済み' : '送信する'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default MiniSurveyAnswer
