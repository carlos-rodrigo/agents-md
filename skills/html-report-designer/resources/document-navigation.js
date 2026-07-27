(() => {
  const article = document.querySelector('main#main > article');
  const desktopTarget = document.querySelector('[data-document-navigation-target]');
  const mobileTarget = document.querySelector('[data-document-navigation-mobile]');
  if (!article || !desktopTarget || !mobileTarget) return;

  const headings = Array.from(article.querySelectorAll('h2[id]'))
    .filter((heading) => heading.textContent.trim());
  if (headings.length === 0) return;
  document.documentElement.classList.add('navigation-ready');

  const buildList = () => {
    const list = document.createElement('ul');
    list.className = 'nav-list';
    headings.forEach((heading) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${encodeURIComponent(heading.id)}`;
      link.textContent = heading.textContent.trim();
      item.append(link);
      list.append(item);
    });
    return list;
  };

  desktopTarget.append(buildList());
  mobileTarget.append(buildList());

  const desktopLinks = Array.from(desktopTarget.querySelectorAll('a[href^="#"]'));
  const mobileDetails = document.querySelector('.mobile-navigation');
  const linksById = new Map(desktopLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
  const select = (id) => desktopLinks.forEach((link) => {
    if (link === linksById.get(id)) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });

  document.querySelectorAll('.mobile-panel a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => mobileDetails?.removeAttribute('open'));
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
      if (visible[0]?.target.id) select(visible[0].target.id);
    }, { rootMargin: '-12% 0px -68% 0px', threshold: 0 });
    headings.forEach((heading) => observer.observe(heading));
  }

  select(decodeURIComponent(location.hash.slice(1)) || headings[0].id);
})();
