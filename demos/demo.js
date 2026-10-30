'use strict';
const root=document.querySelector('#demo-root');
const kind=document.body.dataset.demo;
const embedded=window.parent!==window;
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const heading=(name,en,line)=>`<header class="demo-heading"><div><small class="eyebrow">${en} / INTERACTIVE DEMO</small><h1>${name}<span class="demo-label">可点击体验 · 无需安装</span></h1><p>${line}</p></div><button class="reset" data-action="reset">↺ 重新体验</button></header>`;
const bank=[
 {word:'abandon',phonetic:'/əˈbændən/',meaning:'放弃；抛弃',options:['吸收；理解','放弃；抛弃','扩大；增强','承认；认可'],hint:'常见搭配：abandon a plan / idea，把计划或想法放弃。'},
 {word:'brief',phonetic:'/briːf/',meaning:'简短的；摘要',options:['勇敢的','复杂的','简短的；摘要','准确的'],hint:'brief meeting 表示短会，brief summary 表示简短总结。'},
 {word:'admit',phonetic:'/ədˈmɪt/',meaning:'承认；准许进入',options:['拒绝','预测','修复','承认；准许进入'],hint:'admit a mistake 表示承认错误。'},
 {word:'efficient',phonetic:'/ɪˈfɪʃnt/',meaning:'高效的',options:['高效的','昂贵的','相似的','焦虑的'],hint:'efficient 强调用更少时间或资源完成事情。'},
 {word:'priority',phonetic:'/praɪˈɔːrəti/',meaning:'优先事项',options:['可能性','比例','优先事项','证据'],hint:'top priority 表示最高优先级。'}
];
const apps=[['short','◒','短视频'],['community','✦','内容社区'],['video','▷','视频平台']];
let wl,refState,matchTimer;
function reset(){
 clearTimeout(matchTimer);
 if(kind==='wordlock'){wl={screen:'home',count:3,minutes:5,target:'short',enabled:true,index:0,answer:null,learned:0,bypasses:0,deadline:0,message:'',bypassed:false};renderWordlock();}
 else{refState={id:null,sourceId:null,tab:'abstract',loading:false,query:'',searched:false};renderYinzhi();}
}
function app(){return apps.find(a=>a[0]===wl.target);}
function goQuiz(){wl.index=0;wl.answer=null;wl.screen='quiz';wl.message='';renderWordlock();}
function finishSession(bypass){
 wl.deadline=Date.now()+wl.minutes*60000;wl.bypassed=bypass;
 if(bypass)wl.bypasses++;else wl.learned+=wl.count;
 wl.screen='target';wl.message='';renderWordlock();
}
function homeScreen(){return `<div class="brandline"><span class="app-symbol">词</span><div><h2>词锁</h2><small>WORDLOCK</small></div></div><p class="tagline">让每一次打开，都有收获。</p><div class="stats"><div><small>本次演示累计学习</small><b>${wl.learned}</b><span>词</span></div><div><small>紧急放行</small><b>${wl.bypasses}</b><span>次</span></div></div><div class="service"><i style="${wl.enabled?'':'background:#c8ad77'}"></i><span>${wl.enabled?'守护已开启':'守护尚未开启'} · 模拟状态</span><button data-action="toggle-service">${wl.enabled?'关闭':'开启'}</button></div><section class="setting"><h3>每次学习</h3><div class="choice-row">${[1,3,5].map(n=>`<button data-action="count" data-value="${n}" aria-pressed="${wl.count===n}" class="${wl.count===n?'active':''}">${n} 个单词</button>`).join('')}</div></section><section class="setting"><h3>放行时长</h3><div class="choice-row minutes">${[1,5,10,15,30].map(n=>`<button data-action="minutes" data-value="${n}" aria-pressed="${wl.minutes===n}" class="${wl.minutes===n?'active':''}">${n} 分钟</button>`).join('')}</div></section><section class="setting"><h3>选择守护应用</h3><div class="app-list">${apps.map(([id,icon,name])=>`<button data-action="target" data-value="${id}" aria-pressed="${wl.target===id}" class="app-choice ${wl.target===id?'active':''}"><span class="mini-icon">${icon}</span>${name}</button>`).join('')}</div></section><button class="primary" data-action="launch">模拟打开${app()[2]} →</button><p class="screen-foot">选择一种应用，看看打开前会发生什么。</p>`;}
function quizScreen(){
 const w=bank[wl.index],answered=wl.answer!==null,correct=wl.answer===w.meaning;
 return `<div class="quiz-head"><b>词锁</b><button class="text-btn" data-action="bypass">紧急放行 ↗</button></div><div class="quiz-progress"><span>本次学习</span><b>${wl.index+1} / ${wl.count}</b></div><div class="progress-track"><span style="width:${(wl.index+(answered?1:0))/wl.count*100}%"></span></div><div class="word-label">选择正确释义</div><div class="word-title">${w.word}</div><div class="phonetic">${w.phonetic}</div><div class="answers">${w.options.map((o,i)=>`<button data-action="answer" data-value="${i}" class="answer ${answered?(o===w.meaning?'correct':o===wl.answer?'wrong':''):''}" ${answered?'disabled':''}><span>${String.fromCharCode(65+i)}</span>${o}</button>`).join('')}</div>${answered?`<div class="feedback ${correct?'':'wrong'}" role="status"><b>${correct?'答对了 ✓':'再记住这个词'}</b><p>${correct?'':`正确释义：${w.meaning}。`}${w.hint}</p></div>`:''}<button class="primary" data-action="next" ${answered?'':'disabled'}>${wl.index===wl.count-1?`完成并进入${app()[2]}`:'下一词 →'}</button><p class="screen-foot">${app()[2]} · 完成后放行 ${wl.minutes} 分钟</p>`;
}
function targetScreen(){return `<div class="success-ring">${wl.enabled?'✓':'▷'}</div><h2>${wl.enabled?(wl.bypassed?'已临时放行':'可以进入了'):'直接进入应用'}</h2><p>${wl.enabled?(wl.bypassed?'紧急使用时，无需完成本轮测验。':'先完成一小段学习，再继续原来的事。'):'守护关闭时，不触发学习任务。'}</p><div class="target-tile"><span class="mini-icon">${app()[1]}</span><h3>${app()[2]}</h3><p>这是目标应用的模拟页面</p></div><div class="remaining">${wl.enabled?`放行时长 ${wl.minutes} 分钟 · 当前处于放行期`:'守护未开启'}</div><button class="primary" data-action="reopen">再次打开${app()[2]}</button><button class="secondary" data-action="home">返回词锁设置</button>${wl.enabled?'<button class="text-btn" data-action="expire">跳过等待，演示放行到期 →</button>':''}<div class="demo-message" role="status">${wl.message}</div><p class="screen-foot">网页不会打开或控制您设备上的应用。</p>`;}
function renderWordlock(){
 const step=wl.screen==='home'?0:wl.screen==='quiz'?(wl.answer===null&&wl.index===0?1:2):3;
 const descriptions=[['先定一个小目标','选择应用、学习数量和放行时长。'],['在打开前提醒一下','模拟打开应用，触发单词任务。'],['完成一次微学习','点击释义，查看反馈并继续。'],['把使用权还给用户','体验正常放行或紧急放行。']];
 root.innerHTML=heading('词锁','WORDLOCK','把打开娱乐应用的瞬间，变成一次微学习。试着点击手机中的选项。')+`<div class="workbench"><div class="phone-stage"><div class="phone"><div class="phone-top"><span>09:41</span><span>▮▮ ▰</span></div><div class="phone-screen ${wl.screen==='target'?'target-view':''}">${wl.screen==='home'?homeScreen():wl.screen==='quiz'?quizScreen():targetScreen()}</div><div class="phone-bottom"></div></div></div><aside class="guide-panel"><small class="guide-kicker">TRY IT YOURSELF</small><h2>先学一点，<br>再打开。</h2><ol class="steps">${descriptions.map(([h,p],i)=>`<li class="${i===step?'active':i<step?'done':''}" ${i===step?'aria-current="step"':''}><span>0${i+1}</span><div><b>${h}</b><p>${p}</p></div></li>`).join('')}</ol><div class="decision"><small>一次体验中的取舍</small><p>保留学习约束，也保留紧急使用的出口。放行期间再次打开，不需要重复答题。</p></div></aside></div><p class="demo-disclosure">依据安卓项目的核心流程制作的网页交互演示，沿用学习数量、放行时长与内置测试词。此页不调用手机无障碍服务；学习数据仅来自本次演示，刷新或重置后清空。安卓版本已完成安装并投入个人日常使用。</p>`;
}
const refs={
 a:{citation:'示例作者，2026',title:'数字写作中的信息切换',author:'示例作者 · 2026 · 演示文献 A',context:'在写作过程中，频繁离开正文查找引用，会打断原有的思路。',abstract:'本段为演示摘要，用于展示查阅文献时的信息布局。正文选中的引用与侧栏文献相对应，读者可以在不离开当前段落的情况下，查看文献概况并回到写作。',note:'写作笔记示例：这一篇对应“查找引用会打断思路”的问题。设计侧栏时，优先保留文献标题、摘要和当前引用上下文。',tags:['写作流程','信息查阅']},
 b:{citation:'研究小组，2025',title:'让阅读笔记回到写作现场',author:'研究小组 · 2025 · 演示文献 B',context:'找到文献之后，之前记录的笔记也应该能够一起被找到。',abstract:'本段为演示摘要，用于展示另一条引用的匹配结果。切换正文中的引用后，侧栏随之更新，使不同文献的信息有明确的对应关系。',note:'写作笔记示例：笔记与文献放在同一侧栏中。查看摘要后，可切换到笔记，回顾自己此前记录的思考。',tags:['文献笔记','引用上下文']}
};
function referenceContent(){
 if(refState.loading)return '<div class="match-loading" role="status">正在匹配示例文献…</div>';
 if(!refState.id)return '<div class="ref-placeholder"><span>“ ”</span><h3>从一处引用开始</h3><p>点击左侧正文中带底色的引用，<br>在这里查看对应的文献。</p></div><div class="ref-prompt">交互提示：先点蓝色引用，再切换“摘要”和“笔记”。</div>';
 if(refState.id==='missing')return `<div class="match-label" style="color:#9b865c">未找到明确匹配</div><h3 class="ref-title">先保留上下文，<br>再查找线索。</h3><p class="ref-author">选中的引用：待核对，2024</p><div class="ref-context"><b>引用上下文</b>引用不完整时，系统不应直接替用户指定一篇文献。</div><p class="ref-copy">可以用关键词查找示例文献，再由您确认。试着输入“写作”或“笔记”。</p><form class="ref-search" id="ref-search"><input id="ref-query" value="${escapeHTML(refState.query)}" placeholder="输入文献关键词" aria-label="搜索示例文献关键词" autocomplete="off"><button type="submit">查找</button></form>${refState.searched?searchResults():''}`;
 const r=refs[refState.id];
 return `<div class="match-label">已匹配示例文献 · ${refState.manual?'手动选择':'自动演示'}</div><h3 class="ref-title">${r.title}</h3><p class="ref-author">${r.author}</p><div class="ref-context"><b>当前引用上下文</b>${refState.manual?'引用不完整时，系统不应直接替用户指定一篇文献。':r.context}</div><div class="ref-tabs" role="tablist" aria-label="文献内容"><button data-action="ref-tab" data-value="abstract" role="tab" aria-selected="${refState.tab==='abstract'}" class="${refState.tab==='abstract'?'active':''}">摘要</button><button data-action="ref-tab" data-value="notes" role="tab" aria-selected="${refState.tab==='notes'}" class="${refState.tab==='notes'?'active':''}">笔记</button></div><div class="ref-copy" role="tabpanel">${refState.tab==='abstract'?r.abstract:`<div class="note-card">${r.note}</div>`}</div><div class="ref-tags">${r.tags.map(t=>`<span>${t}</span>`).join('')}</div><p class="ref-local">示例内容，仅用于演示查阅流程。</p>`;
}
function searchResults(){
 const q=refState.query.trim().toLowerCase();
 const matches=q?Object.entries(refs).filter(([,r])=>(r.title+r.tags.join('')).toLowerCase().includes(q)):[];
 return matches.length?matches.map(([id,r])=>`<button class="ref-search-result" data-action="manual-ref" data-value="${id}">${r.title}<small>${r.author} · 点击确认</small></button>`).join(''):'<p class="ref-author" role="status">没有匹配结果，请换一个关键词。</p>';
}
function renderYinzhi(){
 root.innerHTML=heading('引知','YINZHI','留在正文里，把引用对应的文献找出来。点击文中的引用，体验侧栏查阅。')+`<div class="document-window"><div class="document-titlebar"><span class="doc-icon">W</span><span>示例文稿 · 文献查阅体验</span><small>Word 场景示意</small></div><div class="document-toolbar"><span>开始</span><span>插入</span><span>引用</span><b>引知 · 文献助手</b></div><div class="document-body"><div class="manuscript-wrap"><article class="manuscript"><div class="doc-small">SAMPLE DOCUMENT / 演示文稿</div><h2>让文献查阅，<br>留在写作现场。</h2><div class="doc-subtitle">一个关于写作流程的示例片段</div><h3>01 从被打断的思路开始</h3><p>在写作过程中，频繁离开正文查找引用，会打断原有的思路 <button class="citation ${refState.sourceId==='a'?'selected':''}" data-action="cite" data-value="a">（示例作者，2026）</button>。如果查阅可以在侧栏完成，正文与文献便能同时保留在眼前。</p><h3>02 不只找到文献，也找回笔记</h3><p>找到文献之后，之前记录的笔记也应该能够一起被找到 <button class="citation ${refState.sourceId==='b'?'selected':''}" data-action="cite" data-value="b">（研究小组，2025）</button>。试着切换另一处引用，观察侧栏的对应变化。</p><p>有些引用暂时无法准确匹配 <button class="citation missing ${refState.sourceId==='missing'?'selected':''}" data-action="cite" data-value="missing">（待核对，2024）</button>。这时应保留原文，再通过关键词查找并人工确认。</p><div class="doc-line"></div><p class="doc-foot">正文、文献与作者均为虚构示例，用于说明交互流程，不代表学术研究结论。</p></article></div><aside class="reference-panel" aria-label="引知文献侧栏"><div class="reference-head"><span class="app-symbol">引</span><div><h2>引知</h2><small>文献就在旁边。</small></div></div><div id="reference-content" aria-live="polite" aria-busy="${refState.loading}">${referenceContent()}</div></aside></div><div class="doc-status"><span>交互方案演示 · 使用固定示例数据</span><span>正文 ↔ 文献侧栏</span></div></div><div class="doc-guide"><div><span>01</span>点一处引用<p>保留当前段落的上下文。</p></div><div><span>02</span>看摘要与笔记<p>在同一侧栏中切换查看。</p></div><div><span>03</span>试试未匹配的引用<p>用关键词查找，再人工确认。</p></div></div><p class="demo-disclosure">项目已完成本地接口连通与真实文献数据读取验证。此处展示交互方案，引用匹配、摘要、笔记及关键词查找均使用固定演示数据，未连接真实 Word 或 Zotero；不表示这些交互均已在插件中实现。</p>`;
}
function focusCitation(id){root.querySelector(`[data-action="cite"][data-value="${id}"]`)?.focus({preventScroll:true});}
function selectRef(id,manual=false){
 clearTimeout(matchTimer);if(!manual)refState.sourceId=id;refState.id=id;refState.tab='abstract';refState.loading=true;refState.manual=manual;refState.query='';refState.searched=false;renderYinzhi();focusCitation(refState.sourceId);
 if(innerWidth<=700)document.querySelector('.reference-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 matchTimer=setTimeout(()=>{refState.loading=false;const target=document.querySelector('#reference-content');if(target){target.innerHTML=referenceContent();target.setAttribute('aria-busy','false');}},350);
}
root.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action,value=b.dataset.value;
 if(action==='reset'){reset();root.querySelector('.reset').focus({preventScroll:true});return;}
 if(kind==='wordlock'){
  if(action==='count')wl.count=Number(value);
  if(action==='minutes')wl.minutes=Number(value);
  if(action==='target'){wl.target=value;wl.deadline=0;}
  if(action==='toggle-service'){wl.enabled=!wl.enabled;wl.deadline=0;}
  if(action==='launch'){
   if(!wl.enabled||Date.now()<wl.deadline){wl.screen='target';wl.message='';}else{goQuiz();return;}
  }
  if(action==='answer'){if(wl.answer!==null)return;wl.answer=bank[wl.index].options[Number(value)];}
  if(action==='next'){
   if(wl.answer===null)return;
   if(wl.index===wl.count-1){finishSession(false);return;}wl.index++;wl.answer=null;
  }
  if(action==='bypass'){finishSession(true);return;}
  if(action==='home')wl.screen='home';
  if(action==='reopen'){
   if(!wl.enabled)wl.message='守护未开启，直接进入应用。';
   else if(Date.now()<wl.deadline)wl.message='仍在放行期，无需重复答题。';
   else{goQuiz();return;}
  }
  if(action==='expire'){wl.deadline=0;goQuiz();return;}
  renderWordlock();
  const replacement=root.querySelector(`[data-action="${action}"]${value!==undefined?`[data-value="${value}"]`:''}`);
  if(replacement&&!replacement.disabled)replacement.focus({preventScroll:true});
  else if(action==='answer')root.querySelector('[data-action="next"]').focus({preventScroll:true});
 }else{
  if(action==='cite'){selectRef(value);return;}
  if(action==='ref-tab'){refState.tab=value;document.querySelector('#reference-content').innerHTML=referenceContent();root.querySelector(`[data-action="ref-tab"][data-value="${value}"]`).focus({preventScroll:true});}
  if(action==='manual-ref'){selectRef(value,true);}
 }
});
root.addEventListener('submit',e=>{if(e.target.id!=='ref-search')return;e.preventDefault();refState.query=document.querySelector('#ref-query').value;refState.searched=true;document.querySelector('#reference-content').innerHTML=referenceContent();root.querySelector('#ref-query').focus({preventScroll:true});});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&embedded)window.parent.postMessage({type:'portfolio-demo-close'},'*');});
if(embedded){new ResizeObserver(()=>window.parent.postMessage({type:'portfolio-demo-height',height:Math.ceil(root.getBoundingClientRect().height)+4},'*')).observe(root);}
reset();
