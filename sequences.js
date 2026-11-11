/* Reversible scroll chapters and the discreet chapter rail. */
(() => {
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=x=>Math.max(0,Math.min(1,x));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 const feelings=document.querySelector('.feeling-scroll');
 const frame=document.querySelector('.frame-scroll');
 const souvenir=document.querySelector('.souvenir-scroll');
 const track=document.querySelector('.souvenir-track');
 const railLinks=[...document.querySelectorAll('.chapter-rail a')];
 const railTargets=railLinks.map(a=>document.querySelector(a.getAttribute('href')));
 let scheduled=false;
 const progress=el=>clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-el.firstElementChild.offsetHeight));
 function render(){
  scheduled=false;
  let selected=0;
  railTargets.forEach((el,i)=>{if(el&&el.getBoundingClientRect().top<=innerHeight*.4)selected=i;});
  railLinks.forEach((link,i)=>{if(i===selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  const p=progress(feelings), change=smooth((p-.32)/.36);
  feelings.style.setProperty('--change',change);
  feelings.style.setProperty('--phrase-out',smooth((p-.25)/.22));
  feelings.style.setProperty('--phrase-in',smooth((p-.53)/.22));
  feelings.querySelectorAll('.feeling-page').forEach((el,i)=>{
   el.inert=!reduced.matches&&(i===0?change>.5:change<=.5);
   if(el.inert)el.setAttribute('aria-hidden','true');else el.removeAttribute('aria-hidden');
  });
  const z=smooth(progress(frame));frame.style.setProperty('--frame-scale',reduced.matches?1:1.14-.14*z);
  frame.style.setProperty('--frame-copy',reduced.matches?1:smooth((z-.04)/.42));
  const distance=Math.max(0,track.scrollWidth-souvenir.clientWidth+parseFloat(getComputedStyle(track).paddingLeft));
  track.style.transform=reduced.matches?'none':`translateX(${-distance*progress(souvenir)}px)`;
 }
 function request(){if(!scheduled){scheduled=true;requestAnimationFrame(render);}}
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request,{passive:true});window.addEventListener('load',request);reduced.addEventListener('change',request);document.fonts?.ready.then(request);request();

})();
