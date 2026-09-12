const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
// Respect the visitor's system accessibility preference without presentation controls.
let paused = reduced.matches;
function setMotion(value) {
  paused = value;
  root.classList.toggle('motion-paused', value);
  if (value) document.getAnimations().forEach(animation => {
    if (animation.effect?.getTiming().iterations !== Infinity && !(animation instanceof CSSAnimation) && !(animation instanceof CSSTransition)) animation.finish();
  });
  document.dispatchEvent(new Event('portfolio-motion'));
}
setMotion(paused);
reduced.addEventListener('change', event => setMotion(event.matches));
if ('IntersectionObserver' in window) {
  root.classList.add('motion-ready');
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); reveal.unobserve(entry.target); }
  }), { threshold: 0.04 });
  document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('#main-nav a').forEach(link => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }), { rootMargin: '-12% 0px -60% 0px', threshold: 0 });
  document.querySelectorAll('main > section[id]').forEach(section => sectionObserver.observe(section));
}
const progress = document.querySelector('.reading-progress');
let scheduled = false;
function updateProgress() {
  const length = root.scrollHeight - innerHeight;
  progress.style.width = `${length > 0 ? scrollY / length * 100 : 0}%`;
  const hero = document.querySelector('.hero');
  if (hero && !paused && !reduced.matches) hero.style.setProperty('--hero-drift', `${Math.min(scrollY * .055, 34)}px`);
  scheduled = false;
}
addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();
const menu = document.querySelector('#main-nav');
const menuToggle = document.querySelector('.menu-toggle');
function closeMenu() { menu.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', '展开导航'); }
menuToggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? '收起导航' : '展开导航');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); menuToggle.focus(); } });
const projects = [...document.querySelectorAll('.project')];
const filters = [...document.querySelectorAll('[data-filter]')];
function applyProjectFilter(category) {
  let count = 0;
  projects.forEach(project => {
    project.hidden = category !== 'all' && project.dataset.category !== category;
    if (!project.hidden) { count++; project.classList.add('visible'); }
  });
  filters.forEach(button => {
    const active = button.dataset.filter === category;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('.project-count').textContent = `展示 ${count} 个项目`;
  updateProgress();
}
function filterProjects(category) {
  applyProjectFilter(category);
  if (!paused && !reduced.matches) {
    projects.filter(p => !p.hidden).forEach((project, index) => {
      project.getAnimations().forEach(animation => animation.cancel());
      project.animate([{ opacity: 0, transform: 'translateY(18px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: Math.min(index * 45, 180), easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    });
  }
}
filters.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
function ensureTargetVisible() {
  const id = location.hash.slice(1);
  const target = id ? document.getElementById(id) : null;
  if (target?.classList.contains('project') && target.hidden) filterProjects('all');
}
addEventListener('hashchange', ensureTargetVisible);
document.querySelector('.hero-preview').addEventListener('click', () => filterProjects('all'));
ensureTargetVisible();
const dialog = document.querySelector('.lightbox');
const largeImage = dialog.querySelector('img');
const caption = dialog.querySelector('p');
const imageEntries = [];
let lastTrigger;
let activeIndex = 0;
function showImage(index) {
  activeIndex = (index + imageEntries.length) % imageEntries.length;
  const {image, figure} = imageEntries[activeIndex];
  largeImage.src = image.src;
  largeImage.alt = image.alt;
  if (dialog.open && !paused && !reduced.matches) largeImage.animate([{ opacity: .2, transform: 'scale(.975)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });
  caption.textContent = `${activeIndex + 1} / ${imageEntries.length} · ${figure.querySelector('figcaption')?.textContent || image.alt}`;
}
document.querySelectorAll('.project figure, .gallery figure').forEach(figure => {
  const image = figure.querySelector('img');
  const button = document.createElement('button');
  const index = imageEntries.length;
  imageEntries.push({ image, figure, button });
  button.className = 'image-open';
  button.type = 'button';
  button.setAttribute('aria-label', `放大查看：${image.alt}`);
  image.before(button); button.append(image);
  button.addEventListener('click', () => {
    lastTrigger = button; showImage(index); dialog.showModal(); document.body.style.overflow = 'hidden';
  });
});
dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
dialog.querySelector('.lightbox-prev').addEventListener('click', () => showImage(activeIndex - 1));
dialog.querySelector('.lightbox-next').addEventListener('click', () => showImage(activeIndex + 1));
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(activeIndex - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showImage(activeIndex + 1); }
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => { document.body.style.overflow = ''; lastTrigger?.focus({ preventScroll: true }); });
let toastTimeout;
function notify(message) {
  const toast = document.querySelector('.toast'); toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimeout); toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}
document.querySelector('.copy-email').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('heng1537@foxmail.com'); notify('邮箱已复制'); }
  catch { notify('请长按或选中邮箱地址复制'); }
});
addEventListener('beforeprint', () => {
  document.querySelectorAll('details').forEach(el => { el.dataset.printWasOpen = String(el.open); el.open = true; });
});
addEventListener('afterprint', () => {
  document.querySelectorAll('details').forEach(el => { el.open = el.dataset.printWasOpen === 'true'; delete el.dataset.printWasOpen; });
});

// Small pointer responses use transforms only and are disabled on touch devices.
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const interactiveCards = document.querySelectorAll('.project, .education-card, .grp');
interactiveCards.forEach(card => {
  let frame;
  card.addEventListener('pointermove', event => {
    if (!finePointer.matches || paused || reduced.matches) return;
    cancelAnimationFrame(frame);
    const x = event.clientX, y = event.clientY;
    frame = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${x - rect.left}px`);
      card.style.setProperty('--spot-y', `${y - rect.top}px`);
    });
  });
});
document.querySelectorAll('.button, .header-contact').forEach(button => {
  button.addEventListener('pointermove', event => {
    if (!finePointer.matches || paused || reduced.matches) return;
    const rect = button.getBoundingClientRect();
    button.style.translate = `${(event.clientX - rect.left - rect.width / 2) * .07}px ${(event.clientY - rect.top - rect.height / 2) * .10}px`;
  });
  button.addEventListener('pointerleave', () => { button.style.translate = ''; });
});
const portraitFrame = document.querySelector('.portrait-frame');
portraitFrame.addEventListener('pointermove', event => {
  if (!finePointer.matches || paused || reduced.matches) return;
  const rect = portraitFrame.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - .5;
  const y = (event.clientY - rect.top) / rect.height - .5;
  portraitFrame.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
});
portraitFrame.addEventListener('pointerleave', () => { portraitFrame.style.transform = ''; });
// Native details remain readable without JS; with motion enabled, animate the actual height.
document.querySelectorAll('.project details').forEach(details => {
  const summary = details.querySelector('summary');
  let animation;
  summary.addEventListener('click', event => {
    if (paused || reduced.matches || !details.animate) return;
    event.preventDefault();
    const oldHeight = details.getBoundingClientRect().height;
    animation?.cancel();
    const opening = !details.open;
    if (opening) details.open = true;
    const newHeight = opening ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height;
    details.style.overflow = 'hidden';
    animation = details.animate([{ height: `${oldHeight}px` }, { height: `${newHeight}px` }], { duration: 330, easing: 'cubic-bezier(.2,.75,.25,1)' });
    animation.onfinish = () => { details.open = opening; details.style.overflow = ''; animation = null; updateProgress(); };
    animation.oncancel = () => { details.style.overflow = ''; };
  });
});
// A brief local ripple confirms deliberate clicks without replacing native controls.
document.addEventListener('click', event => {
  const target = event.target.closest('.button, .project-filters button, .copy-email');
  if (!target || paused || reduced.matches || event.detail === 0) return;
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'click-ripple'; ripple.setAttribute('aria-hidden', 'true');
  ripple.style.left = `${event.clientX - rect.left}px`; ripple.style.top = `${event.clientY - rect.top}px`;
  target.append(ripple); ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  setTimeout(() => ripple.remove(), 700);
});
// One case, five decisions: interactive storytelling rather than decorative slides.
const processStages = [
  { kicker:'01 / 从学习者的困惑出发', title:'先理解“哪里难”，<br>再决定“做什么”。', description:'分子结构、量子性质和机器学习分散在不同概念里。学习者看到了预测结果，却很难理解结果是如何产生的。', decision:'优先建立直观联系，降低理解门槛。', items:[['用户场景','理解知识，而不只是运行模型'],['核心阻碍','抽象概念之间缺少可见联系'],['设计目标','把计算过程变成可观察的体验']] },
  { kicker:'02 / 把能力组织成学习路径', title:'不是堆叠功能，<br>而是建立理解的顺序。', description:'把分子输入、几何关系、距离与角度编码、模型学习和性质输出组织成连贯链路。每个界面都回答一个明确的问题。', decision:'用固定案例减少操作负担，把注意力留给模型原理。', items:[['内容结构','输入 → 几何 → 编码 → 模型 → 预测'],['交互原则','观察与探索，不强制学生作答'],['功能边界','明确可用、不可用与规划能力']] },
  { kicker:'03 / 让抽象概念可以被操作', title:'让学生动手，<br>也让概念跟着动起来。', description:'通过三维分子、邻域连线与距离角度观察，把模型输入和内部表示转化为可感知的变化；用 Demo 检查讲解是否成立。', decision:'交互应解释概念，而不是增加无关的操作。', items:[['几何观察','旋转分子、改变邻域范围'],['模型对照','连接 MLP 与 DimeNet++ 的输入差异'],['原型目标','验证讲解与操作能否相互支撑']] },
  { kicker:'04 / 用真实结果检验体验', title:'看起来能用，<br>还不够。', description:'把训练任务、模型产物、质量检查与预测分别呈现。参数变化后，过时结果需要失效；数据未准备好时，不用模拟曲线填补。', decision:'让每个结果有状态、有来源，也有解释边界。', items:[['数据真实性','使用真实训练与明确的预测操作'],['状态一致性','参数变化后清理不再匹配的结果'],['质量边界','质量门通过，不等于每个预测都准确']] },
  { kicker:'05 / 把原型变成可延续的工作', title:'交付的不只是页面，<br>还有继续迭代的依据。', description:'将产品叙事、交互状态、接口约定和验收边界沉淀为文档；使下一轮改动能够沿着已经明确的目标继续推进。', decision:'同时交付可运行结果与清楚的能力边界。', items:[['产品说明','需求、交互与设计取舍'],['协作约定','接口、训练状态与产物关系'],['迭代依据','可复现步骤、验证结果与待完成项']] }
];
const stageTabs = [...document.querySelectorAll('[data-stage]')];
const stagePanel = document.querySelector('.stage-panel');
const stageNames = ['发现问题','定义方案','原型探索','验证迭代','推进交付'];
let currentStage = 0;
function selectStage(index, focus = false) {
  currentStage = (index + processStages.length) % processStages.length;
  const stage = processStages[currentStage];
  stageTabs.forEach((button, i) => { button.setAttribute('aria-selected', String(i === currentStage)); button.tabIndex = i === currentStage ? 0 : -1; });
  stagePanel.setAttribute('aria-labelledby', `stage-tab-${currentStage}`);
  stagePanel.querySelector('.stage-kicker').textContent = stage.kicker;
  stagePanel.querySelector('h3').innerHTML = stage.title;
  stagePanel.querySelector('.stage-description').textContent = stage.description;
  stagePanel.querySelector('.stage-decision p').textContent = stage.decision;
  stagePanel.querySelector('.artifact-count').textContent = `0${currentStage + 1} / 05`;
  stagePanel.querySelectorAll('.artifact-items>div').forEach((item,i) => { item.querySelector('strong').textContent = stage.items[i][0]; item.querySelector('p').textContent = stage.items[i][1]; });
  document.querySelector('.process-track>span').style.width = `${(currentStage + 1) * 20}%`;
  document.querySelector('.next-stage').innerHTML = currentStage === 4 ? '重新探索：发现问题 <span>↺</span>' : `下一步：${stageNames[currentStage + 1]} <span>→</span>`;
  if (focus) stageTabs[currentStage].focus();
  if (!paused && !reduced.matches) {
    stagePanel.getAnimations({subtree:true}).forEach(animation => animation.cancel());
    stagePanel.querySelector('.stage-copy').animate([{ opacity:0, transform:'translateX(-12px)' },{ opacity:1, transform:'none' }],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'});
    stagePanel.querySelector('.stage-artifact').animate([{ opacity:0, translate:'0 15px' },{ opacity:1, translate:'0 0' }],{duration:500,easing:'cubic-bezier(.2,.8,.2,1)'});
    stagePanel.querySelectorAll('.artifact-items>div').forEach((item,i)=>item.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:350,delay:i*55,fill:'backwards'}));
  }
}
stageTabs.forEach((button,i) => {
  button.addEventListener('click',()=>selectStage(i));
  button.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight') next=i+1;
    if(event.key==='ArrowLeft') next=i-1;
    if(event.key==='Home') next=0;
    if(event.key==='End') next=4;
    if(next!==undefined){event.preventDefault();selectStage(next,true);}
  });
});
document.querySelector('.next-stage').addEventListener('click',()=>selectStage(currentStage+1));
// Each orbit thumbnail remains a direct, keyboard-accessible route to its case.
document.querySelectorAll('.orbit-shot').forEach(link => link.addEventListener('click', () => filterProjects('all')));
const cinematicHeader = document.querySelector('.header');
let headerTick = false;
addEventListener('scroll', () => {
  if (headerTick) return;
  headerTick = true;
  requestAnimationFrame(() => {cinematicHeader.classList.toggle('is-scrolled', scrollY > 70);headerTick = false;});
}, {passive:true});

// Viewport-sized light field: no external assets, no controls, no input interception.
(() => {
  const canvas = document.querySelector('.atmosphere-canvas');
  const ctx = canvas?.getContext('2d', {alpha:true});
  if (!ctx) return;
  let width=0, height=0, frame=0, last=0, clock=0, compact=false;
  let progress=0, targetProgress=0, ripples=[];
  const pointer={x:.72,y:.35,tx:.72,ty:.35,active:false};
  const tau=Math.PI*2;
  function resize() {
    width=innerWidth; height=innerHeight; compact=width<760;
    const scale=Math.min(devicePixelRatio||1,compact?1:1.25,Math.sqrt(1800000/(width*height)));
    canvas.width=Math.round(width*scale); canvas.height=Math.round(height*scale);
    ctx.setTransform(scale,0,0,scale,0,0);
    targetProgress=scrollY/Math.max(1,root.scrollHeight-height);
    draw();
  }
  function glow(x,y,radius,color,strength) {
    const wash=ctx.createRadialGradient(x,y,0,x,y,radius);
    wash.addColorStop(0,`rgba(${color},${strength})`);
    wash.addColorStop(.48,`rgba(${color},${strength*.42})`);
    wash.addColorStop(1,`rgba(${color},0)`);
    ctx.fillStyle=wash;ctx.fillRect(0,0,width,height);
  }
  function ribbon(lane,offset) {
    const phase=clock*.14+lane*1.7+progress*2.1;
    const y=height*(.35+lane*.24)+offset;
    ctx.beginPath();
    ctx.moveTo(-width*.18,y+Math.sin(phase)*height*.16);
    ctx.bezierCurveTo(width*.22,y-height*(.30+Math.sin(phase*.8)*.08),width*.47,y+height*(.34+Math.cos(phase)*.12),width*1.18,y-height*.22);
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    const drift=clock*.12+progress*2;
    glow(width*(.76+Math.sin(drift)*.14),height*(.28+Math.cos(drift*.77)*.12),Math.max(width*.52,height*.7),'113,172,255',.19);
    glow(width*(.15+Math.cos(drift*.6)*.1),height*(.76+Math.sin(drift*.7)*.14),Math.max(width*.4,height*.6),'110,209,246',.13);
    glow(pointer.x*width,pointer.y*height,Math.min(width,height)*.43,'124,178,255',pointer.active?.15:.07);
    // Parallel filaments describe the same slow current, with clear space over content.
    const strands=compact?7:12;
    for(let lane=0;lane<2;lane++) {
      const light=ctx.createLinearGradient(0,0,width,height);
      light.addColorStop(0,'rgba(112,173,248,0)');
      light.addColorStop(.25,'rgba(77,146,238,.07)');
      light.addColorStop(.72,'rgba(61,128,229,.20)');
      light.addColorStop(1,'rgba(137,197,254,0)');
      ctx.strokeStyle=light;
      ribbon(lane,0);ctx.globalAlpha=.14;ctx.lineWidth=38;ctx.stroke();
      ctx.globalAlpha=1;ctx.lineWidth=.8;
      for(let n=0;n<strands;n++) {ribbon(lane,(n-strands/2)*(compact?7:9));ctx.stroke();}
    }
    // Small points drift without expensive all-to-all connections.
    const count=compact?24:48;
    for(let i=0;i<count;i++) {
      const phase=i*2.39996;
      const x=((i*173.31)%997)/997*width+Math.sin(clock*.12+phase)*18;
      const y=((i*239.71)%991)/991*height+Math.cos(clock*.1+phase)*22;
      const alpha=.12+(Math.sin(clock*.35+phase)+1)*.055;
      ctx.fillStyle=`rgba(63,128,218,${alpha})`;
      ctx.beginPath();ctx.arc(x,y,i%7===0?1.8:1,0,tau);ctx.fill();
      if(i%9===0) {ctx.strokeStyle=`rgba(74,142,227,${alpha*.6})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();}
    }
    for(const ripple of ripples) {
      const age=clock-ripple.born;
      for(let i=0;i<2;i++) {
        const t=(age-i*.2)/2.4;
        if(t<0||t>1)continue;
        ctx.strokeStyle=`rgba(76,145,235,${(1-t)*.25})`;ctx.lineWidth=1.2-t*.7;
        ctx.beginPath();ctx.arc(ripple.x*width,ripple.y*height,12+(1-Math.pow(1-t,3))*160,0,tau);ctx.stroke();
      }
    }
  }
  function tick(now) {
    frame=0;
    if(document.hidden||paused||reduced.matches)return;
    const interval=compact?42:33;
    if(!last)last=now-interval;
    if(now-last>=interval) {
      const dt=Math.min((now-last)/1000,.08);last=now;clock+=dt;
      const ease=1-Math.exp(-dt*3);
      pointer.x+=(pointer.tx-pointer.x)*ease;pointer.y+=(pointer.ty-pointer.y)*ease;
      progress+=(targetProgress-progress)*ease;
      ripples=ripples.filter(r=>clock-r.born<2.7);
      draw();
    }
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);frame=0;last=0;
    if(!document.hidden&&!paused&&!reduced.matches)frame=requestAnimationFrame(tick);
  }
  addEventListener('resize',()=>{resize();sync();},{passive:true});
  addEventListener('scroll',()=>{targetProgress=scrollY/Math.max(1,root.scrollHeight-height);},{passive:true});
  document.addEventListener('pointermove',event=>{
    if(!finePointer.matches||paused||reduced.matches)return;
    pointer.tx=event.clientX/width;pointer.ty=event.clientY/height;pointer.active=true;
  },{passive:true});
  document.addEventListener('pointerleave',()=>{pointer.active=false;pointer.tx=.72;pointer.ty=.35;});
  document.addEventListener('pointerdown',event=>{
    if(paused||reduced.matches||document.hidden)return;
    ripples.push({x:event.clientX/width,y:event.clientY/height,born:clock});
    if(ripples.length>4)ripples.shift();
  },{passive:true});
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('portfolio-motion',sync);
  resize();sync();
})();
