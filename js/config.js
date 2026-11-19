const folderPhotos = import.meta.glob('/assets/photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {eager:true,query:'?url',import:'default'});
const sort = new Intl.Collator('zh-CN',{numeric:true,sensitivity:'base'});
export const defaults={version:2,names:'予安 & 星禾',date:'2026. 10. 18',title:'The art of us.',story:'在漫长的时光里，\n与你相遇，是我最温柔的幸运。',photos:Object.entries(folderPhotos).sort(([a],[b])=>sort.compare(a,b)).map(([,url])=>url),music:'',hold:3.5};
export const TURN=1.8, INTRO=2;
export const spreadCount=c=>Math.ceil((c.photos.length+1)/2);
export const sheetCount=c=>spreadCount(c)+1;
export const turnStart=(c,i)=>i===0?INTRO:INTRO+TURN+c.hold+(i-1)*(c.hold+TURN);
export const duration=c=>INTRO+spreadCount(c)*(TURN+c.hold);
export function position(c,t){
 const total=spreadCount(c);
 let spread=0;
 for(let i=0;i<total;i++)if(t>=turnStart(c,i)+TURN)spread=i+1;
 const first=Math.max(1,spread*2-2),last=Math.min(c.photos.length,spread*2-1);
 return {spread,total,first,last,label:spread===0?'封面 · 0 / '+c.photos.length+' 张':'第 '+spread+' / '+total+' 跨页 · 照片 '+(first===last?first:first+'–'+last)+' / '+c.photos.length+' 张'};
}