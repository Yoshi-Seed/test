/* IndexedDB writes are transactional. A failed write never reports success. */
import {defaultState,validateState} from './core.js';
export const APP_PATH=new URL('./',import.meta.url).pathname;
const DB_NAME='nagi-private-v1:'+APP_PATH;
let db;
export let lastRaw=null;
export async function openStore(){
 return new Promise((resolve,reject)=>{
  if(!globalThis.indexedDB){reject(new Error('端末内の保存機能を使用できません。'));return;}
  const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('app'))req.result.createObjectStore('app');};
  req.onsuccess=()=>{db=req.result;db.onversionchange=()=>{db.close();};resolve(db);};
  req.onerror=()=>reject(req.error||new Error('端末内の保存領域を開けません。'));
  req.onblocked=()=>reject(new Error('別のタブが保存領域を使用中です。凪のほかのタブを閉じてください。'));
 });
}
export function readStore(){
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('app','readonly'),req=tx.objectStore('app').get('state');
  req.onsuccess=()=>{lastRaw=req.result??null;try{resolve(req.result?validateState(req.result):defaultState());}catch(e){reject(e);}};
  req.onerror=()=>reject(req.error);
 });
}
export function mutateStore(fn){
 return new Promise((resolve,reject)=>{
  let result,customError;
  const tx=db.transaction('app','readwrite'),store=tx.objectStore('app');
  const req=store.get('state');
  req.onsuccess=()=>{
   try {
    const state=req.result?validateState(req.result):defaultState();
    fn(state);
    state.revision+=1;
    validateState(state);
    store.put(state,'state');result=state;
   } catch(e){customError=e;tx.abort();}
  };
  tx.oncomplete=()=>{lastRaw=result;resolve(result);};
  tx.onabort=()=>reject(customError||tx.error||new Error('保存できませんでした。記録は更新されていません。'));
  tx.onerror=()=>{ /* onabort is the single rejection path. */ };
 });
}
export function resetStore(){
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('app','readwrite');
  tx.objectStore('app').delete('state');
  tx.oncomplete=()=>{lastRaw=null;resolve();};
  tx.onabort=()=>reject(tx.error||new Error('削除できませんでした。'));
 });
}
const encode=data=>btoa(Array.from(new Uint8Array(data),n=>String.fromCharCode(n)).join(''));
const decode=str=>{
 if(typeof str!=='string'||str.length>35000000||!/^[A-Za-z0-9+/]*={0,2}$/.test(str))throw new Error('暗号化ファイルの形式が不正です。');
 return Uint8Array.from(atob(str),c=>c.charCodeAt(0));
};
async function derive(pass,salt,iterations){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},key,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function encryptBackup(state,pass){
 if(!crypto.subtle)throw new Error('暗号化にはHTTPSで公開されたページが必要です。');
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const iterations=310000,key=await derive(pass,salt,iterations);
 const data=new TextEncoder().encode(JSON.stringify(state));
 if(data.byteLength>16*1024*1024)throw new Error('バックアップ対象が16MBを超えています。大容量のため、このバージョンでは暗号化書き出しができません。既存の記録は変更していません。');
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('NAGI-BACKUP-1')},key,data);
 return {format:'nagi-encrypted',version:1,kdf:'PBKDF2-SHA256',iterations,cipher:'AES-256-GCM',salt:encode(salt),iv:encode(iv),data:encode(ciphertext)};
}
export async function decryptBackup(obj,pass){
 if(!crypto.subtle)throw new Error('復号にはHTTPSで公開されたページが必要です。');
 if(!obj||obj.format!=='nagi-encrypted'||obj.version!==1||obj.kdf!=='PBKDF2-SHA256'||obj.cipher!=='AES-256-GCM'||obj.iterations!==310000)throw new Error('このバックアップ形式には対応していません。');
 const salt=decode(obj.salt),iv=decode(obj.iv),data=decode(obj.data);
 if(salt.length!==16||iv.length!==12||data.length<16)throw new Error('暗号化ファイルの形式が不正です。');
 try{
  const key=await derive(pass,salt,obj.iterations);
  const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('NAGI-BACKUP-1')},key,data);
  return validateState(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(clear)));
 }catch(e){throw new Error('パスフレーズが違うか、ファイルが壊れています。記録は変更していません。');}
}
