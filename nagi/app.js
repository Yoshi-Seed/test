import {
 VERSION,TRIGGERS,PLACES,DURATIONS,ACTIONS,OUTCOMES,LETTERS,esc,pad,localDay,localTime,localInput,
 dateFromDay,addDays,daysBetween,prettyDay,num,uniqueDays,rangeData,daily,counts,level,strengthText,
 defaultState,validateEntry,validateState,mergeStates,makeReport
} from './core.js';
import {APP_PATH,openStore,readStore,mutateStore,resetStore,lastRaw,encryptBackup,decryptBackup} from './storage.js';

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const paths={
 wave:'M2 9c3-5 7 5 10 0s7 5 10 0M2 15c3-5 7 5 10 0s7 5 10 0',
 sun:'M12 3v1m0 16v1M3 12h1m16 0h1M5.6 5.6l.7.7m11.4 11.4.7.7M5.6 18.4l.7-.7M17.7 6.3l.7-.7M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 calendar:'M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2M7 3v4m10-4v4M3 10h18M7 14h1m3 0h1m3 0h1M7 17h1m3 0h1m3 0h1',
 trend:'M3 18V6m0 12h18M6 14l4-4 4 2 5-7',
 report:'M7 3h8l4 4v14H5V3h2m8 0v5h4M9 12h6m-6 4h6',
 gear:'M9 3h6l.5 3 2 1 2.7-1 2.3 5-2.5 2 .1 2 1.8 2.2-3.5 4-2.7-1-2 .8L12 23l-3-2-2-.8-2.7 1-3.5-4L2.6 15l.1-2L.2 11l2.3-5 2.7 1 2-1L9 3M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9.5 3h5l.5 2.5 2 1.2 2.4-.8 2.5 4.3-1.9 1.8v2l1.9 1.8-2.5 4.3-2.4-.8-2 1.2-.5 2.5h-5L9 20.5l-2-1.2-2.4.8-2.5-4.3L4 14v-2l-1.9-1.8 2.5-4.3 2.4.8 2-1.2.5-2.5',
 shield:'M12 3 3.5 6v6c0 5 8.5 9 8.5 9s8.5-4 8.5-9V6L12 3M8 12l3 3 5-6',
 eye:'M3 3l18 18M10 5c1-.2 3-.2 4 .1 5 1.2 8 6.9 8 6.9s-1 2-3 4M6.5 6.5C3.5 8.5 2 12 2 12s4 7 10 7c1.7 0 3.2-.5 4.5-1.2M9.2 9.2a4 4 0 0 0 5.6 5.6',
 plus:'M12 5v14M5 12h14',
 close:'M6 6l12 12M18 6 6 18',
 left:'m15 5-7 7 7 7',
 right:'m9 5 7 7-7 7',
 check:'m5 12 4 4L19 6',
 star:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3',
 garden:'m3 17 7-12 9 5-5 10M2 17h2m5-12h2m7 5h2m-7 10h2M6 12h1m9-8h1m4 14h1',
 pause:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M9 8v8m6-8v8',
 mail:'M3 5h18v14H3V5m0 0 9 8 9-8',
 download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
 upload:'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',
 copy:'M8 8h12v13H8V8M16 8V3H3v13h5',
 share:'M12 15V2M8 6l4-4 4 4M7 9H4v12h16V9h-3',
 trash:'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
 heart:'M12 20 4 12C-2 5 7-1 12 6c5-7 14-1 8 6l-8 8',
 phone:'M5 3h4l2 5-3 2c2 3 3 4 6 6l2-3 5 2v4c0 2-3 3-5 2C8 18 5 15 2 7c-1-2 1-4 3-4',
 sound:'M3 9h4l5-4v14l-5-4H3V9m13-2c3 3 3 7 0 10m3-13c5 5 5 11 0 16',
 leaf:'M20 3C6 1 1 10 7 16s15 0 13-13M5 21 16 9',
 info:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 11v6m0-10v1'
};
function icon(n){return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[n]||paths.wave}"/></svg>`;}
const sea=()=>`<svg class="sea" viewBox="0 0 500 150" preserveAspectRatio="none" aria-hidden="true"><path d="M-40 73Q55 30 150 69T345 72T550 53V170H-40Z" fill="#bdced6" opacity=".19"/><path d="M-40 94Q75 58 175 96T365 96T550 75V170H-40Z" fill="#bed1d5" opacity=".17"/><path d="M-40 121Q75 83 175 117T355 121T550 102V170H-40Z" fill="#d2dfde" opacity=".18"/><path d="M-40 94Q75 58 175 96T365 96T550 75" fill="none" stroke="#f0f4f2" stroke-width=".65" opacity=".26"/></svg>`;
let state;
let ui={tab:'today',selected:localDay(),month:localDay().slice(0,7),period:30,reportPeriod:30,reportInvalid:false,reportStart:addDays(localDay(),-29),reportEnd:localDay(),details:false,offlineReady:false,waiting:null,day:localDay()};
let channel,toastTimeout,entryDraft=null,cleanupModal=null,focusBeforeModal=null,backupURL=null,incomingBackup=null,audio=null,pauseTimer=null,pauseDuration=90,pauseDeadline=null,pauseRemaining=90;
let wantReload=false,noteDirty=false,queuedWrite=Promise.resolve();
const root=$('#app'),modalRoot=$('#modal-root'),cover=$('#cover');

function applyTheme(){
 const dark=state.settings.theme==='dark'||(state.settings.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);
 document.documentElement.dataset.theme=dark?'dark':'light';
 document.documentElement.dataset.motion=state.settings.motion?'on':'off';
 $('meta[name="theme-color"]').content=dark?'#202a38':'#f5f4f0';
}
function toast(message){
 clearTimeout(toastTimeout);const el=$('#toast');el.textContent=message;el.classList.add('visible');
 toastTimeout=setTimeout(()=>el.classList.remove('visible'),4200);
}
function showError(error){
 console.error(error?.name||'NagiError'); // Do not log record contents.
 const target=$('#modal-error')||$('#page-error');
 if(target){target.textContent=error.message||'処理できませんでした。もう一度お試しください。';target.scrollIntoView({block:'nearest'});}
 else toast(error.message||'処理できませんでした。');
}
function commit(fn){
 const operation=queuedWrite.then(async()=>{
  const next=await mutateStore(fn);state=next;applyTheme();render();channel?.postMessage({revision:state.revision});return next;
 });
 queuedWrite=operation.catch(()=>{});
 return operation;
}
function header(){return `<header class="app-header"><div class="wordmark"><span class="brand-kanji">凪</span><div><div class="brand-en">NAGI</div><div class="brand-label">波と、暮らす。</div></div></div><div class="header-tools"><button class="icon-btn" data-action="cover" aria-label="画面を隠す">${icon('eye')}</button><button class="icon-btn" data-action="settings" aria-label="設定">${icon('settings')}</button></div></header>`;}
function nav(){return `<nav class="bottom-nav" aria-label="メインメニュー">${[['today','sun','今日'],['history','calendar','足あと'],['insights','trend','気づき'],['report','report','相談メモ']].map(([id,i,name])=>`<button class="nav-item ${ui.tab===id?'active':''}" data-action="tab" data-tab="${id}" ${ui.tab===id?'aria-current="page"':''}>${icon(i)}<span>${name}</span></button>`).join('')}</nav>`;}
function render(){
 if(!state)return;
 const note=$('#consult-note');
 const currentNote=noteDirty&&note?note.value:null;
 root.innerHTML=header()+`<main id="main" class="screen">${({today:todayScreen,history:historyScreen,insights:insightsScreen,report:reportScreen}[ui.tab])()}</main>`+nav();
 if(currentNote!==null&&$('#consult-note'))$('#consult-note').value=currentNote;
}
function scene(){
 const h=new Date().getHours();
 return h<5||h>=19?'night':h<10?'morning':h<16?'day':'evening';
}
function greeting(){
 const h=new Date().getHours(),name=state.settings.nickname?esc(state.settings.nickname)+'、':'';
 return name+(h>=5&&h<11?'おはよう。':h>=11&&h<18?'こんにちは。':'こんばんは。');
}
function empty(title,body,i='wave'){return `<div class="card empty">${icon(i)}<h3>${title}</h3><p>${body}</p></div>`;}
function stat(label,value,unit=''){return `<div class="stat"><div class="stat-label">${label}</div><div class="stat-number">${num(value)}<small>${unit}</small></div></div>`;}
function entryCard(e){
 const isCheck=e.kind==='check';
 return `<button class="card entry" data-action="edit-entry" data-id="${esc(e.id)}" aria-label="${esc(e.time)} ${isCheck?'渇望なし':`強さ${e.strength}`}の記録を編集"><span class="entry-mark ${level(e.strength)}">${isCheck?icon('leaf'):e.strength}</span><span class="entry-copy"><span class="entry-top"><span class="entry-title">${isCheck?'いまは渇望なし':`波の強さ ${e.strength}<small> / 10</small>`}</span><time>${esc(e.time)}</time></span><span class="entry-sub">${isCheck?'確認した時点の記録':esc(OUTCOMES[e.outcome])}${e.after!==null?` · その後 ${e.after}/10`:''}${e.triggers.length?'<br>'+e.triggers.map(esc).join(' · '):''}</span>${e.note?`<span class="entry-note" style="display:block">${esc(e.note.length>80?e.note.slice(0,80)+'…':e.note)}</span>`:''}</span></button>`;
}
function backupDue(){
 if(!state.entries.length)return false;
 const now=Date.now(),base=state.lastBackup||state.createdAt;
 return now-Date.parse(base)>7*86400000&&(!state.backupSnooze||now>Date.parse(state.backupSnooze));
}
function todayScreen(){
 const today=localDay(),d=daily(state.entries,today),n=uniqueDays(state.entries).length;
 const sorted=[...d.all].sort((a,b)=>b.at.localeCompare(a.at));
 const sky=scene();
 const stars=Array.from({length:12},(_,i)=>`<i class="star" style="left:${15+(i*23)%79}%;top:${10+(i*13)%44}%;animation-delay:${i%5}s"></i>`).join('');
 return `<p class="date-label">${prettyDay(today,true)}</p>
 ${ui.waiting?`<div class="update-pill">新しい凪が届いています<button data-action="update-app">更新する</button></div>`:''}
 <section class="hero ${sky}" aria-label="今日の海">
  <div class="stars" aria-hidden="true">${stars}</div><div class="sky-orb" aria-hidden="true"></div>
  <div class="hero-copy"><p class="eyebrow">A LITTLE SPACE FOR YOU</p><h1><span class="greeting">${greeting()}</span>今日の波も、<br>そのままで。</h1></div>
  ${sea()}<span class="hero-note">うまく書くより、ありのままに。</span>
  <button class="letter-trigger" data-action="letter" aria-label="ウェインツ君からの今日の手紙">${icon('star')}</button>
 </section>
 <div class="main-actions"><button class="btn btn-primary" data-action="new-entry">${icon('plus')}いまの波を記録</button>
 <div class="action-pair"><button class="btn btn-secondary" data-action="no-craving">${icon('leaf')}いまは渇望なし</button><button class="btn btn-soft" data-action="pause">${icon('pause')}ひと息の部屋</button></div></div>
 <section class="section"><div class="section-head"><h2>今日の足あと</h2><small>${d.all.length?'残せたことを、そのままに':'まだ、何も書かなくて大丈夫'}</small></div>
 <div class="stats">${stat('波の記録',d.count,'件')}${stat('最大の強さ',d.max,'/ 10')}${stat('渇望なしの確認',d.all.filter(e=>e.kind==='check').length,'回')}</div>
 <div class="entry-list" style="margin-top:13px">${sorted.length?sorted.slice(0,3).map(entryCard).join(''):empty('今日の一行は、これから。','強さだけでも残せます。<br>詳しいことは、あとからでも。','leaf')}</div>
 ${sorted.length>3?'<button class="text-button" data-action="today-history">今日の記録をすべて見る →</button>':''}
 </section>
 <section class="section"><button class="card garden-card" data-action="garden"><span class="garden-title">あなたの、星の庭。</span><span class="garden-description">${n?`${n}日分の足あとが、小さな星に。`:'一日を残すと、星がひとつ。'}<br>連続じゃなくても、ここに残る。</span><span class="garden-mini">${icon('garden')}</span><span class="garden-foot">記録の内容や強さでは、星は変わりません。</span></button></section>
 ${backupDue()?`<div class="notice warm section"><strong>大切な足あとを、もう一か所に。</strong>端末のデータ消去に備えて、バックアップを。<br><button data-action="backup">暗号化して書き出す</button> <button data-action="snooze-backup">また今度</button></div>`:''}
 <div class="privacy-line">${icon('shield')}記録内容は、この端末の中に。</div>
 <button class="help-link" data-action="help">助けが必要なとき・服薬について</button>`;
}
function historyScreen(){
 const first=`${ui.month}-01`,md=dateFromDay(first),offset=(md.getDay()+6)%7;
 const end=new Date(md.getFullYear(),md.getMonth()+1,0).getDate(),today=localDay();
 const selected=daily(state.entries,ui.selected);
 return `<h1 class="page-title">足あと</h1><p class="page-sub">波のある日も、静かな日も。<br>記録した日だけ、色がつきます。</p>
 <div class="month-nav"><button class="icon-btn" data-action="prev-month" aria-label="前の月">${icon('left')}</button><h2 class="month-title">${md.getFullYear()}年 ${md.getMonth()+1}月</h2><button class="icon-btn" data-action="next-month" aria-label="次の月" ${ui.month>=today.slice(0,7)?'disabled':''}>${icon('right')}</button></div>
 <div class="weekdays" aria-hidden="true">${[...'月火水木金土日'].map(x=>`<span>${x}</span>`).join('')}</div>
 <div class="calendar" aria-label="${md.getMonth()+1}月の記録">${'<span></span>'.repeat(offset)}${Array.from({length:end},(_,i)=>{
  const day=`${ui.month}-${pad(i+1)}`,v=daily(state.entries,day);
  const desc=v.max===null?'未記録':v.max===0?'渇望なしの確認のみ':`最大${v.max}、波${v.count}件`;
  return `<button class="day ${level(v.max)} ${ui.selected===day?'selected':''} ${day===today?'today':''}" data-action="select-day" data-day="${day}" aria-label="${i+1}日 ${desc}" aria-pressed="${ui.selected===day}" ${day>today?'disabled':''}><span>${i+1}</span>${v.count?`<span class="day-dot">${v.count}件</span>`:''}</button>`;
 }).join('')}</div>
 <div class="legend">${[['missing','未記録'],['zero','なし'],['low','1–3'],['mid','4–6'],['high','7–10']].map(([k,t])=>`<span><i class="${k}"></i>${t}</span>`).join('')}</div>
 <p class="month-note">色＝その日の最大の強さ。「なし」は確認時点の記録です。</p>
 <section class="section"><div class="section-head"><h2>${prettyDay(ui.selected)}</h2><button class="text-button" data-action="history-entry">＋ この日に追加</button></div>
 <div class="entry-list">${selected.all.length?[...selected.all].sort((a,b)=>b.at.localeCompare(a.at)).map(entryCard).join(''):empty('まだ、白紙の日。','未記録の日を、渇望なしとは数えません。<br>思い出せることがあれば、あとからでも。','calendar')}</div></section>
 <button class="btn btn-secondary" style="margin-top:20px" data-action="return-today">今日に戻る</button>`;
}
function segment(values,selected,action){return `<div class="segment" role="group" aria-label="表示期間">${values.map(n=>`<button class="${n===selected?'active':''}" aria-pressed="${n===selected}" data-action="${action}" data-value="${n}">${n}日</button>`).join('')}</div>`;}
function chart(start,end,kind='max'){
 const days=daysBetween(start,end),rows=days.map(day=>({day,...daily(state.entries,day)}));
 const ymax=kind==='max'?10:Math.max(2,...rows.map(r=>r.count)),left=26,right=314,top=13,bottom=135;
 const X=i=>left+(days.length>1?i/(days.length-1)*(right-left):0),Y=v=>bottom-v/ymax*(bottom-top);
 let parts=[],path='';
 rows.forEach((r,i)=>{
  const v=r.max===null?null:kind==='max'?r.max:r.count;
  if(v===null){path='';parts.push(`<path class="missing-cross" d="m${X(i)-1.7} ${bottom+11}-3.4-3.4m0 3.4 3.4-3.4" transform="translate(1.7 0)"/>`);return;}
  if(kind==='max'){
   if(path)parts.push(`<path class="trace" d="M${X(i-1)} ${Y(path)}L${X(i)} ${Y(v)}"/>`);
   // previous value 0 is a valid observation, not a missing value.
   if(path===0)parts.push(`<path class="trace" d="M${X(i-1)} ${Y(0)}L${X(i)} ${Y(v)}"/>`);
   parts.push(`<circle class="${v===0?'zero-dot':'dot'}" cx="${X(i)}" cy="${Y(v)}" r="${days.length>30?1.7:2.6}"/>`);
   path=v;
  }else{
   const w=Math.max(2,Math.min(11,(right-left)/days.length*.58));
   parts.push(v?`<rect x="${X(i)-w/2}" y="${Y(v)}" width="${w}" height="${bottom-Y(v)}" rx="${Math.min(3,w/2)}" fill="#8395b5"/>`:`<circle class="zero-dot" cx="${X(i)}" cy="${bottom}" r="2"/>`);
  }
 });
 return `<svg class="chart" viewBox="0 0 330 175" role="img" aria-label="${kind==='max'?'日ごとの最大の強さ':'日ごとの波の記録件数'}。未記録日は線をつながず、下端にバツ印。詳細は数値一覧で確認できます。">
 ${[0,ymax/2,ymax].map(v=>`<line class="gridline" x1="${left}" x2="${right}" y1="${Y(v)}" y2="${Y(v)}"/><text x="4" y="${Y(v)+3}">${Number.isInteger(v)?v:v.toFixed(1)}</text>`).join('')}
 ${parts.join('')}${[0,Math.floor((days.length-1)/2),days.length-1].filter((v,i,a)=>a.indexOf(v)===i).map(i=>`<text x="${X(i)}" y="166" text-anchor="${i===0?'start':i===days.length-1?'end':'middle'}">${Number(days[i].slice(5,7))}/${Number(days[i].slice(8))}</text>`).join('')}</svg>`;
}
function bars(data,total,emptyLabel='まだ記録がありません。'){
 if(!data.length)return `<p class="field-tip">${emptyLabel}</p>`;
 return `<div class="bar-list">${data.slice(0,6).map(([k,n])=>`<div><div class="bar-label"><span>${esc(k)}</span><span>${n}件</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,n/Math.max(1,total)*100)}%"></div></div></div>`).join('')}</div>`;
}
function insightsScreen(){
 const end=localDay(),start=addDays(end,1-ui.period),r=rangeData(state.entries,start,end);
 const hours=[['深夜 0–5時',0],['朝 6–11時',0],['昼 12–17時',0],['夜 18–23時',0]];
 r.waves.forEach(e=>hours[Math.floor(Number(e.time.slice(0,2))/6)][1]++);
 const trigger=counts(r.waves,'triggers')[0],week=rangeData(state.entries,addDays(end,-6),end);
 return `<h1 class="page-title">気づき</h1><p class="page-sub">自分を採点するのではなく、<br>波の輪郭を、少しずつ知るために。</p>
 ${segment([7,14,30,90],ui.period,'insight-period')}
 <div class="stats four">${stat('波の記録',r.count,'件')}${stat('平均の強さ',r.average,'/ 10')}${stat('最大の強さ',r.max,'/ 10')}${stat('記録した日',r.days.length,`/ ${ui.period}日`)}</div>
 <p class="field-tip">平均は渇望あり ${r.count}件が分母。未記録 ${r.missing}日は計算に入れていません。渇望なしの確認のみ ${r.zeroOnly.length}日。</p>
 <section class="section card insight"><p class="eyebrow">A SMALL OBSERVATION</p>${week.days.length?`直近7日間に、${week.days.length}日分の足あと。`:'まだ、気づきを急がなくて大丈夫。'}${trigger?`<br>この期間によく選ばれたきっかけは「${esc(trigger[0])}」（${trigger[1]}件）。原因と決まったわけではなく、相談の手がかりです。`:'<br>記録が増えると、時間帯やきっかけがここに見えてきます。'}</section>
 <section class="section card chart-card"><h2 class="chart-heading">日ごとの、いちばん大きな波</h2>${r.all.length?chart(start,end):'<div class="empty"><p>最初の記録から、線が生まれます。<br>まだ数値はありません。</p></div>'}<p class="chart-note">● 記録あり　× 未記録（0ではありません）<br>日付は記録時の現地日付。空白の日は線でつなぎません。</p></section>
 <section class="section card chart-card"><h2 class="chart-heading">日ごとの、波の記録件数</h2>${r.all.length?chart(start,end,'count'):'<div class="empty"><p>波の記録はまだありません。</p></div>'}<p class="chart-note">記録した分だけを表示。未記録日は0件とみなしません。</p></section>
 <details class="details"><summary>グラフの数値を一覧で見る</summary><div class="card">${daysBetween(start,end).map(d=>{const v=daily(state.entries,d);return `<div class="outcome-row"><span>${Number(d.slice(5,7))}/${Number(d.slice(8))}</span><span>${v.max===null?'未記録':`最大 ${v.max}/10 · 波 ${v.count}件`}</span></div>`;}).join('')}</div></details>
 <section class="section card"><h2 class="chart-heading">きっかけ</h2>${bars(counts(r.waves,'triggers'),r.count)}<p class="field-tip">複数選択のため、合計は波の記録件数を超えることがあります。</p></section>
 <section class="section card"><h2 class="chart-heading">波を記録した時間帯</h2>${bars(r.count?hours:[],r.count)}</section>
 <section class="section card"><h2 class="chart-heading">そのとき、したこと</h2>${bars(counts(r.waves,'actions'),r.count)}<p class="field-tip">選ばれた回数です。対処の効果を示すものではありません。</p></section>
 <section class="section card"><h2 class="chart-heading">その後の強さ</h2><p class="field-tip">${r.paired.length?`前後両方の記録がある ${r.paired.length}件で、変化の平均は ${r.afterChange>0?'+':''}${r.afterChange}（その後 − 最初）。自然な時間経過などの影響もあり、対処の効果とは判断できません。`:'あとから「その後の強さ」を足すと、前後の変化を振り返れます。入力は任意です。'}</p></section>
 <section class="section card"><h2 class="chart-heading">その後の状況</h2>${Object.entries(OUTCOMES).map(([k,v])=>`<div class="outcome-row"><span>${v}</span><span>${r.waves.filter(e=>e.outcome===k).length}件</span></div>`).join('')}<p class="field-tip">服用の有無を成功・失敗として評価しません。処方の範囲内での服用も、別の項目として記録します。</p></section>`;
}
function reportScreen(){
 const r=rangeData(state.entries,ui.reportStart,ui.reportEnd),total=daysBetween(ui.reportStart,ui.reportEnd).length;
 return `<h1 class="page-title">相談メモ</h1><p class="page-sub">診察のとき、うまく話せなくても。<br>伝えたいことを、ここにまとめておく。</p>
 ${segment([7,14,30,90],ui.reportPeriod,'report-period')}
 <div class="two-cols"><label class="form-row" style="margin-top:0"><span class="field-label">開始日</span><input id="report-start" type="date" value="${ui.reportStart}" max="${localDay()}" min="1900-01-01"></label><label class="form-row" style="margin-top:0"><span class="field-label">終了日</span><input id="report-end" type="date" value="${ui.reportEnd}" max="${localDay()}" min="1900-01-01"></label></div>
 <div class="card report-summary"><div><span class="number-highlight">${r.days.length}</span>日分の記録 / ${total}日間</div><p>波の記録 <strong>${r.count}件</strong>　平均 <strong>${num(r.average)}/10</strong><br>最大 <strong>${num(r.max)}/10</strong>　未記録 <strong>${r.missing}日</strong><br>渇望なしの確認 <strong>${r.checks.length}件</strong></p><p class="subtle-note">未記録を0として計算していません。渇望なしの確認は、確認した時点の状態です。</p></div>
 <form id="consult-form"><label class="form-row"><span class="field-label">先生に伝えたいこと<small>端末内に保存</small></span><textarea id="consult-note" maxlength="12000" rows="6" placeholder="気になったこと、困っていること、薬について確認したいこと。箇条書きでも大丈夫。">${esc(state.consultNote)}</textarea></label>
 <button class="btn btn-secondary" type="submit" id="save-consult">メモを保存</button><p id="consult-status" class="field-tip" role="status">${noteDirty?'変更はまだ保存されていません。':'このメモは、どの集計期間でも共通です。'}</p></form>
 <section class="section"><label class="check-row"><input type="checkbox" id="include-details" ${ui.details?'checked':''}>記録ごとの明細・自由記述も含める</label><p class="subtle-note">オフでも、上の相談メモは出力に含まれます。渡す前に内容をご確認ください。</p>
 <div class="export-actions"><button class="btn btn-primary" data-action="preview-report">${icon('report')}まとめを確認する</button><button class="btn btn-secondary" data-action="share-report">${icon('share')}テキストを共有</button></div></section>
 <div id="page-error" class="error-text" role="alert"></div>
 <div class="notice section">これは本人の記録を集計した相談用メモです。診断や、服薬量の提案は行いません。</div>`;
}

function closeModal(force=false){
 const dlg=$('#sheet');
 if(!dlg)return true;
 if(!force&&$('[data-dirty="true"]',dlg)&&!confirm('まだ保存していない変更があります。保存せずに閉じますか？'))return false;
 cleanupModal?.();cleanupModal=null;entryDraft=null;incomingBackup=null;
 dlg.close();modalRoot.innerHTML='';
 document.body.style.overflow='';
 if(focusBeforeModal?.isConnected)focusBeforeModal.focus({preventScroll:true});
 return true;
}
function openModal(title,body,footer='',className=''){
 if(!closeModal())return false;
 focusBeforeModal=document.activeElement;
 modalRoot.innerHTML=`<dialog id="sheet" class="sheet ${className}" aria-labelledby="sheet-title"><div class="sheet-wrap"><header class="sheet-head"><h2 id="sheet-title">${title}</h2><button class="icon-btn" data-action="close-modal" aria-label="閉じる">${icon('close')}</button></header><div class="sheet-body">${body}<p id="modal-error" class="error-text" role="alert"></p></div>${footer?`<footer class="sheet-footer">${footer}</footer>`:''}</div></dialog>`;
 const dlg=$('#sheet');
 dlg.addEventListener('cancel',e=>{e.preventDefault();closeModal();});
 dlg.addEventListener('click',e=>{
  if(e.target===dlg){const r=dlg.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}
 });
 dlg.showModal();document.body.style.overflow='hidden';
 $('[data-action="close-modal"]',dlg).focus({preventScroll:true});
 return true;
}
function welcome(){
 openModal('はじめまして、凪です。',
 `<div class="welcome-art" aria-hidden="true"><div class="welcome-moon"></div>${sea()}</div>
 <h3 class="welcome-title">波のある日も、<br>静かな日も。</h3>
 <p class="page-sub">処方薬への渇望を、自分のペースで残す場所。<br>数字ひとつから、はじめられます。</p>
 <div class="welcome-points">
 <div class="welcome-point">${icon('leaf')}<p><strong>毎日でなくて、大丈夫。</strong>連続記録や我慢を競う仕組みはありません。</p></div>
 <div class="welcome-point">${icon('shield')}<p><strong>記録内容は端末内だけに保存。</strong>アカウント・広告・アクセス解析はありません。保存データ自体は暗号化されないため、iPhoneのロックもご利用ください。</p></div>
 <div class="welcome-point">${icon('report')}<p><strong>相談の言葉を、少しずつ。</strong>履歴とメモを、診察用にまとめられます。</p></div></div>
 <div class="notice warm">薬の中止・減量を勧めるアプリではありません。服用方法は処方医の指示に従い、変更は相談してください。端末のデータ消去に備え、暗号化バックアップを保存できます。</div>`,
 `<button class="btn btn-primary" data-action="start-app">自分のペースで、はじめる</button><p>設定から、いつでも使い方を確認できます。</p>`);
}
function chips(field,options,selected=[],block=false){
 const set=new Set(Array.isArray(selected)?selected:[selected]);
 return `<div class="chips ${block?'block':''}" role="group" aria-label="${({outcome:'その後の状況',triggers:'きっかけ',place:'場所',duration:'続いた時間',actions:'したこと'})[field]}">${options.map(([value,label])=>`<button type="button" class="chip ${set.has(value)?'active':''}" data-action="chip" data-field="${field}" data-value="${esc(value)}" aria-pressed="${set.has(value)}">${esc(label)}</button>`).join('')}</div>`;
}
function entryForm(existing=null,day=null,actions=[]){
 const d=existing?structuredClone(existing):{id:crypto.randomUUID(),kind:'wave',strength:null,after:null,outcome:'unknown',triggers:[],place:'',duration:'',actions,note:'',day:day||localDay(),time:day&&day!==localDay()?'12:00':localTime()};
 const dateValue=`${d.day}T${d.time}`;
 const footer=`<button class="btn btn-primary" type="submit" form="entry-form" id="save-entry" ${d.strength===null?'disabled':''}>${existing?'変更を保存':'この記録を残す'}</button><p>まずは強さだけ。詳しいことは、あとから足せます。</p>`;
 const body=`<form id="entry-form">
 <p class="page-sub">どんな内容の日も、評価せずに残します。</p>
 <label class="form-row"><span class="field-label">いつの記録？</span><input type="datetime-local" id="entry-date" value="${dateValue}" max="${localInput()}" min="1900-01-01T00:00" required></label>
 <div class="strength-header"><label id="strength-label">渇望の強さ</label><span class="strength-value" id="strength-display">${num(d.strength)}<small>/ 10</small></span></div>
 <div class="strength-grid" role="group" aria-labelledby="strength-label">${Array.from({length:11},(_,n)=>`<button type="button" class="${d.strength===n?'active':''}" data-action="strength" data-value="${n}" aria-pressed="${d.strength===n}" aria-label="強さ ${n}${n===0?' 渇望なし':''}">${n}</button>`).join('')}</div>
 <div class="strength-caption"><span id="strength-caption">${strengthText(d.strength)}</span><span>0＝なし / 10＝最大</span></div>
 <div id="strong-note" class="notice warm" style="margin-top:17px" ${d.strength!==null&&d.strength>=8?'':'hidden'}>いまつらいときは、記録より人への相談を優先して大丈夫です。この数字だけで緊急性を判断するものではありません。</div>
 <details class="details" ${existing?'open':''}><summary>詳しいことも残す <span class="subtle-note">すべて任意</span></summary>
 <div id="wave-only" ${d.strength===0?'hidden':''}>
 <div class="form-row"><span class="field-label">その後の状況</span>${chips('outcome',Object.entries(OUTCOMES),d.outcome,true)}<p class="field-tip">処方どおりの服用を「失敗」とは扱いません。頓服も含め、処方の範囲内かどうかを分けて記録できます。</p></div>
 <div class="form-row"><span class="field-label">きっかけ <small>複数選択</small></span>${chips('triggers',TRIGGERS.map(x=>[x,x]),d.triggers)}</div>
 <div class="form-row"><span class="field-label">場所</span>${chips('place',PLACES.map(x=>[x,x]),d.place)}</div>
 <div class="form-row"><span class="field-label">続いた時間</span>${chips('duration',DURATIONS.map(x=>[x,x]),d.duration)}</div>
 <div class="form-row"><span class="field-label">そのとき、したこと <small>複数選択</small></span>${chips('actions',ACTIONS.map(x=>[x,x]),d.actions)}</div>
 <div class="form-row"><label class="check-row"><input type="checkbox" id="after-enabled" ${d.after!==null?'checked':''}>その後の強さも記録する</label>
 <div id="after-wrap" ${d.after===null?'hidden':''}><label class="field-label" for="after-strength">その後の強さ <span id="after-display">${d.after??d.strength??5} / 10</span></label><input id="after-strength" class="after-range" type="range" min="0" max="10" step="1" value="${d.after??d.strength??5}"><p class="field-tip">「その後」は自分で確認した強さです。対処の効果とは限りません。</p></div></div>
 </div>
 <label class="form-row"><span class="field-label">ひとことメモ <small>2000文字まで</small></span><textarea id="entry-note" maxlength="2000" rows="3" placeholder="うまく説明できなくても、そのままに。">${esc(d.note)}</textarea></label>
 </details>
 ${existing?`<button class="help-link" type="button" data-action="delete-entry" data-id="${esc(d.id)}">この記録を削除する</button>`:''}
 </form>`;
 if(!openModal(existing?'足あとを編集':'いまの波を記録',body,footer))return;
 entryDraft={...d,original:existing?structuredClone(existing):null};
}
function changeStrength(n){
 if(!entryDraft)return;
 entryDraft.strength=n;
 $('#entry-form').dataset.dirty='true';
 $('#strength-display').innerHTML=`${n}<small>/ 10</small>`;
 $('#strength-caption').textContent=strengthText(n);
 $$('.strength-grid button').forEach(b=>{b.classList.toggle('active',Number(b.dataset.value)===n);b.setAttribute('aria-pressed',String(Number(b.dataset.value)===n));});
 $('#save-entry').disabled=false;
 $('#strong-note').hidden=n<8;
 $('#wave-only').hidden=n===0;
}
function changeChip(button){
 if(!entryDraft)return;
 const {field,value}=button.dataset;
 if(['triggers','actions'].includes(field)){
  let values=entryDraft[field];
  if(values.includes(value))values=values.filter(x=>x!==value);
  else if((field==='triggers'&&value==='わからない')||(field==='actions'&&value==='特になし'))values=[value];
  else values=[...values.filter(x=>x!==(field==='triggers'?'わからない':'特になし')),value];
  entryDraft[field]=values;
 }else entryDraft[field]=entryDraft[field]===value?(field==='outcome'?'unknown':''):value;
 const val=entryDraft[field],set=new Set(Array.isArray(val)?val:[val]);
 $$(`[data-action="chip"][data-field="${field}"]`).forEach(b=>{b.classList.toggle('active',set.has(b.dataset.value));b.setAttribute('aria-pressed',String(set.has(b.dataset.value)));});
 $('#entry-form').dataset.dirty='true';
}
async function saveEntry(){
 if(!entryDraft||!Number.isInteger(entryDraft.strength))throw new Error('強さを0〜10から選んでください。');
 const d=entryDraft,dateValue=$('#entry-date').value,dt=new Date(dateValue);
 if(!Number.isFinite(dt.getTime())||dateValue.slice(0,10)<'1900-01-01'||dt.getTime()>Date.now()+60000)throw new Error('日時を確認してください。未来の日時では記録できません。');
 const unchangedDate=d.original&&dateValue===`${d.original.day}T${d.original.time}`;
 const entry={id:d.id,kind:d.strength===0?'check':'wave',strength:d.strength,day:dateValue.slice(0,10),time:dateValue.slice(11,16),
 at:unchangedDate?d.original.at:dt.toISOString(),offset:unchangedDate?d.original.offset:dt.getTimezoneOffset(),updatedAt:new Date().toISOString(),
 after:d.strength>0&&$('#after-enabled').checked?Number($('#after-strength').value):null,
 outcome:d.strength===0?'unknown':d.outcome,triggers:d.strength===0?[]:d.triggers,place:d.strength===0?'':d.place,
 duration:d.strength===0?'':d.duration,actions:d.strength===0?[]:d.actions,note:$('#entry-note').value.trim()};
 validateEntry(entry);
 const firstDay=!state.entries.some(x=>x.day===entry.day),editing=!!d.original;
 const button=$('#save-entry');button.disabled=true;
 try{
  await commit(s=>{
   const old=s.entries.find(x=>x.id===entry.id);
   if(d.original&&(!old||old.updatedAt!==d.original.updatedAt))throw new Error('別のタブでこの記録が変更されています。一度閉じて、最新の記録を開き直してください。入力中の内容は、必要ならメモをコピーしてください。');
   s.entries=s.entries.filter(x=>x.id!==entry.id);s.entries.push(entry);
  });
  closeModal(true);
  toast(editing?'足あとを、更新しました。':firstDay?'この日の星が、ひとつ。\nどんな内容の日も、同じひとつです。':'そのままの気持ちを、残しました。');
 }finally{if(button.isConnected)button.disabled=false;}
}
async function addCheck(){
 const now=new Date(),day=localDay(now),time=localTime(now);
 if(state.entries.some(e=>e.kind==='check'&&e.day===day&&e.time===time)){toast('この時刻の「渇望なし」は、すでに残っています。');return;}
 const at=new Date(now);at.setSeconds(0,0);
 const entry={id:crypto.randomUUID(),kind:'check',strength:0,day,time,at:at.toISOString(),offset:at.getTimezoneOffset(),updatedAt:now.toISOString(),after:null,outcome:'unknown',triggers:[],place:'',duration:'',actions:[],note:''};
 await commit(s=>{
  if(!s.entries.some(e=>e.kind==='check'&&e.day===day&&e.time===time))s.entries.push(entry);
 });
 toast('いまの静けさを、残しました。\nあとから波の記録を足しても大丈夫。');
}
async function deleteEntry(id){
 if(!confirm('この記録を削除しますか？元には戻せません。'))return;
 await commit(s=>{s.entries=s.entries.filter(e=>e.id!==id);});
 closeModal(true);toast('この記録を削除しました。');
}
function openLetter(){
 const day=localDay(),index=Math.floor(Date.parse(day+'T00:00:00Z')/86400000)%LETTERS.length,[title,body]=LETTERS[index];
 openModal('今日の、小さな手紙。',
 `<article class="letter"><p class="letter-kicker">A NOTE FROM WEINTZ · ${prettyDay(day)}</p><h3>${title}</h3><p class="letter-body">${body}</p><p class="letter-sign">ウェインツ君より</p><small>あらかじめ書いた手紙を日替わりで表示しています。入力内容を送信したり、AIが状態を評価したりする機能ではありません。</small></article>`,
 `<button class="btn btn-secondary" data-action="close-modal">そっと閉じる</button>`);
}
function openGarden(){
 const days=uniqueDays(state.entries),lit=days.slice(-60),number=days.length;
 const points=Array.from({length:60},(_,i)=>{
  const angle=i*2.399963,rad=15+Math.sqrt(i)*12.8;
  return [170+Math.cos(angle)*rad*1.35,119+Math.sin(angle)*rad*.83];
 });
 let elements='';
 points.forEach(([x,y],i)=>{
  if(i<lit.length&&i>0){const [px,py]=points[i-1];elements+=`<line x1="${px}" y1="${py}" x2="${x}" y2="${y}"/>`;}
  elements+=`<circle class="${i<lit.length?'lit':'unlit'}" cx="${x}" cy="${y}" r="${i<lit.length?(i%4===0?2.7:1.9):1.1}"><title>${i<lit.length?lit[i]:'まだ灯っていない星'}</title></circle>`;
 });
 openModal('あなたの、星の庭。',
 `<div class="garden-full"><p class="eyebrow">YOUR OWN CONSTELLATION</p><svg class="garden-svg" viewBox="0 0 340 270" role="img" aria-label="${number}日分の記録。表示は直近60日分まで。">${elements}</svg><div class="garden-numbers"><strong>${number}</strong><span>日分の、あなたの足あと。</span></div></div>
 <h3 class="welcome-title" style="font-size:22px">${number===0?'最初の星は、あなたのペースで。':number>=30?'ひとつずつ、あなたの星座に。':number>=7?'少しずつ、空に輪郭が。':'小さな光が、ここにあります。'}</h3>
 <p class="page-sub">記録した日ごとに、星がひとつ。<br>強さや服用の有無、記録の件数では増えません。<br>毎日続けなくても、過去の星はそのままです。</p>
 <p class="field-tip">星は保存されている記録の日付から作られます。その日の記録をすべて削除すると、その星も消えます。空の表示は直近60日分まで、日数は全期間です。</p>`,
 `<button class="btn btn-soft" data-action="letter">${icon('mail')}今日の手紙をひらく</button>`);
}
function settings(){
 const s=state.settings;
 const body=`<form id="settings-form">
 <div class="settings-group"><h3>あなたの凪</h3>
 <label class="form-row"><span class="field-label">呼び名 <small>任意・外部送信しません</small></span><input id="nickname" maxlength="30" value="${esc(s.nickname)}" placeholder="例：Yoshi" autocomplete="off"></label>
 <label class="form-row"><span class="field-label">画面の色</span><select id="theme"><option value="light" ${s.theme==='light'?'selected':''}>白い砂浜</option><option value="dark" ${s.theme==='dark'?'selected':''}>夜の海</option><option value="auto" ${s.theme==='auto'?'selected':''}>iPhoneの設定に合わせる</option></select></label>
 <label class="toggle-row"><span>海や光の、ゆっくりした動き</span><input class="toggle" id="motion" type="checkbox" ${s.motion?'checked':''}></label>
 <p class="subtle-note">iPhoneで「視差効果を減らす」が有効な場合は、そちらを優先します。</p>
 <label class="toggle-row"><span>戻ってきたときに画面を隠す</span><input class="toggle" id="privacy-cover" type="checkbox" ${s.privacyCover?'checked':''}></label>
 <p class="subtle-note">別のアプリへ移る際にカバーを表示します。Face ID・認証・暗号化の代わりにはなりません。OSの履歴画面を必ず隠せる保証はありません。</p></div>
 <div class="settings-divider"></div>
 <div class="settings-group"><h3>自分に渡す、お守り</h3>
 <label class="form-row"><span class="field-label">ひと息の部屋で表示する言葉</span><textarea id="charm" maxlength="500" rows="3" placeholder="例：今すぐ答えを出さなくていい。困ったら、誰かに話そう。">${esc(s.charm)}</textarea></label>
 <label class="form-row"><span class="field-label">相談できる相手の呼び名 <small>任意</small></span><input id="support-name" value="${esc(s.supportName)}" maxlength="80" placeholder="例：かかりつけのクリニック" autocomplete="off"></label>
 <label class="form-row"><span class="field-label">電話番号 <small>任意・端末内に保存</small></span><input id="support-phone" type="tel" inputmode="tel" maxlength="40" value="${esc(s.supportPhone)}" placeholder="電話番号" autocomplete="off"></label>
 <p class="subtle-note">電話は「助けが必要なとき」で自分で押した場合だけ発信します。番号と受付時間は、ご自身で確認してください。</p></div>
 <button type="submit" class="btn btn-primary">設定を保存</button>
 </form>
 <div class="settings-divider"></div>
 <div class="settings-group"><h3>記録を守る</h3><p class="field-tip">自動クラウド同期はありません。サイトデータ削除、端末変更、容量不足などで記録が失われることがあります。</p>
 <button class="btn btn-secondary" data-action="backup">${icon('download')}暗号化バックアップ</button>
 <button class="btn btn-secondary" data-action="restore">${icon('upload')}バックアップから復元</button>
 <p class="field-tip">最終書き出し：${state.lastBackup?prettyDay(localDay(new Date(state.lastBackup)),true):'まだありません'}<br>暗号化するのは書き出したファイルです。端末内の記録は暗号化していません。</p>
 <button class="btn btn-secondary" data-action="persist">ブラウザに保存の保持をリクエスト</button>
 <p id="persist-status" class="field-tip">ブラウザが許可するとは限りません。バックアップの代わりにはなりません。</p>
 </div>
 <div class="settings-group"><h3>このアプリについて</h3>
 <div class="notice">${ui.offlineReady?'オフラインの準備ができています。':'オフラインの準備を確認中、または未完了です。オンラインでページを開いてください。'}<br>初回と更新時は、アプリのファイルを読み込む通信があります。記録内容の送信は行いません。</div>
 <button class="btn btn-secondary" data-action="install-guide">${icon('plus')}ホーム画面に追加するには</button>
 <button class="btn btn-secondary" data-action="privacy">${icon('shield')}保存とプライバシー</button>
 <button class="btn btn-secondary" data-action="help">${icon('heart')}助けが必要なとき・服薬について</button>
 ${ui.waiting?'<button class="btn btn-soft" data-action="update-app">新しいバージョンに更新</button>':'<button class="btn btn-secondary" data-action="check-update">更新を確認する</button>'}
 <button class="help-link" data-action="welcome">最初の案内をもう一度</button></div>
 <div class="settings-divider"></div><button class="btn btn-danger" data-action="delete-all">すべての記録と設定を削除</button>
 <p class="version-note">NAGI ${VERSION} · Made for your own pace.<br>A little surprise, from ウェインツ君.</p>`;
 openModal('凪の設定',body,`<button class="btn btn-secondary" data-action="close-modal">閉じる</button>`);
}
async function saveSettings(){
 const form=$('#settings-form');
 const s={nickname:$('#nickname').value.trim(),theme:$('#theme').value,motion:$('#motion').checked,privacyCover:$('#privacy-cover').checked,
 charm:$('#charm').value.trim(),supportName:$('#support-name').value.trim(),supportPhone:$('#support-phone').value.trim()};
 if(s.supportPhone&&!/^\+?\d{3,20}$/.test(s.supportPhone.replace(/[ ()-]/g,'')))throw new Error('電話番号は数字・ハイフン・括弧・先頭の＋などで入力してください。');
 await commit(t=>Object.assign(t.settings,s));
 form.dataset.dirty='false';closeModal(true);toast('あなたの凪を、整えました。');
}
function installGuide(){
 openModal('ホーム画面から、凪へ。',
 `<div class="welcome-art" style="height:100px"><img src="./assets/apple-touch-icon.png" alt="凪のアイコン" width="66" height="66" style="border-radius:16px"></div>
 <h3 class="welcome-title" style="font-size:22px">いつもの場所に、小さな海を。</h3>
 <div class="welcome-points"><div class="welcome-point"><span>1</span><p><strong>この公開ページをSafariで開く。</strong>ZIP内のファイルを直接開くのではなく、GitHub PagesのURLを使います。</p></div>
 <div class="welcome-point"><span>2</span><p><strong>共有メニューから「ホーム画面に追加」。</strong>iOSによっては「…」の中に共有があります。「Webアプリとして開く」が表示されたらオンにします。</p></div>
 <div class="welcome-point"><span>3</span><p><strong>「追加」を押して、ホーム画面の凪を開く。</strong>最初はオンラインで開き、設定で「オフラインの準備ができています」を確認してください。</p></div></div>
 <div class="notice warm">記録を始める前に、ホーム画面への追加がおすすめです。Safariとホーム画面版でデータが共有されない場合があります。移行時はバックアップ・復元を使い、普段使う入口をひとつにそろえてください。</div>`,
 `<button class="btn btn-secondary" data-action="close-modal">閉じる</button>`);
}
function privacy(){
 openModal('保存と、プライバシー。',
 `<div class="settings-group"><h3>記録はどこにある？</h3><p class="page-sub">この公開URLを開いたブラウザのIndexedDBに保存します。アカウント・アクセス解析・外部フォント・外部AIへの送信はありません。GitHubへの公開時に、あなたの記録がリポジトリに書き込まれることもありません。</p></div>
 <div class="settings-group"><h3>端末保存は、永久保存ではありません。</h3><p class="page-sub">サイトデータの消去、端末の変更、ブラウザやOSによるデータ整理などで失われる可能性があります。暗号化バックアップを「ファイル」に保存し、別の安全な場所にも保管してください。</p></div>
 <div class="settings-group"><h3>暗号化するのはバックアップ。</h3><p class="page-sub">端末内の記録は平文です。iPhoneのパスコードやFace IDも使用してください。カバーは見た目を隠す機能であり、認証ロックではありません。バックアップはAES-256-GCMとPBKDF2で暗号化します。パスフレーズを忘れると復元できません。</p></div>
 <div class="settings-group"><h3>公開するもの・しないもの。</h3><p class="page-sub">公開するのはアプリのファイルだけです。書き出したバックアップや相談メモをGitHubへアップロードしないでください。共有・コピーしたメモは共有先にも残ります。</p></div>
 <div class="settings-group"><h3>同じドメインのページについて。</h3><p class="page-sub">別のリポジトリでも、同じGitHub Pagesドメインならブラウザ上では同じオリジンです。保存名はパス別に分けていますが、強い隔離ではありません。同じドメインには信頼できるコードだけを置いてください。</p></div>
 <div class="settings-group"><h3>通信と、できないこと。</h3><p class="page-sub">初回・更新時にはGitHub Pagesから静的ファイルを取得します。ホスティング側には通常のアクセス情報が残る場合があります。記録内容を送る処理はありません。端末間の自動同期、バックグラウンド通知、緊急時の自動連絡はありません。</p></div>`,
 `<button class="btn btn-secondary" data-action="close-modal">閉じる</button>`);
}
function help(){
 const s=state.settings,phone=s.supportPhone.replace(/[^\d+]/g,'');
 openModal('ひとりで、抱えなくていい。',
 `<h3 class="welcome-title" style="font-size:23px">記録より、相談を<br>優先して大丈夫。</h3>
 <div class="notice warm"><strong>服薬について</strong>凪は服用の中止・減量や、服用の先延ばしを勧めるアプリではありません。頓服も含め処方医の指示に従ってください。薬によっては急な中止で危険な離脱症状が起きるため、変更は医師に相談してください。</div>
 <div class="settings-group"><h3>渇望や使い方が気になるとき</h3><p class="page-sub">処方医・薬剤師などに、いまの状況を伝えてください。相談メモを見せるだけでもかまいません。相談先がまだ決まっていない場合も、かかりつけの医療機関から相談できます。</p></div>
 ${phone?`<a class="btn btn-primary" href="tel:${esc(phone)}" data-action="confirm-call">${icon('phone')}${esc(s.supportName||'登録した相談先')}に電話</a><p class="field-tip">受付時間と番号を確認してから発信してください。</p>`:'<p class="field-tip">設定に相談先の番号を登録すると、ここから電話できます。</p>'}
 <div class="notice danger section"><strong>意識がはっきりしない、呼吸が苦しいなど</strong>過量服用の疑いがあり、意識や呼吸に異常があるときなどは、記録やタイマーを続けず緊急の医療を求めてください。</div>
 <a class="btn btn-danger" style="margin-top:13px;text-decoration:none" href="tel:119" data-action="confirm-emergency">${icon('phone')}日本の救急：119</a><p class="field-tip">日本以外では現地の緊急番号を利用してください。自動で通報されることはありません。</p>
 <p class="field-tip">このアプリは医療機器ではなく、診断や緊急性の判定はできません。安全上の記載の参照先は、同梱READMEにまとめています。</p>`,
 `<button class="btn btn-secondary" data-action="close-modal">閉じる</button>`);
}

function backup(){
 const body=`<p class="page-sub">あなたの足あとを、パスフレーズで包んで保存します。<br>処理はこの端末内だけで行います。</p>
 <form id="backup-form">
 <label class="backup-label" for="backup-pass">新しいパスフレーズ（10文字以上）</label><input class="password" id="backup-pass" type="password" minlength="10" maxlength="200" required autocomplete="new-password">
 <label class="backup-label" for="backup-confirm">もう一度入力</label><input class="password" id="backup-confirm" type="password" minlength="10" maxlength="200" required autocomplete="new-password">
 <div class="notice warm section"><strong>パスフレーズは復元に必要です。</strong>忘れると復元できません。凪にもウェインツ君にも戻せません。iPhoneのパスワード管理など、ファイルとは別の安全な場所に控えてください。</div>
 <button class="btn btn-primary section" type="submit" id="prepare-backup">${icon('shield')}暗号化ファイルを作る</button>
 </form><div id="backup-ready"></div><p class="field-tip">全期間の記録・設定・相談メモを含みます。バックアップをGitHubへアップロードしないでください。「ファイル」への保存が完了したことを確認してください。</p>`;
 if(!openModal('足あとを、守る。',body,`<button class="btn btn-secondary" data-action="close-modal">閉じる</button>`))return;
 cleanupModal=()=>{if(backupURL){const url=backupURL;setTimeout(()=>URL.revokeObjectURL(url),60000);backupURL=null;}};
}
async function prepareBackup(){
 const pass=$('#backup-pass').value,confirmPass=$('#backup-confirm').value;
 if(pass.length<10)throw new Error('パスフレーズは10文字以上にしてください。');
 if(pass!==confirmPass)throw new Error('2回のパスフレーズが一致していません。');
 const b=$('#prepare-backup');b.disabled=true;b.textContent='この端末で暗号化しています…';
 try{
  const latest=await readStore(),obj=await encryptBackup(latest,pass);
  if(!$('#backup-ready'))return;
  if(backupURL)URL.revokeObjectURL(backupURL);
  backupURL=URL.createObjectURL(new Blob([JSON.stringify(obj)],{type:'application/json'}));
  const name=`nagi-backup-${localDay().replaceAll('-','')}.nagi`;
  $('#backup-ready').innerHTML=`<div class="notice section"><strong>暗号化ファイルができました。</strong>下のボタンで保存し、「ファイル」アプリにあることを確認してください。<a class="btn btn-primary" style="margin-top:12px;text-decoration:none" href="${backupURL}" download="${name}" data-action="backup-downloaded">${icon('download')}ファイルに保存</a></div>`;
  $('#backup-form').dataset.dirty='false';$('#backup-pass').value='';$('#backup-confirm').value='';
  $('#backup-ready').scrollIntoView({block:'nearest',behavior:'smooth'});
 }finally{if(b.isConnected){b.disabled=false;b.innerHTML=icon('shield')+'暗号化ファイルを作る';}}
}
function restore(){
 openModal('足あとを、迎え入れる。',
 `<p class="page-sub">以前に書き出した .nagi ファイルを選びます。<br>ファイルをサーバーへ送ることはありません。</p>
 <form id="restore-form"><label class="backup-label" for="restore-file">バックアップファイル</label><input class="file-input" id="restore-file" type="file" accept=".nagi,.json,application/json" required>
 <label class="backup-label" for="restore-pass">バックアップのパスフレーズ</label><input class="password" id="restore-pass" type="password" maxlength="200" autocomplete="off">
 <button class="btn btn-primary section" type="submit" id="read-backup">内容を確認する</button></form>
 <div id="restore-preview"></div>
 <div class="notice warm section"><strong>いまの記録に、追加・統合します。</strong>同じIDは更新日時が新しい記録を採用します。今の設定は変えません。相談メモは重複を避けて追記します。削除済みの記録が、古いバックアップから戻ることがあります。</div>`,
 `<button class="btn btn-secondary" data-action="close-modal">閉じる</button>`);
}
async function readBackup(){
 const file=$('#restore-file').files[0],pass=$('#restore-pass').value;
 if(!file)throw new Error('ファイルを選んでください。');
 if(file.size>25*1024*1024)throw new Error('25MBを超えるファイルは読み込めません。');
 const btn=$('#read-backup');btn.disabled=true;btn.textContent='この端末で確認しています…';
 try{
  let obj;
  try{obj=JSON.parse(await file.text());}catch{throw new Error('JSON形式のバックアップとして読み取れません。');}
  const incoming=obj?.format==='nagi-encrypted'?await decryptBackup(obj,pass):validateState(obj);
  if(!$('#restore-preview'))return;
  const result=mergeStates(state,incoming);incomingBackup=incoming;
  $('#restore-form').dataset.dirty='false';
  $('#restore-preview').innerHTML=`<div class="notice section"><strong>${incoming.entries.length}件の記録を確認しました。</strong>追加予定：${result.added}件 ／ 更新予定：${result.updated}件<br>${uniqueDays(incoming.entries).length}日分の足あと。設定は現在のままです。<button class="btn btn-primary" style="margin-top:13px;text-decoration:none" data-action="confirm-restore">この内容を統合する</button></div>`;
  $('#restore-preview').scrollIntoView({block:'nearest',behavior:'smooth'});
 }finally{if(btn.isConnected){btn.disabled=false;btn.textContent='内容を確認する';}}
}
async function confirmRestore(){
 if(!incomingBackup)throw new Error('もう一度ファイルを読み込んでください。');
 const incoming=incomingBackup;let added=0,updated=0;
 await commit(s=>{const r=mergeStates(s,incoming);s.entries=r.entries;s.consultNote=r.consultNote;added=r.added;updated=r.updated;});
 closeModal(true);toast(`足あとを迎え入れました。\n追加 ${added}件 · 更新 ${updated}件`);
}
function deleteAll(){
 openModal('すべての記録を削除',
 `<div class="notice danger"><strong>この操作は元に戻せません。</strong>この公開URLの記録・相談メモ・設定をすべて削除します。必要な場合は先にバックアップを保存してください。別の場所に書き出したファイルは削除されません。</div>
 <form id="delete-all-form"><label class="form-row"><span class="field-label">確認のため「すべて削除」と入力</span><input id="delete-confirm" autocomplete="off" required placeholder="すべて削除"></label><button type="submit" class="btn btn-danger">記録と設定を完全に削除する</button></form>`,
 `<button class="btn btn-secondary" data-action="close-modal">やめる</button>`);
}
async function confirmDeleteAll(){
 if($('#delete-confirm').value!=='すべて削除')throw new Error('「すべて削除」と正確に入力してください。');
 await resetStore();closeModal(true);stopPause();state=defaultState();noteDirty=false;
 channel?.postMessage({reset:true});applyTheme();render();toast('このアプリの記録と設定を削除しました。');
}
function reportText(){
 if(ui.reportInvalid)throw new Error('集計期間に入力エラーがあります。開始日・終了日を修正してください。');
 if(noteDirty)throw new Error('未保存の相談メモがあります。先に「メモを保存」を押してください。');
 return makeReport(state,ui.reportStart,ui.reportEnd,ui.details);
}
async function saveConsult(){
 const text=$('#consult-note').value;
 await commit(s=>{s.consultNote=text;});
 noteDirty=false;
 if($('#consult-status'))$('#consult-status').textContent='相談メモを保存しました。';
 toast('伝えたいことを、預かりました。');
}
function preparePrint(text){
 const lines=text.split('\n');
 $('#print-root').innerHTML=`<h1>${esc(lines.shift())}</h1><p>${esc(lines.shift())}</p>`+lines.map(l=>l.startsWith('【')?`<h2>${esc(l.slice(1,-1))}</h2>`:`<p>${esc(l)||'&nbsp;'}</p>`).join('');
}
function previewReport(){
 const text=reportText();
 preparePrint(text);
 openModal('相談用のまとめ',
 `<p class="field-tip" style="margin-bottom:15px">渡す前に内容を確認してください。日付は入力時の現地日付です。</p><div id="report-preview">${esc(text)}</div>`,
 `<div class="two-cols"><button class="btn btn-secondary" data-action="copy-report">${icon('copy')}コピー</button><button class="btn btn-primary" data-action="print-report">${icon('report')}印刷 / PDF</button></div><button class="btn btn-secondary btn-small" style="margin-top:9px" data-action="download-report">テキストファイルで保存</button><p>印刷画面からのPDF保存方法は、iOSの表示に従ってください。</p>`);
}
async function copyReport(){
 const text=reportText();
 try{
  if(!navigator.clipboard?.writeText)throw new Error('no clipboard');
  await navigator.clipboard.writeText(text);
  const b=$('[data-action="copy-report"]');if(b)b.textContent='コピーしました';
 }catch{
  openModal('テキストをコピー',
  `<p class="page-sub">下のテキストを長押しして、すべて選択 → コピーしてください。</p><textarea id="manual-copy" readonly rows="13">${esc(text)}</textarea>`,
  `<button class="btn btn-secondary" data-action="close-modal">閉じる</button>`);
 }
}
function downloadBlob(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function downloadReport(){
 const text=reportText();downloadBlob(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}),`nagi-report-${ui.reportStart}-${ui.reportEnd}.txt`);
}
async function shareReport(){
 const text=reportText();
 if(navigator.share){
  try{await navigator.share({title:'凪｜相談メモ',text});}catch(e){if(e.name!=='AbortError')throw new Error('共有できませんでした。「まとめを確認する」からコピーや保存をご利用ください。');}
 }else previewReport();
}
const PAUSE_KEY='nagi-pause:'+APP_PATH;
function rememberPause(){
 try{sessionStorage.setItem(PAUSE_KEY,JSON.stringify({deadline:pauseDeadline,duration:pauseDuration,remaining:pauseRemaining}));}catch{}
}
function restorePause(){
 try{
  const s=JSON.parse(sessionStorage.getItem(PAUSE_KEY)||'null');
  if(s&&[30,90,180].includes(s.duration)&&Number.isFinite(s.remaining)&&s.remaining>=0&&s.remaining<=180&&
   (s.deadline===null||(Number.isFinite(s.deadline)&&Math.abs(s.deadline-Date.now())<86400000))){
   pauseDuration=s.duration;pauseDeadline=s.deadline;pauseRemaining=s.remaining;
  }
 }catch{}
}
function stopSound(){
 if(audio){audio.ctx.close().catch(()=>{});audio=null;}
 const b=$('[data-action="sound"]');if(b){b.innerHTML=icon('sound')+'小さな波音をつける';b.setAttribute('aria-pressed','false');}
}
async function toggleSound(){
 if(audio){stopSound();return;}
 const Ctx=window.AudioContext||window.webkitAudioContext;
 if(!Ctx)throw new Error('この環境では音を再生できません。音なしでもご利用いただけます。');
 const ctx=new Ctx(),buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),samples=buffer.getChannelData(0);
 for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*.6;
 const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;
 const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=450;
 const gain=ctx.createGain();gain.gain.value=.055;
 const lfo=ctx.createOscillator(),depth=ctx.createGain();lfo.frequency.value=.12;depth.gain.value=.018;
 lfo.connect(depth);depth.connect(gain.gain);
 source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
 audio={ctx,source};await ctx.resume();source.start();lfo.start();
 const b=$('[data-action="sound"]');if(b){b.innerHTML=icon('sound')+'波音を止める';b.setAttribute('aria-pressed','true');}
}
function openPause(){
 restorePause();
 const body=`<section class="pause-screen" id="pause-screen">
 <p class="eyebrow">A MOMENT, JUST FOR YOU</p>
 <div class="pause-orbit" aria-hidden="true"><div class="pause-ring"></div><div class="pause-ring"></div><div class="pause-core"><span id="pause-clock">1:30</span></div></div>
 <h3 class="pause-prompt" id="pause-prompt">いまは、ここに<br>いるだけで。</h3>
 <p class="pause-caption" id="pause-caption">呼吸は、いつもの自然なペースで。</p>
 <div class="segment" id="pause-lengths" role="group" aria-label="時間を選ぶ">${[[30,'30秒'],[90,'90秒'],[180,'3分']].map(([n,t])=>`<button class="${pauseDuration===n?'active':''}" data-action="pause-duration" data-value="${n}">${t}</button>`).join('')}</div>
 <button class="btn btn-primary" id="pause-start" data-action="pause-start">ひと息の時間を、はじめる</button>
 <button class="sound-button" data-action="sound" aria-pressed="false">${icon('sound')}小さな波音をつける</button>
 ${state.settings.charm?`<div class="charm">${esc(state.settings.charm)}</div>`:''}
 <p class="field-tip">落ち着かなければ、いつでも終えて大丈夫。<br>薬の服用を待つためのタイマーではありません。<br>つらい時は、タイマーより人への相談を優先してください。</p>
 <p class="subtle-note" style="margin-top:13px">アプリを閉じたままの終了通知はありません。<br>戻ると、実際の経過時間を反映します。</p>
 </section>`;
 if(!openModal('ひと息の部屋',body,`<button class="btn btn-secondary btn-small" data-action="help">${icon('heart')}助けが必要なとき</button>`))return;
 updatePause();
 pauseTimer=setInterval(updatePause,250);
 cleanupModal=()=>{clearInterval(pauseTimer);pauseTimer=null;stopSound();rememberPause();};
}
function updatePause(){
 if(!$('#pause-clock'))return;
 const remain=pauseDeadline!==null?Math.max(0,Math.ceil((pauseDeadline-Date.now())/1000)):pauseRemaining;
 $('#pause-clock').textContent=`${Math.floor(remain/60)}:${pad(remain%60)}`;
 const running=pauseDeadline!==null&&remain>0;
 $('#pause-screen').classList.toggle('running',running);
 const start=$('#pause-start'),lengths=$('#pause-lengths');
 if(pauseDeadline!==null&&remain===0){
  $('#pause-prompt').innerHTML='いまの自分に、<br>ひとつだけ目を向ける。';
  $('#pause-caption').textContent='変わらなくても大丈夫。そのまま記録できます。';
  start.textContent='いまの強さを記録する';start.dataset.action='pause-record';lengths.hidden=false;
  stopSound();
 }else if(running){
  const elapsed=pauseDuration-remain;
  const prompts=['足が触れている感覚に、<br>少し気づいてみる。','目に入るものを、<br>ひとつだけ。','いまの気持ちを、<br>変えようとしなくても。','この時間は、<br>あなたのもの。'];
  $('#pause-prompt').innerHTML=prompts[Math.floor(elapsed/20)%prompts.length];
  $('#pause-caption').textContent='呼吸は、いつもの自然なペースで。';
  start.textContent='いったん止める';start.dataset.action='pause-stop';lengths.hidden=true;
 }else{
  $('#pause-prompt').innerHTML='いまは、ここに<br>いるだけで。';
  $('#pause-caption').textContent='呼吸は、いつもの自然なペースで。';
  start.textContent=pauseRemaining!==pauseDuration?'続きから、はじめる':'ひと息の時間を、はじめる';start.dataset.action='pause-start';lengths.hidden=false;
 }
}
function stopPause(){
 clearInterval(pauseTimer);pauseTimer=null;pauseDeadline=null;pauseRemaining=pauseDuration;stopSound();
 try{sessionStorage.removeItem(PAUSE_KEY);}catch{}
}
function openCover(){
 document.body.dataset.covered='true';
 if(!cover.open)cover.showModal();
 $('#uncover').focus({preventScroll:true});
}
function uncover(){cover.close();document.body.dataset.covered='false';}
function changedMonth(direction){
 const d=dateFromDay(ui.month+'-01');d.setMonth(d.getMonth()+direction);
 ui.month=localDay(d).slice(0,7);
 ui.selected=ui.month===localDay().slice(0,7)?localDay():ui.month+'-01';render();
}
function tabChange(tab){
 if(noteDirty&&ui.tab==='report'&&tab!=='report'){
  if(!confirm('相談メモの変更はまだ保存していません。保存せずに移動しますか？'))return;
  noteDirty=false;
 }
 ui.tab=tab;render();window.scrollTo({top:0,behavior:'instant'});
}
async function persist(){
 const t=$('#persist-status');
 if(!navigator.storage?.persist){if(t)t.textContent='このブラウザでは保持リクエストに対応していません。バックアップをご利用ください。';return;}
 const granted=await navigator.storage.persist();
 if(t)t.textContent=granted?'保持リクエストが許可されました。ただし、手動でのデータ消去・端末変更にはバックアップが必要です。':'今回は許可されませんでした。通常の端末保存は使えます。バックアップも保管してください。';
}
async function registerWorker(){
 if(!('serviceWorker' in navigator)||!isSecureContext)return;
 try{
  const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  const inspect=()=>{if(reg.waiting&&navigator.serviceWorker.controller){ui.waiting=reg.waiting;if(!$('#sheet')&&!noteDirty)render();}};
  inspect();
  reg.addEventListener('updatefound',()=>{
   const worker=reg.installing;
   worker?.addEventListener('statechange',()=>{
    if(worker.state==='installed'){
     if(navigator.serviceWorker.controller)inspect();
     else {ui.offlineReady=true;if(!$('#sheet')&&!noteDirty)render();}
    }
   });
  });
  await navigator.serviceWorker.ready;ui.offlineReady=true;
  if(!$('#sheet')&&!noteDirty)render();
 }catch{ui.offlineReady=false;}
}
function updateApp(){
 if(!ui.waiting){toast('新しいバージョンはまだ見つかっていません。');return;}
 if((noteDirty||$('[data-dirty="true"]'))&&!confirm('保存していない変更があります。変更を破棄して更新しますか？'))return;
 wantReload=true;ui.waiting.postMessage({type:'SKIP_WAITING'});
}
async function checkUpdate(){
 if(!navigator.serviceWorker)throw new Error('この環境では更新を確認できません。Safariで公開URLを開いてください。');
 const reg=await navigator.serviceWorker.getRegistration(APP_PATH);
 if(!reg)throw new Error('オフライン機能がまだ準備できていません。オンラインでページを開き直してください。');
 await reg.update();
 if(reg.waiting){ui.waiting=reg.waiting;settings();}
 else{
  const target=$('#modal-error');if(target)target.textContent='更新を確認しました。新しいファイルが届くと、ホーム画面に更新ボタンが出ます。';
 }
}
const handlers={
 'tab':b=>tabChange(b.dataset.tab),
 'new-entry':()=>entryForm(),
 'history-entry':()=>entryForm(null,ui.selected),
 'edit-entry':b=>{const found=state.entries.find(e=>e.id===b.dataset.id);if(!found)throw new Error('この記録は見つかりません。最新の画面を開き直してください。');entryForm(found);},
 'no-craving':addCheck,
 'strength':b=>changeStrength(Number(b.dataset.value)),
 'chip':changeChip,
 'delete-entry':b=>deleteEntry(b.dataset.id),
 'close-modal':()=>closeModal(),
 'settings':settings,
 'cover':openCover,
 'letter':openLetter,
 'garden':openGarden,
 'help':help,
 'privacy':privacy,
 'install-guide':installGuide,
 'welcome':welcome,
 'start-app':async()=>{await commit(s=>{s.settings.onboarded=true;});closeModal(true);toast('凪へ、ようこそ。');},
 'today-history':()=>{ui.month=localDay().slice(0,7);ui.selected=localDay();tabChange('history');},
 'prev-month':()=>changedMonth(-1),
 'next-month':()=>changedMonth(1),
 'select-day':b=>{ui.selected=b.dataset.day;render();},
 'return-today':()=>{ui.month=localDay().slice(0,7);ui.selected=localDay();render();},
 'insight-period':b=>{ui.period=Number(b.dataset.value);render();},
 'report-period':b=>{ui.reportInvalid=false;ui.reportPeriod=Number(b.dataset.value);ui.reportEnd=localDay();ui.reportStart=addDays(ui.reportEnd,1-ui.reportPeriod);render();},
 'preview-report':previewReport,
 'copy-report':copyReport,
 'download-report':downloadReport,
 'share-report':shareReport,
 'print-report':()=>{preparePrint(reportText());window.print();},
 'backup':backup,
 'backup-downloaded':async()=>{await commit(s=>{s.lastBackup=new Date().toISOString();});},
 'restore':restore,
 'confirm-restore':confirmRestore,
 'delete-all':deleteAll,
 'persist':persist,
 'snooze-backup':async()=>{await commit(s=>{s.backupSnooze=new Date(Date.now()+3*86400000).toISOString();});},
 'pause':openPause,
 'pause-duration':b=>{pauseDuration=Number(b.dataset.value);pauseDeadline=null;pauseRemaining=pauseDuration;rememberPause();$$('#pause-lengths button').forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.value)===pauseDuration));updatePause();},
 'pause-start':()=>{pauseDeadline=Date.now()+pauseRemaining*1000;rememberPause();updatePause();},
 'pause-stop':()=>{pauseRemaining=Math.max(0,Math.ceil((pauseDeadline-Date.now())/1000));pauseDeadline=null;rememberPause();updatePause();},
 'pause-record':()=>{stopPause();entryForm(null,null,['ひと息ついた']);},
 'sound':toggleSound,
 'check-update':checkUpdate,
 'update-app':updateApp
};
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-action]');
 if(!b||b.disabled||b.dataset.busy)return;
 const action=b.dataset.action;
 if(action==='confirm-call'){if(!confirm('登録した相談先へ電話しますか？'))e.preventDefault();return;}
 if(action==='confirm-emergency'){if(!confirm('日本の救急119へ発信する画面を開きますか？'))e.preventDefault();return;}
 const fn=handlers[action];if(!fn)return;
 // Do not prevent the explicit backup download link's native action.
 if(b.tagName==='A'&&action!=='backup-downloaded')e.preventDefault();
 b.dataset.busy='true';
 try{await fn(b);}catch(error){showError(error);}finally{delete b.dataset.busy;}
});
document.addEventListener('submit',async e=>{
 e.preventDefault();
 const functions={'entry-form':saveEntry,'settings-form':saveSettings,'consult-form':saveConsult,'backup-form':prepareBackup,'restore-form':readBackup,'delete-all-form':confirmDeleteAll};
 const fn=functions[e.target.id];if(!fn||e.target.dataset.saving)return;
 e.target.dataset.saving='true';
 try{await fn();}catch(error){showError(error);}finally{delete e.target.dataset.saving;}
});
document.addEventListener('input',e=>{
 const f=e.target.closest('form');if(f)f.dataset.dirty='true';
 if(e.target.id==='consult-note'){
  noteDirty=true;$('#consult-status').textContent='変更はまだ保存されていません。';
 }
 if(e.target.id==='after-strength')$('#after-display').textContent=e.target.value+' / 10';
 if(e.target.id==='entry-date')e.target.max=localInput();
});
document.addEventListener('change',e=>{
 const f=e.target.closest('form');if(f)f.dataset.dirty='true';
 if(e.target.id==='after-enabled')$('#after-wrap').hidden=!e.target.checked;
 if(e.target.id==='include-details')ui.details=e.target.checked;
 if(['report-start','report-end'].includes(e.target.id)){
  const start=$('#report-start').value,end=$('#report-end').value;
  if(!start||!end||start>end||end>localDay()||start<'1900-01-01'||daysBetween(start,end).length>366){
   ui.reportInvalid=true;
   $('#page-error').textContent='開始日・終了日を確認してください。未来を含まない、最大366日間の範囲で指定できます。';
   return;
  }
  ui.reportInvalid=false;ui.reportStart=start;ui.reportEnd=end;ui.reportPeriod=0;render();
 }
 if(e.target.id==='restore-file'){
  incomingBackup=null;if($('#restore-preview'))$('#restore-preview').innerHTML='';
 }
});
$('#uncover').addEventListener('click',uncover);
cover.addEventListener('cancel',e=>{e.preventDefault();uncover();});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){
  stopSound();
  if(state?.settings.privacyCover)openCover();
 }else{
  updatePause();
  if(state&&!$('#sheet')&&!noteDirty)render();
 }
});
window.addEventListener('pagehide',()=>{stopSound();if(state?.settings.privacyCover)openCover();});
window.addEventListener('beforeunload',e=>{
 if(noteDirty||$('[data-dirty="true"]')){e.preventDefault();e.returnValue='';}
});
navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(wantReload)location.reload();});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(state)applyTheme();});
window.addEventListener('online',()=>{if(state&&!$('#sheet')&&!noteDirty)render();});
setInterval(()=>{
 const now=localDay();
 if($('#entry-date'))$('#entry-date').max=localInput();
 if(ui.day!==now&&state){
  ui.day=now;
  if(ui.reportPeriod){ui.reportEnd=now;ui.reportStart=addDays(now,1-ui.reportPeriod);}
  if(!$('#sheet')&&!noteDirty)render();
 }
},60000);

async function init(){
 try{
  await openStore();state=await readStore();applyTheme();render();
  if('BroadcastChannel' in window){
   channel=new BroadcastChannel('nagi-state:'+APP_PATH);
   channel.onmessage=async ev=>{
    try{
     state=await readStore();
     if(ev.data?.reset){closeModal(true);noteDirty=false;stopPause();}
     applyTheme();render();
    }catch(e){showError(e);}
   };
  }
  if(!state.settings.onboarded)welcome();
  if(state.settings.onboarded&&state.settings.privacyCover)openCover();
  registerWorker();
 }catch(error){
  root.innerHTML=`<main class="fatal"><h1>記録を安全に開けませんでした。</h1><p>${esc(error.message)}</p><p class="field-tip">既存の保存内容は上書きしていません。通常のSafariで公開URLを開き、ほかの凪のタブを閉じてから再読み込みしてください。端末の空き容量も確認してください。</p>${lastRaw?'<button id="rescue" class="btn btn-secondary">読み取れた元データを救出する</button>':''}<button id="reload" class="btn btn-primary">再読み込み</button><p class="field-tip">救出ファイルは暗号化されません。GitHubへアップロードせず、安全な場所に保存してください。</p></main>`;
  $('#reload').onclick=()=>location.reload();
  if($('#rescue'))$('#rescue').onclick=()=>downloadBlob(new Blob([JSON.stringify(lastRaw)],{type:'application/json'}),'nagi-recovery-private.json');
 }
}
init();
