import {cp} from 'node:fs/promises';import {defineConfig} from 'vite';
import {render} from './scripts/render.mjs';
import path from 'node:path';
import {createReadStream} from 'node:fs';
export default defineConfig({base:'./',server:{host:'127.0.0.1',port:5173,strictPort:true},plugins:[{name:'copy-local-media',async closeBundle(){await cp('assets','dist/assets',{recursive:true});}},{name:'local-video-export',configureServer(server){let busy=false;const outputs=new Map();server.middlewares.use(async(req,res,next)=>{
 if(req.url?.startsWith('/api/video/')){const f=outputs.get(req.url);if(!f){res.statusCode=404;return res.end();}res.setHeader('Content-Type','video/mp4');res.setHeader('Content-Disposition','attachment; filename="wedding-album.mp4"');return createReadStream(f).pipe(res);}
 if(req.url!=='/api/render')return next();res.setHeader('Content-Type','application/json');
 if(req.method!=='POST'){res.statusCode=405;return res.end('{}');}
 if(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host){res.statusCode=403;return res.end('{}');}
 if(busy){res.statusCode=409;return res.end(JSON.stringify({error:'已有导出任务正在运行'}));}
 busy=true;try{let body='';for await(const chunk of req){body+=chunk;if(body.length>80e6)throw Error('项目超过 80MB，请压缩照片或音乐');}const config=JSON.parse(body),id=Date.now().toString(36),output=path.resolve('renders/album-'+id+'.mp4');await render({url:'http://'+req.headers.host,config,output});const url='/api/video/'+id;outputs.set(url,output);res.end(JSON.stringify({url}));}catch(e){res.statusCode=500;res.end(JSON.stringify({error:e.message}));}finally{busy=false;}
 });}}]});
