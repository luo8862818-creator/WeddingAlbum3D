export const resolutions={'1080p':{width:1920,height:1080},'1440p':{width:2560,height:1440}};
export function renderOptions({resolution='1440p',seconds}={}){
 if(!resolutions[resolution])throw Error('分辨率须为 1440p（2560×1440）或 1080p（1920×1080）');
 if(seconds!==undefined&&(!Number.isFinite(seconds)||seconds<=0))throw Error('--seconds 必须为正数');
 return {...resolutions[resolution],fps:30,crf:16,resolution};
}
