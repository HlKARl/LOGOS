/* LOGOS 2.0 — Music manager. No third-party services or CDNs. */
(()=>{
'use strict';
const PHASES=['inicio','suave','media','intensa','victoria'];
const AUDIO_EXT=/\.(mp3|m4a|aac|ogg|opus|wav|flac|webm)$/i;
const DB='logos-musica-v2',STORE='pistas';
const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
function phaseOfPath(p){
 const path='/'+p.toLowerCase().replace(/\\/g,'/').normalize('NFD').replace(/[\u0300-\u036f]/g,'')+'/';
 if(/\/(victoria|ganador|final-victoria)\//.test(path))return 'victoria';
 if(/\/(inicio|menu|portada|home)\//.test(path))return 'inicio';
 if(/\/(intensa|intenso|dificil|11-15|nivel3|alta)\//.test(path))return 'intensa';
 if(/\/(media|medio|6-10|nivel2)\//.test(path))return 'media';
 if(/\/(suave|facil|1-5|nivel1)\//.test(path))return 'suave';
 return 'general';
}
function openDb(){return new Promise((resolve,reject)=>{
 if(!indexedDB){reject(Error('Almacenamiento local no disponible'));return}
 const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'path'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
})}
async function rows(){const db=await openDb();return new Promise((resolve,reject)=>{const req=db.transaction(STORE,'readonly').objectStore(STORE).getAll();req.onsuccess=()=>{db.close();resolve(req.result||[])};req.onerror=()=>{db.close();reject(req.error)}})}
async function insert(rows){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readwrite');for(const row of rows)t.objectStore(STORE).put(row);t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>{db.close();reject(t.error||Error('Sin espacio'))}})}
async function deleteAll(){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readwrite');t.objectStore(STORE).clear();t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>{db.close();reject(t.error)}})}
function create(settings,onChange=()=>{}){
 const audio=new Audio();audio.preload='none';audio.loop=false;
 let local=[],catalog=[],playing=false,usingAmbient=false,nowPlaying='',currentKey='',lastByPhase={},scene='inicio',phaseName='inicio',objectUrl=null,context=null,ambientTick=null,ambientCounter=0,fadeTimer=null,changeToken=0,initialized=false,offlineCount=0;
 const volume=()=>Math.max(0,Math.min(1,Number(settings.musicVolume??35)/100));
 const notify=()=>{try{onChange({playing,nowPlaying,scene,source:settings.musicSource,localCount:local.length,githubCount:catalog.length,offlineCount,usingAmbient})}catch{}};
 const contextGet=()=>{try{context??=new (window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')context.resume().catch(()=>{});return context}catch{return null}};
 const stage=()=>scene==='game'?phaseName:scene;
 const loadedTracks=()=>settings.musicSource==='github'?catalog:local;
 function choices(){const all=loadedTracks(),needed=stage();let chosen=all.filter(x=>x.phase===needed);
  if(!chosen.length&&settings.musicSource==='local')chosen=all.filter(x=>x.phase==='general');
  if(!chosen.length&&settings.musicSource==='local')chosen=all.filter(x=>x.phase!=='victoria'&&x.phase!=='inicio');
  if(!chosen.length&&settings.musicSource==='github')chosen=all.filter(x=>x.phase==='general');
  return chosen;
 }
 const setPlaying=(v)=>{playing=!!v;notify()};
 function stopTicker(){if(ambientTick){clearInterval(ambientTick);ambientTick=null}}
 function fadeCancel(){if(fadeTimer){clearInterval(fadeTimer);fadeTimer=null}}
 function playChords(){if(!playing||!usingAmbient)return;const ctx=contextGet();if(!ctx)return;
  const part=stage();const danger=part==='intensa',middle=part==='media',win=part==='victoria';
  const sequence=win?[[261.63,329.63,392],[293.66,369.99,440],[329.63,392,493.88]]:[[196,246.94,293.66],[174.61,220,261.63],[164.81,196,246.94],[146.83,185,220]];
  const tones=sequence[ambientCounter++%sequence.length],now=ctx.currentTime,master=ctx.createGain();master.gain.value=volume()*.073;master.connect(ctx.destination);
  tones.forEach((f,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=i===1?'triangle':'sine';osc.frequency.value=f*(i===0?.5:1);const hold=danger?2.3:middle?2.9:3.5;gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(i===0?.25:.11,now+.45);gain.gain.setValueAtTime(i===0?.25:.11,now+hold-.45);gain.gain.exponentialRampToValueAtTime(.0001,now+hold+.15);osc.connect(gain).connect(master);osc.start(now);osc.stop(now+hold+.2);osc.onended=()=>{osc.disconnect();gain.disconnect()}});
  if(danger||middle){const beat=ctx.createOscillator(),gain=ctx.createGain();beat.type='sine';beat.frequency.setValueAtTime(danger?92:82,now);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(danger?.09:.043,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.26);beat.connect(gain).connect(master);beat.start(now);beat.stop(now+.28)}
  setTimeout(()=>{try{master.disconnect()}catch{}},5000);
 }
 function startAmbient(){fadeCancel();audio.pause();stopTicker();usingAmbient=true;nowPlaying='Instrumental LOGOS · '+({inicio:'Inicio',suave:'Sereno',media:'Expectativa',intensa:'Máxima tensión',victoria:'Victoria'}[stage()]||'');currentKey='ambient:'+stage();ambientCounter=0;setPlaying(true);playChords();ambientTick=setInterval(playChords,stage()==='intensa'?2500:stage()==='media'?3050:3750)}
 function stopPlayback(){changeToken++;fadeCancel();stopTicker();audio.pause();usingAmbient=false;if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}currentKey='';nowPlaying='';setPlaying(false)}
 async function playTrack(track,token){if(token!==changeToken)return;
  usingAmbient=false;stopTicker();fadeCancel();audio.pause();
  if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}
  if(track.file){objectUrl=URL.createObjectURL(track.file);audio.src=objectUrl}
  else audio.src=track.url;
  currentKey=track.path;nowPlaying=track.name;audio.volume=0;
  try{await audio.play();if(token!==changeToken){audio.pause();return}
   let n=0;fadeTimer=setInterval(()=>{n++;audio.volume=volume()*Math.min(1,n/12);if(n>=12)fadeCancel()},35);setPlaying(true);
  }catch(e){if(token!==changeToken)return;startAmbient();notify()}
 }
 function next(force=false){if(!playing&&!force)return;const list=choices();if(!list.length){startAmbient();return}
  const available=list.length>1?list.filter(t=>t.path!==lastByPhase[stage()]):list;
  const track=pick(available.length?available:list);lastByPhase[stage()]=track.path;
  const token=++changeToken;void playTrack(track,token);
 }
 function start(){if(playing)return;setPlaying(true);if(settings.musicSource==='ambient')startAmbient();else next(true)}
 function stop(){stopPlayback()}
 function toggle(){if(playing)stop();else start()}
 function skip(){if(!playing){start();return}if(settings.musicSource==='ambient'){startAmbient();return}next(true)}
 function setScene(view,round=1,won=false){const old=stage();scene=view==='game'?'game':view==='result'&&won?'victoria':'inicio';phaseName=round<=5?'suave':round<=10?'media':'intensa';if(old!==stage()&&playing){if(settings.musicSource==='ambient')startAmbient();else next(true)}else notify()}
 function setSource(value){if(!['ambient','local','github'].includes(value))value='ambient';settings.musicSource=value; if(playing){stopPlayback();start()}else notify()}
 function setVolume(){audio.volume=volume();notify()}
 async function importFiles(files,assignTo='auto'){const rows=[];for(const file of Array.from(files||[])){
  if(!file||!((file.type||'').startsWith('audio/')||AUDIO_EXT.test(file.name)))continue;
  const original=(file.webkitRelativePath||file.name).replace(/\\/g,'/');const explicit=PHASES.includes(assignTo)?assignTo:'auto';const path=explicit==='auto'?original:explicit+'/'+original;rows.push({path,name:file.name,phase:explicit==='auto'?phaseOfPath(original):explicit,file,size:file.size||0});
 }
 if(!rows.length)throw Error('No se encontraron canciones compatibles (MP3, OGG, M4A, WAV…)');
 await insert(rows);local=await rowsFromStorage();notify();if(playing&&settings.musicSource==='local')next(true);return rows.length;
 }
 async function rowsFromStorage(){try{return await rows()}catch{return []}}
 async function clearLocal(){await deleteAll();local=[];if(playing&&settings.musicSource==='local')next(true);notify()}
 function parseCatalog(json){const tracks=[];for(const [category,files] of Object.entries(json||{})){
  if(!Array.isArray(files))continue;
  for(const raw of files){if(typeof raw!=='string')continue;const path=raw.replace(/^\/+/, '');
   if(!AUDIO_EXT.test(path)||path.includes('..')||path.includes('://')||path.startsWith('/'))continue;
   const phase=PHASES.includes(category)?category:'general';tracks.push({path,name:path.split('/').pop(),phase,url:new URL('music/'+path,document.baseURI).href});
  }
 }return tracks;}
 async function reloadCatalog(){try{const response=await fetch('music/catalog.json',{cache:'no-cache'});if(!response.ok)throw Error('Sin catálogo');catalog=parseCatalog(await response.json());}catch{catalog=[]}
  notify();return catalog.length;
 }
 async function offlineStatus(){if(!('caches' in window)){offlineCount=0;return 0}try{const cache=await caches.open('logos-music-v2');const keys=await cache.keys();offlineCount=keys.length;notify();return offlineCount}catch{return 0}}
 async function downloadAll(progress=()=>{}){
  if(!catalog.length)await reloadCatalog();if(!catalog.length)throw Error('Todavía no hay canciones en el catálogo de GitHub');
  if(!('caches'in window)||location.protocol==='file:')throw Error('Descarga disponible en la versión publicada (HTTPS)');
  const cache=await caches.open('logos-music-v2');let ok=0,failed=0,total=catalog.length;
  for(const track of catalog){try{const req=new Request(track.url);const cached=await cache.match(req);if(!cached){const response=await fetch(req);if(!response.ok)throw Error('HTTP '+response.status);await cache.put(req,response.clone())}ok++}catch{failed++}progress({ok,failed,total,track:track.name});}
  await offlineStatus();return {ok,failed,total};
 }
 async function migrateLegacy(){try{const r=indexedDB.open('logos-audio-v1',1);const old=await new Promise(resolve=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);r.onupgradeneeded=()=>resolve(null)});if(!old||!old.objectStoreNames.contains('songs'))return;const item=await new Promise(resolve=>{const req=old.transaction('songs','readonly').objectStore('songs').get('current');req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null)});old.close();if(item?.file&&local.length===0){await insert([{path:'general/'+item.file.name,name:item.file.name,phase:'general',file:item.file,size:item.file.size||0}]);local=await rowsFromStorage()}}catch{}}
 async function init(){if(initialized)return;initialized=true;local=await rowsFromStorage();await migrateLegacy();await reloadCatalog();await offlineStatus();notify()}
 audio.addEventListener('ended',()=>{if(playing&&!usingAmbient)next(true)});
 audio.addEventListener('error',()=>{if(playing&&!usingAmbient)startAmbient()});
 return {init,toggle,start,stop,skip,setScene,setSource,setVolume,importFiles,clearLocal,reloadCatalog,downloadAll,offlineStatus,getState:()=>({playing,nowPlaying,scene,source:settings.musicSource,localCount:local.length,githubCount:catalog.length,offlineCount,usingAmbient})};
}
window.LogosMusic={create,phaseOfPath};
})();
