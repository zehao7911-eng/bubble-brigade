const T=globalThis.THREE;
T.ColorManagement.legacyMode=false;
export class Pool{
 constructor(canvas){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  this.renderer.outputEncoding=T.sRGBEncoding;
  this.renderer.toneMapping=T.ACESFilmicToneMapping;
  this.scene=new T.Scene();this.scene.background=new T.Color(0x11cbec);
  this.camera=new T.OrthographicCamera(-4.65,4.65,8,-8,.1,70);
  this.camera.position.set(0,8.2,18);this.camera.lookAt(0,4.2,0);
  this.scene.add(new T.HemisphereLight(0xfff9ff,0x405ab5,.84));
  const key=new T.DirectionalLight(0xffe9b9,1.35);key.position.set(-4,8,6);this.scene.add(key);
  const rim=new T.DirectionalLight(0x47fcff,.8);rim.position.set(4,5,-6);this.scene.add(rim);
  this.cube=new T.BoxGeometry();this.sphere=new T.SphereGeometry(1,16,12);this.materials=new Map();
  this.wall=this.box(18,18,.24,0x25c8eb,0,5,-4);
  for(let x=-7;x<=7;x++)for(let y=0;y<11;y++){
   this.box(.035,.98,.03,0x8ff8fa,x,y,-3.84);
   if(x===0)this.box(15,.035,.035,0x8ff8fa,0,y+.5,-3.84);
  }
  this.box(8.4,.32,4.2,0xff5178,0,.12,0);
  this.box(8.05,.14,3.75,0x26cbea,0,.38,0);
  for(const side of [-1,1])this.box(.28,.62,4.13,0xffb73e,side*4.04,.53,0);
  this.box(8.2,.25,.24,0xffbe42,0,.41,2);
  this.box(8.2,.42,.24,0xffbe42,0,.50,-1.95);
  this.box(8.1,.07,.13,0xfff285,0,.57,2.08);
  for(let i=0;i<20;i++){
   const stripe=this.box(.55,.012,.038,0x9af8ff,(i%10-4.5)*.78,.46,(i<10?-.8:.9));
   stripe.rotation.y=.12;
  }
  this.basket=this.group();
  this.box(2.42,.28,1.61,0xff7d32,0,-.32,0,this.basket);
  this.box(2.54,.11,1.75,0xffe85a,0,-.14,0,this.basket);
  for(let i=-4;i<=4;i++)this.box(.1,.40,.12,0xffab45,i*.25,-.13,.77,this.basket);
  for(const x of [-1.13,1.13]){
   this.box(.10,.45,1.63,0xff9830,x,-.14,0,this.basket);
   this.box(.10,3.6,.10,0xfff0af,x,1.61,-.53,this.basket);
  }
  this.box(2.88,.19,.25,0x6133bd,0,8.72,-.52);
  this.box(7.1,.13,.16,0x7546c3,0,8.95,-.56);
  this.nozzle=this.group();
  this.ball(.42,.26,.36,0xff3f69,0,.66,.9,this.nozzle);
  this.box(.34,.33,.29,0xffbc42,0,.82,.9,this.nozzle);
  this.ball(.23,.09,.21,0x17396e,0,1,.9,this.nozzle);
  this.ducks=Array.from({length:5},(_,i)=>this.duck(i));
  this.captain=this.duck(0);
  this.captain.scale.setScalar(1.33);
  this.soap=this.box(1.1,.24,.53,0xfe5ab7,0,0,0);
  this.sock=this.group();
  this.box(.36,.77,.25,0x7440ff,0,0,0,this.sock);
  this.box(.63,.25,.26,0xb9a7ff,.14,-.29,0,this.sock);
  this.box(.38,.12,.27,0xffee71,0,.33,0,this.sock);
  this.disco=this.group();
  this.ball(.52,.52,.52,0xfff2ff,0,0,0,this.disco);
  for(let i=0;i<24;i++){
   const a=i*Math.PI/6,y=(i<12?-.16:.16);
   this.box(.15,.16,.09,[0x26f8ff,0xff59ac,0xffdd43][i%3],Math.sin(a)*.5,y,Math.cos(a)*.5,this.disco).rotation.y=a;
  }
  this.bubbles=Array.from({length:42},(_,i)=>this.ball(.09,.09,.09,i%4?0xbef9ff:0xffffff,0,0,0));
  this.spark=Array.from({length:22},(_,i)=>this.box(.10,.10,.10,[0xffea4a,0xff52a1,0x53f8ed][i%3],0,0,0));
  this.laundry=this.group();
  for(const x of [-3,3]){
   this.box(1.95,2,.40,0xffe7fa,x,2.16,-2.78,this.laundry);
   this.ball(.63,.63,.15,0x744cac,x,2.10,-2.53,this.laundry);
   this.ball(.49,.49,.14,0x60dce8,x,2.10,-2.45,this.laundry);
   this.box(.57,.10,.09,0xffac47,x+.29,2.93,-2.53,this.laundry);
  }
  this.party=this.group();
  for(let i=0;i<12;i++){
   this.box(.53,.54,.07,[0xff48a6,0x34e8ff,0xffde36][i%3],(i%6-2.5)*1.07,1.5+Math.floor(i/6)*.70,-2.74,this.party);
  }
  this.secretDuck=this.duck(3);
  this.flashAge=2;
  const resize=()=>{
   const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;
   this.renderer.setSize(width,height,false);const half=Math.max(6,4.65*height/width);
   this.camera.top=half;this.camera.bottom=-half;this.camera.updateProjectionMatrix();
  };
  resize();new ResizeObserver(resize).observe(canvas);
 }
 group(parent=this.scene){const g=new T.Group();parent.add(g);return g}
 mesh(geo,w,h,d,color,x,y,z,parent){
  if(!this.materials.has(color))this.materials.set(color,new T.MeshStandardMaterial({color,roughness:.46}));
  const mesh=new T.Mesh(geo,this.materials.get(color));mesh.scale.set(w,h,d);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 }
 box(w,h,d,c,x,y,z,p=this.scene){return this.mesh(this.cube,w,h,d,c,x,y,z,p)}
 ball(w,h,d,c,x,y,z,p=this.scene){return this.mesh(this.sphere,w,h,d,c,x,y,z,p)}
 duck(i){
  const g=this.group(),color=[0xffcc22,0xff7c44,0xffed50,0x5df0b7,0xf9a2d8][i];
  this.ball(.48,.31,.37,color,0,0,0,g);
  this.ball(.31,.30,.28,color,.15,.35,.08,g);
  this.ball(.22,.089,.20,0xff7820,.40,.28,.19,g);
  this.ball(.067,.075,.024,0x172f58,.14,.39,.34,g);
  this.ball(.022,.022,.012,0xffffff,.121,.416,.36,g);
  this.ball(.27,.14,.065,color,-.13,.02,.34,g);
  this.ball(.19,.13,.15,color,-.43,.11,-.06,g);
  if(i===0){
   g.userData.cap=this.box(.49,.10,.36,0x164b96,.14,.56,.05,g);
   this.box(.33,.14,.31,0xf9fdff,.14,.67,.03,g);
   this.box(.12,.07,.045,0xff6336,.14,.66,.20,g);
  }
  return g;
 }
 draw(run,stage,phase,time,sceneTime,spray,dock,dt){
  this.captain.userData.cap.material=this.materials.get(run.gold?0xffe85a:0x164b96);
  this.scene.background.setHex(stage.sky);this.wall.material.color.setHex(stage.wall);
  this.laundry.visible=run.stage===1;
  this.party.visible=run.stage===2;
  this.basket.position.set(dock,5.16,0);
  this.nozzle.position.x=run.x;
  this.flashAge+=dt;
  this.ducks.forEach((mesh,i)=>{
   const d=run.ducks[i];mesh.visible=!!d;
   if(!d)return;
   mesh.position.set(d.safe?dock+(i-(run.ducks.length-1)/2)*.44:d.x,d.safe?5.42:d.y+Math.sin(time*4+i)*.08,d.safe?-.06:0);
   mesh.rotation.z=d.safe?Math.sin(time*8+i)*.13:i===run.held?Math.sin(time*9)*.13:0;
   mesh.scale.setScalar(d.safe?.59:1);
  });
  const opening=phase==='intro',closing=phase==='ending'||phase==='result';
  this.captain.visible=opening||closing;
  if(opening){
   const fall=Math.max(0,Math.min(1,(sceneTime-.85)/1.1));
   this.captain.position.set(-2.75+fall*.84,4.5-fall*3.3,1);
   this.captain.rotation.z=fall*Math.PI*2;
  }else if(closing){
   this.captain.position.set(dock,6.55+Math.abs(Math.sin(time*7))*.26,.5);
   this.captain.rotation.z=Math.sin(time*7)*.22;
  }
  this.soap.visible=opening&&run.stage===0;
  this.soap.position.set(-2.8+sceneTime*.6,4.08-Math.max(0,sceneTime-.8)*1.45,1.2);
  this.sock.visible=(opening||closing&&(run.drops>0||sceneTime<.9))&&run.stage===1;
  this.sock.position.set(closing?dock+1.15:2.3-sceneTime*.4,closing?5.8:6.2-sceneTime,1.2);
  this.sock.rotation.z=time*2;
  this.secretDuck.visible=closing&&run.stage===1&&!run.drops&&sceneTime>=.9;
  this.secretDuck.position.set(dock+1.4,5.85+Math.abs(Math.sin(time*8))*.40,.9);
  this.secretDuck.rotation.z=Math.sin(time*8)*.32;
  this.disco.visible=run.stage===2;
  this.disco.position.set(-2.6,7.25,0);
  this.disco.rotation.y=time*2;
  this.bubbles.forEach((mesh,i)=>{
   const age=(time*1.25+i/this.bubbles.length)%1;
   mesh.visible=spray;
   if(spray){
    mesh.position.set(run.x+Math.sin(i*4.3)*(.06+age*.27),.98+age*5.1,Math.cos(i*2.3)*.33+.57);
    mesh.scale.setScalar(.043+age*.095);
   }
  });
  this.spark.forEach((mesh,i)=>{
   mesh.visible=(i<14||run.confetti)&&(this.flashAge<.65||closing);
   const a=closing?(time*1.2+i*.083)%1:this.flashAge/.65;
   if(mesh.visible)mesh.position.set(dock+Math.sin(i*2.4)*a*2,5.65+a*1.6,Math.cos(i*2.4)*a*1.65);
   mesh.rotation.set(time+i,time*2,0);
  });
  this.camera.zoom+=( (opening?1.12:closing?1.04:1)-this.camera.zoom)*Math.min(1,dt*5);
  this.camera.updateProjectionMatrix();
  this.renderer.render(this.scene,this.camera);
 }
}

