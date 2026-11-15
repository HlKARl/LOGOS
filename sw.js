// LOGOS 2.0: independent caches for application shell and user-selected soundtrack.
const SHELL='logos-offline-v2.0.0';
const MUSIC='logos-music-v2';
const FILES=['./','./index.html','./styles.css','./app.js','./music.js','./questions.js','./manifest.webmanifest','./music/catalog.json','./icons/logos.svg','./icons/logos-192.png','./icons/logos-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('logos-offline-')&&k!==SHELL).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('/music/catalog.json')){
  e.respondWith(fetch(req).then(async r=>{if(r.ok){const cache=await caches.open(SHELL);await cache.put(req,r.clone())}return r}).catch(async()=>await caches.match(req)||new Response('{}',{headers:{'Content-Type':'application/json'}})));
  return;
 }
 if(url.pathname.includes('/music/')&&/\.(mp3|ogg|m4a|aac|wav|flac|opus|webm)$/i.test(url.pathname)){
  e.respondWith(caches.open(MUSIC).then(async cache=>{const hit=await cache.match(req);if(hit)return hit;const res=await fetch(req);if(res.ok){try{await cache.put(req,res.clone())}catch{}}return res}));return;
 }
 e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(SHELL).then(c=>c.put(req,copy)).catch(()=>{})}return res})));
});
