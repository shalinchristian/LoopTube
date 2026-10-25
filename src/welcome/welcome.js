// word-by-word title
(function(){
  const h=document.getElementById('title');
  const words=h.textContent.trim().split(' ');
  h.textContent='';
  words.forEach((w,i)=>{const s=document.createElement('span');s.className='w';s.textContent=w;s.style.animationDelay=(1.35+i*.14)+'s';h.appendChild(s);if(i<words.length-1)h.appendChild(document.createTextNode(' '));});
})();
// cursor-following glow
(function(){
  const f=document.getElementById('follow');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let x=innerWidth/2,y=innerHeight/3;f.style.transform='translate('+(x-innerWidth*.2)+'px,'+(y-innerWidth*.2)+'px)';
  addEventListener('pointermove',e=>{const r=f.offsetWidth/2;f.style.transform='translate('+(e.clientX-r)+'px,'+(e.clientY-r)+'px)';},{passive:true});
})();
// cards: staggered reveal + 3D tilt
(function(){
  const cards=[...document.querySelectorAll('.fc')];
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const i=cards.indexOf(e.target);setTimeout(()=>e.target.classList.add('in'),i*90);io.unobserve(e.target);}}),{threshold:.2});
  cards.forEach(c=>io.observe(c));
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||matchMedia('(hover: none)').matches)return;
  cards.forEach(c=>{
    c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;c.style.transition='transform .1s ease';c.style.transform='rotateY('+(px*10)+'deg) rotateX('+(-py*10)+'deg) translateZ(6px)';});
    c.addEventListener('pointerleave',()=>{c.style.transition='transform .5s cubic-bezier(.2,.8,.2,1)';c.style.transform='';});
  });
})();
