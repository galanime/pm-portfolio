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

// The winding landscape belongs to the document, so scrolling reveals new scenery.
(() => {
  const backdrop=document.querySelector('.page-atmosphere');
  const svg=backdrop?.querySelector('.journey-background');
  if(!svg)return;
  const ns='http://www.w3.org/2000/svg';
  const wash=svg.querySelector('.journey-wash');
  const ribbon=svg.querySelector('.journey-ribbon');
  const filaments=svg.querySelector('.journey-filaments');
  const trace=svg.querySelector('.journey-progress');
  const landmarks=svg.querySelector('.journey-landmarks');
  const beacon=svg.querySelector('.journey-beacon');
  const orbs=[...backdrop.querySelectorAll('.depth-orb')];
  let height=0,width=0,length=0,frame=0,layoutPending=true,orbPositions=[];
  function element(tag,attrs){const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,value));return el;}
  function layout(){
    width=document.body.clientWidth;height=document.body.offsetHeight;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    const step=Math.max(760,Math.min(1080,innerHeight*1.12));
    const points=[{x:width*.98,y:-220}];
    for(let y=step*.72,i=0;y<height+step;y+=step,i++)points.push({x:width*(i%2===0?.08:.92),y});
    let d=`M${points[0].x},${points[0].y}`;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],dy=b.y-a.y;
      d+=` C${a.x},${a.y+dy*.48} ${b.x},${b.y-dy*.48} ${b.x},${b.y}`;
    }
    wash.setAttribute('d',d);ribbon.setAttribute('d',d);trace.setAttribute('d',d);
    filaments.replaceChildren();
    const strands=width<760?6:10;
    for(let i=0;i<strands;i++)filaments.append(element('path',{d,transform:`translate(${(i-(strands-1)/2)*(width<760?11:15)},0)`}));
    landmarks.replaceChildren();
    points.slice(1,-1).forEach((p,i)=>{
      const ring=element('g',{transform:`translate(${p.x},${p.y})`});
      ring.append(element('circle',{r:width<760?74:112}),element('circle',{r:width<760?88:132,'stroke-dasharray':'2 11'}));
      ring.append(element('path',{d:'M-12 0H12 M0-12V12'}));landmarks.append(ring);
    });
    length=wash.getTotalLength();
    orbPositions=orbs.map(el=>el.offsetTop+el.offsetHeight/2);
  }
  function render(){
    frame=0;if(document.hidden)return;
    if(layoutPending){layoutPending=false;layout();}
    const y=Math.min(height,scrollY+innerHeight*.57);
    // Locate the same vertical point on the curve; the beacon follows reading progress.
    let low=0,high=length;
    for(let i=0;i<11;i++){const mid=(low+high)/2;if(wash.getPointAtLength(mid).y<y)low=mid;else high=mid;}
    const traveled=(low+high)/2;
    const point=wash.getPointAtLength(traveled);
    beacon.setAttribute('transform',`translate(${point.x},${point.y})`);
    trace.style.strokeDashoffset=String(1-traveled/length);
    orbs.forEach((el,i)=>{const offset=paused||reduced.matches?0:Math.max(-100,Math.min(100,(scrollY+innerHeight/2-orbPositions[i])*.12));el.style.setProperty('--depth-shift',`${offset}px`);});
  }
  function schedule(needsLayout=false){layoutPending=layoutPending||needsLayout;if(!frame&&!document.hidden)frame=requestAnimationFrame(render);}
  addEventListener('scroll',()=>schedule(),{passive:true});
  addEventListener('resize',()=>schedule(true),{passive:true});
  document.addEventListener('portfolio-motion',()=>schedule());
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule(true);});
  if('ResizeObserver' in window)new ResizeObserver(()=>schedule(true)).observe(document.body);
  schedule(true);
})();
