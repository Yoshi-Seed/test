/* Only the application shell is cached. No records enter this worker. */
const VERSION='1.0.0';
const PREFIX='nagi-shell:'+self.registration.scope+':';
const CACHE=PREFIX+VERSION;
const FILES=[
 './','./index.html','./style.css','./app.js','./core.js','./storage.js',
 './manifest.webmanifest','./assets/icon.svg','./assets/apple-touch-icon.png',
 './assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable-512.png'
];
const URLS=FILES.map(p=>new URL(p,self.registration.scope).href);
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(URLS.map(url=>new Request(url,{cache:'reload'})));
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 const clean=url.origin+url.pathname;
 if(!URLS.includes(clean))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),cached=await cache.match(clean);
  if(cached)return cached;
  return fetch(req);
 })());
});
