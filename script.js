const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const motionToggle = document.querySelector('.motion-toggle');
let paused = reduced.matches;
try { paused = paused || localStorage.getItem('portfolio-motion') === 'paused'; } catch {}
function setMotion(value) {
  paused = value;
  root.classList.toggle('motion-paused', value);
  motionToggle.textContent = value ? '开启动效' : '暂停动效';
  motionToggle.setAttribute('aria-pressed', String(value));
}
setMotion(paused);
motionToggle.addEventListener('click', () => {
  setMotion(!paused);
  try { localStorage.setItem('portfolio-motion', paused ? 'paused' : 'playing'); } catch {}
});
reduced.addEventListener('change', event => { if (event.matches) setMotion(true); });
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
function filterProjects(category) {
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
  caption.textContent = `${activeIndex + 1} / ${imageEntries.length} · ${figure.querySelector('figcaption')?.textContent || image.alt}`;
}
document.querySelectorAll('.project-media figure, .gallery figure').forEach(figure => {
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
