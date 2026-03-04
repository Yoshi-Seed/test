/* Demo UI — No persistent storage (no cookies/localStorage). */

const TEXT = {
  consentIntro: "本市場調査においてご提供いただく情報は、特定の疾患に対する治療実態の理解を深める目的で、集計・分析のうえ活用されます。\nご回答いただく内容はすべて機密として取り扱われます。書面により匿名性の放棄に同意いただかない限り、個人が特定されることはございません。\nご参加にあたり、いかなる質問に対しても回答を拒否する権利、およびいつでもご参加を中止する権利があります。",
  adverseEvent: "調査依頼元および シード・プランニングは、患者様と製品の安全性の確保に努めております。ご参加は任意であり、先生の個人情報は機密として扱われ、匿名化されますが、本市場調査の過程で先生から提供される可能性のある安全性情報または製品品質情報を収集する義務が弊社にはあることをご承知おきください。この情報は、先生がすでに企業や規制当局に報告した場合でも、収集・報告されなければなりません。先生から提供された安全性情報または製品品質情報を収集・報告する必要がある場合、その報告に関連して先生の個人情報を開示する必要があります。",
  confidentiality: "本調査内では、企業の私的情報や機密情報をご覧頂く場合がございます。それらの情報には例として、試験のコンセプト、マーケティング・広告・クリエイティブ戦略や計画、製品名や潜在的な製品名・マークまたはロゴが含まれている可能性がありますが、この限りではありません。本調査への協力にご同意頂けた場合、先生には次の点にもご同意頂きたく存じます：（a）調査内で知りえたすべての情報を機密情報として取り扱うこと、（b）弊社からの事前かつ書面での承諾なしに、本調査内で知りえたいかなる情報も他者へ共有しないこと、（c）弊社からの事前かつ書面での承諾なしに知りえた情報を使用しないこと、および（d）提示されたいかなる情報も、複製（コピー）、印刷、またはダウンロードしないこと。",
  terminateMsg: "今回は残念ながら、調査の対象条件に該当しなかったため、ここで終了とさせていただきます。ご関心をお寄せいただき、誠に感謝申し上げます。今後、別の調査でご協力いただける機会がございましたら、ぜひご参加ください。本日はありがとうございました。",
  thankYouMsg: "本日はお時間をいただき、ありがとうございました。ご予定されている調査について（○月○日）、その他ご不明点がございましたら、お気軽にお知らせください。"
};

const OPTIONS = {
  S0: [{"value": "1", "label": "男性"}, {"value": "2", "label": "女性"}],
  S10: [{"value": "1", "label": "北海道"}, {"value": "2", "label": "東北地方（青森県、岩手県、宮城県、秋田県、山形県、福島県）"}, {"value": "3", "label": "関東地方（茨城県、栃木県、群馬県、埼玉県、千葉県、神奈川県）"}, {"value": "4", "label": "東京都"}, {"value": "5", "label": "甲信越・北陸地方（新潟県、富山県、石川県、福井県、山梨県、長野県）"}, {"value": "6", "label": "中部地方（岐阜県、静岡県、愛知県、三重県）"}, {"value": "7", "label": "近畿地方（滋賀県、京都府、大阪府、兵庫県、奈良県、和歌山県）"}, {"value": "8", "label": "中国地方（鳥取県、島根県、岡山県、広島県、山口県）"}, {"value": "9", "label": "四国地方（徳島県、香川県、愛媛県、高知県）"}, {"value": "10", "label": "九州・沖縄地方（福岡県、佐賀県、長崎県、熊本県、大分県、宮崎県、鹿児島県、沖縄県）"}],
  S41: [{"value": "1", "label": "精神科"}, {"value": "2", "label": "内科"}, {"value": "10", "label": "その他（具体的に）"}],
  S60: [{"value": "1", "label": "精神科専門医（日本精神神経学会など）"}, {"value": "2", "label": "厚生労働省認定の精神保健指定医"}, {"value": "3", "label": "上記いずれも"}, {"value": "4", "label": "いずれにも該当しない"}],
  S63: [{"value": "1", "label": "クリニック"}, {"value": "2", "label": "総合病院（公立）"}, {"value": "3", "label": "総合病院（私立）"}, {"value": "4", "label": "精神科単科病院"}, {"value": "5", "label": "大学病院"}, {"value": "9", "label": "その他（具体的に）"}],
  S25_ITEMS: [{"value": "1", "label": "医療機器メーカー"}, {"value": "2", "label": "市場調査会社、広告代理店、またはメディア関連企業"}, {"value": "3", "label": "医薬品の承認審査を行う公的機関（PMDA、厚生労働省など）"}, {"value": "4", "label": "医薬品またはバイオテクノロジーの製造業者、流通業者、小売業者、卸売業者、または医薬品の販売業者"}, {"value": "5", "label": "製薬・バイオテクノロジー分野のコンサルタント、研究者、または医薬品の営業・製造に関与する臨床研究担当者"}],
  S65_ITEMS: [{"value": "1", "label": "患者さんの治療・診察"}, {"value": "2", "label": "学術的業務（研究や教育、論文執筆など）"}, {"value": "3", "label": "管理業務"}, {"value": "4", "label": "その他（具体的に）"}],
  S70_ITEMS: [{"value": "1", "label": "全般性不安障害／不安症"}, {"value": "2", "label": "摂食障害"}, {"value": "3", "label": "大うつ病"}, {"value": "4", "label": "統合失調症"}, {"value": "5", "label": "双極性障害"}, {"value": "9", "label": "いずれにも該当しない"}],
  S72_ITEMS: [{"value": "1", "label": "13歳未満"}, {"value": "2", "label": "13～17歳"}, {"value": "3", "label": "18歳以上"}],
  S86_OPTS: [{"value": "1", "label": "エスシタロプラム（レクサプロ）", "group": "選択的セロトニン再取り込み阻害薬（SSRI）"}, {"value": "2", "label": "セルトラリン（ジェイゾロフト）", "group": "選択的セロトニン再取り込み阻害薬（SSRI）"}, {"value": "3", "label": "ベンラファキシン（イフェクサーSR）", "group": "セロトニン・ノルアドレナリン再取り込み阻害薬（SNRI）"}, {"value": "4", "label": "タンドスピロン（セディール）", "group": "アザピロン系"}, {"value": "5", "label": "アルプラゾラム（ソラナックス、コンスタン）", "group": "ベンゾジアゼピン系"}, {"value": "6", "label": "ジアゼパム（セルシン、ホリゾン）", "group": "ベンゾジアゼピン系"}, {"value": "7", "label": "エチゾラム（デパス）", "group": "ベンゾジアゼピン系"}, {"value": "98", "label": "上記以外（具体的に）", "group": "Other"}, {"value": "99", "label": "いずれも該当しない", "group": "Other"}]
};

/** Screens: 1 question = 1 screen (SPA style). */
const SCREENS = [
  {
    id: "start",
    kicker: "WELCOME",
    title: "GAD Patient Journey — HCP Screener（日本）",
    desc: "1問ずつ進むデモ画面です。入力内容は保存されません（リロードで消えます）。",
    type: "start"
  },
  {
    id: "consent",
    kicker: "CONSENT",
    title: "ご同意の確認",
    desc: "以下の内容をご確認ください。",
    type: "consent",
    question: "このまま調査を進めることにご同意いただけますか？",
    options: [{value:"1", label:"はい"}, {value:"2", label:"いいえ（終了）"}]
  },
  {
    id: "confidential",
    kicker: "CONFIDENTIALITY",
    title: "機密保持の確認",
    desc: "以下の内容をご確認ください。",
    type: "consent",
    question: "以上のことに同意いただき、アンケートにご回答いただけますか？",
    options: [{value:"1", label:"はい"}, {value:"2", label:"いいえ（終了）"}]
  },
  {
    id: "S0",
    kicker: "SCREENING",
    title: "性別",
    desc: "",
    type: "radio",
    code: "S0",
    question: "性別を教えてください。",
    options: OPTIONS.S0
  },
  {
    id: "S10",
    kicker: "SCREENING",
    title: "勤務先の地域",
    desc: "主なご勤務先の所在地を選択してください。",
    type: "radio",
    code: "S10",
    question: "先生の主なご勤務先はどの地域に所在していますか。[1つ選択]",
    options: OPTIONS.S10
  },
  {
    id: "S25",
    kicker: "SCREENING",
    title: "利益相反の確認",
    desc: "各項目について「はい／いいえ」を選択してください。",
    type: "matrix_yesno",
    code: "S25",
    question: "先生ご自身もしくはご家族の中に、以下のいずれかの種類の企業・団体と報酬を伴う関係にある方はいらっしゃいますか。\n［各項目についてそれぞれ1つ選択］",
    items: OPTIONS.S25_ITEMS
  },
  {
    id: "S41",
    kicker: "SCREENING",
    title: "専門領域",
    desc: "「その他」の場合は対象外となります（デモでは終了画面へ）。",
    type: "radio_other_terminate",
    code: "S41",
    question: "先生の主な専門領域を教えてください。[1つ選択]",
    options: OPTIONS.S41,
    otherValue: "10"
  },
  {
    id: "S50",
    kicker: "SCREENING",
    title: "臨床経験年数",
    desc: "研修期間を終えてからの臨床経験年数（年）を入力してください。",
    type: "number",
    code: "S50",
    question: "研修期間を終えてからの臨床経験年数を教えてください。",
    placeholder: "例：12",
    min: 0,
    max: 99,
    rule: "TERMINATE IF <3 or >30"
  },
  {
    id: "S60",
    kicker: "SCREENING",
    title: "認定資格",
    desc: "",
    type: "radio",
    code: "S60",
    question: "以下の認定をお持ちですか？[1つ選択]",
    options: OPTIONS.S60
  },
  {
    id: "S63",
    kicker: "SCREENING",
    title: "主な診療施設",
    desc: "「その他」は保留扱い（要確認）として続行できます。",
    type: "radio_with_other_text",
    code: "S63",
    question: "先生は以下のうち主にどの施設で患者さんを診療されていますか？[1つ選択]",
    options: OPTIONS.S63,
    otherValue: "9"
  },
  {
    id: "S65",
    kicker: "SCREENING",
    title: "勤務時間の配分",
    desc: "合計が100%になるよう入力してください。",
    type: "percent_grid",
    code: "S65",
    question: "先生のご勤務時間のうち、以下のような内容に費やしている時間はおよそ何パーセントですか？",
    items: OPTIONS.S65_ITEMS,
    mustTotal: 100,
    terminateIfPatientCareUnder: 60
  },
  {
    id: "S70",
    kicker: "SCREENING",
    title: "担当患者数",
    desc: "数字で入力してください（デモでは空欄は0として扱います）。",
    type: "number_list_with_none",
    code: "S70",
    question: "現在、以下の患者さんを何名治療または管理していらっしゃいますか？[回答を数字で記録]",
    items: OPTIONS.S70_ITEMS,
    noneValue: "9",
    gadValue: "1",
    gadMin: 5
  },
  {
    id: "S72",
    kicker: "SCREENING",
    title: "年齢分布（GAD/不安症）",
    desc: "S70-1の人数をパイプインする想定です（デモでは表示のみ）。",
    type: "percent_grid",
    code: "S72",
    question: "先生が診られている全般性不安障害／不安症患者【Pipe in S70-1 [患者数]を挿入】人のうち、以下のグループに該当するのはそれぞれ何パーセントですか？[回答を記録]",
    items: OPTIONS.S72_ITEMS,
    mustTotal: 100,
    holdIfAdultUnder: 50
  },
  {
    id: "S86",
    kicker: "SCREENING",
    title: "処方薬",
    desc: "該当する薬剤を選択してください。1〜7のいずれかは必須です。",
    type: "therapy_checklist",
    code: "S86",
    question: "通常の1か月間において、先生ご自身が全般性不安障害／不安症の患者さんに対して処方されている治療薬はどれですか。[リストを読み上げ回答を記録]",
    options: OPTIONS.S86_OPTS
  },
  {
    id: "complete",
    kicker: "DONE",
    title: "完了",
    desc: "デモ回答ありがとうございました。",
    type: "complete"
  }
];

const END_SCREENS = {
  terminate: { id:"terminate", kicker:"END", title:"終了", desc:"", type:"terminate" },
  hold: { id:"hold", kicker:"ON HOLD", title:"保留（要確認）", desc:"", type:"hold" }
};

// State (in-memory only)
const state = { screenIndex: 0, answers: {}, flags: {} };

const el = (id) => document.getElementById(id);
const kickerEl = el("kicker");
const titleEl = el("title");
const descEl = el("desc");
const bodyEl = el("body");
const hintEl = el("hint");
const backBtn = el("backBtn");
const nextBtn = el("nextBtn");
const restartBtn = el("restartBtn");
const progressLabel = el("progressLabel");
const progressFill = el("progressFill");

restartBtn.addEventListener("click", () => restart());
backBtn.addEventListener("click", () => goBack());
nextBtn.addEventListener("click", () => goNext());

function restart(){
  state.screenIndex = 0;
  state.answers = {};
  state.flags = {};
  render();
}

function currentScreen(){ return SCREENS[state.screenIndex]; }

function setHint(msg, kind=""){
  hintEl.textContent = msg || "";
  hintEl.style.color = kind === "bad" ? "rgba(127,29,29,.95)"
                    : kind === "warn" ? "rgba(120,53,15,.95)"
                    : "rgba(11,19,36,.60)";
}

function setAnswer(code, value){ state.answers[code] = value; }
function getAnswer(code){ return state.answers[code]; }
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function render(){
  const s = currentScreen();
  kickerEl.textContent = s.kicker || "";
  titleEl.textContent = s.title || "";
  descEl.textContent = s.desc || "";
  bodyEl.innerHTML = "";
  setHint("");

  backBtn.disabled = state.screenIndex === 0;
  nextBtn.disabled = false;

  const total = SCREENS.filter(x => !["start","complete"].includes(x.id)).length;
  const done = SCREENS.slice(0, state.screenIndex).filter(x => !["start","complete"].includes(x.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  progressLabel.textContent = `進捗: ${done}/${total}`;
  progressFill.style.width = `${pct}%`;

  if (s.type === "start") return renderStart();
  if (s.type === "consent") return renderConsent(s);
  if (s.type === "radio") return renderRadio(s);
  if (s.type === "radio_other_terminate") return renderRadioOtherTerminate(s);
  if (s.type === "radio_with_other_text") return renderRadioWithOtherText(s);
  if (s.type === "matrix_yesno") return renderMatrixYesNo(s);
  if (s.type === "number") return renderNumber(s);
  if (s.type === "percent_grid") return renderPercentGrid(s);
  if (s.type === "number_list_with_none") return renderNumberListWithNone(s);
  if (s.type === "therapy_checklist") return renderTherapyChecklist(s);
  if (s.type === "complete") return renderComplete();
  if (s.type === "terminate") return renderTerminate();
  if (s.type === "hold") return renderHold();
}

function renderStart(){
  const box = document.createElement("div");
  box.className = "stack";
  box.innerHTML = `
    <div class="note">
      <strong>コンセプト</strong><br/>
      • 1問1画面（ページ）スタイル<br/>
      • 入力内容は保存されません（このタブを閉じる／リロードで消えます）<br/>
      • デモ用に一部ルール（終了／保留）を簡易実装しています
    </div>
    <div class="grid two">
      <div class="note">
        <strong>画面センス（意図）</strong><br/>
        “医師に優しい”を第一に、<br/>
        余白・視線誘導・誤入力防止を重視しています。
      </div>
      <div class="note">
        <strong>操作</strong><br/>
        「次へ」で進みます。<br/>
        右上の ↻ で最初から。
      </div>
    </div>
  `;
  bodyEl.appendChild(box);
  backBtn.disabled = true;
  nextBtn.textContent = "はじめる";
}

function renderConsent(s){
  const ans = getAnswer(s.id) || "";
  const stack = document.createElement("div");
  stack.className = "stack";

  const note = document.createElement("div");
  note.className = "note";
  const mainText = s.id === "consent"
    ? `${TEXT.consentIntro}\n\nADVERSE EVENT DISCLAIMER:\n${TEXT.adverseEvent}`
    : `CONFIDENTIALITY STATEMENT（JAPAN）\n${TEXT.confidentiality}`;
  note.innerHTML = `<div style="white-space:pre-wrap; line-height:1.75">${escapeHtml(mainText)}</div>`;
  stack.appendChild(note);

  const options = document.createElement("div");
  options.className = "stack";

  s.options.forEach(opt => {
    const id = `${s.id}_${opt.value}`;
    const label = document.createElement("label");
    label.className = "option";
    label.setAttribute("for", id);
    label.innerHTML = `
      <input type="radio" name="${s.id}" id="${id}" value="${opt.value}" ${ans===opt.value?"checked":""}/>
      <div class="label">${escapeHtml(opt.label)}</div>
    `;
    label.querySelector("input").addEventListener("change", (e) => {
      setAnswer(s.id, e.target.value);
      render();
    });
    options.appendChild(label);
  });

  stack.appendChild(options);
  bodyEl.appendChild(stack);

  nextBtn.textContent = "次へ";
  nextBtn.disabled = !getAnswer(s.id);
}

function renderRadio(s){
  const ans = getAnswer(s.code) || "";
  const stack = document.createElement("div");
  stack.className = "stack";

  const q = document.createElement("div");
  q.className = "note";
  q.innerHTML = `<strong>${escapeHtml(s.question)}</strong>`;
  stack.appendChild(q);

  const options = document.createElement("div");
  options.className = "stack";

  s.options.forEach(opt => {
    const id = `${s.code}_${opt.value}`;
    const label = document.createElement("label");
    label.className = "option";
    label.setAttribute("for", id);
    label.innerHTML = `
      <input type="radio" name="${s.code}" id="${id}" value="${opt.value}" ${ans===opt.value?"checked":""}/>
      <div class="label"><strong>${escapeHtml(opt.label)}</strong></div>
    `;
    label.querySelector("input").addEventListener("change", (e) => {
      setAnswer(s.code, e.target.value);
      render();
    });
    options.appendChild(label);
  });

  stack.appendChild(options);
  bodyEl.appendChild(stack);

  nextBtn.textContent = "次へ";
  nextBtn.disabled = !getAnswer(s.code);
}

function renderRadioOtherTerminate(s){
  renderRadio(s);
  const ans = getAnswer(s.code);
  if (ans === s.otherValue) {
    const box = document.createElement("input");
    box.className = "text";
    box.placeholder = "「その他」の内容を入力（デモでは対象外扱い）";
    box.value = getAnswer(s.code+"_text") || "";
    box.addEventListener("input", e => setAnswer(s.code+"_text", e.target.value));
    bodyEl.querySelector(".stack").appendChild(box);
  }
}

function renderRadioWithOtherText(s){
  renderRadio(s);
  const ans = getAnswer(s.code);
  if (ans === s.otherValue) {
    const box = document.createElement("input");
    box.className = "text";
    box.placeholder = "具体的に（任意）";
    box.value = getAnswer(s.code+"_text") || "";
    box.addEventListener("input", e => setAnswer(s.code+"_text", e.target.value));
    bodyEl.querySelector(".stack").appendChild(box);

    const badge = document.createElement("div");
    badge.className = "badge warn";
    badge.textContent = "この回答は「保留（要確認）」としてフラグされます。";
    bodyEl.querySelector(".stack").appendChild(badge);
  }
}

function renderMatrixYesNo(s){
  const ans = getAnswer(s.code) || {};
  const stack = document.createElement("div");
  stack.className = "stack";

  const q = document.createElement("div");
  q.className = "note";
  q.innerHTML = `<strong>${escapeHtml(s.question)}</strong><div style="margin-top:8px;color:rgba(11,19,36,.65);font-size:13px">※ いずれか「はい」の場合は終了（対象外）</div>`;
  stack.appendChild(q);

  s.items.forEach(item => {
    const row = document.createElement("div");
    row.className = "rowcard";
    row.innerHTML = `
      <div class="rowlabel"><strong>${escapeHtml(item.label)}</strong></div>
      <div class="rowinput">
        <div class="segment" role="group" aria-label="yes no">
          <button class="segbtn ${ans[item.value]==="yes"?"active":""}" type="button">はい</button>
          <button class="segbtn ${ans[item.value]==="no"?"active":""}" type="button">いいえ</button>
        </div>
      </div>
    `;
    const btns = row.querySelectorAll(".segbtn");
    btns[0].addEventListener("click", () => { ans[item.value]="yes"; setAnswer(s.code, ans); render(); });
    btns[1].addEventListener("click", () => { ans[item.value]="no"; setAnswer(s.code, ans); render(); });
    stack.appendChild(row);
  });

  const allAnswered = s.items.every(it => ans[it.value] === "yes" || ans[it.value] === "no");
  nextBtn.disabled = !allAnswered;
  if (!allAnswered) setHint("未回答の項目があります。");
  bodyEl.appendChild(stack);
}

function renderNumber(s){
  const val = getAnswer(s.code);
  const stack = document.createElement("div");
  stack.className = "stack";

  const q = document.createElement("div");
  q.className = "note";
  q.innerHTML = `<strong>${escapeHtml(s.question)}</strong><div style="margin-top:8px;color:rgba(11,19,36,.65);font-size:13px">条件: ${escapeHtml(s.rule)}</div>`;
  stack.appendChild(q);

  const input = document.createElement("input");
  input.type = "number";
  input.className = "num";
  input.placeholder = s.placeholder || "";
  input.min = s.min ?? "";
  input.max = s.max ?? "";
  input.value = (val ?? "");
  input.addEventListener("input", (e) => {
    const v = e.target.value === "" ? "" : Number(e.target.value);
    setAnswer(s.code, v);
    render();
  });
  stack.appendChild(input);

  bodyEl.appendChild(stack);
  nextBtn.disabled = (val === "" || val === undefined || Number.isNaN(val));
}

function renderPercentGrid(s){
  const ans = getAnswer(s.code) || {};
  const stack = document.createElement("div");
  stack.className = "stack";

  let piped = "";
  if (s.code === "S72") {
    const gad = Number(getAnswer("S70")?.["1"] ?? 0);
    piped = gad ? `（現在の入力: S70-1 = ${gad}人）` : "（S70-1 未入力）";
  }

  const q = document.createElement("div");
  q.className = "note";
  q.innerHTML = `<strong>${escapeHtml(s.question)}</strong><div style="margin-top:8px;color:rgba(11,19,36,.65);font-size:13px">合計: ${s.mustTotal}% ${piped}</div>`;
  stack.appendChild(q);

  s.items.forEach(item => {
    const row = document.createElement("div");
    row.className = "rowcard";
    const v = ans[item.value] ?? "";
    row.innerHTML = `
      <div class="rowlabel"><strong>${escapeHtml(item.label)}</strong></div>
      <div class="rowinput">
        <input class="num" style="max-width:120px" type="number" inputmode="numeric" min="0" max="100" value="${v}"/>
        <div class="suffix">%</div>
      </div>
    `;
    row.querySelector("input").addEventListener("input", e => {
      const x = e.target.value === "" ? "" : Number(e.target.value);
      ans[item.value] = x;
      setAnswer(s.code, ans);
      render();
    });
    stack.appendChild(row);
  });

  const total = s.items.reduce((sum,it) => sum + (Number(ans[it.value]) || 0), 0);
  const okTotal = total === s.mustTotal && s.items.every(it => ans[it.value] !== "" && ans[it.value] !== undefined);

  const badge = document.createElement("div");
  badge.className = okTotal ? "pill good" : "pill warn";
  badge.textContent = okTotal ? `合計 ${total}%` : `現在の合計 ${total}%（${s.mustTotal}%になるよう調整してください）`;
  stack.appendChild(badge);

  if (s.code === "S72" && okTotal) {
    const adult = Number(ans["3"]) || 0;
    const tag = document.createElement("div");
    tag.className = adult >= 50 ? "pill good" : "pill warn";
    tag.textContent = adult >= 50 ? `成人（18歳以上）: ${adult}% ✅` : `成人（18歳以上）: ${adult}% → 50%未満（保留）`;
    stack.appendChild(tag);
  }

  bodyEl.appendChild(stack);
  nextBtn.disabled = !okTotal;
}

function renderNumberListWithNone(s){
  const ans = getAnswer(s.code) || {};
  const stack = document.createElement("div");
  stack.className = "stack";

  const q = document.createElement("div");
  q.className = "note";
  q.innerHTML = `<strong>${escapeHtml(s.question)}</strong><div style="margin-top:8px;color:rgba(11,19,36,.65);font-size:13px">条件: GAD/不安症（S70-1）は${s.gadMin}名以上</div>`;
  stack.appendChild(q);

  const noneChecked = !!ans[s.noneValue];

  s.items.filter(it => it.value !== s.noneValue).forEach(item => {
    const row = document.createElement("div");
    row.className = "rowcard";
    const v = ans[item.value] ?? "";
    row.innerHTML = `
      <div class="rowlabel"><strong>${escapeHtml(item.label)}</strong></div>
      <div class="rowinput">
        <input class="num" style="max-width:140px" type="number" inputmode="numeric" min="0" max="999" value="${v}" ${noneChecked?"disabled":""}/>
        <div class="suffix">名</div>
      </div>
    `;
    row.querySelector("input").addEventListener("input", e => {
      const x = e.target.value === "" ? "" : Number(e.target.value);
      ans[item.value] = x;
      setAnswer(s.code, ans);
      render();
    });
    stack.appendChild(row);
  });

  const noneLabel = s.items.find(it=>it.value===s.noneValue).label;
  const noneRow = document.createElement("label");
  noneRow.className = "option small";
  noneRow.innerHTML = `
    <input type="checkbox" ${noneChecked?"checked":""}/>
    <div class="label"><strong>${escapeHtml(noneLabel)}</strong>（選択すると終了）</div>
  `;
  noneRow.querySelector("input").addEventListener("change", e => {
    if (e.target.checked) {
      Object.keys(ans).forEach(k => delete ans[k]);
      ans[s.noneValue] = true;
    } else {
      delete ans[s.noneValue];
    }
    setAnswer(s.code, ans);
    render();
  });
  stack.appendChild(noneRow);

  let ok = true;
  if (noneChecked) ok = true;
  else {
    const gad = Number(ans[s.gadValue]) || 0;
    ok = gad >= s.gadMin;
    const pill = document.createElement("div");
    pill.className = gad >= s.gadMin ? "pill good" : "pill bad";
    pill.textContent = gad >= s.gadMin ? `S70-1: ${gad}名 ✅` : `S70-1: ${gad}名（${s.gadMin}名以上が必要）`;
    stack.appendChild(pill);
  }

  bodyEl.appendChild(stack);
  nextBtn.disabled = !ok;
}

function renderTherapyChecklist(s){
  const selected = new Set(getAnswer(s.code) || []);
  const otherText = getAnswer(s.code+"_text") || "";
  const stack = document.createElement("div");
  stack.className = "stack";

  const q = document.createElement("div");
  q.className = "note";
  q.innerHTML = `<strong>${escapeHtml(s.question)}</strong><div style="margin-top:8px;color:rgba(11,19,36,.65);font-size:13px">条件: 1〜7のいずれかを選択必須／99は終了／98は保留（要確認）</div>`;
  stack.appendChild(q);

  const groups = {};
  s.options.forEach(o => {
    const g = o.group || "Other";
    groups[g] = groups[g] || [];
    groups[g].push(o);
  });

  const noneSelected = selected.has("99");

  const renderOption = (o) => {
    const id = `${s.code}_${o.value}`;
    const label = document.createElement("label");
    label.className = "option";
    label.setAttribute("for", id);
    label.innerHTML = `
      <input type="checkbox" id="${id}" value="${o.value}" ${selected.has(o.value)?"checked":""} ${noneSelected && o.value!=="99" ? "disabled": ""}/>
      <div class="label"><strong>${escapeHtml(o.label)}</strong></div>
    `;
    label.querySelector("input").addEventListener("change", (e) => {
      const v = e.target.value;
      if (v === "99" && e.target.checked) {
        selected.clear();
        selected.add("99");
      } else {
        if (e.target.checked) selected.add(v);
        else selected.delete(v);
        selected.delete("99");
      }
      setAnswer(s.code, Array.from(selected));
      render();
    });
    return label;
  };

  Object.keys(groups).forEach(g => {
    const h = document.createElement("div");
    h.className = "group-title";
    h.textContent = g;
    stack.appendChild(h);
    groups[g].forEach(o => stack.appendChild(renderOption(o)));
  });

  if (selected.has("98")) {
    const box = document.createElement("input");
    box.className = "text";
    box.placeholder = "「上記以外」の具体名を入力";
    box.value = otherText;
    box.addEventListener("input", e => { setAnswer(s.code+"_text", e.target.value); render(); });
    stack.appendChild(box);

    const badge = document.createElement("div");
    badge.className = "badge warn";
    badge.textContent = "「上記以外」が選択されています（保留／要確認）。";
    stack.appendChild(badge);
  }

  const hasCore = ["1","2","3","4","5","6","7"].some(v => selected.has(v));
  const hasNone = selected.has("99");
  let ok = hasNone || hasCore;
  if (!ok) setHint("1〜7のいずれかを選択してください。", "warn");

  if (selected.has("98") && !otherText.trim()) {
    ok = false;
    setHint("「上記以外」を選択した場合は具体名を入力してください。", "warn");
  }

  bodyEl.appendChild(stack);
  nextBtn.disabled = !ok;
}

function renderComplete(){
  const stack = document.createElement("div");
  stack.className = "stack";
  stack.innerHTML = `
    <div class="note">
      <strong>${escapeHtml(TEXT.thankYouMsg || "ありがとうございました。")}</strong><br/>
      <span style="color:rgba(11,19,36,.68)">（この画面はデモ用の完了ページです）</span>
    </div>
    <details class="note">
      <summary style="cursor:pointer; font-weight:900;">入力内容（デモ表示）</summary>
      <pre style="white-space:pre-wrap; margin:12px 0 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; line-height: 1.6;">${escapeHtml(JSON.stringify(state.answers, null, 2))}</pre>
    </details>
  `;
  bodyEl.appendChild(stack);
  backBtn.disabled = true;
  nextBtn.textContent = "最初から";
}

function renderTerminate(){
  const stack = document.createElement("div");
  stack.className = "stack";
  stack.innerHTML = `
    <div class="badge">対象条件に該当しないため終了（デモ）</div>
    <div class="note"><strong>${escapeHtml(TEXT.terminateMsg || "終了となります。")}</strong></div>
  `;
  bodyEl.appendChild(stack);
  backBtn.disabled = true;
  nextBtn.textContent = "最初から";
}

function renderHold(){
  const stack = document.createElement("div");
  stack.className = "stack";
  stack.innerHTML = `
    <div class="badge warn">保留（要確認）</div>
    <div class="note">
      <strong>この回答は条件により「保留」扱いです。</strong><br/>
      <span style="color:rgba(11,19,36,.68)">
        実運用では、担当者による確認・割付が必要になる想定です（デモではここで終了）。
      </span>
    </div>
    <details class="note">
      <summary style="cursor:pointer; font-weight:900;">入力内容（デモ表示）</summary>
      <pre style="white-space:pre-wrap; margin:12px 0 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; line-height: 1.6;">${escapeHtml(JSON.stringify(state.answers, null, 2))}</pre>
    </details>
  `;
  bodyEl.appendChild(stack);
  backBtn.disabled = true;
  nextBtn.textContent = "最初から";
}

function goBack(){
  if (state.screenIndex <= 0) return;
  state.screenIndex -= 1;
  nextBtn.textContent = "次へ";
  render();
}

function goNext(){
  const s = currentScreen();

  if (["complete","terminate","hold"].includes(s.type)) {
    restart();
    return;
  }

  if (s.type === "start") {
    state.screenIndex += 1;
    nextBtn.textContent = "次へ";
    render();
    return;
  }

  if (s.type === "consent") {
    const v = getAnswer(s.id);
    if (!v) return;
    if (v === "2") { showEnd("terminate"); return; }
    state.screenIndex += 1;
    render();
    return;
  }

  if (s.code === "S25") {
    const ans = getAnswer("S25") || {};
    const anyYes = Object.values(ans).some(x => x === "yes");
    if (anyYes) { showEnd("terminate"); return; }
  }

  if (s.code === "S41") {
    const v = getAnswer("S41");
    if (v === "10") { showEnd("terminate"); return; }
  }

  if (s.code === "S50") {
    const v = Number(getAnswer("S50"));
    if (Number.isFinite(v) && (v < 3 || v > 30)) { showEnd("terminate"); return; }
  }

  if (s.code === "S65") {
    const ans = getAnswer("S65") || {};
    const care = Number(ans["1"]) || 0;
    if (care < 60) { showEnd("terminate"); return; }
  }

  if (s.code === "S70") {
    const ans = getAnswer("S70") || {};
    if (ans["9"]) { showEnd("terminate"); return; }
    const gad = Number(ans["1"]) || 0;
    if (gad < 5) { showEnd("terminate"); return; }
  }

  if (s.code === "S72") {
    const ans = getAnswer("S72") || {};
    const adult = Number(ans["3"]) || 0;
    if (adult < 50) { showEnd("hold"); return; }
  }

  if (s.code === "S86") {
    const sel = new Set(getAnswer("S86") || []);
    if (sel.has("99")) { showEnd("terminate"); return; }
    if (sel.has("98")) { showEnd("hold"); return; }
  }

  state.screenIndex += 1;
  state.screenIndex = clamp(state.screenIndex, 0, SCREENS.length - 1);

  const next = currentScreen();
  nextBtn.textContent = next.type === "complete" ? "最初から" : "次へ";
  render();
}

function showEnd(kind){
  const end = END_SCREENS[kind];
  SCREENS.splice(state.screenIndex + 1, 0, end);
  state.screenIndex += 1;
  render();
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

render();
