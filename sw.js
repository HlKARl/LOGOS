/* LOGOS 3.5 — actualización automática del contenido; canciones y datos personales independientes. */
const VERSION='3.5.0';
const SHELL='logos-offline-v'+VERSION;
const MUSIC='logos-music-v2'; // Conservar las canciones ya descargadas.
const FILES=['./','./index.html','./styles.css?v='+VERSION,'./app.js?v='+VERSION,'./music.js?v='+VERSION,'./questions.js?v='+VERSION,'./manifest.webmanifest','./music/catalog.json','./icons/logos.svg','./icons/logos-192.png','./icons/logos-512.png'];

self.addEventListener('install', event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(SHELL);
  await cache.addAll(FILES.map(path=>new Request(path,{cache:'reload'})));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate', event=>{
 event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith('logos-offline-')&&name!==SHELL).map(name=>caches.delete(name)));
  await self.clients.claim();
 })());
});

async function shellNetworkFirst(request, destination){
 const cache=await caches.open(SHELL);
 try{
  // No mantener el HTML, JS o CSS desactualizados cuando hay conexión.
  const response=await fetch(new Request(request,{cache:'no-cache'}));
  if(response.ok){
   const key=destination==='document'?new URL('./index.html',self.registration.scope):request;
   try{await cache.put(key,response.clone())}catch{}
  }
  return response;
 }catch{
  if(destination==='document')return (await cache.match(new URL('./index.html',self.registration.scope)))||Response.error();
  return (await cache.match(request))||Response.error();
 }
}

async function cachedRange(full,range){
 const match=/^bytes=(\d*)-(\d*)$/i.exec(range.trim());
 if(!match)return full;
 const bytes=await full.arrayBuffer(),size=bytes.byteLength;
 let start,end;
 if(match[1]===''){
  const tail=Number(match[2]);
  if(!Number.isFinite(tail)||tail<=0)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
  start=Math.max(0,size-tail);end=size-1;
 }else{
  start=Number(match[1]);end=match[2]===''?size-1:Math.min(size-1,Number(match[2]));
 }
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start> end||start>=size)
  return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
 const headers=new Headers();
 headers.set('Content-Type',full.headers.get('Content-Type')||'audio/mpeg');
 headers.set('Accept-Ranges','bytes');
 headers.set('Content-Range',`bytes ${start}-${end}/${size}`);
 headers.set('Content-Length',String(end-start+1));
 return new Response(bytes.slice(start,end+1),{status:206,headers});
}

async function musicResponse(request){
 const cache=await caches.open(MUSIC);
 const cacheKey=new Request(request.url); // sin cabecera Range
 const full=await cache.match(cacheKey);
 const range=request.headers.get('range');
 if(range){
  // GitHub Pages responde 206. No se puede almacenar un 206 como archivo completo.
  try{
   const live=await fetch(request);
   if(live.ok){
    if(live.status===200)try{await cache.put(cacheKey,live.clone())}catch{}
    return live;
   }
   if(!full)return live;
  }catch{if(!full)return Response.error()}
  // Sin conexión: responder 206 a partir del MP3 completo previamente almacenado.
  return cachedRange(full,range);
 }
 // Para la biblioteca offline usar siempre respuestas completas (200), nunca fragmentos 206.
 if(full)return full;
 try{
  const live=await fetch(request);
  if(live.ok&&live.status===200)try{await cache.put(cacheKey,live.clone())}catch{}
  return live;
 }catch{return Response.error()}
}

self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 if(url.pathname.includes('/music/')&&/\.(mp3|m4a|aac|ogg|opus|wav|flac|webm)$/i.test(url.pathname)){
  event.respondWith(musicResponse(request));return;
 }
 if(request.mode==='navigate'){
  event.respondWith(shellNetworkFirst(request,'document'));return;
 }
 if(url.pathname.endsWith('/music/catalog.json')||/\.(html|js|css|json|webmanifest)$/i.test(url.pathname)){
  event.respondWith(shellNetworkFirst(request,'asset'));return;
 }
 event.respondWith((async()=>{
  const hit=await caches.match(request);if(hit)return hit;
  try{const live=await fetch(request);if(live.ok){const cache=await caches.open(SHELL);try{await cache.put(request,live.clone())}catch{}}return live}catch{return Response.error()}
 })());
});
