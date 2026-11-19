import settings from '../album.config.json';
const folderPhotos = import.meta.glob('/assets/photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {eager:true,query:'?url',import:'default'});
const sort = new Intl.Collator('zh-CN',{numeric:true,sensitivity:'base'});
export const defaults={...settings,version:2,photos:Object.entries(folderPhotos).sort(([a],[b])=>sort.compare(a,b)).map(([,url])=>url)};
export function validateTiming(c){for(const [key,min,max] of [['hold',1,20],['turnDuration',.6,10],['closeDuration',.6,10],['endHold',0,20]]){const value=c[key];if(value!==undefined&&(!Number.isFinite(value)||value<min||value>max))throw Error(key+' 必须为 '+min+'–'+max+' 秒');}return c;}
validateTiming(defaults);
export const TURN=2.2, INTRO=2;
export const turnDuration=c=>c.turnDuration??TURN;
export const closeDuration=c=>c.closeDuration??2.4;
export const endHold=c=>c.endHold??2;
export const smooth=p=>p*p*p*(p*(p*6-15)+10);
export const spreadCount=c=>Math.ceil((c.photos.length+1)/2);
export const sheetCount=c=>spreadCount(c)+1;
export const turnStart=(c,i)=>i===0?INTRO:INTRO+turnDuration(c)+c.hold+(i-1)*(c.hold+turnDuration(c));
export const closeStart=c=>INTRO+spreadCount(c)*(turnDuration(c)+c.hold);
export const duration=c=>closeStart(c)+closeDuration(c)+endHold(c);
export function position(c,t){
 const total=spreadCount(c);
 let spread=0;
 for(let i=0;i<total;i++)if(t>=turnStart(c,i)+turnDuration(c))spread=i+1;
 const first=Math.max(1,spread*2-2),last=Math.min(c.photos.length,spread*2-1);
 const phase=t>=closeStart(c)+closeDuration(c)?'closed':t>closeStart(c)?'closing':spread===0?'cover':'reading';
 return {spread,total,first,last,phase,label:phase==='closed'?'已合册 · '+c.photos.length+' / '+c.photos.length+' 张':phase==='closing'?'正在合册 · '+c.photos.length+' / '+c.photos.length+' 张':spread===0?'封面 · 0 / '+c.photos.length+' 张':'第 '+spread+' / '+total+' 跨页 · 照片 '+(first===last?first:first+'–'+last)+' / '+c.photos.length+' 张'};
}
