import {createServer} from 'vite';
import {browser} from './render.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const server=await createServer({server:{port:0,strictPort:false,hmr:false}});await server.listen();const b=await browser({software:false});
try{
 const p=await b.newPage({viewport:{width:1920,height:1080}});p.setDefaultTimeout(60000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(server.resolvedUrls.local[0]+'?render=1');await p.evaluate(()=>window.ready);
 const model=await server.ssrLoadModule('/js/config.js');
 const cfg=await p.evaluate(()=>window.albumAPI.config);
 const close=model.closeStart(cfg),end=model.duration(cfg);
 await p.evaluate(t=>window.albumAPI.seek(t),close-.1);await p.screenshot({path:'renders/before-closing.png'});
 const stats=await p.evaluate(()=>window.albumAPI.quality.stats);
 for(let i=0;i<=24;i++)await p.evaluate(t=>window.albumAPI.seek(t),close+model.closeDuration(cfg)*i/24);
 const after=await p.evaluate(()=>window.albumAPI.quality);
 assert.equal(after.state.closing,1);assert.equal(after.stats.textureBuilds,stats.textureBuilds);
 await p.screenshot({path:'renders/closed-end.png'});
 await p.evaluate(t=>window.albumAPI.seek(t),close+model.closeDuration(cfg)/2);await p.screenshot({path:'renders/closing-middle.png'});
 await p.evaluate(t=>window.albumAPI.seek(t),end);
 const final=await p.evaluate(()=>document.querySelector('#stage canvas').toDataURL());
 assert.equal(await p.evaluate(()=>window.albumAPI.position.phase),'closed');
 await p.evaluate(()=>window.albumAPI.seek(4.2));await p.evaluate(t=>window.albumAPI.seek(t),end);
 assert.equal(await p.evaluate(()=>document.querySelector('#stage canvas').toDataURL()),final);
 const start=model.turnStart(cfg,Math.min(2,model.spreadCount(cfg)-1));
 await p.evaluate(t=>window.albumAPI.seek(t),start-.1);
 const beforeTurn=await p.evaluate(()=>window.albumAPI.quality.stats);
 const frameMs=[];
 for(let i=1;i<30;i++){const ms=await p.evaluate(t=>{const a=performance.now();window.albumAPI.seek(t);return performance.now()-a;},start+model.turnDuration(cfg)*i/30);frameMs.push(ms);}
 const afterTurn=await p.evaluate(()=>window.albumAPI.quality.stats);
 assert.equal(beforeTurn.textureBuilds,afterTurn.textureBuilds);
 await p.evaluate(t=>window.albumAPI.seek(t),start+model.turnDuration(cfg)+.1);
 const still=await p.evaluate(()=>window.albumAPI.quality.stats);
 await p.evaluate(t=>window.albumAPI.seek(t),start+model.turnDuration(cfg)+.2);
 const stillAfter=await p.evaluate(()=>window.albumAPI.quality.stats);assert.equal(stillAfter.renders,still.renders);
 assert.deepEqual(errors,[]);
 const report={closing:true,finalState:'closed',reverseSeekPixelsIdentical:true,noTextureBuildsDuringTurn:true,noTextureBuildsDuringClose:true,noRedrawDuringHold:true,turnDuration:model.turnDuration(cfg),closeDuration:model.closeDuration(cfg),endHold:model.endHold(cfg),duration:end,cpuSeekMedianMs:frameMs.sort((a,b)=>a-b)[15],note:'CPU seek timing excludes GPU completion; not a guarantee of display FPS'};
 await writeFile('renders/closing-checks.json',JSON.stringify(report,null,2));console.log(report);
}finally{await b.close();await server.close();}