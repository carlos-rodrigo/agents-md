const tocLinks = Array.from(document.querySelectorAll('nav[aria-label="Table of contents"] a[href^="#"]'));
const tocEntries = tocLinks
  .map((link) => ({ link, target: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
  .filter((item) => item.target);
const sideNav = document.querySelector('.side-nav');

const activateAndScrollTocLinkIntoView = (activeLink) => {
  tocEntries.forEach(({ link }) => link.classList.toggle('is-active', link === activeLink));
  if (!activeLink || !sideNav) return;
  const linkTop = activeLink.offsetTop;
  const linkBottom = linkTop + activeLink.offsetHeight;
  if (linkTop < sideNav.scrollTop + 56) sideNav.scrollTop = Math.max(0, linkTop - 72);
  if (linkBottom > sideNav.scrollTop + sideNav.clientHeight) sideNav.scrollTop = linkBottom - sideNav.clientHeight + 24;
};

if ('IntersectionObserver' in window && tocEntries.length > 0) {
  const visibleSectionIds = new Map();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => visibleSectionIds.set(entry.target.id, entry.isIntersecting));
    const currentTocEntry = tocEntries.find(({ target }) => visibleSectionIds.get(target.id)) ?? [...tocEntries].reverse().find(({ target }) => target.getBoundingClientRect().top <= 160);
    activateAndScrollTocLinkIntoView(currentTocEntry?.link ?? tocEntries[0].link);
  }, { rootMargin: '-12% 0px -72% 0px', threshold: [0, 1] });
  tocEntries.forEach(({ target }) => observer.observe(target));
} else if (tocEntries.length > 0) {
  activateAndScrollTocLinkIntoView(tocEntries[0].link);
}

tocLinks.forEach((link) => link.addEventListener('click', () => activateAndScrollTocLinkIntoView(link)));
