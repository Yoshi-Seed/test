import { useState } from 'react'
import { CheckCircle, XCircle, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react'

type ScreenerStep =
  | 'intro'
  | 'consent'
  | 'confidentiality'
  | 'S0'
  | 'S10'
  | 'S25'
  | 'S41'
  | 'S50'
  | 'S60'
  | 'S63'
  | 'S65'
  | 'S70'
  | 'S72'
  | 'S86'
  | 'complete'
  | 'terminated'

const STEPS: ScreenerStep[] = [
  'intro',
  'consent',
  'confidentiality',
  'S0',
  'S10',
  'S25',
  'S41',
  'S50',
  'S60',
  'S63',
  'S65',
  'S70',
  'S72',
  'S86',
  'complete',
]

const REGIONS = [
  '北海道',
  '東北地方（青森県、岩手県、宮城県、秋田県、山形県、福島県）',
  '関東地方（茨城県、栃木県、群馬県、埼玉県、千葉県、神奈川県）',
  '東京都',
  '甲信越・北陸地方（新潟県、富山県、石川県、福井県、山梨県、長野県）',
  '中部地方（岐阜県、静岡県、愛知県、三重県）',
  '近畿地方（滋賀県、京都府、大阪府、兵庫県、奈良県、和歌山県）',
  '中国地方（鳥取県、島根県、岡山県、広島県、山口県）',
  '四国地方（徳島県、香川県、愛媛県、高知県）',
  '九州・沖縄地方（福岡県、佐賀県、長崎県、熊本県、大分県、宮崎県、鹿児島県、沖縄県）',
]

const S25_ITEMS = [
  '医療機器メーカー',
  '市場調査会社、広告代理店、またはメディア関連企業',
  '医薬品の承認審査を行う公的機関（PMDA、厚生労働省など）',
  '医薬品またはバイオテクノロジーの製造業者、流通業者、小売業者、卸売業者、または医薬品の販売業者',
  '製薬・バイオテクノロジー分野のコンサルタント、研究者、または医薬品の営業・製造に関与する臨床研究担当者',
]

const S70_CONDITIONS = [
  '全般性不安障害／不安症',
  '摂食障害',
  '大うつ病',
  '統合失調症',
  '双極性障害',
]

const S86_CATEGORIES = [
  {
    category: '選択的セロトニン再取り込み阻害薬（SSRI）',
    drugs: [
      'エスシタロプラム（レクサプロ）',
      'セルトラリン（ジェイゾロフト）',
    ],
  },
  {
    category: 'セロトニン・ノルアドレナリン再取り込み阻害薬（SNRI）',
    drugs: ['ベンラファキシン（イフェクサーSR）'],
  },
  {
    category: 'アザピロン系',
    drugs: ['タンドスピロン（セディール）'],
  },
  {
    category: 'ベンゾジアゼピン系',
    drugs: [
      'アルプラゾラム（ソラナックス、コンスタン）',
      'ジアゼパム（セルシン、ホリゾン）',
      'エチゾラム（デパス）',
    ],
  },
]

interface Answers {
  consent: string
  confidentiality: string
  S0: string
  S10: string
  S25: Record<string, string>
  S41: string
  S50: string
  S60: string
  S63: string
  S65: { patient: string; academic: string; admin: string; other: string }
  S70: Record<string, string>
  S72: { under13: string; teen: string; adult: string }
  S86: Record<string, string>
  S86_other: string
}

function initialAnswers(): Answers {
  return {
    consent: '',
    confidentiality: '',
    S0: '',
    S10: '',
    S25: {},
    S41: '',
    S50: '',
    S60: '',
    S63: '',
    S65: { patient: '', academic: '', admin: '', other: '' },
    S70: {},
    S72: { under13: '', teen: '', adult: '' },
    S86: {},
    S86_other: '',
  }
}

export default function GadScreener() {
  const [currentStep, setCurrentStep] = useState<ScreenerStep>('intro')
  const [answers, setAnswers] = useState<Answers>(initialAnswers())
  const [terminateReason, setTerminateReason] = useState('')

  const currentIndex = STEPS.indexOf(currentStep)
  const progress = currentStep === 'terminated' ? 100 : Math.round((currentIndex / (STEPS.length - 1)) * 100)

  function goTo(step: ScreenerStep) {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function terminate(reason: string) {
    setTerminateReason(reason)
    goTo('terminated')
  }

  function next() {
    const idx = STEPS.indexOf(currentStep)
    if (idx < STEPS.length - 1) {
      goTo(STEPS[idx + 1])
    }
  }

  function prev() {
    const idx = STEPS.indexOf(currentStep)
    if (idx > 0) {
      goTo(STEPS[idx - 1])
    }
  }

  function handleConsentNext() {
    if (answers.consent === 'yes') {
      next()
    } else if (answers.consent === 'no') {
      terminate('同意が得られなかったため、調査を終了します。')
    }
  }

  function handleConfidentialityNext() {
    if (answers.confidentiality === 'yes') {
      next()
    } else if (answers.confidentiality === 'no') {
      terminate('機密保持への同意が得られなかったため、調査を終了します。')
    }
  }

  function handleS25Next() {
    if (answers.S25['0'] === 'yes') {
      terminate('医療機器メーカーとの関係が確認されたため、調査を終了します。')
      return
    }
    next()
  }

  function handleS41Next() {
    if (answers.S41 === 'other') {
      terminate('対象外の専門領域のため、調査を終了します。')
      return
    }
    next()
  }

  function handleS50Next() {
    const years = parseInt(answers.S50)
    if (isNaN(years) || years < 3 || years > 30) {
      terminate('臨床経験年数が対象範囲外（3〜30年）のため、調査を終了します。')
      return
    }
    next()
  }

  function handleS65Next() {
    const patient = parseFloat(answers.S65.patient) || 0
    const academic = parseFloat(answers.S65.academic) || 0
    const admin = parseFloat(answers.S65.admin) || 0
    const other = parseFloat(answers.S65.other) || 0
    const total = patient + academic + admin + other
    if (Math.abs(total - 100) > 0.5) {
      alert('合計が100%になるように入力してください。')
      return
    }
    if (patient < 60) {
      terminate('患者さんの治療・診察に費やす時間が60%に満たないため、調査を終了します。')
      return
    }
    next()
  }

  function handleS70Next() {
    const gadCount = parseInt(answers.S70['0']) || 0
    if (gadCount < 5) {
      terminate('全般性不安障害の患者数が5名に満たないため、調査を終了します。')
      return
    }
    if (answers.S70['none'] === 'yes') {
      terminate('いずれの疾患にも該当しないため、調査を終了します。')
      return
    }
    next()
  }

  function handleS72Next() {
    const under13 = parseFloat(answers.S72.under13) || 0
    const teen = parseFloat(answers.S72.teen) || 0
    const adult = parseFloat(answers.S72.adult) || 0
    const total = under13 + teen + adult
    if (Math.abs(total - 100) > 0.5) {
      alert('合計が100%になるように入力してください。')
      return
    }
    if (adult < 50) {
      terminate('成人患者（18歳以上）の割合が50%に満たないため、調査を終了します。')
      return
    }
    next()
  }

  function handleS86Next() {
    const allDrugs = S86_CATEGORIES.flatMap(c => c.drugs)
    const hasAtLeastOne = allDrugs.some((_, i) => answers.S86[String(i)] === 'yes')
    if (!hasAtLeastOne && !answers.S86_other) {
      if (answers.S86['none'] === 'yes') {
        terminate('いずれの治療薬も処方していないため、調査を終了します。')
        return
      }
      alert('少なくとも1つの治療薬を選択してください。')
      return
    }
    next()
  }

  // Renders
  function renderCard(children: React.ReactNode) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
        {children}
      </div>
    )
  }

  function renderNavButtons(onNext?: () => void, canGoBack = true, nextLabel = '次へ', nextDisabled = false) {
    return (
      <div className="flex justify-between mt-8">
        {canGoBack && currentIndex > 0 ? (
          <button
            onClick={prev}
            className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={18} /> 戻る
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onNext || next}
          disabled={nextDisabled}
          className="flex items-center gap-1 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {nextLabel} <ChevronRight size={18} />
        </button>
      </div>
    )
  }

  function renderIntro() {
    return renderCard(
      <>
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
            HCP Screener for Japan
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            GAD Patient Journey
          </h1>
          <p className="text-lg text-gray-700 mb-1">全般性不安障害ペイシェントジャーニー</p>
          <p className="text-gray-500">医師用スクリーナー</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Base Sizes</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600 font-medium">Target</th>
                <th className="text-right py-2 text-gray-600 font-medium">Japan</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-700">精神科</td>
                <td className="text-right py-2 text-gray-700 font-medium">4</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-700">内科</td>
                <td className="text-right py-2 text-gray-700 font-medium">6</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-900 font-semibold">TOTAL</td>
                <td className="text-right py-2 text-gray-900 font-bold">10</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2 mb-2">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-amber-800">ADVERSE EVENT DISCLAIMER</p>
          </div>
          <p className="text-sm text-amber-900 leading-relaxed">
            調査依頼元およびシード・プランニングは、患者様と製品の安全性の確保に努めております。ご参加は任意であり、先生の個人情報は機密として扱われ、匿名化されますが、本市場調査の過程で先生から提供される可能性のある安全性情報または製品品質情報を収集する義務が弊社にはあることをご承知おきください。この情報は、先生がすでに企業や規制当局に報告した場合でも、収集・報告されなければなりません。先生から提供された安全性情報または製品品質情報を収集・報告する必要がある場合、その報告に関連して先生の個人情報を開示する必要があります。
          </p>
        </div>

        <div className="text-sm text-gray-600 leading-relaxed mb-6">
          <p className="mb-3">
            本市場調査においてご提供いただく情報は、特定の疾患に対する治療実態の理解を深める目的で、集計・分析のうえ活用されます。
          </p>
          <p className="mb-3">
            ご回答いただく内容はすべて機密として取り扱われます。書面により匿名性の放棄に同意いただかない限り、個人が特定されることはございません。
          </p>
          <p>
            ご参加にあたり、いかなる質問に対しても回答を拒否する権利、およびいつでもご参加を中止する権利があります。
          </p>
        </div>

        {renderNavButtons(undefined, false, '調査を開始する')}
      </>
    )
  }

  function renderConsent() {
    return renderCard(
      <>
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-3">同意確認</span>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            このまま調査を進めることにご同意いただけますか？
          </h2>
        </div>
        <div className="space-y-3">
          {[
            { value: 'yes', label: 'はい' },
            { value: 'no', label: 'いいえ' },
          ].map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                answers.consent === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="consent"
                value={opt.value}
                checked={answers.consent === opt.value}
                onChange={e => setAnswers(p => ({ ...p, consent: e.target.value }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-800 font-medium">{opt.label}</span>
              {opt.value === 'no' && (
                <span className="text-xs text-red-500 ml-auto">終了</span>
              )}
            </label>
          ))}
        </div>
        {renderNavButtons(handleConsentNext, true, '次へ', !answers.consent)}
      </>
    )
  }

  function renderConfidentiality() {
    return renderCard(
      <>
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-3">CONFIDENTIALITY STATEMENT</span>
          <h2 className="text-lg font-bold text-gray-900 mb-4">機密保持に関する同意</h2>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed mb-4">
            <p>
              本調査内では、企業の私的情報や機密情報をご覧頂く場合がございます。それらの情報には例として、試験のコンセプト、マーケティング・広告・クリエイティブ戦略や計画、製品名や潜在的な製品名・マークまたはロゴが含まれている可能性がありますが、この限りではありません。
            </p>
            <p className="mt-3">
              本調査への協力にご同意頂けた場合、先生には次の点にもご同意頂きたく存じます：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
              <li>（a）調査内で知りえたすべての情報を機密情報として取り扱うこと</li>
              <li>（b）弊社からの事前かつ書面での承諾なしに、本調査内で知りえたいかなる情報も他者へ共有しないこと</li>
              <li>（c）弊社からの事前かつ書面での承諾なしに知りえた情報を使用しないこと</li>
              <li>（d）提示されたいかなる情報も、複製（コピー）、印刷、またはダウンロードしないこと</li>
            </ul>
          </div>
          <p className="text-gray-800 font-medium">以上のことに同意いただき、アンケートにご回答いただけますか？</p>
        </div>
        <div className="space-y-3">
          {[
            { value: 'yes', label: 'はい' },
            { value: 'no', label: 'いいえ' },
          ].map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                answers.confidentiality === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="confidentiality"
                value={opt.value}
                checked={answers.confidentiality === opt.value}
                onChange={e => setAnswers(p => ({ ...p, confidentiality: e.target.value }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-800 font-medium">{opt.label}</span>
              {opt.value === 'no' && (
                <span className="text-xs text-red-500 ml-auto">終了</span>
              )}
            </label>
          ))}
        </div>
        {renderNavButtons(handleConfidentialityNext, true, '次へ', !answers.confidentiality)}
      </>
    )
  }

  function renderS0() {
    return renderCard(
      <>
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-3">S0</span>
          <h2 className="text-lg font-bold text-gray-900">性別を教えてください。</h2>
        </div>
        <div className="space-y-3">
          {[
            { value: 'male', label: '男性' },
            { value: 'female', label: '女性' },
          ].map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                answers.S0 === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="S0"
                value={opt.value}
                checked={answers.S0 === opt.value}
                onChange={e => setAnswers(p => ({ ...p, S0: e.target.value }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-800 font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
        {renderNavButtons(undefined, true, '次へ', !answers.S0)}
      </>
    )
  }

  function renderS10() {
    return renderCard(
      <>
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-3">S10</span>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            先生の主なご勤務先はどの地域に所在していますか。
          </h2>
          <p className="text-sm text-gray-500">1つ選択</p>
        </div>
        <div className="space-y-2">
          {REGIONS.map((region, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                answers.S10 === String(i)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="S10"
                value={String(i)}
                checked={answers.S10 === String(i)}
                onChange={e => setAnswers(p => ({ ...p, S10: e.target.value }))}
                className="w-4 h-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-gray-800 text-sm">{region}</span>
            </label>
          ))}
        </div>
        {renderNavButtons(undefined, true, '次へ', !answers.S10)}
      </>
    )
  }

  function renderS25() {
    const allAnswered = S25_ITEMS.every((_, i) => answers.S25[String(i)])
    return renderCard(
      <>
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-3">S25</span>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            先生ご自身もしくはご家族の中に、以下のいずれかの種類の企業・団体と報酬を伴う関係にある方はいらっしゃいますか。
          </h2>
          <p className="text-sm text-gray-500">各項目についてそれぞれ1つ選択</p>
        </div>
        <div className="space-y-4">
          {S25_ITEMS.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-800 font-medium mb-3">{item}</p>
              <div className="flex gap-4">
                {['yes', 'no'].map(val => (
                  <label
                    key={val}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                      answers.S25[String(i)] === val
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`S25-${i}`}
                      value={val}
                      checked={answers.S25[String(i)] === val}
                      onChange={() =>
                        setAnswers(p => ({
                          ...p,
                          S25: { ...p.S25, [String(i)]: val },
                        }))
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700 text-sm">{val === 'yes' ? 'はい' : 'いいえ'}</span>
                  </label>
                ))}
                {i === 0 && answers.S25['0'] === 'yes' && (
                  <span className="text-xs text-red-500 self-center ml-auto">終了</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {renderNavButtons(handleS25Next, true, '次へ', !allAnswered)}
      </>
    )
  }

  function renderS41() {
    const options = [
      { value: 'psychiatry', label: '精神科', note: '精神科として割付' },
      { value: 'internal', label: '内科', note: '内科として割付' },
      { value: 'other', label: 'その他（具体的に）', note: '終了' },
    ]
    return renderCard(
      <>
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-3">S41</span>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            先生の主な専門領域を教えてください。
          </h2>
          <p className="text-sm text-gray-500">1つ選択</p>
        </div>
        <div className="space-y-3">
          {options.map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                answers.S41 === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="S41"
                value={opt.value}
                checked={answers.S41 === opt.value}
                onChange={e => setAnswers(p => ({ ...p, S41: e.target.value }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-800 font-medium">{opt.label}</span>
              <span className={`text-xs ml-auto ${opt.value === 'other' ? 'text-red-500' : 'text-blue-500'}`}>
                {opt.note}
              </span>
            </label>
          ))}
        </div>
        {renderNavButtons(handleS41Next, true, '次へ', !answers.S41)}
      </>
    )
  }

  function renderS50() {
    return renderCard(
      <>
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-3">S50</span>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            研修期間を終えてからの臨床経験年数を教えてください。
          </h2>
          <p className="text-sm text-gray-500">3〜30年の範囲で入力してください</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={50}
            value={answers.S50}
            onChange={e => setAnswers(p => ({ ...p, S50: e.target.value }))}
            className="w-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
            placeholder="0"
          />
          <span className="text-gray-700 font-medium">年</span>
        </div>
        {renderNavButtons(handleS50Next, true, '次へ', !answers.S50)}
      </>
    )
  }

  function renderS60() {
    const options = [
      { value: 'specialist', label: '精神科専門医（日本精神神経学会など）' },
      { value: 'designated', label: '厚生労働省認定の精神保健指定医' },
      { value: 'both', label: '上記いずれも' },
      { value: 'none', label: 'いずれにも該当しない' },
    ]
    return renderCard(
      <>
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-3">S60</span>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            以下の認定をお持ちですか？
          </h2>
          <p className="text-sm text-gray-500">1つ選択</p>
        </div>
        <div className="space-y-3">
          {options.map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                answers.S60 === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="S60"
                value={opt.value}
                checked={answers.S60 === opt.value}
                onChange={e => setAnswers(p => ({ ...p, S60: e.target.value }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-800">{opt.label}</span>
            </label>
          ))}
        </div>
        {renderNavButtons(undefined, true, '次へ', !answers.S60)}
      </>
    )
  }

  function renderS63() {
    const options = [
      { value: 'clinic', label: 'クリニック', note: 'コミュニティと割付' },
      { value: 'public_hospital', label: '総合病院（公立）', note: '' },
      { value: 'private_hospital', label: '総合病院（私立）', note: '' },
      { value: 'psychiatric_hospital', label: '精神科単科病院', note: '' },
      { value: 'university_hospital', label: '大学病院', note: 'アカデミックと割付' },
      { value: 'other', label: 'その他（具体的に）', note: '保留し継続' },
    ]
    return renderCard(
      <>
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-3">S63</span>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            先生は以下のうち主にどの施設で患者さんを診療されていますか？
          </h2>
          <p className="text-sm text-gray-500">1つ選択</p>
        </div>
        <div className="space-y-3">
          {options.map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                answers.S63 === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="S63"
                value={opt.value}
                checked={answers.S63 === opt.value}
                onChange={e => setAnswers(p => ({ ...p, S63: e.target.value }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-800">{opt.label}</span>
              {opt.note && (
                <span className="text-xs text-blue-500 ml-auto">{opt.note}</span>
              )}
            </label>
          ))}
        </div>
        {renderNavButtons(undefined, true, '次へ', !answers.S63)}
      </>
    )
  }

  function renderS65() {
    const total =
      (parseFloat(answers.S65.patient) || 0) +
      (parseFloat(answers.S65.academic) || 0) +
      (parseFloat(answers.S65.admin) || 0) +
      (parseFloat(answers.S65.other) || 0)
    const items = [
      { key: 'patient' as const, label: '患者さんの治療・診察', note: '60%以上必須' },
      { key: 'academic' as const, label: '学術的業務（研究や教育、論文執筆など）', note: '' },
      { key: 'admin' as const, label: '管理業務', note: '' },
      { key: 'other' as const, label: 'その他', note: '' },
    ]
    return renderCard(
      <>
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-3">S65</span>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            先生のご勤務時間のうち、以下のような内容に費やしている時間はおよそ何パーセントですか？
          </h2>
          <p className="text-sm text-gray-500">合計が100%になるように入力してください</p>
        </div>
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.key} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">{item.label}</p>
                {item.note && <p className="text-xs text-red-500">{item.note}</p>}
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={answers.S65[item.key]}
                  onChange={e =>
                    setAnswers(p => ({
                      ...p,
                      S65: { ...p.S65, [item.key]: e.target.value },
                    }))
                  }
                  className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                  placeholder="0"
                />
                <span className="text-gray-500 text-sm">%</span>
              </div>
            </div>
          ))}
        </div>
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
          Math.abs(total - 100) < 0.5 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          合計: {total}%{Math.abs(total - 100) >= 0.5 && '（100%にしてください）'}
        </div>
        {renderNavButtons(handleS65Next, true, '次へ', Math.abs(total - 100) >= 0.5)}
      </>
    )
  }

  function renderS70() {
    return renderCard(
      <>
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-3">S70</span>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            現在、以下の患者さんを何名治療または管理していらっしゃいますか？
          </h2>
          <p className="text-sm text-gray-500">回答を数字で記録（全般性不安障害は5名以上必須）</p>
        </div>
        <div className="space-y-4">
          {S70_CONDITIONS.map((cond, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">{cond}</p>
                {i === 0 && <p className="text-xs text-red-500">5名以上必須</p>}
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  value={answers.S70[String(i)] || ''}
                  onChange={e =>
                    setAnswers(p => ({
                      ...p,
                      S70: { ...p.S70, [String(i)]: e.target.value },
                    }))
                  }
                  className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                  placeholder="0"
                />
                <span className="text-gray-500 text-sm">名</span>
              </div>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={answers.S70['none'] === 'yes'}
                onChange={e =>
                  setAnswers(p => ({
                    ...p,
                    S70: { ...p.S70, none: e.target.checked ? 'yes' : '' },
                  }))
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-gray-800 text-sm">いずれにも該当しない</span>
              <span className="text-xs text-red-500 ml-auto">終了</span>
            </label>
          </div>
        </div>
        {renderNavButtons(handleS70Next)}
      </>
    )
  }

  function renderS72() {
    const gadCount = answers.S70['0'] || '0'
    const total =
      (parseFloat(answers.S72.under13) || 0) +
      (parseFloat(answers.S72.teen) || 0) +
      (parseFloat(answers.S72.adult) || 0)
    const items = [
      { key: 'under13' as const, label: '13歳未満', note: '' },
      { key: 'teen' as const, label: '13～17歳', note: '' },
      { key: 'adult' as const, label: '18歳以上', note: '50%以上必須' },
    ]
    return renderCard(
      <>
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-3">S72</span>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            先生が診られている全般性不安障害／不安症患者 <span className="text-blue-600">{gadCount}人</span> のうち、以下のグループに該当するのはそれぞれ何パーセントですか？
          </h2>
          <p className="text-sm text-gray-500">合計が100%になるように入力してください</p>
        </div>
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.key} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">{item.label}</p>
                {item.note && <p className="text-xs text-red-500">{item.note}</p>}
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={answers.S72[item.key]}
                  onChange={e =>
                    setAnswers(p => ({
                      ...p,
                      S72: { ...p.S72, [item.key]: e.target.value },
                    }))
                  }
                  className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                  placeholder="0"
                />
                <span className="text-gray-500 text-sm">%</span>
              </div>
            </div>
          ))}
        </div>
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
          Math.abs(total - 100) < 0.5 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          合計: {total}%{Math.abs(total - 100) >= 0.5 && '（100%にしてください）'}
        </div>
        {renderNavButtons(handleS72Next, true, '次へ', Math.abs(total - 100) >= 0.5)}
      </>
    )
  }

  function renderS86() {
    let drugIndex = 0
    return renderCard(
      <>
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-3">S86</span>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            通常の1か月間において、先生ご自身が全般性不安障害／不安症の患者さんに対して処方されている治療薬はどれですか。
          </h2>
          <p className="text-sm text-gray-500">該当するものすべてを選択</p>
        </div>
        <div className="space-y-6">
          {S86_CATEGORIES.map((cat, ci) => {
            const startIdx = drugIndex
            const items = cat.drugs.map((drug, di) => {
              const idx = startIdx + di
              return (
                <label
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    answers.S86[String(idx)] === 'yes'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={answers.S86[String(idx)] === 'yes'}
                    onChange={e =>
                      setAnswers(p => ({
                        ...p,
                        S86: { ...p.S86, [String(idx)]: e.target.checked ? 'yes' : '' },
                      }))
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-gray-800 text-sm">{drug}</span>
                </label>
              )
            })
            drugIndex += cat.drugs.length
            return (
              <div key={ci}>
                <p className="text-sm font-semibold text-gray-600 mb-2">{cat.category}</p>
                <div className="space-y-2">{items}</div>
              </div>
            )
          })}

          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">その他</p>
            <input
              type="text"
              value={answers.S86_other}
              onChange={e => setAnswers(p => ({ ...p, S86_other: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="上記以外の治療薬（具体的に）"
            />
          </div>

          <div className="border-t border-gray-200 pt-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={answers.S86['none'] === 'yes'}
                onChange={e =>
                  setAnswers(p => ({
                    ...p,
                    S86: { ...p.S86, none: e.target.checked ? 'yes' : '' },
                  }))
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-gray-800 text-sm">いずれも該当しない</span>
              <span className="text-xs text-red-500 ml-auto">終了</span>
            </label>
          </div>
        </div>
        {renderNavButtons(handleS86Next, true, '完了')}
      </>
    )
  }

  function renderComplete() {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          スクリーニング完了
        </h2>
        <p className="text-gray-600 mb-6">
          本日はお時間をいただき、ありがとうございました。ご予定されている調査について、その他ご不明点がございましたら、お気軽にお知らせください。
        </p>
        <button
          onClick={() => {
            setAnswers(initialAnswers())
            goTo('intro')
          }}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          最初からやり直す
        </button>
      </div>
    )
  }

  function renderTerminated() {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <XCircle size={56} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          調査終了
        </h2>
        <p className="text-gray-600 mb-4">{terminateReason}</p>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mb-6">
          今回は残念ながら、調査の対象条件に該当しなかったため、ここで終了とさせていただきます。ご関心をお寄せいただき、誠に感謝申し上げます。今後、別の調査でご協力いただける機会がございましたら、ぜひご参加ください。本日はありがとうございました。
        </div>
        <button
          onClick={() => {
            setAnswers(initialAnswers())
            setTerminateReason('')
            goTo('intro')
          }}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          最初からやり直す
        </button>
      </div>
    )
  }

  const stepRenderers: Record<ScreenerStep, () => React.ReactNode> = {
    intro: renderIntro,
    consent: renderConsent,
    confidentiality: renderConfidentiality,
    S0: renderS0,
    S10: renderS10,
    S25: renderS25,
    S41: renderS41,
    S50: renderS50,
    S60: renderS60,
    S63: renderS63,
    S65: renderS65,
    S70: renderS70,
    S72: renderS72,
    S86: renderS86,
    complete: renderComplete,
    terminated: renderTerminated,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-sm font-semibold text-gray-500">GAD HCP Screener</h1>
          {currentStep !== 'terminated' && (
            <span className="text-xs text-gray-400">
              {currentIndex + 1} / {STEPS.length}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        {stepRenderers[currentStep]()}
      </div>
    </div>
  )
}
