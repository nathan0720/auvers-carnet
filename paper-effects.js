/* Small editorial motions, draggable navigation and a real downloadable ticket. */
(() => {
 'use strict';
 const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
 const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const blue=document.querySelector('.blue-transition'),cover=document.querySelector('.closing-scroll');
 const notes=[...document.querySelectorAll('.detail-note')];
 const heading=document.getElementById('details-title');
 // Preserve emphasis and readable words while revealing the heading in order.
 const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT),texts=[];while(walker.nextNode())texts.push(walker.currentNode);
 texts.forEach(node=>{const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{if(!word)return;if(/^\s+$/.test(word))fragment.append(document.createTextNode(word));else{const span=document.createElement('span');span.className='detail-title-word';span.textContent=word;fragment.append(span);}});node.replaceWith(fragment);});
 const words=[...heading.querySelectorAll('.detail-title-word')];
 const progress=el=>clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-el.firstElementChild.offsetHeight));
 let frame=0;
 function render(){
  frame=0;
  const bp=progress(blue),cp=progress(cover),still=reduced.matches;
  blue.style.setProperty('--blue-cover',still?0:1-smooth((bp-.25)/.65));
  blue.style.setProperty('--blue-photo',1);
  blue.style.setProperty('--blue-words',still?0:1-smooth((bp-.25)/.28));
  cover.style.setProperty('--cover-grow',still?1:smooth(cp/.82));
  cover.style.setProperty('--cover-copy',still?1:smooth((cp-.52)/.34));
  const hp=smooth((innerHeight-heading.getBoundingClientRect().top)/innerHeight);
  words.forEach((word,i)=>word.style.setProperty('--word',still?1:smooth((hp-.16-i*.035)/.23)));
  notes.forEach(note=>{
   const image=note.querySelector('figure'),box=image.getBoundingClientRect();
   const focus=still?1:smooth((innerHeight-box.top)/(innerHeight*.65));
   note.style.setProperty('--detail-focus',focus.toFixed(4));
   const copy=note.querySelector('.detail-writing').getBoundingClientRect();
   note.style.setProperty('--ink-draw',still?1:smooth((innerHeight-copy.top)/(innerHeight*.4)));
  });
  updateRail();
  if(!drag){const cut=sheet.querySelector('.ticket-top').getBoundingClientRect().bottom-sheet.getBoundingClientRect().top+9;sheet.style.setProperty('--tear-cut',cut+'px');}
 }
 function request(){if(!frame)frame=requestAnimationFrame(render);}
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request,{passive:true});window.addEventListener('load',request);reduced.addEventListener('change',request);document.fonts?.ready.then(request);
 const rail=document.querySelector('.chapter-rail'),links=[...rail.querySelectorAll('a')],thumb=rail.querySelector('.rail-thumb');
 links.forEach(link=>{link.draggable=false;});
 rail.addEventListener('dragstart',event=>event.preventDefault());
 let dragging=false,moved=false,startY=0,targetScroll=0,scrubFrame=0,suppressClick=false;
 const maximum=()=>Math.max(1,document.documentElement.scrollHeight-innerHeight);
 function anchors(){return links.map(link=>{const hash=link.getAttribute('href');const el=hash==='#parcours'?document.querySelector('.map-intro'):document.querySelector(hash);return clamp(el.getBoundingClientRect().top+scrollY-30,0,maximum());});}
 function updateRail(){
  const positions=anchors();let at=0;
  for(let i=0;i<positions.length-1;i++){if(scrollY>=positions[i])at=i+clamp((scrollY-positions[i])/Math.max(1,positions[i+1]-positions[i]));}
  if(scrollY>=positions.at(-1))at=positions.length-1;
  rail.style.setProperty('--rail-progress',at/Math.max(1,positions.length-1));
  thumb.setAttribute('aria-valuenow',String(Math.round(scrollY/maximum()*100)));
  thumb.setAttribute('aria-valuetext',`${Math.round(scrollY/maximum()*100)} % du carnet`);
 }
 function step(){scrubFrame=0;targetScroll=clamp(targetScroll,0,maximum());const delta=targetScroll-scrollY;if(Math.abs(delta)<.6){scrollTo(0,targetScroll);return;}scrollTo(0,reduced.matches?targetScroll:scrollY+delta*.20);scrubFrame=requestAnimationFrame(step);}
 function aim(y){
  const positions=anchors(),first=links[0].getBoundingClientRect(),last=links.at(-1).getBoundingClientRect();
  const at=clamp((y-(first.top+first.height/2))/Math.max(1,last.top-first.top))*(positions.length-1);
  const i=Math.min(positions.length-2,Math.floor(at));targetScroll=positions[i]+(positions[i+1]-positions[i])*(at-i);
  if(!scrubFrame)scrubFrame=requestAnimationFrame(step);
 }
 rail.addEventListener('pointerdown',event=>{if(event.button!==0)return;cancelAnimationFrame(scrubFrame);scrubFrame=0;suppressClick=false;dragging=true;moved=false;startY=event.clientY;rail.classList.add('is-held');});
 rail.addEventListener('pointermove',event=>{
  links.forEach(link=>{const r=link.getBoundingClientRect(),distance=Math.abs(event.clientY-r.top-r.height/2);link.style.setProperty('--tick-wave',Math.max(0,1-distance/75));});
  if(!dragging)return;if(Math.abs(event.clientY-startY)>4&&!moved){moved=true;rail.setPointerCapture(event.pointerId);}
  if(moved){event.preventDefault();rail.classList.add('is-scrubbing');aim(event.clientY);}
 });
 function release(event){if(!dragging)return;if(moved){cancelAnimationFrame(scrubFrame);scrubFrame=0;scrollTo(0,clamp(targetScroll,0,maximum()));}dragging=false;suppressClick=moved;rail.classList.remove('is-held','is-scrubbing');if(rail.hasPointerCapture(event.pointerId))rail.releasePointerCapture(event.pointerId);}
 window.addEventListener('pointerup',release);rail.addEventListener('pointercancel',event=>{release(event);suppressClick=false;cancelAnimationFrame(scrubFrame);scrubFrame=0;});
 rail.addEventListener('keydown',()=>{suppressClick=false;});
 rail.addEventListener('click',event=>{if(!moved){cancelAnimationFrame(scrubFrame);scrubFrame=0;}if(suppressClick||event.target===thumb){event.preventDefault();event.stopImmediatePropagation();suppressClick=false;}},true);
 rail.addEventListener('pointerleave',()=>{if(!dragging)links.forEach(link=>link.style.removeProperty('--tick-wave'));});
 window.addEventListener('pointermove',event=>{if(dragging)return;const rect=rail.getBoundingClientRect();const near=clamp(1-Math.max(0,rect.left-event.clientX)/100);rail.style.setProperty('--rail-near',near);},{passive:true});
 window.addEventListener('auvers:navigation',()=>{cancelAnimationFrame(scrubFrame);scrubFrame=0;});
 window.addEventListener('pointerdown',event=>{if(!rail.contains(event.target)){cancelAnimationFrame(scrubFrame);scrubFrame=0;}},{passive:true});
 ['wheel','touchstart'].forEach(name=>window.addEventListener(name,()=>{cancelAnimationFrame(scrubFrame);scrubFrame=0;},{passive:true}));
 thumb.addEventListener('keydown',event=>{let amount=0;if(event.key==='ArrowDown'||event.key==='ArrowRight')amount=.025;if(event.key==='ArrowUp'||event.key==='ArrowLeft')amount=-.025;if(event.key==='PageDown')amount=.1;if(event.key==='PageUp')amount=-.1;if(amount||['Home','End'].includes(event.key)){event.preventDefault();targetScroll=event.key==='Home'?0:event.key==='End'?maximum():clamp(scrollY/maximum()+amount)*maximum();if(!scrubFrame)scrubFrame=requestAnimationFrame(step);}});
 // A real-time jagged tear: the detached paper follows the grabbed corner.
 const sheet=document.querySelector('.ticket-sheet'),tear=sheet.querySelector('.ticket-tear'),status=sheet.querySelector('.ticket-download-status');
 tear.draggable=false;tear.addEventListener('dragstart',event=>event.preventDefault());
 const ns='http://www.w3.org/2000/svg';
 let drag=null,fragment=null,seam=null,guide=null,curl=null,cast=null,tearFrame=0,busy=false,suppress=false;
 function openPDF(){const a=document.createElement('a');a.href=tear.href;a.target='_blank';a.rel='noopener noreferrer';a.hidden=true;document.body.append(a);a.click();a.remove();status.textContent='Le billet PDF a été ouvert dans un nouvel onglet.';tear.querySelector('.tear-label').textContent='SUIVRE LA LIGNE · PDF';}
 function begin(x,y){
  const r=sheet.getBoundingClientRect();drag={x,y,dx:0,dy:0,p:0,r,cut:parseFloat(getComputedStyle(sheet).getPropertyValue('--tear-cut'))||58};
  fragment=sheet.cloneNode(true);
  const sourceNodes=[sheet,...sheet.querySelectorAll('*')],copyNodes=[fragment,...fragment.querySelectorAll('*')];
  const retained=['font-family','font-size','font-weight','font-style','line-height','letter-spacing','color','padding','margin','width','max-width','height','min-height','box-sizing','display','gap','grid-template-columns','align-items','border-top','border-bottom','text-transform'];
  sourceNodes.forEach((node,i)=>{if(node.classList.contains('typed-char'))return;const style=getComputedStyle(node);retained.forEach(property=>copyNodes[i].style.setProperty(property,style.getPropertyValue(property)));});
  fragment.className='ticket-sheet tear-fragment';fragment.inert=true;fragment.setAttribute('aria-hidden','true');
  fragment.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));fragment.querySelectorAll('.ticket-tear,.ticket-download-status').forEach(el=>el.remove());
  Object.assign(fragment.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',margin:'0',maxWidth:'none',maxHeight:'none',zIndex:'150',transformOrigin:'100% 100%',visibility:'visible'});
  document.body.append(fragment);
  cast=document.createElement('div');cast.className='paper-cast-shadow';cast.innerHTML='<div></div>';Object.assign(cast.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});document.body.append(cast);
  curl=document.createElementNS(ns,'svg');curl.classList.add('paper-curl');curl.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);Object.assign(curl.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
  curl.innerHTML='<defs><linearGradient id="paper-curl-light" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf4"/><stop offset=".4" stop-color="#eee7d2"/><stop offset=".76" stop-color="#b5aa8c"/><stop offset="1" stop-color="#fbf5e5"/></linearGradient></defs><path class="curl-shade"/><path class="curl-back"/><path class="curl-rim"/>';document.body.append(curl);
  guide=tear.cloneNode(true);guide.removeAttribute('href');guide.removeAttribute('download');guide.setAttribute('aria-hidden','true');guide.inert=true;guide.classList.add('tear-live-guide');Object.assign(guide.style,{position:'fixed',left:r.left+'px',right:'auto',top:(r.top+drag.cut-22)+'px',visibility:'visible',zIndex:'152',pointerEvents:'none'});guide.style.setProperty('width',r.width+'px','important');document.body.append(guide);
  seam=document.createElementNS(ns,'svg');seam.classList.add('tear-seam');seam.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);Object.assign(seam.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
  const bridge=document.createElementNS(ns,'path');bridge.setAttribute('class','tear-paper-bridge');seam.append(bridge);
  for(const name of ['tear-edge-shadow','tear-edge-fibres']){const path=document.createElementNS(ns,'path');path.setAttribute('class',name);seam.append(path);}document.body.append(seam);
  sheet.classList.add('is-ripping');document.body.classList.add('paper-grabbed');draw();
 }
 function draw(){
  if(!drag)return;const {p,r,dx,dy}=drag,w=r.width,h=r.height,cut=drag.cut,front=24+(w-48)*(1-p);
  // Tear across the binding, never diagonally through the printed text.
  const line=[];const steps=Math.ceil(w/5);
  for(let i=0;i<=steps;i++){const x=w*i/steps,rough=x>=front?(Math.sin(i*12.3)*1.1+Math.cos(i*4.2)*.7):0;line.push([x,cut+rough]);}
  const polygon=points=>'polygon('+points.map(v=>v.map(n=>n.toFixed(2)+'px').join(' ')).join(',')+')';
  sheet.style.clipPath=polygon([[0,0],[w,0],...line.toReversed()]);
  const lift=reduced.matches?0:Math.sin(p*Math.PI/2)*64;
  const bowed=line.map(([x,y])=>[x,y+(x>front?lift*((x-front)/Math.max(1,w-front))**1.65:0)]);
  fragment.style.clipPath=polygon([...bowed,[w,h],[0,h]]);
  const origin=`${front}px ${cut}px`,motion=`perspective(1100px) translate3d(${dx}px,${dy}px,${lift*.65}px) rotateX(${-p*6}deg) rotateY(${-p*8.5}deg) rotateZ(${-p*.45}deg)`;
  fragment.style.setProperty('transform-origin',origin,'important');fragment.style.transform=motion;fragment.style.filter='none';
  cast.firstElementChild.style.clipPath=polygon([...bowed,[w,h],[0,h]]);cast.style.opacity=String(Math.sin(p*Math.PI/2)*.58);cast.style.filter=`blur(${5+lift*.25}px)`;cast.style.transform=`translate(${dx+lift*.38}px,${dy+lift*.78}px) scale(.995)`;
  curl.style.transformOrigin=origin;curl.style.transform=motion;
  const span=w-front,tip=cut+lift,band=lift*.83;
  const edge=`M ${front} ${cut} C ${front+span*.45} ${cut} ${w-span*.28} ${tip-lift*.35} ${w} ${tip}`;
  const flap=edge+` L ${w} ${tip+band} C ${w-span*.38} ${tip+band-lift*.18} ${front+span*.22} ${cut+band*.35} ${front} ${cut} Z`;
  curl.querySelector('.curl-back').setAttribute('d',flap);curl.querySelector('.curl-shade').setAttribute('d',flap);curl.querySelector('.curl-rim').setAttribute('d',edge);curl.style.opacity=String(smooth(p/.12));
  // The unbroken binding bends between the fixed stub and the moving page.
  const bridge=seam.querySelector('.tear-paper-bridge');
  bridge.setAttribute('d',`M 0 ${cut-1} L ${front} ${cut-1} L ${front+dx} ${cut+dy+3} L ${dx} ${cut+dy+3} Z`);
  bridge.style.opacity=String(1-smooth((p-.85)/.15));
  sheet.style.setProperty('--line-progress',p);
  if(guide){guide.style.setProperty('--line-progress',p);guide.querySelector('.tear-label').textContent=tear.querySelector('.tear-label').textContent;}
  const torn=line.filter(point=>point[0]>=front);
  seam.querySelectorAll('.tear-edge-shadow,.tear-edge-fibres').forEach(path=>path.setAttribute('d',torn.map((pt,i)=>(i?'L':'M')+pt.join(' ')).join(' ')));
  tear.querySelector('.tear-label').textContent=p>=.985?'RELÂCHER POUR EMPORTER LE PDF':p>.02?`SUIVRE LA LIGNE · ${Math.round(p*100)} %`:'DÉCHIRER LE LONG DU BORD · PDF';
 }
 function clean(){if(curl)curl.remove();if(cast)cast.remove();curl=cast=null;if(guide)guide.remove();guide=null;if(fragment)fragment.remove();if(seam)seam.remove();fragment=seam=null;drag=null;busy=false;sheet.classList.remove('is-ripping','is-off-track');sheet.style.setProperty('--line-progress',0);sheet.style.clipPath='';document.body.classList.remove('paper-grabbed');tear.querySelector('.tear-label').textContent='DÉCHIRER LE LONG DU BORD · PDF';}
 function returnPaper(){
  const start={...drag},began=performance.now();busy=true;
  function tick(now){const t=reduced.matches?1:clamp((now-began)/650),ease=1-(1-t)**3;drag.p=start.p*(1-ease);drag.dx=start.dx*(1-ease);drag.dy=start.dy*(1-ease);draw();if(t<1)tearFrame=requestAnimationFrame(tick);else clean();}tearFrame=requestAnimationFrame(tick);
 }
 function finish(){
  busy=true;drag.p=1;draw();openPDF();seam.remove();seam=null;if(guide)guide.remove();guide=null;
  const copy=fragment;if(curl)curl.remove();if(cast)cast.remove();curl=cast=null;sheet.style.clipPath='';sheet.classList.add('paper-replaced');
  if(reduced.matches){clean();sheet.classList.remove('paper-replaced');return;}
  const motion=copy.animate([{transform:copy.style.transform,opacity:1},{transform:`translate(${drag.dx+75}px,${drag.dy-110}px) rotate(-12deg)`,opacity:0}],{duration:650,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'});
  motion.finished.then(()=>{clean();sheet.classList.remove('paper-replaced');});
 }
 tear.addEventListener('pointerdown',event=>{
  if(event.button!==0||busy)return;event.preventDefault();suppress=false;
  const rect=sheet.getBoundingClientRect();
  if(Math.abs(event.clientX-(rect.right-24))>38){status.textContent='Commencez au repère à droite, puis suivez la ligne vers la gauche.';tear.classList.add('show-start');setTimeout(()=>tear.classList.remove('show-start'),1200);return;}
  begin(event.clientX,event.clientY);tear.setPointerCapture(event.pointerId);
 });
 tear.addEventListener('pointermove',event=>{
  if(!drag||busy)return;event.preventDefault();
  const tolerance=event.pointerType==='touch'?34:25;
  const onLine=Math.abs(event.clientY-(drag.r.top+drag.cut))<=tolerance;
  sheet.classList.toggle('is-off-track',!onLine);
  if(!onLine){tear.querySelector('.tear-label').textContent='REVENIR SUR LA LIGNE';if(guide)guide.querySelector('.tear-label').textContent='REVENIR SUR LA LIGNE';return;}
  const next=clamp((drag.r.right-24-event.clientX)/(drag.r.width-48));
  drag.p=Math.max(drag.p,next);drag.dx=-drag.p*9;drag.dy=drag.p*18;draw();
 });
 tear.addEventListener('pointerup',event=>{
  if(!drag||busy)return;suppress=true;if(tear.hasPointerCapture(event.pointerId))tear.releasePointerCapture(event.pointerId);
  if(drag.p>=.985&&!sheet.classList.contains('is-off-track'))finish();else returnPaper();
 });
 tear.addEventListener('pointercancel',()=>{if(drag&&!busy){suppress=true;returnPaper();}});
 tear.addEventListener('click',event=>{
  event.preventDefault();if(suppress){suppress=false;return;}if(busy)return;
  // Keyboard users get the same visible tear without requiring a pointer gesture.
  if(event.detail===0){const r=sheet.getBoundingClientRect();begin(r.right-24,r.top+(parseFloat(getComputedStyle(sheet).getPropertyValue('--tear-cut'))||58));busy=true;const began=performance.now();function tick(now){const p=reduced.matches?1:clamp((now-began)/650);drag.p=p;drag.dx=-p*9;drag.dy=p*18;draw();if(p<1)tearFrame=requestAnimationFrame(tick);else finish();}tearFrame=requestAnimationFrame(tick);}
  else status.textContent='Commencez au repère à droite et suivez la ligne jusqu’à gauche.';
 });
 window.addEventListener('resize',()=>{if(drag&&!busy){cancelAnimationFrame(tearFrame);clean();}});
 request();
})();
