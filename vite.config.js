import {cp} from 'node:fs/promises';
import {defineConfig} from 'vite';
export default defineConfig({
 base:'./',
 server:{host:'127.0.0.1',port:5173,strictPort:true},
 plugins:[{name:'copy-local-media',async closeBundle(){await cp('assets','dist/assets',{recursive:true});}}]
});