import {createAlbum} from './album.js';
import {defaults,duration,spreadCount,turnStart,turnDuration,closeStart,closeDuration,position,validateTiming} from './config.js';
const $=id=>document.getElementById(id),film=new URLSearchParams(location.search).has('render')||document.documentElement.dataset.export==='true';
if(film)document.body.classList.add('film');
let config=structuredClone(defaults),album,time=0,playing=!film,last=0,busy=false,manual=null;
const audio=new Audio();audio.loop=true;audio.volume=.45;
const status=s=>$('status').textContent=s;
function isPhotoSource(p){if(/^(data:image\/|\/?assets\/)/.test(p))return true;try{const u=new URL(p,location.href);return u.origin===location.origin&&u.pathname.includes('/assets/');}catch{return false;}}
function validate(c){validateTiming(c);if(c.version!==2||!Array.isArray(c.photos)||!c.photos.length||c.photos.some(p=>typeof p!=='string'||!isPhotoSource(p)))throw Error('至少需要一张照片，请添加到 assets/photos 后刷新');for(const key of ['names','title','story','date'])if(typeof c[key]!=='string'||c[key].length>300)throw Error('项目文案无效');if(!Number.isFinite(c.hold)||c.hold<1||c.hold>20)throw Error('停留时间需在 1–20 秒之间');if(c.music&&! /^(data:audio\/|assets\/)/.test(c.music))throw Error('音乐格式无效');return c;}
async function load(c){if(busy)return;busy=true;try{validate(c);const next=await createAlbum($('stage'),c);album?.dispose();album=next;config=structuredClone(c);time=0;audio.pause();audio.src=c.music||'';$('loading')?.remove();$('seek').max=duration(c);$('date-label').textContent=c.date;sync();}finally{busy=false,manual=null;}}
function sync(){if(!album)return;album.seek(time);$('seek').value=time;$('play').textContent=playing?'Ⅱ 暂停':'▶ 继续';const p=position(config,time);if($('counter').textContent!==p.label){$('counter').textContent=p.label;$('film-counter').textContent=p.label;}$('film-progress').value=time/duration(config);$('prev').disabled=time<=0;$('next').disabled=p.phase==='closed'; }
function stop(){manual=null;playing=false;audio.pause();sync();}
function turn(dir){stop();const operations=Array.from({length:spreadCount(config)},(_,i)=>({start:turnStart(config,i),length:turnDuration(config)}));operations.push({start:closeStart(config),length:closeDuration(config)});const op=dir>0?operations.find(o=>time<o.start+o.length-.001):operations.findLast(o=>time>o.start+.001);if(!op)return;const from=dir>0?Math.max(time,op.start):Math.min(time,op.start+op.length),to=dir>0?op.start+op.length:op.start;manual={from,to,start:performance.now(),duration:Math.max(.01,Math.abs(to-from))*1000};sync();}
$('prev').onclick=()=>turn(-1);$('next').onclick=()=>turn(1);
$('play').onclick=()=>{if(position(config,time).phase==='closed')time=0;playing=!playing;if(!playing)audio.pause();sync();};
$('seek').oninput=e=>{stop();time=Number(e.target.value);sync();};
$('music').onclick=async()=>{if(!config.music){status('请在定制相册中选择本地音乐文件。');return;}try{if(audio.paused){await audio.play();$('music').textContent='♫ 静音';}else{audio.pause();$('music').textContent='♫ 音乐';}}catch(e){status('音乐无法播放：'+e.message);}};
document.onkeydown=e=>{if(/INPUT|TEXTAREA/.test(e.target.tagName)||$('editor').open)return;if(e.key==='ArrowRight')turn(1);if(e.key==='ArrowLeft')turn(-1);if(e.code==='Space'){e.preventDefault();$('play').click();}};
let down; $('stage').onpointerdown=e=>down=e.clientX;$('stage').onpointerup=e=>{if(down!=null&&Math.abs(e.clientX-down)>35)turn(e.clientX<down?1:-1);down=null;};
const fields=['names','date','title','story','hold'];
let draftPhotos=[];
function thumbnails(){ $('thumbs').replaceChildren(...draftPhotos.map((src,i)=>{const card=document.createElement('div'),im=new Image(),button=document.createElement('button');im.src=src;button.textContent='删除 '+(i+1);button.type='button';button.onclick=()=>{draftPhotos.splice(i,1);thumbnails();};card.append(im,button);return card;}));}
function editor(){stop();fields.forEach(k=>$(k).value=config[k]);draftPhotos=[...config.photos];thumbnails();$('editor').showModal();}
$('edit').onclick=editor;
const read=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
let uploading=Promise.resolve();
$('photos').onchange=e=>{const files=[...e.target.files];uploading=uploading.catch(()=>{}).then(async()=>{for(const file of files){const im=await createImageBitmap(file);im.close();draftPhotos.push(await read(file));}thumbnails();e.target.value='';});uploading.catch(err=>alert('照片读取失败：'+err.message));};
async function collect(){await uploading;const c=structuredClone(config);c.photos=[...draftPhotos];fields.forEach(k=>c[k]=k==='hold'?Number($(k).value):$(k).value);if($('audio-file').files[0])c.music=await read($('audio-file').files[0]);return validate(c);}
$('apply').onclick=async()=>{try{await load(await collect());$('photos').value='';$('audio-file').value='';$('editor').close();status('已应用修改。请保存项目以供下次使用和命令行导出。');}catch(e){status(e.message);alert(e.message);}};
function download(data,name,type){const u=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);}
$('save').onclick=async()=>{try{download(JSON.stringify(await collect()),'wedding-project.json','application/json');}catch(e){alert(e.message);}};
$('import').onclick=()=>$('project-file').click();$('project-file').onchange=async e=>{try{await load(JSON.parse(await e.target.files[0].text()));$('editor').close();}catch(err){alert(err.message);}};
$('reset').onclick=async()=>{await load(defaults);$('editor').close();};
window.albumAPI={load,seek(t){time=Math.max(0,Math.min(duration(config),t));stop();},get config(){return config;},get duration(){return duration(config);},get position(){return position(config,time);},get quality(){return album?.quality;}};
window.addEventListener('hf-seek',e=>{const work=window.ready.then(()=>window.albumAPI.seek(e.detail.time));e.detail.waitUntil?.(work);});
window.ready=load(defaults).then(()=>{last=0;});
if(document.documentElement.dataset.export==='true'){
 window.__hf=window.__hf||{};window.__hf.buildReady=window.__hf.buildReady||{};
 window.__hf.buildReady.album=window.ready;
 window.ready.then(()=>window.__albumBuildResolve?.(),e=>window.__albumBuildReject?.(e));
}
function frame(now){if(manual){const p=Math.min(1,(now-manual.start)/manual.duration);time=manual.from+(manual.to-manual.from)*p;if(p===1)manual=null;sync();}if(playing&&album){time=Math.min(duration(config),time+(last?(now-last)/1000:0));if(time>=duration(config)){playing=false;audio.pause();}sync();}last=now;requestAnimationFrame(frame);}if(!film)requestAnimationFrame(frame);
window.ready.catch(e=>{$('loading').textContent='加载失败：'+e.message;});
let controlsTimer;document.addEventListener('pointermove',()=>{document.body.classList.add('controls-visible');clearTimeout(controlsTimer);controlsTimer=setTimeout(()=>document.body.classList.remove('controls-visible'),2000);});
