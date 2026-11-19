import {createServer} from 'vite';
import {browser} from './render.mjs';
import assert from 'node:assert/strict';
import {writeFile,unlink,copyFile} from 'node:fs/promises';
const server=await createServer({server:{port:0,strictPort:false}});await server.listen();
const b=await browser();const results=[];const temp='assets/photos/99-test-added.jpg';
try{
 const page=await b.newPage({viewport:{width:1920,height:1080}});
 await page.goto(server.resolvedUrls.local[0]+'?render=1');await page.evaluate(()=>window.ready);
 const base=await page.evaluate(()=>window.albumAPI.config);
 assert(base.photos.length>0);
 assert.equal(await page.locator('nav').isVisible(),false);assert.equal(await page.locator('header').isVisible(),false);assert.equal(await page.locator('#film-hud').isVisible(),true);assert.equal(await page.locator('#status').isVisible(),false);assert.equal(await page.locator('#export').count(),0);
 results.push('影片只显示页码和进度；无导出按钮');
 const raw=()=>page.evaluate(()=>document.querySelector('canvas').toDataURL());
 await page.evaluate(()=>window.albumAPI.seek(0));const closed=await raw();
 await page.screenshot({path:'renders/closed-1080.png'});
 await page.evaluate(()=>window.albumAPI.seek(1.99));assert.equal(await raw(),closed);
 await page.evaluate(()=>window.albumAPI.seek(2.9));assert.notEqual(await raw(),closed);
 await page.screenshot({path:'renders/opening-1080.png'});
 results.push('0–2秒闭合，2秒后开始打开');
 for(const n of [1,2,7]){
  await page.evaluate(async({base,n})=>{await window.albumAPI.load({...base,photos:Array.from({length:n},(_,i)=>base.photos[i%base.photos.length])});window.albumAPI.seek(window.albumAPI.duration);},{base,n});
  const p=await page.evaluate(()=>({pos:window.albumAPI.position,duration:window.albumAPI.duration}));
  assert.equal(p.pos.total,Math.ceil((n+1)/2));assert.equal(p.pos.last,n);assert.equal(p.pos.spread,p.pos.total);
  assert.equal(p.duration,2+Math.ceil((n+1)/2)*(1.8+base.hold));assert.equal(await page.locator('#film-progress').getAttribute('max'),'1');
 }
 await page.screenshot({path:'renders/film-progress-1080.png'});
 results.push('1/2/7张照片动态页数、总数、时长及最终页码正确');
 await copyFile('assets/photos/wedding-01.jpg',temp);
 await page.waitForTimeout(1000);await page.reload();await page.evaluate(()=>window.ready);assert.equal(await page.evaluate(()=>window.albumAPI.config.photos.length),base.photos.length+1);
 await unlink(temp);await page.waitForTimeout(1000);await page.reload();await page.evaluate(()=>window.ready);assert.equal(await page.evaluate(()=>window.albumAPI.config.photos.length),base.photos.length);
 results.push('文件夹新增、删除后刷新自动同步');
 await page.goto(server.resolvedUrls.local[0]);await page.evaluate(()=>window.ready);await page.click('#edit');await page.click('#thumbs button');await page.click('#apply');await page.waitForFunction(()=>!document.getElementById('editor').open);assert.equal(await page.evaluate(()=>window.albumAPI.config.photos.length),base.photos.length-1);
 results.push('网页编辑器删除照片并应用');
 console.log(results);await writeFile('renders/dynamic-checks.json',JSON.stringify(results,null,2));
}finally{await unlink(temp).catch(()=>{});await b.close();await server.close();}