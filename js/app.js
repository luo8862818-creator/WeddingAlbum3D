import {createAlbum} from './album.js';
import {defaults,duration,TURN} from './config.js';
const $=id=>document.getElementById(id),film=new URLSearchParams(location.search).has('render');
if(film)document.body.classList.add('film');
let config=structuredClone(defaults),album,time=0,playing=!film,last=0,busy=false,manual=null;
const audio=new Audio();audio.loop=true;audio.volume=.45;
const status=s=>$('status').textContent=s;
function validate(c){if(c.version!==2||!Array.isArray(c.photos)||c.photos.length!==3||c.photos.some(p=>typeof p!=='string'||! /^(data:image\/|assets\/)/.test(p)))throw Error('项目需要三个有效的本地照片或内嵌图片');for(const key of ['names','title','story','date'])if(typeof c[key]!=='string'||c[key].length>300)throw Error('项目文案无效');if(!Number.isFinite(c.hold)||c.hold<1||c.hold>20)throw Error('停留时间需在 1–20 秒之间');if(c.music&&! /^(data:audio\/|assets\/)/.test(c.music))throw Error('音乐格式无效');return c;}
async function load(c){if(busy)return;busy=true;try{validate(c);const next=await createAlbum($('stage'),c);album?.dispose();album=next;config=structuredClone(c);time=0;audio.pause();audio.src=c.music||'';$('loading')?.remove();$('seek').max=duration(c);$('date-label').textContent=c.date;sync();}finally{busy=false,manual=null;}}
function sync(){if(!album)return;album.seek(time);$('seek').value=time;$('play').textContent=playing?'Ⅱ 暂停':'▶ 继续';$('counter').textContent=time<config.hold?'封面':String(Math.min(4,Math.floor(time/(config.hold+TURN))+1)).padStart(2,'0')+' / 04';$('prev').disabled=time<=0;$('next').disabled=time>=duration(config); }
function stop(){manual=null;playing=false;audio.pause();sync();}
function turn(dir){stop();const step=config.hold+TURN;let from,to;if(dir>0){const i=Math.min(3,Math.floor(time/step));from=Math.max(time,i*step+config.hold);to=(i+1)*step;}else{const i=Math.max(0,Math.ceil(time/step)-1);from=Math.min(time,(i+1)*step);to=i*step+config.hold;}manual={from,to,start:performance.now()};sync();}
$('prev').onclick=()=>turn(-1);$('next').onclick=()=>turn(1);
$('play').onclick=()=>{if(time>=duration(config))time=0;playing=!playing;if(!playing)audio.pause();sync();};
$('seek').oninput=e=>{stop();time=Number(e.target.value);sync();};
$('music').onclick=async()=>{if(!config.music){status('请在定制相册中选择本地音乐文件。');return;}try{if(audio.paused){await audio.play();$('music').textContent='♫ 静音';}else{audio.pause();$('music').textContent='♫ 音乐';}}catch(e){status('音乐无法播放：'+e.message);}};
document.onkeydown=e=>{if(/INPUT|TEXTAREA/.test(e.target.tagName)||$('editor').open)return;if(e.key==='ArrowRight')turn(1);if(e.key==='ArrowLeft')turn(-1);if(e.code==='Space'){e.preventDefault();$('play').click();}};
let down; $('stage').onpointerdown=e=>down=e.clientX;$('stage').onpointerup=e=>{if(down!=null&&Math.abs(e.clientX-down)>35)turn(e.clientX<down?1:-1);down=null;};
const fields=['names','date','title','story','hold'];
function editor(){stop();fields.forEach(k=>$(k).value=config[k]);$('thumbs').replaceChildren(...config.photos.map(src=>{const im=new Image();im.src=src;return im;}));$('editor').showModal();}
$('edit').onclick=editor;
const read=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
async function collect(){const c=structuredClone(config);fields.forEach(k=>c[k]=k==='hold'?Number($(k).value):$(k).value);const fs=[...$('photos').files];if(fs.length>3)throw Error('最多选择三张照片');for(let i=0;i<fs.length;i++){const im=await createImageBitmap(fs[i]);const cv=document.createElement('canvas'),r=Math.min(1,3200/Math.max(im.width,im.height));cv.width=im.width*r;cv.height=im.height*r;cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);c.photos[i]=cv.toDataURL('image/jpeg',.92);im.close();}if($('audio-file').files[0])c.music=await read($('audio-file').files[0]);return validate(c);}
$('apply').onclick=async()=>{try{await load(await collect());$('photos').value='';$('audio-file').value='';$('editor').close();status('已应用修改。请保存项目以供下次使用和命令行导出。');}catch(e){status(e.message);alert(e.message);}};
function download(data,name,type){const u=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);}
$('save').onclick=async()=>{try{download(JSON.stringify(await collect()),'wedding-project.json','application/json');}catch(e){alert(e.message);}};
$('import').onclick=()=>$('project-file').click();$('project-file').onchange=async e=>{try{await load(JSON.parse(await e.target.files[0].text()));$('editor').close();}catch(err){alert(err.message);}};
$('reset').onclick=async()=>{await load(defaults);$('editor').close();};
$('export').onclick=async()=>{stop();$('export').disabled=true;try{status('正在逐帧渲染影片…可以继续浏览；请保持本地服务运行。');const r=await fetch('/api/render',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(config)});const j=await r.json();if(!r.ok)throw Error(j.error);status('影片已完成，正在下载。');const a=document.createElement('a');a.href=j.url;a.download='wedding-album.mp4';a.click();}catch(e){status('导出失败：'+e.message+'。可保存项目并运行 npm run render -- --project wedding-project.json');}finally{$('export').disabled=false;}};
window.albumAPI={load,seek(t){time=Math.max(0,Math.min(duration(config),t));stop();},get config(){return config;},get duration(){return duration(config);}};
window.addEventListener('hf-seek',e=>window.albumAPI.seek(e.detail.time));
window.ready=load(defaults);
function frame(now){if(manual){const p=Math.min(1,(now-manual.start)/1800);time=manual.from+(manual.to-manual.from)*p;if(p===1)manual=null;sync();}if(playing&&album){time=Math.min(duration(config),time+(last?(now-last)/1000:0));if(time>=duration(config)){playing=false;audio.pause();}sync();}last=now;requestAnimationFrame(frame);}if(!film)requestAnimationFrame(frame);
window.ready.catch(e=>{$('loading').textContent='加载失败：'+e.message;});
let controlsTimer;document.addEventListener('pointermove',()=>{document.body.classList.add('controls-visible');clearTimeout(controlsTimer);controlsTimer=setTimeout(()=>document.body.classList.remove('controls-visible'),2000);});
