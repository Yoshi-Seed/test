import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, Survey, Response } from '@/lib/supabase'
import { Plus, ExternalLink, Download, Trash2, Eye } from 'lucide-react'

export default function SurveyList() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSurveys()
  }, [])

  async function fetchSurveys() {
    setLoading(true)
    const { data: surveysData } = await supabase
      .from('mini_surveys')
      .select('*')
      .order('created_at', { ascending: false })

    if (surveysData) {
      setSurveys(surveysData)

      // Get response counts for each survey
      const counts: Record<string, number> = {}
      for (const survey of surveysData) {
        const { count } = await supabase
          .from('mini_survey_responses')
          .select('*', { count: 'exact', head: true })
          .eq('survey_id', survey.id)
        counts[survey.id] = count || 0
      }
      setResponseCounts(counts)
    }
    setLoading(false)
  }

  async function deleteSurvey(id: string) {
    if (!confirm('このSurveyを削除しますか？')) return
    await supabase.from('mini_surveys').delete().eq('id', id)
    fetchSurveys()
  }

  async function toggleStatus(survey: Survey) {
    const newStatus = survey.status === 'published' ? 'closed' : 'published'
    await supabase
      .from('mini_surveys')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', survey.id)
    fetchSurveys()
  }

  async function downloadCSV(surveyId: string, surveyTitle: string) {
    // Fetch responses
    const { data: responses } = await supabase
      .from('mini_survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .order('submitted_at', { ascending: true })

    // Fetch questions
    const { data: questions } = await supabase
      .from('mini_survey_questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('question_no', { ascending: true })

    if (!responses || !questions) return

    // Build CSV
    const headers = ['回答ID', '回答日時', ...questions.map(q => `Q${q.question_no}: ${q.title}`)]
    const rows = responses.map(r => {
      const answers = r.answers as Record<string, string | string[]>
      return [
        r.id,
        new Date(r.submitted_at).toLocaleString('ja-JP'),
        ...questions.map(q => {
          const answer = answers[q.id]
          if (Array.isArray(answer)) return answer.join(', ')
          return answer || ''
        })
      ]
    })

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    // Download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${surveyTitle}_responses_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      closed: 'bg-red-100 text-red-700',
    }
    const labels: Record<string, string> = {
      draft: '下書き',
      published: '公開中',
      closed: '終了',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mini Survey</h1>
            <p className="text-gray-600 mt-1">簡易アンケート管理</p>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            新規作成
          </Link>
        </div>

        {surveys.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Eye size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Surveyがありません</h3>
            <p className="text-gray-600 mb-6">新規作成ボタンから最初のSurveyを作成しましょう</p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              新規作成
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold text-gray-900">{survey.title}</h2>
                      {getStatusBadge(survey.status)}
                    </div>
                    {survey.description && (
                      <p className="text-gray-600 text-sm mb-3">{survey.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>回答数: {responseCounts[survey.id] || 0}</span>
                      <span>作成日: {new Date(survey.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {survey.status === 'published' && (
                      <a
                        href={`/s/${survey.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="回答リンク"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                    <button
                      onClick={() => downloadCSV(survey.id, survey.title)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="CSVダウンロード"
                    >
                      <Download size={20} />
                    </button>
                    <button
                      onClick={() => deleteSurvey(survey.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="削除"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/edit/${survey.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      編集
                    </Link>
                    {survey.status !== 'draft' && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/s/${survey.id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          リンクをコピー
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => toggleStatus(survey)}
                    className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                      survey.status === 'draft'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : survey.status === 'published'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {survey.status === 'draft' ? '公開する' : survey.status === 'published' ? '終了する' : '再公開'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
