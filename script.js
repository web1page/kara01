const card=document.querySelector('#businessCard');const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(card&&!reduceMotion&&window.matchMedia('(pointer: fine)').matches){card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1100px) rotateY(${x*2.2}deg) rotateX(${-y*2.2}deg)`});card.addEventListener('pointerleave',()=>card.style.transform='perspective(1100px) rotateY(0) rotateX(0)')}
(()=>{
 const canvas=document.getElementById('particleCanvas'); if(!canvas)return;
 const ctx=canvas.getContext('2d'); let w=0,h=0,pts=[],raf=0,dpr=1;
 const pointer={x:-1000,y:-1000,active:false,until:0};
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);w=innerWidth;h=innerHeight;
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
  const n=Math.min(650,Math.max(260,Math.floor(w*h/1500)));
  pts=Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.42,vy:(Math.random()-.5)*.42,r:.8+Math.random()*1.25,phase:Math.random()*6.28}));
 }
 function interact(x,y){pointer.x=x;pointer.y=y;pointer.active=true;pointer.until=performance.now()+1800;}
 function onPointer(e){interact(e.clientX,e.clientY)}
 function onTouch(e){if(e.touches&&e.touches.length)interact(e.touches[0].clientX,e.touches[0].clientY)}
 function draw(){
  ctx.clearRect(0,0,w,h);const now=performance.now();if(now>pointer.until)pointer.active=false;
  // Draw a connected particle network: every nearby particle connects to its neighbors,
  // and nearby particles connect directly to the cursor/finger point.
  const linkDist=105;
  for(let i=0;i<pts.length;i++){
   const a=pts[i];
   if(!reduced){
    a.x+=a.vx;a.y+=a.vy;a.phase+=.022;
    if(a.x<0)a.x=w;if(a.x>w)a.x=0;if(a.y<0)a.y=h;if(a.y>h)a.y=0;
    if(pointer.active){
     const dx=a.x-pointer.x,dy=a.y-pointer.y,d=Math.hypot(dx,dy);
     if(d<155&&d>0.1){const f=(155-d)/155*.095;a.vx+=(dx/d)*f;a.vy+=(dy/d)*f;}
    }
    a.vx*=.994;a.vy*=.994;const sp=Math.hypot(a.vx,a.vy);if(sp>1.5){a.vx*=1.5/sp;a.vy*=1.5/sp;}
   }
   // Neighbor links are drawn between dots, not as a starburst.
   for(let j=i+1;j<pts.length;j++){
    const b=pts[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);
    if(d<linkDist){
     const alpha=(1-d/linkDist)*.28;
     ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
     ctx.strokeStyle=`rgba(255,255,255,${alpha})`;ctx.lineWidth=.55;ctx.stroke();
    }
   }
   if(pointer.active){
    const d=Math.hypot(a.x-pointer.x,a.y-pointer.y);
    if(d<190){
     ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(pointer.x,pointer.y);
     ctx.strokeStyle=`rgba(255,255,255,${(1-d/190)*.9})`;
     ctx.lineWidth=d<75?1.05:.75;ctx.stroke();
    }
   }
  }
  for(const p of pts){
   const alpha=.55+.4*(Math.sin(p.phase)+1)/2;
   ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
   ctx.fillStyle=`rgba(255,255,255,${alpha})`;ctx.shadowBlur=4;ctx.shadowColor='rgba(255,255,255,.9)';ctx.fill();ctx.shadowBlur=0;
  }
  if(pointer.active){
   // Small cursor node: connected to nearby particles; deliberately no radial rays.
   ctx.beginPath();ctx.arc(pointer.x,pointer.y,3,0,Math.PI*2);
   ctx.fillStyle='#fff';ctx.shadowBlur=12;ctx.shadowColor='#fff';ctx.fill();ctx.shadowBlur=0;
  }
  if(!reduced)raf=requestAnimationFrame(draw);
 }
 window.addEventListener('pointermove',onPointer,{passive:true});
 window.addEventListener('pointerdown',onPointer,{passive:true});
 window.addEventListener('touchstart',onTouch,{passive:true});
 window.addEventListener('touchmove',onTouch,{passive:true});
 window.addEventListener('resize',resize,{passive:true});
 resize();draw();
})();