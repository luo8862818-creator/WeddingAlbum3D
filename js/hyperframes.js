import {createAlbum} from './album.js';
import {defaults,duration,position} from './config.js';
window.__timelines=window.__timelines||{};
async function boot(){
 await document.fonts.ready;
 const album=await createAlbum(document.getElementById('stage'),defaults);
 function seek(time){album.seek(time);document.getElementById('film-counter').textContent=position(defaults,time).label;document.getElementById('film-progress').value=time/duration(defaults);}
 const state={time:0};const timeline=window.gsap.timeline({paused:true});
 timeline.to(state,{time:duration(defaults),duration:duration(defaults),ease:'none',onUpdate:()=>seek(state.time)},0);
 window.__timelines['wedding-album']=timeline;
 seek(0);window.albumExport={seek,config:defaults,duration:duration(defaults),get quality(){return album.quality;}};
 window.addEventListener('hf-seek',e=>seek(e.detail.time));
}
window.ready=boot();
window.ready.then(()=>window.__albumBuildResolve(),e=>window.__albumBuildReject(e));