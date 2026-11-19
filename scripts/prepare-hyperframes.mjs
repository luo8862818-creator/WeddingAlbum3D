import {createServer,build} from 'vite';
import {cp,readFile,writeFile,mkdir,unlink} from 'node:fs/promises';
import {existsSync} from 'node:fs';
const out='hyperframes-export',source='hf-source.html';
const server=await createServer({server:{hmr:false},appType:'custom'});let config,seconds;
try{const module=await server.ssrLoadModule('/js/config.js');config=module.defaults;seconds=module.duration(config);}finally{await server.close();}
if(!config.photos.length)throw Error('assets/photos 至少需要一张照片');
await mkdir(out+'/vendor',{recursive:true});await mkdir(out+'/assets/fonts',{recursive:true});
for(const f of ['three.module.js','three.core.js'])await cp('node_modules/three/build/'+f,out+'/vendor/'+f);
await cp('node_modules/gsap/dist/gsap.min.js',out+'/vendor/gsap.min.js');
let fonts='';
for(const [family,file] of [['AlbumText','msyh.ttc'],['AlbumSerif','simsun.ttc']]){
 const local='C:/Windows/Fonts/'+file;
 if(existsSync(local)){await cp(local,out+'/assets/fonts/'+file);fonts+='@font-face{font-family:'+family+';src:url(assets/fonts/'+file+')}';}
}
const audio=config.music?'<audio id="album-music" class="clip" data-start="0" data-duration="'+seconds+'" data-volume="0.45" src="'+config.music.replaceAll('&','&amp;').replaceAll('"','&quot;')+'" loop></audio>':'';
const html='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>Wedding Album 2K</title><link rel="icon" href="data:,"><style>'+fonts+'html,body{margin:0;width:2560px;height:1440px;overflow:hidden;background:#222b23}#root{position:relative;width:2560px;height:1440px;overflow:hidden}#stage{position:absolute;inset:0}canvas{display:block;width:100%;height:100%}#film-hud{position:absolute;left:920px;bottom:24px;width:720px;display:flex;align-items:center;gap:20px;padding:14px 24px;box-sizing:border-box;background:#18251ef5;border-radius:6px;color:#f3e7c9;font:18px AlbumText,Arial,sans-serif}#film-progress{height:5px;flex:1;accent-color:#c5ac74}#film-progress::-webkit-progress-bar{background:#ffffff44}#film-progress::-webkit-progress-value{background:#d5bc84}</style><script type="importmap">{"imports":{"three":"./vendor/three.module.js"}}</script><script src="vendor/gsap.min.js"></script><script>window.__hf=window.__hf||{};window.__hf.buildReady=window.__hf.buildReady||{};window.__hf.buildReady.album=new Promise((resolve,reject)=>{window.__albumBuildResolve=resolve;window.__albumBuildReject=reject;});</script></head><body><div id="root" data-composition-id="wedding-album" data-width="2560" data-height="1440" data-fps="30" data-duration="'+seconds+'"><div id="stage" class="clip" data-start="0" data-duration="'+seconds+'" data-track-index="0" data-track-kind="graphics" data-hold></div><div id="film-hud" class="clip" data-start="0" data-duration="'+seconds+'" data-track-index="1" data-track-kind="graphics"><span id="film-counter"></span><progress id="film-progress" max="1" value="0"></progress></div>'+audio+'</div><script type="module" src="/js/hyperframes.js"></script></body></html>';
await writeFile(source,html);
try{
 await build({configFile:false,base:'./',build:{outDir:out,emptyOutDir:false,rollupOptions:{input:source,external:['three']}}});
 await writeFile(out+'/index.html',await readFile(out+'/'+source,'utf8'));
 await unlink(out+'/'+source);
 await cp('assets',out+'/assets',{recursive:true});
}finally{await unlink(source).catch(()=>{});}
console.log('Prepared '+out+'/index.html / 2560×1440 / '+seconds+'s / '+config.photos.length+' photos');
console.log('npx hyperframes render hyperframes-export --output renders/final.mp4 --fps 30 --quality delivery --workers 1');