import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {readFile,mkdir,writeFile,unlink} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export async function browser(){for(const p of [process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'])if(p&&existsSync(p))return chromium.launch({executablePath:p,headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});return chromium.launch({headless:true});}
export async function render({url,config,output='renders/wedding-album.mp4',seconds}){
 await mkdir(path.dirname(output),{recursive:true});const b=await browser();let ff,audioPath;
 try{const page=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});await page.goto(url+'/?render=1');await page.evaluate(()=>window.ready);if(config)await page.evaluate(c=>window.albumAPI.load(c),config);
 const cfg=await page.evaluate(()=>window.albumAPI.config),len=seconds||await page.evaluate(()=>window.albumAPI.duration),frames=Math.ceil(len*30);
 const args=['-y','-f','image2pipe','-vcodec','mjpeg','-framerate','30','-i','pipe:0'];
 if(cfg.music){if(cfg.music.startsWith('data:')){audioPath=output+'.audio';await writeFile(audioPath,Buffer.from(cfg.music.split(',')[1],'base64'));}else audioPath=path.resolve(cfg.music);args.push('-stream_loop','-1','-i',audioPath);}
 args.push('-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-r','30');
 if(cfg.music)args.push('-c:a','aac','-af','volume=0.45,afade=t=out:st='+Math.max(0,len-2)+':d=2');
 args.push('-t',String(frames/30),'-movflags','+faststart',output);
 ff=spawn(process.env.FFMPEG_PATH||'ffmpeg',args,{stdio:['pipe','ignore','pipe']});let log='';ff.stderr.on('data',d=>log=(log+d).slice(-6000));const done=new Promise((resolve,reject)=>{ff.on('error',reject);ff.on('close',c=>c===0?resolve():reject(Error(log)));});done.catch(()=>{});ff.stdin.on('error',()=>{});
 for(let n=0;n<frames;n++){await page.evaluate(t=>window.albumAPI.seek(t),n/30);const png=await page.screenshot({type:'jpeg',quality:95});if(!ff.stdin.write(png))await Promise.race([once(ff.stdin,'drain'),done]);if(n%60===0)console.log('Frame '+n+'/'+frames);}
 ff.stdin.end();await done;console.log('Rendered '+output+' ('+frames+' frames)');return output;
 }finally{ff?.stdin.destroy();if(ff&&ff.exitCode===null)ff.kill();await b.close();if(audioPath?.endsWith('.audio'))await unlink(audioPath).catch(()=>{});}
}
