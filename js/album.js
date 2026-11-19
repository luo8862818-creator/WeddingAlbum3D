import * as T from 'three';
import {INTRO,sheetCount,spreadCount,turnStart,turnDuration,closeStart,closeDuration,smooth} from './config.js';
const W=2.5,H=2.8;
export async function createAlbum(host, config) {
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;
 host.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(33,1,.1,100);
 camera.position.set(0,5.3,6.4);camera.lookAt(0,0,0);
 scene.add(new T.HemisphereLight(0xfff8e7,0x536054,1.4));
 const light=new T.DirectionalLight(0xfff4df,2);light.position.set(-3,8,4);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-7,right:7,top:7,bottom:-7});light.shadow.bias=-.0003;light.shadow.normalBias=.025;scene.add(light);
 const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.25}));floor.rotation.x=-Math.PI/2;floor.position.y=-.18;floor.receiveShadow=true;scene.add(floor);
 const book=new T.Group();book.rotation.y=0;scene.add(book);
 const box=(w,h,d,color,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.9}));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;book.add(m);return m;};
 const leftBase=box(2.575,.1,2.94,0x63705c,-1.2875,-.09,0);box(2.575,.1,2.94,0x63705c,1.2875,-.09,0);const leftStack=[leftBase];
 box(.12,.19,2.96,0x3e503f,0,-.035,0);
 for(let i=0;i<14;i++) {leftStack.push(box(2.48,.004,2.78,i%2?0xe7deca:0xc7bea9,-1.25,-.025+i*.004,0));box(2.48,.004,2.78,i%2?0xe7deca:0xc7bea9,1.25,-.025+i*.004,0);}
 const images=await Promise.all(config.photos.map(src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('照片无法加载：'+src.slice(0,100)));im.src=src;})));
 function texture(index) {
  const c=document.createElement('canvas');
  const target=host.clientWidth<700?2048:3072;
  c.width=Math.min(target,Math.floor(renderer.capabilities.maxTextureSize/1.12));c.height=Math.round(c.width*1.12);
  const g=c.getContext('2d');g.scale(c.width/1000,c.height/1320);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.fillStyle=index===0?'#52624f':'#f2eddf';g.fillRect(0,0,1000,1320);
  // Deterministic subtle cotton / linen grain.
  for(let i=0;i<18000;i++){const x=(i*73)%1000,y=(i*137)%1320;g.fillStyle=i%2?'#ffffff09':'#171e1408';g.fillRect(x,y,1+(i%3),1);}
  const text=(s,x,y,size,color='#746b55',font='Georgia')=>{g.fillStyle=color;g.font=size+'px '+font;g.textAlign='center';g.fillText(s,x,y,880);};
  const photo=(im,x,y,w,h)=>{const r=Math.max(w/im.width,h*(2.8/3.3)/im.height),sw=w/r,sh=h*(2.8/3.3)/r;g.drawImage(im,(im.width-sw)/2,(im.height-sh)/2,sw,sh,x,y,w,h);};
  if(index===0){g.strokeStyle='#bda77a';g.lineWidth=2;g.strokeRect(38,38,924,1244);text('THE WEDDING COLLECTION',500,125,20,'#d4c39d');photo(images[0],170,200,660,690);text(config.title,500,1010,65,'#ecdfbf');text(config.names,500,1110,35,'#ecdfbf','serif');text(config.date,500,1190,22,'#c8b78f');}
  else if(index===1||index>config.photos.length+1){text(index===1?'THE BEGINNING':'FOREVER, WITH YOU',500,220,23);text(index===1?'Our story.':'To be continued.',500,480,67);config.story.split('\n').flatMap(s=>s.match(/.{1,22}/gu)||['']).slice(0,6).forEach((s,i)=>text(s,500,640+i*52,28,'#746b55','serif'));text(config.names,500,1080,32,'#746b55','serif');}
  else {const idx=index-2;const inset=index%3===0;photo(images[idx],inset?110:45,inset?200:55,inset?780:910,inset?870:1130);text(['','', 'THE DAY WE BECAME US','A MOMENT, A LIFETIME','IN YOUR LIGHT','ALL THE LITTLE THINGS','SIDE BY SIDE'][index]||'OUR FOREVER',500,1230,18);}
  if(index>0)text(String(Math.max(0,index-1)).padStart(2,'0'),870,1280,16);
  const shade=g.createLinearGradient(0,0,1000,0);shade.addColorStop(0,'#40341d25');shade.addColorStop(.05,'#40341d00');shade.addColorStop(.95,'#40341d00');shade.addColorStop(1,'#40341d12');g.fillStyle=shade;g.fillRect(0,0,1000,1320);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
 }
 const textures=new Map(),sheets=[],count=sheetCount(config);const stats={textureBuilds:0,geometryUpdates:0,renders:0};
 const fallback=new T.CanvasTexture(Object.assign(document.createElement('canvas'),{width:1,height:1}));fallback.colorSpace=T.SRGBColorSpace;
 // Photographs are already graded sRGB artwork. Keep their pixel values out
 // of the scene's warm lighting and ACES curve; retain real, subtle shadows.
 function pageMaterial(face,side){
  const material=new T.MeshStandardMaterial({map:fallback,roughness:.87,side});
  const inset=face%3===0;
  const rect=face===0?[.17,1-890/1320,.83,1-200/1320]:face===1||face>config.photos.length+1?[0,0,0,0]:inset?[.11,1-1070/1320,.89,1-200/1320]:[.045,1-1185/1320,.955,1-55/1320];
  material.onBeforeCompile=shader=>{
   shader.uniforms.photoBounds={value:new T.Vector4(...rect)};
   shader.fragmentShader='uniform vec4 photoBounds;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <shadowmap_pars_fragment>','#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>');
   shader.fragmentShader=shader.fragmentShader.replace('#include <tonemapping_fragment>',`#include <tonemapping_fragment>
    #ifdef USE_MAP
     float photoArea=step(photoBounds.x,vMapUv.x)*step(vMapUv.x,photoBounds.z)*step(photoBounds.y,vMapUv.y)*step(vMapUv.y,photoBounds.w);
     gl_FragColor.rgb=mix(gl_FragColor.rgb,diffuseColor.rgb*(0.9+0.1*getShadowMask()),photoArea);
    #endif`);
  };
  material.customProgramCacheKey=()=> 'original-photo-srgb-v1';
  return material;
 }
 for(let i=0;i<count;i++){
  const geo=new T.PlaneGeometry(W,H,48,8);geo.translate(W/2,0,0);
  const front=pageMaterial(i*2,T.FrontSide);
  const back=pageMaterial(i*2+1,T.BackSide);
  // Back UVs must read normally after the sheet has turned.
  const bg=geo.clone();const uv=bg.attributes.uv;for(let n=0;n<uv.count;n++)uv.setX(n,1-uv.getX(n));
  const a=new T.Mesh(geo,front),b=new T.Mesh(bg,back);a.castShadow=a.receiveShadow=b.castShadow=b.receiveShadow=true;book.add(a,b);sheets.push({a,b,progress:-1,closing:-1,columns:new Float32Array(49*4)});
 }
 const sizes=()=>{const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;const tangent=Math.tan(T.MathUtils.degToRad(33/2));const distance=Math.max(2.94/(2*tangent),5.15/(2*tangent*camera.aspect))*1.035;camera.position.set(0,distance*.992,distance*.126);camera.lookAt(0,0,0);camera.updateProjectionMatrix();renderer.render(scene,camera);};
 let previous=-1,lastVisual='',currentTime=0;
 const rest=leftStack.map(m=>m.position.clone());
 const observer=new ResizeObserver(sizes);observer.observe(host);sizes();
 function seek(time){if(time===previous)return;previous=time;currentTime=time;
  const open=smooth(T.MathUtils.clamp((time-INTRO)/turnDuration(config),0,1));
  const close=smooth(T.MathUtils.clamp((time-closeStart(config))/closeDuration(config),0,1));
  let active=0;for(let i=0;i<spreadCount(config);i++)if(time>=turnStart(config,i)-(i?config.hold:0))active=i;
  const readyToClose=time>=closeStart(config)-config.hold;
  const progress=sheets.map((_,i)=>i===count-1?0:smooth(T.MathUtils.clamp((time-turnStart(config,i))/turnDuration(config),0,1)));
  const key=[open,close,active,readyToClose,...progress].join(':');
  if(key===lastVisual)return;lastVisual=key;
  book.position.x=-W/2*(1-open+close);
  const ca=Math.cos(-close*Math.PI),sa=Math.sin(-close*Math.PI),pivot=.14;
  leftStack.forEach((m,i)=>{m.visible=open>.98&&close===0;m.position.set(ca*rest[i].x-sa*(rest[i].y-pivot),sa*rest[i].x+ca*(rest[i].y-pivot)+pivot,rest[i].z);m.rotation.z=-close*Math.PI;});
  const visible=new Set([Math.max(0,active-1),active,Math.min(count-1,active+1)]);
  if(readyToClose)visible.add(0);
  sheets.forEach((sheet,i)=>{const {a,b,columns}=sheet;
   a.visible=b.visible=visible.has(i);
   if(!a.visible)return;
   for(const [face,mesh] of [[i*2,a],[i*2+1,b]]){
    if(!textures.has(face)){const t=texture(face);textures.set(face,t);renderer.initTexture(t);stats.textureBuilds++;}
    mesh.material.map=textures.get(face);
   }
   const p=progress[i],closing=p===1?close:0,angle=p*Math.PI;
   if(sheet.progress===p&&sheet.closing===closing)return;
   sheet.progress=p;sheet.closing=closing;stats.geometryUpdates++;
   // Evaluate each strip column once; analytic tangents replace a full
   // indexed-mesh normal recomputation for every frame and every face.
   for(let col=0;col<49;col++){
    const u=col/48,x=u*W,k=i===0?0:Math.sin(Math.PI*p)*.24;
    const local=angle+k*u,bend=i===0?0:Math.sin(Math.PI*p)*.48*Math.sin(u*Math.PI);
    let px=Math.cos(local)*x,py=.08+((1-p)*(count-i)+p*i)*Math.min(.009,.045/count)+Math.sin(local)*x+bend;
    const dx=W*Math.cos(local)-x*Math.sin(local)*k;
    const dy=W*Math.sin(local)+x*Math.cos(local)*k+(i===0?0:Math.sin(Math.PI*p)*.48*Math.PI*Math.cos(u*Math.PI));
    const length=Math.hypot(dx,dy);let nx=-dy/length,ny=dx/length;
    if(closing>0){const c=Math.cos(-closing*Math.PI),s=Math.sin(-closing*Math.PI),oldX=px,oldNx=nx;px=c*px-s*(py-pivot);py=s*oldX+c*(py-pivot)+pivot;nx=c*nx-s*ny;ny=s*oldNx+c*ny;}
    columns.set([px,py,nx,ny],col*4);
   }
   for(const mesh of [a,b]){
    const pos=mesh.geometry.attributes.position,normal=mesh.geometry.attributes.normal;
    for(let n=0;n<pos.count;n++){const col=n%49,at=col*4,v=Math.floor(n/49)/8;const offset=mesh===b?-.001:.001;pos.setXYZ(n,columns[at],columns[at+1]+offset,(v-.5)*H);normal.setXYZ(n,columns[at+2],columns[at+3],0);}
    pos.needsUpdate=normal.needsUpdate=true;
   }
  });
  for(const [face,t] of textures)if(!visible.has(Math.floor(face/2))){
   const mesh=face%2?sheets[Math.floor(face/2)].b:sheets[Math.floor(face/2)].a;mesh.material.map=fallback;t.dispose();textures.delete(face);
  }
  renderer.render(scene,camera);stats.renders++;
 }
 seek(0);
 // Both side programs and the first photographs are ready before autoplay.
 await renderer.compileAsync(scene,camera);
 return {seek,renderer,get quality(){return {stats:{...stats},state:{time:currentTime,closing:smooth(T.MathUtils.clamp((currentTime-closeStart(config))/closeDuration(config),0,1))},canvas:{width:renderer.domElement.width,height:renderer.domElement.height},textures:[...textures.values()].map(t=>({width:t.image.width,height:t.image.height})),sources:images.map(im=>({width:im.naturalWidth,height:im.naturalHeight}))};},dispose(){observer.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of [].concat(o.material))m.dispose();}});textures.forEach(t=>t.dispose());fallback.dispose();renderer.dispose();renderer.domElement.remove();}};
}
