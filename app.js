/* LOGOS v2.0 — Concurso bíblico con biblioteca musical offline. */
(()=>{
'use strict';
const $ = id => document.getElementById(id);
const PRIZES=[100,200,300,500,1000,2000,4000,8000,16000,32000,64000,125000,250000,500000,1000000];
const TIER_LABELS=['','INICIAL','BÁSICO','INTERMEDIO','AVANZADO','EXPERTO'];
const QUESTIONS=Array.isArray(window.LOGOS_QUESTIONS)?window.LOGOS_QUESTIONS:[];
const byId=new Map(QUESTIONS.map(q=>[q.id,q]));
const KEY='logos.game.v1',SETTINGS_KEY='logos.settings.v1',RECORD_KEY='logos.records.v1',RECENT_KEY='logos.recent.v1';
const basicSettings={timer:0,sfx:true,musicVolume:35,musicSource:'ambient'};
function fromStorage(key,otherwise){try{const value=localStorage.getItem(key);return value?JSON.parse(value):otherwise}catch{return otherwise}}
function putStorage(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
function clean(str){return String(str||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}
function displayPoints(num){return Number(num||0).toLocaleString('es-EC')}
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function pad(n){return String(n).padStart(2,'0')}
const settings={...basicSettings,...fromStorage(SETTINGS_KEY,{})};
let game=validateGame(fromStorage(KEY,null));
let view='home',modalOpen=false,pendingResolve=false,timeInterval=null,soundContext=null,toastTimeout=null,modalReturnFocus=null;
if(settings.musicSource==='archivo')settings.musicSource='local';
const music=window.LogosMusic.create(settings,updateMusicButton);
const audioApi={get ctx(){if(!soundContext){try{soundContext=new (window.AudioContext||window.webkitAudioContext)()}catch{}}if(soundContext&&soundContext.state==='suspended')soundContext.resume().catch(()=>{});return soundContext}};
function validateGame(g){if(!g||!Number.isInteger(g.round)||g.round<1||g.round>15||!g.q||!byId.has(g.q.id)||!Array.isArray(g.q.order)||g.q.order.length!==4)return null;if(!Number.isFinite(g.timerSeconds))g.timerSeconds=settings.timer;return g}
function tierForRound(round){return Math.min(5,Math.ceil(round/3))}
function correctSlot(q){const data=byId.get(q.id);return q.order.indexOf(data.answer)}
function safePrize(won){return won>=10?PRIZES[9]:won>=5?PRIZES[4]:0}
function saveGame(){if(game)putStorage(KEY,game);else try{localStorage.removeItem(KEY)}catch{}}
function saveSettings(){putStorage(SETTINGS_KEY,settings)}
function pickQuestion(round,used){
 const tier=tierForRound(round);
 let pool=QUESTIONS.filter(q=>q.tier===tier&&!used.includes(q.id));
 if(!pool.length)pool=QUESTIONS.filter(q=>q.tier===tier);
 if(!pool.length)throw Error('No hay preguntas disponibles para este nivel');
 const recents=fromStorage(RECENT_KEY,[]);const fresh=pool.filter(q=>!recents.includes(q.id));if(fresh.length)pool=fresh;
 const books=used.map(id=>byId.get(id)?.book);const novel=pool.filter(q=>!books.includes(q.book));if(novel.length)pool=novel;
 const q=pool[Math.floor(Math.random()*pool.length)];
 const history=[...recents.filter(id=>id!==q.id),q.id].slice(-110);putStorage(RECENT_KEY,history);
 return {id:q.id,order:shuffle([0,1,2,3]),removed:[],wrong:[],selected:null,status:'active',result:null,doubleActive:false,fiftyApplied:false};
}
function makeNewGame(){
 if(QUESTIONS.length!==660){toast('No se pudieron cargar las 660 preguntas.');return}
 const player=($('playerInput').value.trim().slice(0,28)||'Participante');
 const g={player,round:1,won:0,used:[],lifelines:{fifty:false,swap:false,double:false},q:null,startedAt:Date.now(),timerSeconds:settings.timer,timeLeft:settings.timer,notice:''};
 g.q=pickQuestion(1,[]);g.used.push(g.q.id);game=g;pendingResolve=false;saveGame();showGame();sound('start');
}
function showHome(){view='home';music.setScene('home');stopTimer();$('gameScreen').hidden=true;$('resultScreen').hidden=true;$('homeScreen').hidden=false;const resume=Boolean(game);$('resumeBtn').hidden=!resume;if(game)$('playerInput').value=game.player;document.title='LOGOS · El gran desafío bíblico';window.scrollTo({top:0,behavior:'instant'})}
function showGame(){if(!game)return showHome();view='game';music.setScene('game',game.round);$('homeScreen').hidden=true;$('resultScreen').hidden=true;$('gameScreen').hidden=false;$('mobileLadder').hidden=true;$('ladderToggle').setAttribute('aria-expanded','false');renderGame();startTimer();document.title='LOGOS · Pregunta '+game.round;window.scrollTo({top:0,behavior:'instant'})}
function showResult(record){view='result';music.setScene('result',15,record.reason==='win');stopTimer();$('homeScreen').hidden=true;$('gameScreen').hidden=true;$('resultScreen').hidden=false;
 const win=record.reason==='win',retire=record.reason==='retire';$('resultIcon').textContent=win?'✦':retire?'◇':'✧';$('resultEyebrow').textContent=win?'DESAFÍO COMPLETADO':retire?'HAS DECIDIDO PLANTARTE':'FIN DEL CONCURSO';
 $('resultTitle').textContent=win?'¡Alcanzaste el millón!':retire?'¡Premio asegurado!':record.won>=10?'¡Gran recorrido!':record.won>=5?'¡Buen trabajo!':'¡Sigue aprendiendo!';
 $('resultSubtitle').textContent=win?'Respondiste correctamente las quince preguntas. ¡Un recorrido extraordinario!':retire?'Elegiste retirarte con lo ganado. A veces, la sabiduría también está en saber cuándo detenerse.':record.reason==='timeout'?'Se agotó el tiempo de la pregunta. Tu premio se calcula según la última meta asegurada.':'La última respuesta no fue correcta, pero siempre hay algo nuevo que aprender.';
 $('resultScore').textContent=displayPoints(record.score);
 $('resultDetails').textContent=`${record.player} · ${record.won} ${record.won===1?'pregunta superada':'preguntas superadas'} · ${new Date(record.date).toLocaleDateString('es-EC')}`;
 document.title='LOGOS · '+$('resultTitle').textContent;window.scrollTo({top:0,behavior:'instant'});
}
function finish(reason){if(!game)return;const last=game;const score=reason==='win'||reason==='retire'?(last.won?PRIZES[last.won-1]:0):safePrize(last.won);
 const record={player:last.player,won:last.won,score,reason,date:Date.now()};const records=fromStorage(RECORD_KEY,[]);records.unshift(record);putStorage(RECORD_KEY,records.slice(0,100));game=null;saveGame();pendingResolve=false;showResult(record);
 if(reason==='win')sound('victory');}
function renderLadder(){if(!game)return;const html=PRIZES.map((value,i)=>({value,n:i+1})).reverse().map(({value,n})=>{
 const isCurrent=n===game.round,check=[5,10,15].includes(n),passed=n<=game.won&&!isCurrent;
 return `<div class="prize-line ${isCurrent?'current':''} ${passed?'passed':''} ${check?'checkpoint':''} ${n===15?'final':''}" ${isCurrent?'aria-current="step"':''}><span class="prize-num">${pad(n)}</span><span class="prize-value">${displayPoints(value)}</span><span class="prize-symbol">${n===15?'✦':check?'◆':passed?'✓':''}</span></div>`;
 }).join('');$('prizeLadder').innerHTML=html;$('mobileLadderContent').innerHTML='<div class="prize-ladder">'+html+'</div>'}
function renderOptions(){if(!game)return;const q=game.q;const data=byId.get(q.id);const c=correctSlot(q);const grid=$('answerGrid');grid.replaceChildren();
 q.order.forEach((originalIdx,i)=>{const btn=document.createElement('button');btn.type='button';btn.className='answer-button';btn.setAttribute('aria-label',String.fromCharCode(65+i)+': '+data.options[originalIdx]);btn.setAttribute('aria-pressed',String(q.selected===i));
 const eliminated=q.removed.includes(i),wrong=q.wrong.includes(i),resolved=q.status==='resolved';
 if(q.selected===i&&!resolved)btn.classList.add('selected');if(eliminated)btn.classList.add('eliminated');if(wrong||(resolved&&q.result!=='correct'&&q.selected===i&&i!==c))btn.classList.add('wrong');
 if(resolved&&i===c)btn.classList.add('correct');if(pendingResolve&&q.selected===i)btn.classList.add('locked');
 btn.disabled=eliminated||wrong||resolved||pendingResolve;const letter=document.createElement('span');letter.className='answer-letter';letter.textContent=String.fromCharCode(65+i);const text=document.createElement('span');text.className='answer-copy';text.textContent=data.options[originalIdx];btn.append(letter,text);btn.addEventListener('click',()=>selectAnswer(i));grid.appendChild(btn);
 });
}
function feedback(message,kind=''){const bar=$('feedbackBar');bar.classList.remove('good','bad','warn');if(kind)bar.classList.add(kind);$('feedbackText').textContent=message}
function renderGame(){if(!game)return;const q=game.q,data=byId.get(q.id);const resolved=q.status==='resolved';
 $('playerDisplay').textContent=game.player.toLocaleUpperCase('es-EC');$('roundLabel').textContent=`PREGUNTA ${pad(game.round)} DE 15`; $('roundPrize').innerHTML=displayPoints(PRIZES[game.round-1])+' <span>PTS</span>';$('tierLabel').textContent=TIER_LABELS[tierForRound(game.round)];$('progressFill').style.width=((game.round/15)*100)+'%';
 $('questionBook').textContent=data.book.toLocaleUpperCase('es-EC')+' · '+(data.testament==='AT'?'ANTIGUO TESTAMENTO':'NUEVO TESTAMENTO');$('questionText').textContent=data.question;
 $('questionReference').hidden=!resolved;$('questionReference').textContent=resolved?'REFERENCIA: '+data.reference:'';$('safetyDisplay').textContent=displayPoints(safePrize(game.won))+' PTS';renderOptions();renderLadder();
 const cb=$('confirmBtn');const canSelect=q.status==='active'&&!pendingResolve;cb.disabled=!canSelect||q.selected===null;
 if(resolved){cb.disabled=false;cb.innerHTML=q.result==='correct'?(game.round===15?'VER VICTORIA <span>✦</span>':'SIGUIENTE PREGUNTA <span>↗</span>'):'VER RESULTADO <span>↗</span>';
  feedback(q.result==='correct'?`¡Respuesta correcta! Has alcanzado ${displayPoints(PRIZES[game.round-1])} puntos.`:q.result==='timeout'?'Se agotó el tiempo. La respuesta correcta aparece en verde.':'La respuesta correcta aparece en verde. Revisa la referencia bíblica. ',q.result==='correct'?'good':'bad');
 } else{cb.innerHTML=pendingResolve?'COMPROBANDO… <span>✦</span>':'CONFIRMAR RESPUESTA <span>↗</span>';
  feedback(pendingResolve?'Respuesta definitiva…':game.notice||(q.wrong.length?'Primera respuesta incorrecta. ¡Tienes una segunda oportunidad!':q.selected!==null?'¿Es tu respuesta definitiva? Pulsa confirmar.':'Selecciona una alternativa y confirma tu respuesta.'),q.wrong.length||game.notice?'warn':'');}
 const canLifeline=canSelect;
 [['fifty','fiftyBtn'],['swap','swapBtn'],['double','doubleBtn']].forEach(([name,id])=>{const b=$(id);b.disabled=!canLifeline||game.lifelines[name];b.classList.toggle('used',game.lifelines[name]);b.classList.toggle('armed',name==='double'&&q.doubleActive)});
 $('timerPill').hidden=!game.timerSeconds;renderTimer();
}
function selectAnswer(i){if(!game||pendingResolve||game.q.status!=='active'||game.q.removed.includes(i)||game.q.wrong.includes(i))return;game.q.selected=i;game.notice='';saveGame();renderGame();sound('select')}
function confirm(){if(!game||pendingResolve)return;const q=game.q;
 if(q.status==='resolved'){if(q.result!=='correct')finish(q.result==='timeout'?'timeout':'wrong');else if(game.round===15)finish('win');else nextQuestion();return}
 if(q.selected===null)return;
 pendingResolve=true;stopTimer();saveGame();renderGame();sound('lock');
 window.setTimeout(()=>{if(!game||game.q!==q)return;pendingResolve=false;
 const correct=q.selected===correctSlot(q);
 if(correct){q.result='correct';q.status='resolved';game.won=game.round;game.notice='';sound('correct')}
 else if(q.doubleActive&&q.wrong.length===0){q.wrong.push(q.selected);q.selected=null;game.notice='Primera respuesta incorrecta. Elige otra; tu doble oportunidad sigue activa.';sound('second')}
 else{q.result='wrong';q.status='resolved';game.notice='';sound('wrong')}
 saveGame();renderGame();if(q.status==='active')startTimer();
 },1120);
}
function nextQuestion(){if(!game||game.round>=15)return;game.round++;music.setScene('game',game.round);game.q=pickQuestion(game.round,game.used);game.used.push(game.q.id);game.timerSeconds=settings.timer;game.timeLeft=game.timerSeconds;game.notice='';saveGame();renderGame();startTimer();sound('next');window.scrollTo({top:0,behavior:'smooth'})}
function removeFifty(q){const right=correctSlot(q);const incorrect=shuffle([0,1,2,3].filter(i=>i!==right&&!q.wrong.includes(i)&&!q.removed.includes(i)));q.removed.push(...incorrect.slice(0,Math.max(0,incorrect.length-1)));q.fiftyApplied=true}
function fifty(){if(!game||pendingResolve||game.q.status!=='active'||game.lifelines.fifty)return;game.lifelines.fifty=true;removeFifty(game.q);game.q.selected=null;game.notice='50/50: quedan la respuesta correcta y una alternativa posible.';saveGame();renderGame();sound('lifeline')}
function swap(){if(!game||pendingResolve||game.q.status!=='active'||game.lifelines.swap)return;const old=game.q;game.lifelines.swap=true;
 const fresh=pickQuestion(game.round,game.used);game.used.push(fresh.id);fresh.doubleActive=old.doubleActive;if(old.fiftyApplied)removeFifty(fresh);
 game.q=fresh;game.timeLeft=game.timerSeconds;game.notice='Pregunta cambiada por otra del mismo nivel de dificultad.';saveGame();renderGame();startTimer();sound('lifeline')}
function double(){if(!game||pendingResolve||game.q.status!=='active'||game.lifelines.double)return;game.lifelines.double=true;game.q.doubleActive=true;game.notice='Doble oportunidad activada: si fallas, podrás elegir otra respuesta.';saveGame();renderGame();sound('lifeline')}
function stopTimer(){if(timeInterval){clearInterval(timeInterval);timeInterval=null}}
function renderTimer(){const pill=$('timerPill'),text=$('timerText');if(!game||!game.timerSeconds){pill.hidden=true;return}pill.hidden=false;text.textContent=Math.max(0,Math.ceil(game.timeLeft??game.timerSeconds));pill.classList.toggle('danger',(game.timeLeft??game.timerSeconds)<=10)}
function startTimer(){stopTimer();if(!game||!game.timerSeconds||view!=='game'||game.q.status!=='active'||pendingResolve||modalOpen)return;if(!Number.isFinite(game.timeLeft)||game.timeLeft<=0)game.timeLeft=game.timerSeconds;
 let last=performance.now();timeInterval=setInterval(()=>{if(!game||view!=='game'||game.q.status!=='active'||modalOpen){stopTimer();return}const now=performance.now();game.timeLeft=Math.max(0,game.timeLeft-(now-last)/1000);last=now;renderTimer();if(game.timeLeft<=0){stopTimer();timeOut();}},160)}
function timeOut(){if(!game||game.q.status!=='active'||pendingResolve)return;game.q.status='resolved';game.q.result='timeout';game.q.selected=null;game.notice='';saveGame();renderGame();sound('wrong')}
function toast(message){const el=$('toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>{el.hidden=true},3400)}
function openModal(title,content,buttons=[]){stopTimer();modalReturnFocus=document.activeElement;modalOpen=true;$('modalTitle').textContent=title;$('modalBody').innerHTML=content;$('modalActions').replaceChildren();buttons.forEach(b=>{const button=document.createElement('button');button.type='button';button.className=b.style||'plain-action';button.textContent=b.label;button.addEventListener('click',b.fn);$('modalActions').appendChild(button)});$('modalBackdrop').hidden=false;$('modalClose').focus()}
function closeModal(){modalOpen=false;$('modalBackdrop').hidden=true;$('modalBody').replaceChildren();$('modalActions').replaceChildren();if(modalReturnFocus&&document.contains(modalReturnFocus))modalReturnFocus.focus();if(view==='game')startTimer()}
function leaveMenu(){if(pendingResolve){toast('Primero espera a que se compruebe tu respuesta.');return}
 openModal('¿Qué deseas hacer?',`<p>Vas por la <strong>pregunta ${game.round}</strong>. Ya has respondido correctamente <strong>${game.won}</strong> preguntas.</p><p>Puedes regresar al inicio sin perder tu progreso, o <strong>plantarte</strong> y quedarte con los ${displayPoints(game.won?PRIZES[game.won-1]:0)} puntos que has ganado hasta ahora.</p><p class="fine-print">Si respondes incorrectamente, conservarás únicamente tu último premio asegurado (${displayPoints(safePrize(game.won))} puntos).</p>`,[
 {label:'GUARDAR Y SALIR',fn:()=>{closeModal();saveGame();showHome()}},
 {label:'PLANTARME',style:'gold-action',fn:()=>{closeModal();finish('retire')}}]);}
function howTo(){openModal('Cómo se juega',`<h3>EL DESAFÍO</h3><p>Responde <strong>15 preguntas bíblicas</strong> de dificultad creciente. Cada acierto hace subir tu premio hasta <strong>1.000.000 de puntos</strong> (ficticios, sin dinero real).</p><p>Selecciona A, B, C o D y pulsa <strong>Confirmar respuesta</strong>. Después de confirmar, verás si acertaste y la referencia bíblica.</p><h3>PREMIOS SEGUROS</h3><p>Al superar la pregunta <strong>5</strong> aseguras 1.000 puntos; al superar la <strong>10</strong>, 32.000. Si fallas después, conservas el último escalón asegurado. Puedes plantarte cuando quieras para quedarte con todo lo ganado.</p><h3>TRES COMODINES</h3><ul><li><strong>50/50:</strong> elimina las opciones incorrectas hasta dejar la correcta y otra alternativa.</li><li><strong>Cambiar:</strong> sustituye la pregunta por otra del mismo nivel de dificultad.</li><li><strong>Doble:</strong> te permite una segunda respuesta si fallas la primera.</li></ul><p>Usa cada comodín <strong>una vez por partida</strong>. Los tres pueden combinarse en la misma ronda. Si cambias una pregunta después de activar 50/50 o Doble, sus efectos continúan en la nueva pregunta.</p><h3>EXTRAS</h3><p>El juego se guarda automáticamente. Hay banda sonora generativa, música por carpetas de tu dispositivo y listas por etapas alojadas en GitHub. Puedes jugar sin internet. El temporizador es opcional y viene desactivado.</p><p class="fine-print">Atajos: teclas A–D para responder, Intro para confirmar y Esc para cerrar ventanas.</p>`,[{label:'ENTENDIDO',style:'gold-action',fn:closeModal}])}
function records(){const list=fromStorage(RECORD_KEY,[]);const best=list.slice().sort((a,b)=>b.score-a.score||b.won-a.won).slice(0,8);
 const html=best.length?best.map((r,i)=>`<div class="score-row"><span><strong>${pad(i+1)} · ${clean(r.player)}</strong><small>${r.won}/15 preguntas · ${new Date(r.date).toLocaleDateString('es-EC')} · ${r.reason==='win'?'Victoria':r.reason==='retire'?'Plantó':'Concurso terminado'}</small></span><b>${displayPoints(r.score)}</b></div>`).join(''):'<p>Aún no tienes partidas terminadas. ¡El primer récord puede ser tuyo!</p>';
 openModal('Mis resultados',`<p>Los mejores resultados de este dispositivo, ordenados por premio obtenido.</p>${html}<p class="fine-print">Partidas terminadas: ${list.length}. Los registros se guardan solo en este navegador.</p>`,[{label:'CERRAR',fn:closeModal}])}
function settingsModal(){const st=music.getState();openModal('Sonido y opciones',`
 <h3>BANDA SONORA</h3>
 <div class="settings-row"><label for="musicSource">Origen musical</label><select id="musicSource"><option value="ambient" ${settings.musicSource==='ambient'?'selected':''}>Instrumental LOGOS</option><option value="local" ${settings.musicSource==='local'?'selected':''}>Mi música (celular/PC)</option><option value="github" ${settings.musicSource==='github'?'selected':''}>Música de GitHub</option></select></div>
 <p class="fine-print">La música cambia automáticamente entre inicio, preguntas 1–5, 6–10, 11–15 y victoria. La instrumental genera distintos ambientes sin archivos.</p>
 <div class="settings-row"><label for="volumeRange">Volumen <span id="volumeVal">${settings.musicVolume}%</span></label><input id="volumeRange" type="range" min="0" max="100" value="${settings.musicVolume}"></div>
 <p id="playingNow" class="current-track">♫ ${clean(st.nowPlaying||'Música pausada')}</p>
 <button id="nextSongBtn" class="file-button" type="button">⏭ OTRA CANCIÓN</button>
 <h3>MI CARPETA DEL DISPOSITIVO</h3>
 <p class="fine-print">Puedes importar una carpeta completa o varias canciones. Se guardarán en este navegador para escucharlas sin conexión. En algunos celulares la selección de carpetas no está disponible: utiliza «Elegir canciones».</p>
 <div class="settings-row"><label for="localPhase">Usar canciones en</label><select id="localPhase"><option value="auto">Según subcarpetas / toda la partida</option><option value="inicio">Solo pantalla inicial</option><option value="suave">Solo rondas 1–5</option><option value="media">Solo rondas 6–10</option><option value="intensa">Solo rondas 11–15</option><option value="victoria">Solo victoria</option></select></div>
 <div class="music-import-actions"><label class="file-button" for="folderSongs">IMPORTAR CARPETA</label><input id="folderSongs" type="file" accept="audio/*" webkitdirectory directory multiple hidden><label class="file-button" for="multipleSongs">ELEGIR CANCIONES</label><input id="multipleSongs" type="file" accept="audio/*,.mp3,.ogg,.wav,.m4a,.aac,.flac" multiple hidden></div>
 <p id="localMusicStatus" class="fine-print">${st.localCount} canciones locales guardadas</p>
 <button id="clearSongsBtn" class="subtle-action" type="button">BORRAR MI BIBLIOTECA LOCAL</button>
 <h3>MÚSICA DESDE GITHUB</h3>
 <p class="fine-print">Coloca tus canciones en las subcarpetas de <code>music/</code> y escribe los nombres en <code>music/catalog.json</code>. Logos elige la canción de cada etapa. Para jugar offline, descárgalas una vez.</p>
 <p id="githubMusicStatus" class="fine-print">${st.githubCount} canciones configuradas · ${st.offlineCount} descargadas offline</p>
 <button id="downloadMusicBtn" class="file-button" type="button">↓ DESCARGAR MÚSICA DE GITHUB PARA OFFLINE</button>
 <h3>EFECTOS Y CONCURSO</h3>
 <div class="settings-row"><label for="sfxToggle">Efectos de sonido</label><input id="sfxToggle" type="checkbox" ${settings.sfx?'checked':''}></div>
 <div class="settings-row"><label for="timerSelect">Tiempo por pregunta</label><select id="timerSelect"><option value="0" ${settings.timer===0?'selected':''}>Sin límite</option><option value="30" ${settings.timer===30?'selected':''}>30 segundos</option><option value="45" ${settings.timer===45?'selected':''}>45 segundos</option><option value="60" ${settings.timer===60?'selected':''}>60 segundos</option><option value="90" ${settings.timer===90?'selected':''}>90 segundos</option></select></div>
 <p class="fine-print">Los cambios de tiempo empiezan en la siguiente pregunta. Tus canciones no se envían a ningún servidor; la música subida a un repositorio público de GitHub sí es accesible públicamente.</p>
 `,[{label:'LISTO',style:'gold-action',fn:()=>{closeModal();renderGame()}}]);
 const refresh=()=>{const a=music.getState();if($('localMusicStatus'))$('localMusicStatus').textContent=`${a.localCount} canciones locales guardadas`;if($('githubMusicStatus'))$('githubMusicStatus').textContent=`${a.githubCount} canciones configuradas en GitHub · ${a.offlineCount} guardadas offline`;if($('playingNow'))$('playingNow').textContent='♫ '+(a.nowPlaying||'Música pausada')};
 $('musicSource').addEventListener('change',e=>{music.setSource(e.target.value);saveSettings();refresh()});
 $('volumeRange').addEventListener('input',e=>{settings.musicVolume=Number(e.target.value);$('volumeVal').textContent=settings.musicVolume+'%';saveSettings();music.setVolume()});
 $('sfxToggle').addEventListener('change',e=>{settings.sfx=e.target.checked;saveSettings();if(settings.sfx)sound('select')});
 $('timerSelect').addEventListener('change',e=>{settings.timer=Number(e.target.value);saveSettings()});
 $('nextSongBtn').addEventListener('click',()=>{music.skip();setTimeout(refresh,100)});
 const importHandler=async e=>{const files=Array.from(e.target.files||[]);if(!files.length)return;toast('Guardando canciones en el dispositivo…');try{const count=await music.importFiles(files,$('localPhase').value);music.setSource('local');$('musicSource').value='local';saveSettings();refresh();toast(`${count} canciones añadidas. Puedes usarlas sin internet.`)}catch(err){toast('No se pudieron guardar canciones: '+err.message)}e.target.value=''};
 $('folderSongs').addEventListener('change',importHandler);$('multipleSongs').addEventListener('change',importHandler);
 $('clearSongsBtn').addEventListener('click',async()=>{if(!window.confirm('¿Borrar las canciones locales guardadas en LOGOS?'))return;try{await music.clearLocal();refresh();toast('Biblioteca local vaciada.')}catch{toast('No se pudo borrar la biblioteca.')}});
 $('downloadMusicBtn').addEventListener('click',async()=>{const b=$('downloadMusicBtn');b.disabled=true;b.textContent='PREPARANDO…';try{await music.reloadCatalog();const r=await music.downloadAll(p=>{b.textContent=`GUARDANDO ${p.ok+p.failed}/${p.total}…`});refresh();toast(r.failed?`${r.ok} pistas descargadas, ${r.failed} fallidas. Revisa los nombres.`:`¡${r.ok} canciones disponibles offline!`)}catch(err){toast(err.message)}finally{b.disabled=false;b.textContent='↓ DESCARGAR MÚSICA DE GITHUB PARA OFFLINE'}});
 void music.reloadCatalog().then(refresh);
}
function toggleMusic(){music.toggle();updateMusicButton()}
function updateMusicButton(){const s=music.getState();$('musicBtn').classList.toggle('active',s.playing);$('musicBtn').setAttribute('aria-pressed',String(s.playing));$('musicBtn').title=s.playing?'Pausar: '+s.nowPlaying:'Reproducir música';$('musicBtn').setAttribute('aria-label',s.playing?'Pausar música':'Reproducir música');if($('musicInfo'))$('musicInfo').textContent=s.playing?s.nowPlaying:'MÚSICA APAGADA';if($('nextTrackBtn'))$('nextTrackBtn').hidden=!s.playing;if($('playingNow'))$('playingNow').textContent='♫ '+(s.nowPlaying||'Música pausada')}
function playTone(frequency,at,length,type='sine',volume=.1){const ctx=audioApi.ctx;if(!ctx)return;const osc=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime+at;osc.type=type;osc.frequency.setValueAtTime(frequency,start);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume),start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+length);osc.connect(gain).connect(ctx.destination);osc.start(start);osc.stop(start+length+.02);osc.onended=()=>{osc.disconnect();gain.disconnect()}}
function sound(kind){if(!settings.sfx)return;const p=(f,t,d,vol=.045)=>playTone(f,t,d,'sine',vol);switch(kind){case'select':p(690,0,.08,.025);break;case'lock':p(430,0,.20,.044);p(540,.22,.23,.044);break;case'correct':p(520,0,.19);p(659,.15,.22);p(784,.30,.38);break;case'wrong':p(355,0,.31);p(240,.2,.53);break;case'second':p(340,0,.18);p(450,.19,.24);break;case'lifeline':p(780,0,.1);p(1030,.11,.16);break;case'next':p(550,0,.09,.027);break;case'start':p(392,0,.2);p(494,.22,.21);p(587,.45,.26);break;case'victory':[523,659,784,1046].forEach((f,i)=>p(f,i*.15,.58,.055));break;}}
function bind(){
 $('brandBtn').addEventListener('click',()=>{if(view==='game'&&!pendingResolve){saveGame();showHome()}else if(view!=='game')showHome()});
 $('startBtn').addEventListener('click',()=>{if(game){openModal('¿Empezar otra partida?',`<p>Hay una partida guardada de <strong>${clean(game.player)}</strong>. Si comienzas una nueva, se perderá el progreso de esa partida.</p>`,[{label:'CANCELAR',fn:closeModal},{label:'NUEVA PARTIDA',style:'gold-action',fn:()=>{closeModal();makeNewGame()}}])}else makeNewGame()});
 $('resumeBtn').addEventListener('click',showGame);$('howBtn').addEventListener('click',howTo);$('recordsBtn').addEventListener('click',records);$('musicBtn').addEventListener('click',toggleMusic);$('nextTrackBtn').addEventListener('click',()=>music.skip());$('settingsBtn').addEventListener('click',settingsModal);$('leaveBtn').addEventListener('click',leaveMenu);
 $('ladderToggle').addEventListener('click',()=>{const el=$('mobileLadder');el.hidden=!el.hidden;$('ladderToggle').setAttribute('aria-expanded',String(!el.hidden))});
 $('confirmBtn').addEventListener('click',confirm);$('fiftyBtn').addEventListener('click',fifty);$('swapBtn').addEventListener('click',swap);$('doubleBtn').addEventListener('click',double);
 $('playAgainBtn').addEventListener('click',()=>{showHome();makeNewGame()});$('resultHomeBtn').addEventListener('click',showHome);
 $('modalClose').addEventListener('click',closeModal);$('modalBackdrop').addEventListener('click',e=>{if(e.target===$('modalBackdrop'))closeModal()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modalOpen){closeModal();return}if(modalOpen||view!=='game'||!game||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)||e.altKey||e.ctrlKey||e.metaKey)return;
 const letter=e.key.toUpperCase();if('ABCD'.includes(letter)&&letter.length===1){selectAnswer(letter.charCodeAt(0)-65);return}if(e.key==='Enter'){e.preventDefault();confirm()}if(letter==='L')$('ladderToggle').click();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTimer();else if(view==='game')startTimer()});
 window.addEventListener('pagehide',()=>{saveGame();stopTimer()});
 if('serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
  navigator.serviceWorker.register('./sw.js').catch(()=>{});
 }
 const badge=$('offlineBadge');if(location.protocol==='file:'){badge.classList.add('not-installed');$('connectionText').textContent='MODO LOCAL · OFFLINE'}
}
function init(){if(!QUESTIONS.length||QUESTIONS.length!==660){$('homeHeading').textContent='Error al cargar preguntas';$('startBtn').disabled=true;return}bind();void music.init();updateMusicButton();showHome();}
init();
})();
