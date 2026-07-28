const reviewSelectors = Array.from(document.querySelectorAll('fieldset.review-option-selector'));

if (reviewSelectors.length > 0) {
  const storagePrefix = `artifact-review:${location.pathname || document.title}:`;
  const storage = getStorage();

  reviewSelectors.forEach((selector, selectorIndex) => {
    const radios = Array.from(selector.querySelectorAll('input[type="radio"]'));
    if (radios.length === 0) return;

    const selectorId = selector.dataset.reviewId || radios[0].name || `selector-${selectorIndex + 1}`;
    const storageKey = storagePrefix + selectorId;
    const status = document.createElement('p');
    status.className = 'feedback-note review-selection-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    selector.append(status);

    const restore = () => {
      if (!storage) return;
      try {
        const saved = JSON.parse(storage.getItem(storageKey) || 'null');
        if (!saved || !Number.isInteger(saved.optionIndex) || !radios[saved.optionIndex]) return;
        radios[saved.optionIndex].checked = true;
        const customInput = radios[saved.optionIndex].closest('label')?.querySelector('input[type="text"]');
        if (customInput && typeof saved.customValue === 'string') customInput.value = saved.customValue;
        selector.dataset.reviewSelection = saved.selectedText || '';
        status.textContent = 'Restored from this browser. Export choices to share them.';
      } catch {
        storage.removeItem(storageKey);
      }
    };

    const save = () => {
      const optionIndex = radios.findIndex((radio) => radio.checked);
      if (optionIndex < 0) return;
      const selected = radios[optionIndex];
      const label = selected.closest('label');
      const customInput = label?.querySelector('input[type="text"]');
      const customValue = customInput?.value.trim() || '';
      const labelText = label?.querySelector('span')?.textContent?.trim() || label?.textContent?.trim() || `Option ${optionIndex + 1}`;
      const selectedText = customValue || labelText;
      selector.dataset.reviewSelection = selectedText;

      if (!storage) {
        status.textContent = 'Selected for this session. Browser storage is unavailable; export choices before closing.';
        return;
      }

      storage.setItem(storageKey, JSON.stringify({ optionIndex, customValue, selectedText }));
      status.textContent = 'Saved in this browser. Export choices to share them.';
      document.dispatchEvent(new CustomEvent('artifact-review-selection-change', {
        detail: { reviewId: selectorId, selectedText },
      }));
    };

    selector.addEventListener('change', save);
    selector.querySelectorAll('input[type="text"]').forEach((input) => {
      input.addEventListener('input', () => {
        const radio = input.closest('label')?.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        save();
      });
    });
    restore();
  });

  const exportActions = document.createElement('section');
  exportActions.className = 'feedback-widget review-selection-export';
  exportActions.dataset.reviewId = 'review-selections.export';
  exportActions.innerHTML = '<h2 class="panel-title">Review Selections</h2><p class="feedback-note">Selections save in this browser immediately. Copy or download them to make the review record portable.</p><div class="feedback-actions"><button type="button" data-review-copy>Copy Selections</button><button type="button" data-review-download>Download Markdown</button></div><p class="feedback-result" aria-live="polite"></p>';
  const insertionPoint = document.querySelector('.feedback-widget');
  (insertionPoint?.parentElement || document.querySelector('article') || document.body).insertBefore(exportActions, insertionPoint || null);

  const exportText = () => {
    const lines = [`# Review selections for ${document.title}`, '', `Source: ${location.pathname || 'inline document'}`, ''];
    reviewSelectors.forEach((selector, index) => {
      const legend = selector.querySelector('legend')?.textContent?.trim() || `Decision ${index + 1}`;
      const reviewId = selector.dataset.reviewId || `decision-${index + 1}`;
      const selection = selector.dataset.reviewSelection || 'No selection';
      lines.push(`## ${legend}`, '', `Review ID: \`${reviewId}\``, `Selected: ${selection}`, '');
    });
    return lines.join('\n');
  };

  const exportResult = exportActions.querySelector('.feedback-result');
  exportActions.querySelector('[data-review-copy]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(exportText());
      exportResult.textContent = 'Selections copied.';
    } catch {
      exportResult.textContent = 'Copy unavailable. Download the Markdown record instead.';
    }
  });
  exportActions.querySelector('[data-review-download]')?.addEventListener('click', () => {
    const blob = new Blob([exportText()], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    const slug = (document.title || 'review').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    link.href = URL.createObjectURL(blob);
    link.download = `${slug || 'review'}.review-selections.md`;
    link.click();
    URL.revokeObjectURL(link.href);
    exportResult.textContent = 'Markdown review record downloaded.';
  });
}

function getStorage() {
  try {
    const key = '__artifact_review_storage_test__';
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return localStorage;
  } catch {
    return null;
  }
}
