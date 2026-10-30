(() => {
 const gate=document.querySelector('#archive-gate');
 const button=document.querySelector('#open-archive');
 const html=document.documentElement;
 if(!gate||!button){html.classList.remove('archive-pending');return;}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 let opening=false,transition=null;
 const lastLink=document.querySelector('body>header>a:last-child');
 if(lastLink){const end=document.createElement('div');end.className='header-end';lastLink.before(end);const replay=document.createElement('button');replay.type='button';replay.className='archive-reclose';replay.textContent='合上档案';replay.setAttribute('aria-label','合上档案，回到档案袋封面');replay.addEventListener('click',showCover);end.append(replay,lastLink);}
 const folder=document.querySelector('.folder');
 if(folder&&!folder.querySelector('.archive-spine')){folder.insertAdjacentHTML('afterbegin','<span class="archive-spine" aria-hidden="true"></span><span class="archive-clip" aria-hidden="true"></span>');}
 const help=document.querySelector('.archive-controls>p');if(help)help.textContent='点击页签或左右滑动，翻阅不同档案';
 const counts={content:'4 则实践',works:'5 份作品',accounts:'3 个账号',practice:'4 项探索'};
 function enrichPaper(){
  const paper=document.querySelector('#paper');if(!paper)return;
  const note=paper.querySelector('.paper-title>span');
  const active=document.querySelector('[data-tab][aria-selected="true"]');
  if(note&&!note.dataset.enriched){const n=Number(active?.dataset.tab||0);const index=['content','works','accounts','practice'][n];note.append(document.createElement('br'),document.createTextNode(counts[index]));note.dataset.enriched='true';}
  const details={autumn:'5 张图文 · 查看 IP 与栏目规划',life:'4 张物料 · 查看互动玩法',weekly:'播放视频 · 查看制作流程',runba:'查看赛事前中后宣与现场执行'};
  paper.querySelectorAll('.maincase .case-link').forEach(b=>{const text=details[b.dataset.project];if(!text||b.querySelector('.case-evidence'))return;const label=document.createElement('span');label.className='case-evidence';label.textContent=text;b.append(label);});
  paper.querySelectorAll('.mini-case').forEach(b=>{b.title=details[b.dataset.project]||'查看案例';});
 }
 enrichPaper();const paper=document.querySelector('#paper');if(paper)new MutationObserver(enrichPaper).observe(paper,{childList:true});
 function showCover(){
  if(opening||gate.open)return;
  document.body.classList.remove('archive-entered');
  gate.hidden=false;gate.classList.remove('is-untying','is-unfolding','is-extracting','is-revealing');
  gate.querySelector('.archive-transfer-sheet')?.remove();button.disabled=false;
  document.querySelector('#entry-status').textContent='点击档案袋，解开封绳。';
  html.classList.add('archive-gated');
  try{gate.showModal();button.focus({preventScroll:true});}catch{html.classList.remove('archive-pending','archive-gated');gate.hidden=true;}
 }
 function makeTransfer(){
  const target=document.querySelector('#paper'),insert=gate.querySelector('.insert-front');if(!target||!insert)return null;
  const from=insert.getBoundingClientRect(),to=target.getBoundingClientRect();
  if(to.width<=0||to.height<=0)return null;
  const sheet=document.createElement('div');sheet.className='archive-transfer-sheet';sheet.setAttribute('aria-hidden','true');sheet.inert=true;
  const clone=target.cloneNode(true);clone.removeAttribute('id');clone.removeAttribute('tabindex');clone.removeAttribute('role');clone.removeAttribute('aria-labelledby');clone.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));clone.querySelectorAll('button,a,input').forEach(e=>e.setAttribute('tabindex','-1'));sheet.append(clone);
  Object.assign(sheet.style,{left:`${to.left}px`,top:`${to.top}px`,width:`${to.width}px`,height:`${to.height}px`});gate.append(sheet);
  const start=`translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width},${from.height/to.height}) rotate(-3deg)`;
  transition=sheet.animate([{transform:start,opacity:.78,offset:0},{opacity:1,offset:.2},{transform:'translate(0,0) scale(1,1) rotate(-.4deg)',opacity:1,offset:1}],{duration:700,easing:'cubic-bezier(.22,.7,.18,1)',fill:'both'});
  return transition.finished.catch(()=>{});
 }
 async function openArchive(quick=false){
  if(opening||!gate.open)return;opening=true;button.disabled=true;
  try{
   if(!quick&&!reduced.matches){
    gate.classList.add('is-untying');document.querySelector('#entry-status').textContent='正在解开封绳…';
    await wait(250);gate.classList.add('is-unfolding');
    await wait(550);gate.classList.add('is-extracting');
    await wait(610);
    html.classList.remove('archive-pending');
    const finished=makeTransfer();gate.classList.add('is-revealing');
    if(finished)await finished;else await wait(650);
   }
  }finally{
   transition?.cancel();transition=null;gate.querySelector('.archive-transfer-sheet')?.remove();
   if(gate.open)gate.close();gate.hidden=true;
   html.classList.remove('archive-pending','archive-gated');document.body.classList.add('archive-entered');
   opening=false;button.disabled=false;
   // Keep deep-linked project dialogs focused; otherwise start at the page header.
   if(!document.querySelector('#project-dialog')?.open&&gate.classList.contains('keyboard-mode'))document.querySelector('.wordmark')?.focus({preventScroll:true});
  }
 }
 document.addEventListener('keydown',e=>{if(e.key==='Tab')gate.classList.add('keyboard-mode');});
 gate.addEventListener('pointerdown',()=>gate.classList.remove('keyboard-mode'));
 button.addEventListener('click',()=>openArchive());
 gate.addEventListener('cancel',e=>{e.preventDefault();if(!opening)openArchive(true);});
 showCover();
})();
