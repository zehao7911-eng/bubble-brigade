import {stages,create,step} from './core.mjs';
import {Pool} from './view.mjs';
import {Music} from './audio.mjs';
import {BeaconHost} from './sdk.mjs';
const byId=id=>document.getElementById(id);
const canvas=document.querySelector('canvas');
const key='bubble-brigade-v1';
function normalize(data){
 return {game:'bubble-brigade',v:1,unlocked:Number.isInteger(data?.unlocked)?Math.max(0,Math.min(2,data.unlocked)):0,eggs:stages.map((_,i)=>data?.eggs?.[i]===true),gold:data?.gold===true,confetti:data?.confetti===true,sound:data?.sound!==false};
}
let raw;try{raw=JSON.parse(localStorage.getItem(key))}catch{}
const saved=normalize(raw),music=new Music();
music.enabled=saved.sound;
let level=saved.unlocked,run=create(level),phase='menu',sceneTime=0,dock=stages[level].target,aim=0,pointer=null,keySpray=false,world,captionUntil=0,support={};
const host=new BeaconHost(window,{
 status(value){support=value;social()},
 reward(name){if(saved[name])return;saved[name]=true;save();social()},
 load(value){
  const remote=normalize(value);
  saved.unlocked=Math.max(saved.unlocked,remote.unlocked);
  saved.eggs=saved.eggs.map((found,i)=>found||remote.eggs[i]);
  saved.gold ||= remote.gold;saved.confetti ||= remote.confetti;
  if(phase==='menu'){level=saved.unlocked;run=create(level);dock=stages[level].target;menu()}
  save();social();
 }
});
function save(){try{localStorage.setItem(key,JSON.stringify(saved))}catch{}host.save(saved)}
function social(){
 const rewards=[];
 if(support.gold)rewards.push(saved.gold?'Gold cap unlocked':'Like to unlock a gold cap');
 if(support.confetti)rewards.push(saved.confetti?'Extra sparks unlocked':'Comment to unlock extra sparks');
 byId('social').hidden=!rewards.length;byId('social').textContent=rewards.join(' · ');
}
function caption(text,duration=1.4){byId('toast').textContent=text;captionUntil=duration}
function menu(){
 byId('progress').textContent='MISSION '+(level+1)+' / '+stages.length+' · SECRETS '+saved.eggs.filter(Boolean).length+' / '+stages.length;
}
const sceneLines=[
 ['QUACK CAPTAIN: WATCH THIS.','THE SOAP HAS OTHER PLANS.','SPLASH! TO THE RESCUE!'],
 ['ONE LAST SPIN CYCLE.','WAIT… THAT SOCK QUACKED.','DUCKS OVERBOARD!'],
 ['THE CAPTAIN FOUND THE BEAT.','THAT WAS THE WRONG LEVER.','RESCUE ON THE DANCE FLOOR!']
];
let lastBeat=-1;
function begin(){
 if(!world)return;
 if(phase==='result')level=(level+1)%stages.length;
 run=create(level);aim=0;dock=stages[level].target;phase='intro';sceneTime=0;lastBeat=-1;
 byId('panel').hidden=true;byId('hud').hidden=true;byId('skip').hidden=false;
 caption(sceneLines[level][0],2.2);music.mode='chute';music.start();
}
function play(){
 if(phase!=='intro')return;
 phase='play';sceneTime=0;host.start();music.mode='dive';
 byId('skip').hidden=true;byId('hud').hidden=false;byId('tip').hidden=false;
 byId('area').textContent=stages[level].name.toUpperCase();
 byId('count').textContent='0 / '+run.ducks.length+' SAFE';
 caption('LIFT THE DUCKS!');
}
function complete(){
 if(phase!=='play')return;
 phase='ending';sceneTime=0;pointer=null;keySpray=false;host.end();music.mode='chute';
 saved.unlocked=Math.max(saved.unlocked,Math.min(level+1,stages.length-1));
 if(!run.drops)saved.eggs[level]=true;
 save();byId('tip').hidden=true;
 caption(run.drops?'ALL DUCKS SAFE!':stages[level].egg,3);
}
function result(){
 phase='result';
 byId('panel').hidden=false;
 byId('eyebrow').textContent=run.drops?'MISSION COMPLETE':'SECRET SCENE FOUND';
 byId('title').textContent=run.drops?'Everyone made it!':'Smooth rescue!';
 byId('detail').textContent=run.ducks.length+' ducks rescued. '+(run.drops?'Keep the spray on until the basket to find a secret scene.':stages[level].egg);
 byId('go').textContent=level===stages.length-1?'PLAY AGAIN →':'NEXT RESCUE →';
 menu();
}
byId('go').onclick=begin;byId('skip').onclick=play;
function soundLabel(){byId('sound').setAttribute('aria-pressed',String(music.enabled));byId('sound').textContent=music.enabled?'♫':'♪'}
byId('sound').onclick=()=>{music.toggle();saved.sound=music.enabled;soundLabel();save()};
soundLabel();
function steer(e){
 const rect=canvas.getBoundingClientRect();
 aim=Math.max(-3.7,Math.min(3.7,((e.clientX-rect.left)/rect.width-.5)*9.3));
}
canvas.addEventListener('pointerdown',e=>{
 if(phase!=='play'||pointer!==null)return;
 pointer=e.pointerId;canvas.setPointerCapture(pointer);steer(e);
});
canvas.addEventListener('pointermove',e=>{if(e.pointerId===pointer)steer(e)});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(e.pointerId===pointer)pointer=null});
addEventListener('keydown',e=>{
 if(phase!=='play')return;
 if(e.code==='Space'){e.preventDefault();keySpray=true}
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();aim=Math.max(-3.7,Math.min(3.7,aim+(e.key==='ArrowLeft'?-.23:.23)))}
});
addEventListener('keyup',e=>{if(e.code==='Space')keySpray=false});
try{world=new Pool(canvas)}catch(e){byId('title').textContent='3D unavailable';byId('detail').textContent='Open in a WebGL-enabled browser.';byId('go').disabled=true}
let last=performance.now();
function frame(now){
 const dt=Math.min(.045,(now-last)/1000);last=now;
 if(document.hidden){requestAnimationFrame(frame);return}
 sceneTime+=dt;
 if(phase==='intro'){
  const beat=sceneTime<2.2?0:sceneTime<3.5?1:2;
  if(beat!==lastBeat){lastBeat=beat;caption(sceneLines[level][beat],2.4);if(beat)music.hit(beat)}
  if(sceneTime>=5.6)play();
 }
 if(phase==='ending'&&sceneTime>=2.75)result();
 const spray=phase==='play'&&(pointer!==null||keySpray);
 if(phase==='play'){
  const change=step(run,aim,spray,dt);dock=change.dock;
  if(change.rescued>=0){
   world.flashAge=0;music.hit(run.rescued);caption('DUCK SAFE! +1');
   byId('count').textContent=run.rescued+' / '+run.ducks.length+' SAFE';
   if(run.rescued===run.ducks.length)complete();
  }
 }
 captionUntil-=dt;if(captionUntil<=0&&byId('toast').textContent)byId('toast').textContent='';
 run.gold=saved.gold;run.confetti=saved.confetti;
 world?.draw(run,stages[level],phase,now/1000,sceneTime,spray,dock,dt);
 requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){pointer=null;keySpray=false;save();music.context?.suspend().catch(()=>{})}
 else if(music.enabled&&music.context)music.context.resume().catch(()=>{});
});
addEventListener('pagehide',()=>{save();host.stop();music.stop()});
addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
menu();host.poll();requestAnimationFrame(frame);
