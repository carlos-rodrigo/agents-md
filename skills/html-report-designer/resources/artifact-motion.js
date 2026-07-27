(() => {
  document.documentElement.classList.add('motion-runtime-ready');
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const printQuery = window.matchMedia('print');
  const reduceMotion = reduceQuery.matches;
  const activeAnimations = new Set();
  const observers = new Set();
  const supportedMotifs = new Set(['enter', 'flow', 'state', 'target']);
  const easing = 'cubic-bezier(.16, 1, .3, 1)';
  const enterDuration = 440;
  const flowDuration = 520;
  const stagger = 90;

  document.querySelectorAll('[data-motion-sections="enter"]').forEach((container) => {
    Array.from(container.children)
      .filter((child) => child.matches('section'))
      .forEach((section) => {
        if (!section.dataset.motion) section.dataset.motion = 'enter';
      });
  });

  const roots = Array.from(document.querySelectorAll('[data-motion]'));

  const complete = (element) => {
    element.classList.remove('motion-pending');
    element.classList.add('motion-complete');
  };

  const itemsFor = (root) => {
    if (root.dataset.motion !== 'flow') return [root];
    const diagramItems = Array.from(root.querySelectorAll('.diagram-reveal'));
    if (diagramItems.length > 0) return diagramItems;
    const explicit = Array.from(root.querySelectorAll(':scope > [data-motion-item]'));
    if (explicit.length > 0) return explicit;
    return Array.from(root.children).filter((child) => !child.matches('script, style'));
  };

  const hasViewTimeline = (element) => {
    const timeline = getComputedStyle(element).animationTimeline;
    return Boolean(timeline && timeline !== 'auto' && timeline !== 'none');
  };

  const usesCssViewMotion = (root) => {
    if (root.dataset.motion === 'flow') return itemsFor(root).some(hasViewTimeline);
    return hasViewTimeline(root);
  };

  const animateItem = (item, delay, isFlow) => {
    if (item.dataset.motionState === 'complete') return Promise.resolve();
    item.dataset.motionState = 'active';
    const distance = isFlow ? '14px' : '20px';
    const animation = item.animate(
      [
        { opacity: 0.18, transform: `translateY(${distance})` },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      {
        duration: isFlow ? flowDuration : enterDuration,
        delay,
        easing,
        fill: 'both',
      },
    );
    activeAnimations.add(animation);
    return animation.finished
      .catch(() => {})
      .finally(() => {
        activeAnimations.delete(animation);
        animation.cancel();
        item.dataset.motionState = 'complete';
        complete(item);
      });
  };

  const finishRoot = (root) => {
    root.dataset.motionState = 'complete';
    root.dispatchEvent(new CustomEvent('artifact-motion:complete', { bubbles: true }));
  };

  const revealRoot = (root) => {
    if (root.dataset.motionState === 'complete') return;
    root.dataset.motionState = 'active';
    animateItem(root, 0, false).finally(() => finishRoot(root));
  };

  const observeFlowItems = (root) => {
    const items = itemsFor(root);
    if (items.length === 0) {
      finishRoot(root);
      return;
    }
    root.dataset.motionState = 'active';
    const remaining = new Set(items);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => items.indexOf(a.target) - items.indexOf(b.target));
      visible.forEach((entry, visibleIndex) => {
        observer.unobserve(entry.target);
        animateItem(entry.target, visibleIndex * stagger, true).finally(() => {
          remaining.delete(entry.target);
          if (remaining.size === 0) {
            observers.delete(observer);
            observer.disconnect();
            finishRoot(root);
          }
        });
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
    observers.add(observer);
    items.forEach((item) => observer.observe(item));
  };

  const emphasizeTarget = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (!target || target.dataset.motion !== 'target') return;
    const animation = target.animate(
      [
        { outlineColor: 'transparent', outlineOffset: '10px', outlineStyle: 'solid', outlineWidth: '0.15rem' },
        { outlineColor: 'currentColor', outlineOffset: '4px', outlineStyle: 'solid', outlineWidth: '0.15rem' },
        { outlineColor: 'transparent', outlineOffset: '7px', outlineStyle: 'solid', outlineWidth: '0.15rem' },
      ],
      { duration: 420, easing },
    );
    activeAnimations.add(animation);
    animation.finished.catch(() => {}).finally(() => activeAnimations.delete(animation));
  };

  const settleMotion = () => {
    observers.forEach((observer) => observer.disconnect());
    observers.clear();
    activeAnimations.forEach((animation) => animation.cancel());
    activeAnimations.clear();
    roots.forEach((root) => {
      root.dataset.motionState = 'complete';
      itemsFor(root).forEach((item) => {
        item.dataset.motionState = 'complete';
        complete(item);
      });
    });
  };
  reduceQuery.addEventListener?.('change', (event) => { if (event.matches) settleMotion(); });
  printQuery.addEventListener?.('change', (event) => { if (event.matches) settleMotion(); });

  if (reduceMotion || printQuery.matches || !('IntersectionObserver' in window) || !('animate' in Element.prototype)) {
    settleMotion();
    return;
  }

  const rootObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealRoot(entry.target);
      rootObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  observers.add(rootObserver);

  roots
    .filter((root) => supportedMotifs.has(root.dataset.motion) && root.dataset.motion !== 'target')
    .forEach((root) => {
      if (usesCssViewMotion(root)) {
        root.dataset.motionState = 'css-view';
        return;
      }
      if (root.dataset.motion === 'flow') observeFlowItems(root);
      else rootObserver.observe(root);
    });

  window.addEventListener('hashchange', emphasizeTarget);
  requestAnimationFrame(emphasizeTarget);
})();
