import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Coins } from 'lucide-react'
import Layout from './Layout'

function MiniSurveyComplete({ onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { surveyId } = useParams()

  const awardedPoints = location.state?.awardedPoints ?? 100

  return (
    <Layout onLogout={onLogout}>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 text-center">
        <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">回答ありがとうございました</h1>
        <p className="text-gray-600 mb-6">
          Mini Survey（{surveyId}）の回答を受け付けました。
        </p>

        <div className="inline-flex items-center px-6 py-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 font-semibold mb-8">
          <Coins className="h-5 w-5 mr-2 text-yellow-500" />
          付与ポイント: {awardedPoints}pt
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 rounded-md bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
          >
            ダッシュボードへ戻る
          </button>
          <button
            onClick={() => navigate(`/mini-survey/${surveyId}`)}
            className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200"
          >
            回答内容を確認
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default MiniSurveyComplete
