import {createServer} from 'vite';
import {browser} from './render.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const s=await createServer({server:{port:0,strictPort:false,hmr:false}});await s.listen();const b=await browser();
try{const p=await b.newPage({viewport:{width:2560,height:1440}});const errors=[];p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(m.text());});p.on('pageerror',e=>errors.push(e.message));await p.goto(s.resolvedUrls.local[0]+'?render=1');await p.evaluate(()=>window.ready);
 const base=await p.evaluate(()=>window.albumAPI.config);
 const colors=[[64,96,128],[200,120,80],[240,240,240]];
 const results=[];
 for(const rgb of colors){const actual=await p.evaluate(async({base,rgb})=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='rgb('+rgb.join(',')+')';g.fillRect(0,0,64,64);await window.albumAPI.load({...base,photos:[c.toDataURL()]});window.albumAPI.seek(3.8);const image=new Image();image.src=document.querySelector('#stage canvas').toDataURL();await image.decode();const out=document.createElement('canvas');out.width=2560;out.height=1440;const ctx=out.getContext('2d');ctx.drawImage(image,0,0);return [...ctx.getImageData(1920,720,1,1).data].slice(0,3);},{base,rgb});assert(rgb.every((v,i)=>Math.abs(v-actual[i])<=3),JSON.stringify({rgb,actual}));results.push({rgb,actual});}
 assert.deepEqual(errors,[]);await writeFile('renders/color-checks.json',JSON.stringify(results,null,2));console.log(results);
}finally{await b.close();await s.close();}