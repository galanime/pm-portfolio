const reduced = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reduced.matches) {
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.06 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
const progress = document.querySelector('.reading-progress');
let scheduled = false;
function updateProgress() {
  const length = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${length > 0 ? scrollY / length * 100 : 0}%`;
  scheduled = false;
}
addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();
const dialog = document.querySelector('.lightbox');
const largeImage = dialog.querySelector('img');
const caption = dialog.querySelector('p');
let lastTrigger;
document.querySelectorAll('.project-media figure, .gallery figure').forEach(figure => {
  const image = figure.querySelector('img');
  const button = document.createElement('button');
  button.className = 'image-open';
  button.type = 'button';
  button.setAttribute('aria-label', `放大查看：${image.alt}`);
  image.before(button);
  button.append(image);
  button.addEventListener('click', () => {
    lastTrigger = button;
    largeImage.src = image.src;
    largeImage.alt = image.alt;
    caption.textContent = figure.querySelector('figcaption')?.textContent || image.alt;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  });
});
dialog.querySelector('button').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { document.body.style.overflow = ''; lastTrigger?.focus({ preventScroll: true }); });
