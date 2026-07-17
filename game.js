(() => {
  'use strict';
  const W=1000,H=600, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const $=id=>document.getElementById(id);

  class InputManager{
    constructor(){this.keys={};const map={ArrowUp:'forward',KeyW:'forward',ArrowDown:'back',KeyS:'back',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
      addEventListener('keydown',e=>{if(map[e.code]){this.keys[map[e.code]]=true;e.preventDefault()}if((e.code==='KeyP'||e.code==='Escape')&&!e.repeat)game.togglePause()},{passive:false});
      addEventListener('keyup',e=>{if(map[e.code]){this.keys[map[e.code]]=false;e.preventDefault()}},{passive:false});
      document.querySelectorAll('[data-control]').forEach(b=>{const key=b.dataset.control,set=v=>{this.keys[key]=v;b.classList.toggle('active',v)};b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);set(true)});['pointerup','pointercancel','lostpointercapture'].forEach(n=>b.addEventListener(n,()=>set(false)))})
    }
    clear(){this.keys={};document.querySelectorAll('.active').forEach(x=>x.classList.remove('active'))}
  }
  class AudioManager{
    constructor(){this.enabled=localStorage.getItem('ef-sound')!=='false';this.ctx=null}
    init(){if(!this.ctx)try{this.ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){this.enabled=false}if(this.ctx?.state==='suspended')this.ctx.resume()}
    tone(freq,dur,type='sine',vol=.08,delay=0){if(!this.enabled)return;this.init();if(!this.ctx)return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(this.ctx.destination);o.start(t);o.stop(t+dur)}
    crash(){this.tone(90,.2,'sawtooth',.13)} park(){this.tone(520,.12);this.tone(780,.18,'sine',.1,.12)} complete(){[440,554,659,880].forEach((f,i)=>this.tone(f,.25,'triangle',.1,i*.12))}
    toggle(){this.enabled=!this.enabled;localStorage.setItem('ef-sound',this.enabled);return this.enabled}
  }
  class Car{
    constructor(x,y,a,color='#34a6ff'){Object.assign(this,{x,y,a,color,speed:0,w:34,h:62})}
    update(dt,input){const accel=input.keys.forward?150:input.keys.back?-115:0;if(accel)this.speed+=accel*dt;else this.speed*=Math.pow(.18,dt);this.speed=clamp(this.speed,-72,175);if(Math.abs(this.speed)<.8)this.speed=0;const steer=(input.keys.right?1:0)-(input.keys.left?1:0);if(steer&&Math.abs(this.speed)>2)this.a+=steer*1.85*dt*clamp(Math.abs(this.speed)/70,.25,1)*(this.speed>0?1:-1);this.x+=Math.sin(this.a)*this.speed*dt;this.y-=Math.cos(this.a)*this.speed*dt}
    corners(x=this.x,y=this.y,a=this.a){const c=Math.cos(a),s=Math.sin(a),hw=this.w/2,hh=this.h/2;return [[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]].map(([px,py])=>({x:x+px*c-py*s,y:y+px*s+py*c}))}
    draw(ctx,active=true){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.a);ctx.shadowColor=active?'#65f6c0':'transparent';ctx.shadowBlur=active?15:0;ctx.fillStyle=this.color;roundRect(ctx,-17,-31,34,62,8);ctx.fill();ctx.fillStyle='#bce8ff';roundRect(ctx,-12,-18,24,16,4);ctx.fill();ctx.fillStyle='#16304a';roundRect(ctx,-12,5,24,15,4);ctx.fill();ctx.fillStyle='#111';[-20,16].forEach(x=>[-20,20].forEach(y=>ctx.fillRect(x,y,4,13)));ctx.fillStyle='#fff6b2';ctx.fillRect(-12,-30,7,3);ctx.fillRect(5,-30,7,3);ctx.restore()}
  }
  class ParkingSpot{
    constructor(x,y,a,n){Object.assign(this,{x,y,a,n,w:48,h:82})}
    contains(car){const p=car.corners();const c=Math.cos(-this.a),s=Math.sin(-this.a);return p.every(q=>{const dx=q.x-this.x,dy=q.y-this.y;return Math.abs(dx*c-dy*s)<this.w/2-2&&Math.abs(dx*s+dy*c)<this.h/2-2})}
    draw(ctx,target=false,t=0){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.a);ctx.strokeStyle=target?(Math.sin(t*6)>0?'#56ffaf':'#fff176'):'#d8e3e8';ctx.lineWidth=target?5:2;ctx.setLineDash(target?[10,6]:[]);ctx.strokeRect(-24,-41,48,82);ctx.setLineDash([]);ctx.fillStyle=target?'#56ffaf':'#d8e3e8';ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.fillText(target?'ALVO '+this.n:String(this.n),0,6);ctx.restore()}
  }
  const levels=[
    {start:[100,500,0],cars:2,spots:[[770,130,Math.PI/2],[770,470,Math.PI/2]],obs:[[380,245,100,110]]},
    {start:[100,300,Math.PI/2],cars:3,spots:[[780,110,Math.PI/2],[780,300,Math.PI/2],[780,490,Math.PI/2]],obs:[[400,80,70,180],[400,340,70,180]]},
    {start:[120,500,0],cars:3,spots:[[170,105,0],[500,105,0],[830,105,0]],obs:[[300,260,400,70],[70,180,100,55]]},
    {start:[500,520,0],cars:4,spots:[[120,110,Math.PI/2],[880,110,Math.PI/2],[120,330,Math.PI/2],[880,330,Math.PI/2]],obs:[[280,190,440,65],[280,390,440,65]]},
    {start:[100,510,0],cars:5,spots:[[170,100,0],[390,100,0],[610,100,0],[830,100,0],[880,485,Math.PI/2]],obs:[[250,210,80,260],[460,210,80,260],[670,210,80,260],[50,180,100,70]]}
  ];
  class Game{
    constructor(){this.canvas=$('game');this.ctx=this.canvas.getContext('2d');this.input=new InputManager();this.audio=new AudioManager();this.state='menu';this.level=0;this.score=0;this.best=+(localStorage.getItem('ef-best')||0);this.last=performance.now();this.elapsed=0;this.parked=0;this.crashes=0;this.hitCooldown=0;this.parkCooldown=0;this.bind();this.loadLevel();requestAnimationFrame(t=>this.loop(t))}
    bind(){$('mainBtn').onclick=()=>this.mainAction();$('pauseBtn').onclick=()=>this.togglePause();$('restartBtn').onclick=()=>this.restart();$('soundBtn').onclick=()=>this.updateSound(this.audio.toggle());this.updateSound(this.audio.enabled);addEventListener('blur',()=>{if(this.state==='playing')this.pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.state==='playing')this.pause()})}
    loadLevel(){const L=levels[this.level];this.parked=0;this.levelTime=0;this.spots=L.spots.map((s,i)=>new ParkingSpot(...s,i+1));this.obstacles=L.obs.map(o=>({x:o[0],y:o[1],w:o[2],h:o[3]}));this.parkedCars=[];this.spawn();this.updateHUD()}
    spawn(){const L=levels[this.level],shift=this.parked*7;this.car=new Car(L.start[0]+shift,L.start[1],L.start[2],['#2fa8ff','#ff5964','#ffb627','#9b7bff','#32d583'][this.parked%5])}
    mainAction(){this.audio.init();if(this.state==='menu'||this.state==='gameover'){this.level=0;this.score=0;this.crashes=0;this.elapsed=0;this.loadLevel();this.play()}else if(this.state==='complete'){if(this.level<levels.length-1){this.level++;this.loadLevel();this.play()}else{this.showEnd()}}else if(this.state==='paused')this.play()}
    play(){this.state='playing';$('overlay').classList.add('hidden');this.last=performance.now();$('pauseBtn').textContent='⏸ Pausar'}
    pause(){this.state='paused';this.input.clear();this.showOverlay('Jogo pausado','Respire fundo. Seu carro está seguro.','Continuar',false);$('pauseBtn').textContent='▶ Continuar'}
    togglePause(){if(this.state==='playing')this.pause();else if(this.state==='paused')this.play()}
    restart(){if(this.state==='menu')return;this.score=Math.max(0,this.score-100);this.loadLevel();this.play()}
    showOverlay(title,text,button,instructions=false){$('overlayTitle').textContent=title;$('overlayText').textContent=text;$('mainBtn').textContent=button;$('instructions').style.display=instructions?'grid':'none';$('overlay').classList.remove('hidden')}
    updateSound(on){$('soundBtn').textContent=on?'🔊 Som':'🔇 Sem som';$('soundBtn').setAttribute('aria-pressed',String(on))}
    loop(now){const dt=Math.min((now-this.last)/1000,.035);this.last=now;if(this.state==='playing')this.update(dt);this.draw(now/1000);requestAnimationFrame(t=>this.loop(t))}
    update(dt){this.elapsed+=dt;this.levelTime+=dt;this.hitCooldown-=dt;this.parkCooldown-=dt;const old={x:this.car.x,y:this.car.y,a:this.car.a};this.car.update(dt,this.input);if(this.collides(this.car)){Object.assign(this.car,old);this.car.speed*=-.25;if(this.hitCooldown<=0){this.crashes++;this.score=Math.max(0,this.score-40);this.hitCooldown=.8;this.audio.crash();this.canvas.classList.add('impact');setTimeout(()=>this.canvas.classList.remove('impact'),400);this.toast('💥 Batida! −40 pontos')}}
      const spot=this.spots[this.parked];if(this.parkCooldown<=0&&spot.contains(this.car)&&Math.abs(this.car.speed)<10&&angleDiff(this.car.a,spot.a)<.28){this.parkCooldown=1;this.parkedCars.push(new Car(spot.x,spot.y,spot.a,this.car.color));this.parked++;const precision=Math.round(300+Math.max(0,180-this.levelTime*3));this.score+=precision;this.audio.park();this.toast('✅ Perfeito! +'+precision);this.levelTime=0;if(this.parked>=levels[this.level].cars)this.completeLevel();else this.spawn()}this.updateHUD()}
    collides(car){const pts=car.corners();if(pts.some(p=>p.x<25||p.x>W-25||p.y<25||p.y>H-25))return true;return this.obstacles.some(o=>polyRect(pts,o))||this.parkedCars.some(c=>sat(pts,c.corners()))}
    completeLevel(){this.state='complete';const bonus=Math.max(100,Math.round(800-this.levelTime*5-this.crashes*20));this.score+=bonus;this.saveBest();this.audio.complete();const last=this.level===levels.length-1;this.showOverlay(last?'Você dominou o estacionamento!':'Fase concluída!',`Pontuação: ${this.score} • Batidas: ${this.crashes} • Bônus: ${bonus}`,last?'Ver resultado':'Próxima fase')}
    showEnd(){this.state='gameover';this.saveBest();this.showOverlay('Fim de jogo — parabéns!',`Você concluiu as 5 fases com ${this.score} pontos e ${this.crashes} batidas. Recorde: ${this.best}.`,'Jogar novamente')}
    saveBest(){if(this.score>this.best){this.best=this.score;localStorage.setItem('ef-best',this.best)}localStorage.setItem('ef-level',Math.max(+(localStorage.getItem('ef-level')||1),this.level+1))}
    toast(s){const e=$('message');e.textContent=s;e.classList.add('show');clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>e.classList.remove('show'),1200)}
    updateHUD(){$('phase').textContent=this.level+1;$('score').textContent=this.score;$('time').textContent=formatTime(this.elapsed);$('parked').textContent=this.parked;$('remaining').textContent=levels[this.level].cars-this.parked;$('crashes').textContent=this.crashes;$('best').textContent=this.best}
    draw(t){const c=this.ctx;c.clearRect(0,0,W,H);c.fillStyle='#29353b';c.fillRect(0,0,W,H);c.strokeStyle='#33434b';c.lineWidth=2;for(let x=-H;x<W;x+=80){c.beginPath();c.moveTo(x,0);c.lineTo(x+H,H);c.stroke()}c.fillStyle='#66737a';c.fillRect(0,0,W,25);c.fillRect(0,H-25,W,25);c.fillRect(0,0,25,H);c.fillRect(W-25,0,25,H);c.fillStyle='#f4d35e';for(let x=45;x<W-40;x+=70)c.fillRect(x,H/2-3,36,6);
      this.spots.forEach((s,i)=>s.draw(c,i===this.parked,t));this.obstacles.forEach(o=>{c.fillStyle='#d9574e';roundRect(c,o.x,o.y,o.w,o.h,8);c.fill();c.strokeStyle='#fff';c.lineWidth=5;for(let x=o.x+10;x<o.x+o.w;x+=25){c.beginPath();c.moveTo(x,o.y);c.lineTo(Math.min(x+30,o.x+o.w),o.y+o.h);c.stroke()}});this.parkedCars.forEach(x=>x.draw(c,false));if(this.car)this.car.draw(c,true);if(this.state==='paused'){c.fillStyle='#0006';c.fillRect(0,0,W,H)}}
  }
  function roundRect(c,x,y,w,h,r){c.beginPath();c.roundRect?c.roundRect(x,y,w,h,r):(c.rect(x,y,w,h))}
  function formatTime(s){const m=Math.floor(s/60),q=Math.floor(s%60);return String(m).padStart(2,'0')+':'+String(q).padStart(2,'0')}
  function angleDiff(a,b){let d=Math.abs((a-b)%(Math.PI*2));return Math.min(d,Math.PI*2-d,Math.abs(d-Math.PI))}
  function polyRect(p,o){return sat(p,[{x:o.x,y:o.y},{x:o.x+o.w,y:o.y},{x:o.x+o.w,y:o.y+o.h},{x:o.x,y:o.y+o.h}])}
  function sat(a,b){for(const p of [a,b])for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length],e={x:q.x-p[i].x,y:q.y-p[i].y},axis={x:-e.y,y:e.x};let amin=Infinity,amax=-Infinity,bmin=Infinity,bmax=-Infinity;for(const v of a){const d=v.x*axis.x+v.y*axis.y;amin=Math.min(amin,d);amax=Math.max(amax,d)}for(const v of b){const d=v.x*axis.x+v.y*axis.y;bmin=Math.min(bmin,d);bmax=Math.max(bmax,d)}if(amax<bmin||bmax<amin)return false}return true}
  const game=new Game();
})();
