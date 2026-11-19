import {readdir} from 'node:fs/promises';
const samplePhoto='assets/photos/'+(await readdir('assets/photos')).filter(n=>/\.(jpe?g|png|webp|avif)$/i.test(n)).sort()[0];
import {createServer} from 'vite';
import {browser} from './render.mjs';
import {renderOptions} from './render-options.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
assert.deepEqual(renderOptions(),{width:2560,height:1440,fps:30,crf:16,resolution:'1440p'});
assert.equal(renderOptions({resolution:'1080p'}).width,1920);
assert.throws(()=>renderOptions({resolution:'bad'}));
const server=await createServer({server:{port:0,strictPort:false,hmr:false}});await server.listen();const b=await browser();
try{
 const page=await b.newPage({viewport:{width:2560,height:1440},deviceScaleFactor:1});
 await page.goto(server.resolvedUrls.local[0]+'?render=1');await page.evaluate(()=>window.ready);
 await page.evaluate(()=>window.albumAPI.seek(3.8));
 const quality=await page.evaluate(()=>window.albumAPI.quality);
 assert.deepEqual(quality.canvas,{width:2560,height:1440});assert(quality.textures.every(t=>t.width===3072&&t.height===3441));
 await page.screenshot({path:'renders/quality-1440p.png',type:'png'});
 // Upload uses original bytes, never a re-encoded or downscaled canvas.
 await page.evaluate(async()=>{const c=window.albumAPI.config;await window.albumAPI.load({...c,photos:[c.photos[0]]});document.body.classList.remove('film');});
 await page.click('#edit');await page.setInputFiles('#photos',samplePhoto);await page.click('#apply');await page.waitForFunction(()=>!document.getElementById('editor').open);
 const original=await readFile(samplePhoto);
 const equal=await page.evaluate(base64=>window.albumAPI.config.photos.at(-1).split(',')[1]===base64,original.toString('base64'));assert(equal);
 const report={resolution:renderOptions(),canvas:quality.canvas,textures:quality.textures,sourceDimensions:quality.sources,originalUploadBytesPreserved:equal};
 await writeFile('renders/quality-checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await b.close();await server.close();}
