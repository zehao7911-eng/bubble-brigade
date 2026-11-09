export const stages=[
 {name:'Bath Patrol',target:0,positions:[-2.6,2.4,-.9],sky:0x10cbe4,wall:0x28b5de,intro:'The captain slipped on the soap.',egg:'CAPTAIN QUACK REPORTING!',color:0xffbe20},
 {name:'Laundry Launch',target:1.6,positions:[-2.8,2.7,.3,-1.25],sky:0xff7a8b,wall:0xe85798,intro:'A sock avalanche! The ducks need a lift.',egg:'THE SOCK WAS A DUCK ALL ALONG!',color:0xff9e26},
 {name:'Disco Drain',target:-1.5,positions:[2.8,-2.75,.8,-.25,2],sky:0x6864ff,wall:0x8f49e7,intro:'The disco ball called for backup.',egg:'THE CAPTAIN STARTED A DANCE PARTY!',color:0xfce24c}
];
export function create(stage){
 return {stage,x:0,seconds:0,held:-1,rescued:0,drops:0,ducks:stages[stage].positions.map(x=>({x,y:1.12,safe:false}))};
}
export function step(run,target,spray,dt){
 run.seconds+=dt;
 run.x+=(target-run.x)*Math.min(1,dt*13);
 const dock=stages[run.stage].target+Math.sin(run.seconds*1.4)*run.stage*.38;
 let rescued=-1;
 if(!spray&&run.held>=0){run.held=-1;run.drops++}
 if(spray&&run.held<0){
  let distance=.76;
  run.ducks.forEach((duck,i)=>{
   if(!duck.safe&&Math.abs(duck.x-run.x)<distance){distance=Math.abs(duck.x-run.x);run.held=i}
  });
 }
 run.ducks.forEach((duck,i)=>{
  if(duck.safe)return;
  if(i===run.held){
   duck.x+=(run.x-duck.x)*Math.min(1,dt*8);
   duck.y=Math.min(5.95,duck.y+dt*2.95);
   if(duck.y>=5.1&&Math.abs(duck.x-dock)<.76){
    duck.safe=true;run.held=-1;run.rescued++;rescued=i;
   }
  }else duck.y=Math.max(1.12,duck.y-dt*2.3);
 });
 return {dock,rescued};
}
