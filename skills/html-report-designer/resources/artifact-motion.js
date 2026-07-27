document.documentElement.classList.add('js');

const revealItems = Array.from(document.querySelectorAll('.reveal'));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const showAll = () => revealItems.forEach((item) => item.classList.add('is-visible'));

if (reduceMotion || !('IntersectionObserver' in window)) {
  showAll();
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealItems.forEach((item) => observer.observe(item));
  window.addEventListener('beforeprint', showAll, { once: true });
}
