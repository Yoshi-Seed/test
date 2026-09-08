/* NAGI 1.0.0 — Pure data helpers. No network calls. */
export const VERSION = '1.0.0';
export const SCHEMA = 1;
export const TRIGGERS = ['ストレス','不安','疲れ','痛み・体調','孤独','退屈','怒り','いつもの時間','場所・におい','人間関係','わからない','その他'];
export const PLACES = ['自宅','職場','外出先','移動中','その他'];
export const DURATIONS = ['一瞬','5分ほど','15分ほど','30分ほど','1時間以上','続いている'];
export const ACTIONS = ['ひと息ついた','水を飲んだ','歩いた','少し待った','誰かに話した','別のことをした','場所を変えた','特になし'];
export const OUTCOMES = {
  unknown:'あとで記録',
  pending:'まだ途中',
  no_use:'服用せず過ごした',
  prescribed:'処方の範囲内で服用',
  different:'処方とは違う使い方'
};
export const LETTERS = [
 ['点数より、輪郭。','数字は、あなたの価値じゃない。\nいまの気持ちに輪郭をつけるための、小さな目印です。\nうまく言葉にならない日は、数字ひとつだけでも。'],
 ['戻ってきた日が、今日。','毎日じゃなくていい。\n間が空いたことより、いまここを開いたこと。\nその一歩を、凪は静かに受け取ります。'],
 ['白紙も、余白。','書いていない日は、失敗した日ではありません。\nただ、まだ書かれていない日。\nあとから残しても、そのままにしても大丈夫。'],
 ['同じ波は、ひとつもない。','昨日と比べて、採点しなくていい。\n今日には今日の事情があります。\nその事情ごと、ここに置いていってください。'],
 ['正直に書ける場所。','きれいな記録を作らなくていい。\n話しにくいことも、ここではまず事実のままで。\n相談するときの言葉を、一緒に用意しておこう。'],
 ['小さな選択。','水を一口。窓の外を見る。誰かの声を聞く。\n大きな決意じゃなくても、今日をつくるものはあります。\n自分に合うものを、ゆっくり探していこう。'],
 ['助けを借りること。','一人で抱えきることを、目標にしなくていい。\n「少し話したい」も、立派な言葉。\nこの記録が、その最初の一言を助けられたら。'],
 ['静かな日にも。','何も書くことがないように感じる日もある。\n「いまは渇望なし」のひと押しでも、今日は残せます。\n押さない日があっても、もちろん大丈夫。'],
 ['長い説明はいらない。','忙しいとき、疲れているとき。\n理由まで上手に説明しなくてもいい。\n詳しいことは、落ち着いてから足せるようにしておきました。'],
 ['夜は、ここまで。','今日すべてを解決しなくていい。\n相談したいことを一行、メモに預けるだけでも。\n続きは、次の自分と、頼れる人に。'],
 ['地図をつくる。','記録が増えるのは、良い日ばかりだからではなくて。\n自分の時間を、少しずつ見つめているから。\n行き先を決めつけない地図にしていこう。'],
 ['星は、競わない。','ここに増える星は、我慢の点数ではありません。\n一日を残した、その印。\nどんな内容の日も、同じようにひとつ光ります。']
];
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const pad = n => String(n).padStart(2,'0');
export function localDay(d=new Date()) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
export function localTime(d=new Date()) { return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
export function localInput(d=new Date()) { return `${localDay(d)}T${localTime(d)}`; }
export function dateFromDay(day) { return new Date(`${day}T12:00:00`); }
export function addDays(day, n) { const d=dateFromDay(day); d.setDate(d.getDate()+n); return localDay(d); }
export function daysBetween(start,end) {
  const out=[]; let d=start;
  for(let i=0;d<=end && i<36600;i++) {out.push(d);d=addDays(d,1);}
  return out;
}
export function validDay(s) { return typeof s==='string' && /^\d{4}-\d\d-\d\d$/.test(s) && Number.isFinite(dateFromDay(s).getTime()) && localDay(dateFromDay(s))===s; }
export function prettyDay(day, year=false) {
  const d=dateFromDay(day);
  return `${year?d.getFullYear()+'年':''}${d.getMonth()+1}月${d.getDate()}日（${'日月火水木金土'[d.getDay()]}）`;
}
export const num = n => n===null||n===undefined ? '—' : String(n);
export const mean = a => a.length ? Math.round(a.reduce((s,n)=>s+n,0)/a.length*10)/10 : null;
export const uniqueDays = entries => [...new Set(entries.map(e=>e.day))].sort();
export function rangeData(entries,start,end) {
  const all=entries.filter(e=>e.day>=start&&e.day<=end);
  const waves=all.filter(e=>e.kind==='wave');
  const checks=all.filter(e=>e.kind==='check');
  const days=uniqueDays(all);
  const zeroOnly=days.filter(d=>!waves.some(e=>e.day===d));
  const paired=waves.filter(e=>Number.isInteger(e.after));
  return {all,waves,checks,days,zeroOnly,paired,
    count:waves.length,average:mean(waves.map(e=>e.strength)),
    max:waves.length?Math.max(...waves.map(e=>e.strength)):(checks.length?0:null),
    missing:Math.max(0,daysBetween(start,end).length-days.length),
    afterChange:mean(paired.map(e=>e.after-e.strength))
  };
}
export function daily(entries,day) {
  const all=entries.filter(e=>e.day===day);
  const waves=all.filter(e=>e.kind==='wave');
  return {all,waves,max:all.length?Math.max(...all.map(e=>e.strength)):null,count:waves.length};
}
export function counts(entries, field) {
  const out=new Map();
  entries.forEach(e=>(Array.isArray(e[field])?e[field]:(e[field]?[e[field]]:[])).forEach(x=>out.set(x,(out.get(x)||0)+1)));
  return [...out.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'ja'));
}
export function level(s) {return s===null?'missing':s===0?'zero':s<=3?'low':s<=6?'mid':'high';}
export function strengthText(s) {return s===null?'まだ選んでいません':s===0?'渇望なし':s<=3?'弱い':s<=6?'中くらい':s<=8?'強い':'とても強い';}
export function defaultState() {
 return {schema:SCHEMA,revision:0,createdAt:new Date().toISOString(),entries:[],
 settings:{nickname:'',theme:'light',motion:true,privacyCover:false,charm:'',supportName:'',supportPhone:'',onboarded:false},
 consultNote:'',lastBackup:null,backupSnooze:null};
}
const ensure=(ok,msg)=>{if(!ok)throw new Error(msg);};
const smallString=(x,max)=>typeof x==='string'&&x.length<=max;
export function validateEntry(e) {
 ensure(e && typeof e==='object','記録の形式を読み取れません。');
 ensure(smallString(e.id,100)&&e.id.length>0,'記録IDが不正です。');
 ensure(['wave','check'].includes(e.kind),'記録の種類が不正です。');
 ensure(validDay(e.day)&&e.day>='1900-01-01'&&e.day<='9999-12-31','記録の日付が不正です。');
 ensure(typeof e.time==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time),'記録の時刻が不正です。');
 ensure(typeof e.at==='string'&&Number.isFinite(Date.parse(e.at)),'記録の日時が不正です。');
 ensure(typeof e.updatedAt==='string'&&Number.isFinite(Date.parse(e.updatedAt)),'更新日時が不正です。');
 ensure(Number.isInteger(e.offset)&&Math.abs(e.offset)<=900,'時差情報が不正です。');
 // The saved local calendar date remains stable even when the user travels.
 const local=new Date(Date.parse(e.at)-e.offset*60000).toISOString().slice(0,16);
 ensure(local===`${e.day}T${e.time}`,'記録の日時と現地日付が一致しません。');
 ensure(Number.isInteger(e.strength)&&e.strength>=0&&e.strength<=10,'強さは0〜10です。');
 ensure(e.kind==='check'?e.strength===0:e.strength>0,'記録の種類と強さが一致しません。');
 ensure(e.after===null||(Number.isInteger(e.after)&&e.after>=0&&e.after<=10),'その後の強さが不正です。');
 ensure(Object.hasOwn(OUTCOMES,e.outcome),'その後の状況が不正です。');
 for(const [field,allowed] of [['triggers',TRIGGERS],['actions',ACTIONS]]) {
  ensure(Array.isArray(e[field])&&e[field].length<=allowed.length&&e[field].every(v=>allowed.includes(v))&&new Set(e[field]).size===e[field].length,`${field}の値が不正です。`);
 }
 ensure(e.place===''||PLACES.includes(e.place),'場所が不正です。');
 ensure(e.duration===''||DURATIONS.includes(e.duration),'続いた時間が不正です。');
 ensure(smallString(e.note,2000),'メモは2000文字までです。');
 return e;
}
export function validateState(s) {
 ensure(s && s.schema===SCHEMA,'このファイルの形式・バージョンには対応していません。');
 ensure(Array.isArray(s.entries)&&s.entries.length<=20000,'記録の形式または件数が上限を超えています。');
 s.entries.forEach(validateEntry);
 ensure(new Set(s.entries.map(e=>e.id)).size===s.entries.length,'重複する記録IDがあります。');
 ensure(smallString(s.consultNote,12000),'相談メモの形式が不正です。');
 const t=s.settings;
 ensure(t&&smallString(t.nickname,30)&&['light','dark','auto'].includes(t.theme)&&typeof t.motion==='boolean'&&typeof t.privacyCover==='boolean'&&typeof t.onboarded==='boolean','設定の形式が不正です。');
 ensure(smallString(t.charm,500)&&smallString(t.supportName,80)&&smallString(t.supportPhone,40)&&(!t.supportPhone||/^\+?\d{3,20}$/.test(t.supportPhone.replace(/[ ()-]/g,''))),'お守り・連絡先の形式が不正です。');
 ensure(Number.isInteger(s.revision)&&s.revision>=0,'保存バージョンが不正です。');
 ensure(typeof s.createdAt==='string'&&Number.isFinite(Date.parse(s.createdAt)),'作成日時が不正です。');
 for(const k of ['lastBackup','backupSnooze'])ensure(s[k]===null||(typeof s[k]==='string'&&Number.isFinite(Date.parse(s[k]))),'バックアップ情報が不正です。');
 return s;
}
export function mergeStates(current, incoming) {
 validateState(incoming);
 const map=new Map(current.entries.map(e=>[e.id,e]));
 let added=0,updated=0;
 for(const e of incoming.entries) {
  const old=map.get(e.id);
  if(!old) {map.set(e.id,e);added++;}
  else if(Date.parse(e.updatedAt)>Date.parse(old.updatedAt)){map.set(e.id,e);updated++;}
 }
 let consultNote=current.consultNote;
 if(incoming.consultNote&&!consultNote.includes(incoming.consultNote)){
  consultNote=(consultNote?consultNote+'\n\n［バックアップから復元］\n':'')+incoming.consultNote;
 }
 ensure(consultNote.length<=12000,'相談メモが12000文字を超えるため統合できません。先にメモを整理してください。');
 ensure(map.size<=20000,'統合後の記録が20000件を超えます。');
 return {entries:[...map.values()],consultNote,added,updated};
}
export function makeReport(state,start,end,details=false) {
 const r=rangeData(state.entries,start,end);
 const lines=['凪｜診察・相談のための記録',`${prettyDay(start,true)} 〜 ${prettyDay(end,true)}`,'',
 `記録のある日：${r.days.length}日／${daysBetween(start,end).length}日（未記録 ${r.missing}日）`,
 `渇望ありの記録：${r.count}件`,
 `渇望なしの確認：${r.checks.length}件（確認時点の自己申告）`,
 `渇望なしの確認のみの日：${r.zeroOnly.length}日`,
 `渇望の平均の強さ：${num(r.average)}／10（渇望あり ${r.count}件が分母）`,
 `期間内の最大：${num(r.max)}／10`,
 '', '【その後の状況】'];
 for(const [k,label] of Object.entries(OUTCOMES))lines.push(`${label}：${r.waves.filter(e=>e.outcome===k).length}件`);
 lines.push('','【よく選ばれたきっかけ】',...counts(r.waves,'triggers').map(([k,n])=>`${k}：${n}件`));
 if(!counts(r.waves,'triggers').length)lines.push('記録なし');
 lines.push('','【記録された対処】',...counts(r.waves,'actions').map(([k,n])=>`${k}：${n}件`));
 if(!counts(r.waves,'actions').length)lines.push('記録なし');
 lines.push('',`前後の強さがある記録：${r.paired.length}件`,r.paired.length?`その後 − 最初の強さの平均：${r.afterChange>0?'+':''}${r.afterChange}（対処の効果・因果関係を示すものではありません）`:'前後比較の記録はありません。',
 '', '【相談したいこと】',state.consultNote||'未記入');
 if(details){
  lines.push('','【記録の明細】');
  [...r.all].sort((a,b)=>a.at.localeCompare(b.at)).forEach(e=>{
   lines.push(`${e.day} ${e.time}｜${e.kind==='check'?'渇望なし':`強さ ${e.strength}/10`}｜${e.kind==='check'?'確認時点':OUTCOMES[e.outcome]}`);
   if(e.triggers.length)lines.push('きっかけ：'+e.triggers.join('・'));
   if(e.actions.length)lines.push('したこと：'+e.actions.join('・'));
   if(e.place||e.duration)lines.push([e.place,e.duration].filter(Boolean).join('／'));
   if(e.after!==null)lines.push('その後の強さ：'+e.after+'/10');
   if(e.note)lines.push('メモ：'+e.note);
  });
 }
 lines.push('','【読み方】','これは本人が入力した記録の集計であり、診断・服薬指示ではありません。未記録は0として計算していません。渇望なしの確認は一日全体の状態を保証しません。複数選択項目の合計は記録件数を超えることがあります。日付・時刻は入力時の現地時刻です。');
 return lines.join('\n');
}
