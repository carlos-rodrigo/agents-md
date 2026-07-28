const decisionRecorders = Array.from(document.querySelectorAll('fieldset.decision-recorder'));
const browserStorage = getStorage();
const storagePrefix = `artifact-review:${location.pathname || document.title}:`;

for (const [index, recorder] of decisionRecorders.entries()) {
  const decisionId = recorder.dataset.reviewId || `decision-${index + 1}`;
  const isCanonicallyAccepted = recorder.dataset.decisionStatus === 'accepted';
  const optionInputs = Array.from(recorder.querySelectorAll('input[type="radio"]'));
  const customAnswerInput = recorder.querySelector('[data-decision-custom]');
  const rationaleInput = recorder.querySelector('[data-decision-rationale]');
  const ownerInput = recorder.querySelector('[data-decision-owner]');
  const reviewRecordedCheckbox = recorder.querySelector('[data-decision-recorded]');
  const decisionStatusMessage = recorder.querySelector('.decision-status');
  const storageKey = storagePrefix + decisionId;
  let recordedReviewFingerprint = null;
  let storageWriteFailed = false;

  const selectedOptionInput = () => optionInputs.find((option) => option.checked);
  const selectedAnswer = () => {
    const selectedOption = selectedOptionInput();
    if (!selectedOption) return '';
    if (selectedOption.value === 'other') return customAnswerInput?.value.trim() || '';
    return selectedOption.closest('label')?.querySelector('span')?.textContent?.trim() || selectedOption.value;
  };
  const isReviewInputComplete = () => Boolean(selectedAnswer() && rationaleInput?.value.trim() && ownerInput?.value.trim());
  const contentFingerprint = () => JSON.stringify({
    optionId: selectedOptionInput()?.value || '',
    selection: selectedAnswer(),
    customAnswer: customAnswerInput?.value.trim() || '',
    rationale: rationaleInput?.value.trim() || '',
    owner: ownerInput?.value.trim() || '',
  });

  const createDecisionReviewRecord = () => ({
    reviewId: decisionId,
    question: recorder.querySelector('legend')?.textContent?.trim() || decisionId,
    sourceFingerprint: recorder.dataset.decisionSourceFingerprint || '',
    status: isCanonicallyAccepted ? 'Accepted' : reviewRecordedCheckbox?.checked ? 'Recorded review input' : 'Not recorded',
    optionId: selectedOptionInput()?.value || '',
    selection: selectedAnswer(),
    customAnswer: customAnswerInput?.value.trim() || '',
    rationale: rationaleInput?.value.trim() || '',
    owner: ownerInput?.value.trim() || '',
    approvedBy: recorder.dataset.approvedBy || '',
    approvedAt: recorder.dataset.approvedAt || '',
    localRecordedAt: !isCanonicallyAccepted && reviewRecordedCheckbox?.checked ? recorder.dataset.localRecordedAt || new Date().toISOString().slice(0, 10) : '',
  });

  const syncDecisionRecorder = ({ restored = false } = {}) => {
    if (!isCanonicallyAccepted && reviewRecordedCheckbox) {
      const currentFingerprint = contentFingerprint();
      if (reviewRecordedCheckbox.checked && recordedReviewFingerprint && recordedReviewFingerprint !== currentFingerprint) {
        reviewRecordedCheckbox.checked = false;
        delete recorder.dataset.localRecordedAt;
        recordedReviewFingerprint = null;
      }

      const reviewInputComplete = isReviewInputComplete();
      reviewRecordedCheckbox.disabled = !reviewInputComplete;
      if (!reviewInputComplete) reviewRecordedCheckbox.checked = false;
      if (reviewRecordedCheckbox.checked) {
        if (!recorder.dataset.localRecordedAt) recorder.dataset.localRecordedAt = new Date().toISOString().slice(0, 10);
        if (!recordedReviewFingerprint) recordedReviewFingerprint = currentFingerprint;
      } else {
        delete recorder.dataset.localRecordedAt;
        recordedReviewFingerprint = null;
      }
    }

    const reviewRecord = createDecisionReviewRecord();
    recorder.dataset.reviewSelection = reviewRecord.selection;
    recorder.dataset.reviewRecorded = String(reviewRecord.status !== 'Not recorded');
    if (!isCanonicallyAccepted && browserStorage) {
      try {
        browserStorage.setItem(storageKey, JSON.stringify(reviewRecord));
        storageWriteFailed = false;
      } catch {
        storageWriteFailed = true;
      }
    }

    if (decisionStatusMessage) {
      if (isCanonicallyAccepted) decisionStatusMessage.textContent = `Accepted by ${reviewRecord.approvedBy} on ${reviewRecord.approvedAt}.`;
      else if (reviewRecord.status === 'Recorded review input') decisionStatusMessage.textContent = 'Recorded in this browser. Export it for canonical reconciliation and approval.';
      else if (!isReviewInputComplete()) decisionStatusMessage.textContent = 'Select an option and provide rationale and owner before recording.';
      else decisionStatusMessage.textContent = restored ? 'Restored from this browser. Check “Decision recorded” when ready.' : 'Ready to record.';
      if (!isCanonicallyAccepted && (!browserStorage || storageWriteFailed)) decisionStatusMessage.textContent += ' Browser storage is unavailable; export before closing.';
    }
  };

  if (!isCanonicallyAccepted && browserStorage) {
    try {
      const savedRecord = JSON.parse(browserStorage.getItem(storageKey) || 'null');
      if (savedRecord) {
        const currentQuestion = recorder.querySelector('legend')?.textContent?.trim() || decisionId;
        const savedOption = optionInputs.find((candidate) => candidate.value === savedRecord.optionId);
        const currentSavedSelection = savedRecord.optionId === 'other'
          ? savedRecord.customAnswer || ''
          : savedOption?.closest('label')?.querySelector('span')?.textContent?.trim() || '';
        const optionStillExists = savedRecord.optionId === '' || Boolean(savedOption);
        const meaningUnchanged = savedRecord.sourceFingerprint === recorder.dataset.decisionSourceFingerprint
          && savedRecord.question === currentQuestion
          && optionStillExists
          && savedRecord.selection === currentSavedSelection;
        if (!meaningUnchanged) {
          browserStorage.removeItem(storageKey);
        } else {
          if (savedOption) savedOption.checked = true;
          if (customAnswerInput && typeof savedRecord.customAnswer === 'string') customAnswerInput.value = savedRecord.customAnswer;
          if (rationaleInput && typeof savedRecord.rationale === 'string') rationaleInput.value = savedRecord.rationale;
          if (ownerInput && typeof savedRecord.owner === 'string') ownerInput.value = savedRecord.owner;
          if (reviewRecordedCheckbox) reviewRecordedCheckbox.checked = savedRecord.status === 'Recorded review input';
          if (savedRecord.localRecordedAt) recorder.dataset.localRecordedAt = savedRecord.localRecordedAt;
          if (reviewRecordedCheckbox?.checked) recordedReviewFingerprint = contentFingerprint();
        }
      }
    } catch {
      try { browserStorage.removeItem(storageKey); } catch { /* browser storage is optional */ }
    }
  }

  customAnswerInput?.addEventListener('input', () => {
    const customOption = optionInputs.find((option) => option.value === 'other');
    if (customOption) customOption.checked = true;
  });
  recorder.addEventListener('input', () => syncDecisionRecorder());
  recorder.addEventListener('change', () => syncDecisionRecorder());
  syncDecisionRecorder({ restored: true });
}

if (decisionRecorders.length > 0) {
  const exportActions = document.createElement('section');
  exportActions.className = 'feedback-widget decision-export';
  exportActions.dataset.reviewId = 'review-decisions.export';
  exportActions.innerHTML = '<h2 class="panel-title">Decision Review Record</h2><p class="feedback-note">Browser records are review input, not canonical approval. Export them, then reconcile accepted choices into the PRD, design, or ADR.</p><div class="feedback-actions"><button type="button" data-review-copy>Copy Decisions</button><button type="button" data-review-download>Download Markdown</button></div><p class="feedback-result" aria-live="polite"></p>';
  (document.querySelector('article') || document.body).append(exportActions);

  const buildDecisionExportMarkdown = () => {
    const lines = [`# Decision review record for ${document.title}`, '', `Source: ${location.pathname || 'inline document'}`, '', '> Review input only. Reconcile explicit human approval into canonical document source.', ''];
    decisionRecorders.forEach((recorder, index) => {
      const decisionId = recorder.dataset.reviewId || `decision-${index + 1}`;
      const question = recorder.querySelector('legend')?.textContent?.trim() || decisionId;
      const selectedOption = recorder.querySelector('input[type="radio"]:checked');
      const customAnswer = recorder.querySelector('[data-decision-custom]')?.value.trim() || '';
      const selection = selectedOption?.value === 'other' ? customAnswer : selectedOption?.closest('label')?.querySelector('span')?.textContent?.trim() || 'No selection';
      const isAccepted = recorder.dataset.decisionStatus === 'accepted';
      const isLocallyRecorded = recorder.querySelector('[data-decision-recorded]')?.checked;
      lines.push(
        `## ${question}`, '',
        `- Review ID: \`${decisionId}\``,
        `- Source fingerprint: \`${recorder.dataset.decisionSourceFingerprint || 'unknown'}\``,
        `- Status: ${isAccepted ? 'Accepted' : isLocallyRecorded ? 'Recorded review input' : 'Not recorded'}`,
        `- Decision: ${selection}`,
        `- Rationale: ${recorder.querySelector('[data-decision-rationale]')?.value.trim() || 'Not provided'}`,
        `- Owner: ${recorder.querySelector('[data-decision-owner]')?.value.trim() || 'Not provided'}`,
        `- Approved by: ${recorder.dataset.approvedBy || 'Not approved'}`,
        `- Approved on: ${recorder.dataset.approvedAt || 'Not approved'}`,
        `- Browser recorded: ${recorder.dataset.localRecordedAt || 'Not recorded'}`,
        '',
      );
    });
    return lines.join('\n');
  };

  const exportStatusMessage = exportActions.querySelector('.feedback-result');
  exportActions.querySelector('[data-review-copy]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(buildDecisionExportMarkdown());
      exportStatusMessage.textContent = 'Decision record copied.';
    } catch {
      exportStatusMessage.textContent = 'Copy unavailable. Download the Markdown record instead.';
    }
  });
  exportActions.querySelector('[data-review-download]')?.addEventListener('click', () => {
    const blob = new Blob([buildDecisionExportMarkdown()], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    const slug = (document.title || 'review').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    link.href = URL.createObjectURL(blob);
    link.download = `${slug || 'review'}.decision-review.md`;
    link.click();
    URL.revokeObjectURL(link.href);
    exportStatusMessage.textContent = 'Markdown decision record downloaded.';
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
