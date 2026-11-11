/* Optical registration in the comparator only; the source photograph is preserved. */
(() => {
  const root = document.querySelector('.church-slider');
  if (!root) return;
  const stage = root.querySelector('.comparator-stage');
  const photo = root.querySelector('.comparator-photo');
  const ns = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs, parent) => {
    const el = document.createElementNS(ns,tag);
    Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,value));
    parent.append(el); return el;
  };
  // Shared horizontal and vertical bands keep the clock, tower and main roof
  // in register without shearing individual architectural features.
  const x = [[0,0],[.29,.42],[.494,.572],[.97,.92],[1,1]];
  const y = [[0,0],[.03,.048],[.185,.168],[.375,.30],[.815,.68],[1,1]];
  const svg = document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 960 1268');
  svg.setAttribute('preserveAspectRatio','none');
  svg.setAttribute('aria-hidden','true');
  svg.classList.add('church-registered-photo');
  for(let row=0;row<y.length-1;row++) for(let col=0;col<x.length-1;col++) {
    const sx=x[col][0]*960, sy=y[row][0]*1268;
    const sw=(x[col+1][0]-x[col][0])*960, sh=(y[row+1][0]-y[row][0])*1268;
    const tx=x[col][1]*960, ty=y[row][1]*1268;
    const tw=(x[col+1][1]-x[col][1])*960, th=(y[row+1][1]-y[row][1])*1268;
    const tile=make('svg',{x:tx,y:ty,width:tw,height:th,viewBox:`${sx} ${sy} ${sw} ${sh}`,preserveAspectRatio:'none',overflow:'hidden'},svg);
    make('image',{href:photo.getAttribute('src'),x:0,y:0,width:960,height:1268,preserveAspectRatio:'none'},tile);
  }
  photo.addEventListener('load',()=>stage.classList.add('is-registered'),{once:true});
  stage.insertBefore(svg,root.querySelector('.comparator-paint'));
  if(photo.complete&&photo.naturalWidth) stage.classList.add('is-registered');
})();
