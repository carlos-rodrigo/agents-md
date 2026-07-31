#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const canonicalRenderer = resolve(dirname(fileURLToPath(import.meta.url)), '../../html-report-designer/scripts/render-canonical-report.mjs');

const arguments_ = process.argv.slice(2);
if (arguments_[0] === '--fingerprint') {
  const path = arguments_[1] ? resolve(arguments_[1]) : '';
  if (!path || !existsSync(path)) exitWithErrors([{ path: path || 'task', message: 'task file does not exist' }]);
  const content = readFileSync(path, 'utf8');
  const frontmatter = parseFrontmatter(content, path, []);
  console.log(contractFingerprint(content, frontmatter.authorization_basis || ''));
  process.exit(0);
}

const [taskArgument, boardArgument] = arguments_;
if (!taskArgument) exitWithErrors([{ path: 'validate-task.mjs', message: 'usage: validate-task.mjs <task.md> [active-board.md]' }]);

const taskPath = resolve(taskArgument);
const boardPath = boardArgument ? resolve(boardArgument) : join(dirname(taskPath), '_active.md');
const errors = [];
if (!existsSync(taskPath)) exitWithErrors([{ path: taskPath, message: 'task file does not exist' }]);

const source = readFileSync(taskPath, 'utf8');
const frontmatter = parseFrontmatter(source, taskPath, errors);
const taskId = frontmatter.id || taskPath;
const status = frontmatter.status;

validateFrontmatter(frontmatter, taskPath, errors);
validateSections(source, status, taskPath, errors);
validateAuthorization(frontmatter, source, status, taskPath, errors);
validateDependencies(source, taskPath, status, errors);
validateResult(source, status, taskPath, errors);
if (existsSync(boardPath)) validateBoard(readFileSync(boardPath, 'utf8'), boardPath, taskId, status, errors);
else if (boardArgument) errors.push({ path: boardPath, message: 'active board does not exist' });

if (errors.length > 0) exitWithErrors(errors);
console.log(`✓ ${taskPath} is a valid ${status} task${existsSync(boardPath) ? ' and matches _active.md' : ''}`);

function parseFrontmatter(content, path, validationErrors) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    validationErrors.push({ path, message: 'missing YAML frontmatter' });
    return {};
  }
  const frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const field = line.match(/^([a-z][a-z0-9_]*):\s*(.*)$/);
    if (field) frontmatter[field[1]] = cleanScalar(field[2]);
  }
  return frontmatter;
}

function cleanScalar(value) {
  let result = value.trim();
  const commentAt = result.indexOf(' #');
  if (commentAt >= 0) result = result.slice(0, commentAt).trim();
  if ((result.startsWith('"') && result.endsWith('"')) || (result.startsWith("'") && result.endsWith("'"))) result = result.slice(1, -1);
  return result.trim();
}

function validateFrontmatter(frontmatter, path, validationErrors) {
  for (const field of ['id', 'status', 'order', 'created']) {
    if (!frontmatter[field]) validationErrors.push({ path, message: `frontmatter missing ${field}` });
  }
  if (frontmatter.id && !/^TASK-[0-9]{3,}$/.test(frontmatter.id)) validationErrors.push({ path, message: `frontmatter id must match TASK-NNN: ${frontmatter.id}` });
  if (frontmatter.status && !['draft', 'ready', 'blocked', 'done', 'open'].includes(frontmatter.status)) validationErrors.push({ path, message: `unsupported status: ${frontmatter.status}` });
  if (frontmatter.order && !/^\d+$/.test(frontmatter.order)) validationErrors.push({ path, message: `frontmatter order must be an integer: ${frontmatter.order}` });
  if (frontmatter.created && !isDate(frontmatter.created)) validationErrors.push({ path, message: `frontmatter created must be YYYY-MM-DD: ${frontmatter.created}` });
}

function validateSections(content, status, path, validationErrors) {
  if (!['ready', 'open', 'blocked', 'done'].includes(status)) return;
  const required = {
    Brief: ['Goal', 'Change', 'Done'],
    Context: ['Source anchors', 'Facts / decisions', 'Depends'],
    Execute: ['Required behavior', 'In scope', 'Out of scope', 'Invariants'],
    'Feedback loop': ['State', 'Contract', 'Setup / repro', 'Fast', 'User/system', 'Edge', 'Gate', 'Result'],
    'Escalate if': ['Approval required', 'Blocked when'],
  };
  for (const [heading, bullets] of Object.entries(required)) {
    const section = readSection(content, heading);
    if (!section) {
      validationErrors.push({ path, message: `missing ## ${heading}` });
      continue;
    }
    for (const bullet of bullets) {
      const values = readBullets(section, bullet);
      if (values.length === 0) validationErrors.push({ path, message: `## ${heading} missing ${bullet} bullet` });
      else if (values.some((value) => !value)) validationErrors.push({ path, message: `## ${heading} ${bullet} bullet must have a value` });
    }
  }
  if (containsTemplatePlaceholder(content)) validationErrors.push({ path, message: `${status} task contains an unresolved placeholder` });
}

function validateAuthorization(frontmatter, content, status, path, validationErrors) {
  if (!['ready', 'open', 'blocked', 'done'].includes(status)) return;
  for (const field of ['authorized_by', 'authorized_at', 'authorization_basis', 'authorization_fingerprint']) {
    if (!frontmatter[field]) validationErrors.push({ path, message: `${status} task missing authorization field ${field}` });
  }
  if (frontmatter.authorized_at && !isDate(frontmatter.authorized_at)) validationErrors.push({ path, message: `authorized_at must be YYYY-MM-DD: ${frontmatter.authorized_at}` });

  const basis = frontmatter.authorization_basis || '';
  if (basis.startsWith('approved-design: ')) validateApprovedDesignBasis(basis.slice('approved-design: '.length), path, validationErrors);
  else if (basis.startsWith('user-request: ')) {
    if (!basis.slice('user-request: '.length).trim()) validationErrors.push({ path, message: 'authorization_basis user-request must name the bounded request' });
  } else if (basis) {
    validationErrors.push({ path, message: 'authorization_basis must start with approved-design: or user-request:' });
  }

  if (frontmatter.authorization_fingerprint) {
    const expected = contractFingerprint(content, basis);
    if (frontmatter.authorization_fingerprint !== expected) validationErrors.push({ path, message: `authorization_fingerprint does not match binding contract; expected ${expected}` });
  }
}

function validateApprovedDesignBasis(reference, taskPath, validationErrors) {
  const sourceReference = reference.trim().split('#')[0];
  if (!sourceReference || isAbsolute(sourceReference)) {
    validationErrors.push({ path: taskPath, message: 'approved-design authorization_basis must use a project-relative design.document.json path' });
    return;
  }
  const root = projectRoot(taskPath);
  const designPath = resolve(root, sourceReference);
  if (relative(root, designPath).startsWith(`..${sep}`)) {
    validationErrors.push({ path: taskPath, message: 'approved-design authorization_basis escapes the project root' });
    return;
  }
  if (!existsSync(designPath)) {
    validationErrors.push({ path: designPath, message: 'approved design source does not exist' });
    return;
  }

  let design;
  try { design = JSON.parse(readFileSync(designPath, 'utf8')); }
  catch (error) {
    validationErrors.push({ path: designPath, message: `approved design source is invalid JSON: ${error.message}` });
    return;
  }
  if (design.document?.kind !== 'design') {
    validationErrors.push({ path: designPath, message: `authority kind is ${design.document?.kind || 'missing'}, expected design` });
    return;
  }
  if (design.document?.status !== 'Approved') {
    validationErrors.push({ path: designPath, message: `design status is ${design.document?.status || 'missing'}, expected Approved` });
    return;
  }
  if (!design.document?.approval?.approvedBy || !isDate(design.document?.approval?.approvedAt || '')) {
    validationErrors.push({ path: designPath, message: 'Approved design requires valid approval.approvedBy and approval.approvedAt' });
    return;
  }

  if (!designPath.endsWith('.document.json')) {
    validationErrors.push({ path: designPath, message: 'approved design source must end with .document.json' });
    return;
  }
  const reportPath = designPath.replace(/\.document\.json$/, '.html');
  if (!existsSync(reportPath)) {
    validationErrors.push({ path: reportPath, message: 'approved design review projection does not exist' });
    return;
  }
  const embeddedMatch = readFileSync(reportPath, 'utf8').match(/<script[^>]*data-document-spec=["']canonical-report-v1["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!embeddedMatch) {
    validationErrors.push({ path: reportPath, message: 'approved design review projection has no embedded canonical DocumentSpec' });
    return;
  }
  try {
    const embedded = JSON.parse(embeddedMatch[1]);
    if (!isDeepStrictEqual(embedded, design)) {
      validationErrors.push({ path: reportPath, message: 'approved design review projection does not match design.document.json' });
      return;
    }
  } catch (error) {
    validationErrors.push({ path: reportPath, message: `embedded canonical DocumentSpec is invalid JSON: ${error.message}` });
    return;
  }

  if (!existsSync(canonicalRenderer)) {
    validationErrors.push({ path: canonicalRenderer, message: 'html-report-designer canonical renderer is required for approved-design authorization' });
    return;
  }
  const freshness = spawnSync(process.execPath, [canonicalRenderer, '--check', designPath, reportPath], { cwd: root, encoding: 'utf8' });
  if (freshness.status !== 0) {
    const detailLines = `${freshness.stdout}${freshness.stderr}`.trim().split(/\r?\n/).filter(Boolean);
    const detail = detailLines.find((line) => /^\s*(?:Error|error|✗)/.test(line)) || detailLines[0] || '';
    validationErrors.push({ path: reportPath, message: `canonical renderer --check failed${detail ? `: ${detail.trim()}` : ''}` });
  }
}

function validateDependencies(content, taskPath, status, validationErrors) {
  if (!['ready', 'open'].includes(status)) return;
  const dependencyValue = readBullet(readSection(content, 'Context'), 'Depends');
  if (!dependencyValue || /^none[.;]?$/i.test(dependencyValue)) return;
  const dependencyIds = dependencyValue.match(/TASK-[0-9]{3,}/g) || [];
  if (dependencyIds.length === 0) {
    validationErrors.push({ path: taskPath, message: `Depends must be none or TASK-NNN references: ${dependencyValue}` });
    return;
  }
  const siblingTasks = new Map();
  for (const entry of readdirSync(dirname(taskPath), { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name === '_active.md') continue;
    const siblingPath = join(dirname(taskPath), entry.name);
    const siblingFrontmatter = parseFrontmatter(readFileSync(siblingPath, 'utf8'), siblingPath, []);
    if (siblingFrontmatter.id) siblingTasks.set(siblingFrontmatter.id, siblingFrontmatter.status);
  }
  for (const dependencyId of dependencyIds) {
    const dependencyStatus = siblingTasks.get(dependencyId);
    if (!dependencyStatus) validationErrors.push({ path: taskPath, message: `dependency ${dependencyId} does not exist` });
    else if (dependencyStatus !== 'done') validationErrors.push({ path: taskPath, message: `dependency ${dependencyId} is not done (status: ${dependencyStatus})` });
  }
}

function validateResult(content, status, path, validationErrors) {
  if (!['done', 'blocked'].includes(status)) return;
  const result = readSection(content, 'Result');
  if (!result) {
    validationErrors.push({ path, message: `status ${status} requires ## Result` });
    return;
  }
  const required = status === 'done'
    ? ['Status', 'Changed', 'TDD', 'Task contract', 'Feedback loop', 'Gate', 'Review', 'Follow-up applied to next task']
    : ['Status', 'Changed', 'Last failing check', 'Attempts', 'TDD state', 'Blocker owner', 'Gate', 'Needed to unblock'];
  for (const bullet of required) {
    const values = readBullets(result, bullet);
    if (values.length === 0) validationErrors.push({ path, message: `## Result missing ${bullet} bullet for ${status} task` });
    else if (values.length > 1) validationErrors.push({ path, message: `## Result must contain exactly one ${bullet} bullet for ${status} task` });
    else if (values.some((value) => !value)) validationErrors.push({ path, message: `## Result ${bullet} bullet must have a value` });
  }
  const resultStatus = readBullet(result, 'Status');
  if (resultStatus && resultStatus.toLowerCase() !== status) validationErrors.push({ path, message: `Result Status ${resultStatus} does not match frontmatter status ${status}` });
  if (status === 'done') {
    const tdd = readBullet(result, 'TDD');
    if (/\b(?:not green|still failing|remains red|unresolved)\b/i.test(tdd)) validationErrors.push({ path, message: 'done task TDD records failure or incomplete evidence' });
    if (!/\b(?:green|passed)\b|\bno-op\b|not applicable|exception|docs[- ]only|already pass(?:ed|es)/i.test(tdd)) validationErrors.push({ path, message: 'done task TDD must record green/passed, a sourced no-op, or an explicit exception' });

    const taskContract = readBullet(result, 'Task contract');
    if (/\b(?:not satisfied|unmet)\b/i.test(taskContract)) validationErrors.push({ path, message: 'done task Task contract records failure or incomplete evidence' });
    if (!/\bsatisfied\b/i.test(taskContract)) validationErrors.push({ path, message: 'done task Task contract must record satisfied' });

    const feedback = readBullet(result, 'Feedback loop');
    if (/\b(?:not (?:verified|observed|satisfied|successful|passed|green)|still failing|unresolved|skipp(?:ed|ing))\b/i.test(feedback)) validationErrors.push({ path, message: 'done task Feedback loop records failure or incomplete evidence' });
    if (!/\b(?:passed|green|satisfied|observed|verified|succeeded)\b|\bexits? 0\b|\bno-op\b|not applicable|exception|\b[0-9]+\/[0-9]+\b/i.test(feedback)) validationErrors.push({ path, message: 'done task Feedback loop must record a successful observation or explicit exception' });

    const gate = readBullet(result, 'Gate');
    if (/\b(?:fail(?:ed|ing|ure)?|not pass(?:ed)?|blocked|unresolved|pending|skipp(?:ed|ing)|not run|not executed)\b/i.test(gate)) validationErrors.push({ path, message: 'done task Gate records failure or incomplete evidence' });
    if (!/\bpassed\b|\bgreen\b|\bsucceeded\b|\bexits? 0\b|\bexited 0\b/i.test(gate)) validationErrors.push({ path, message: 'done task Gate must record a successful terminal state' });

    const review = readBullet(result, 'Review');
    if (/\b(?:unresolved|blocking|pending|not (?:approved|reviewed|proud|resolved))\b/i.test(review)) validationErrors.push({ path, message: 'done task Review records incomplete evidence' });
    if (!/\b(?:no findings|resolved|proud|passed|approved|no change|not applicable)\b|skipped\s+(?:because|with reason|:)/i.test(review)) validationErrors.push({ path, message: 'done task Review must record no findings, resolved findings, or an explicit exception' });
  } else {
    const failureState = /\b(?:fail(?:ed|ing|ure)?|red|error|nonzero|exit(?:ed)?(?: code)? [1-9][0-9]*|unavailable|missing|timeout|blocked|rejected|skipp(?:ed|ing)|not run|not executed)\b/i;
    const negatedFailure = /\bnot (?:failed|failing|red|an? error|nonzero|unavailable|missing|timed? out|blocked|rejected|skipped)\b/i;
    const lastFailingCheck = readBullet(result, 'Last failing check');
    if (negatedFailure.test(lastFailingCheck) || !failureState.test(lastFailingCheck)) validationErrors.push({ path, message: 'blocked task Last failing check must record a non-success terminal state' });
    const blockedTdd = readBullet(result, 'TDD state');
    if (/\bnot (?:red|green|blocked|started|applicable)\b/i.test(blockedTdd) || !/\b(?:red|green|blocked|not started|not applicable|no acceptance boundary|still failing|exception)\b/i.test(blockedTdd)) validationErrors.push({ path, message: 'blocked task TDD state must use no acceptance boundary, red, red/green, still failing, not started, not applicable, blocked, or exception without negating the state' });
    const blockedGate = readBullet(result, 'Gate');
    if (negatedFailure.test(blockedGate) || !failureState.test(blockedGate)) validationErrors.push({ path, message: 'blocked task Gate must record failed, blocked, skipped, unavailable, or not-run state' });
    const blockerOwner = readBullet(result, 'Blocker owner');
    if (blockerOwner && !/^(?:user|environment|upstream|oracle)(?:\b|:)/i.test(blockerOwner)) validationErrors.push({ path, message: 'blocked task Blocker owner must be user, environment, upstream, or oracle' });
  }
}

function validateBoard(board, boardPath, id, status, validationErrors) {
  const entries = board.split(/\r?\n/).map(parseProgressLine).filter(Boolean);
  const duplicateIds = [...new Set(entries.map((entry) => entry.id).filter((entryId, index, all) => all.indexOf(entryId) !== index))];
  for (const duplicateId of duplicateIds) validationErrors.push({ path: boardPath, message: `duplicate progress entry for ${duplicateId}` });
  const entry = entries.find((candidate) => candidate.id === id);
  if (!entry) {
    validationErrors.push({ path: boardPath, message: `no exact progress entry for ${id}` });
    return;
  }
  const acceptedStatuses = status === 'open' ? ['open', 'ready'] : [status];
  if (!acceptedStatuses.includes(entry.status)) validationErrors.push({ path: boardPath, message: `status for ${id} is ${entry.status}, expected ${status}` });
  if (status === 'done' && !entry.checked) validationErrors.push({ path: boardPath, message: `must check off done task ${id}` });
  if (status !== 'done' && entry.checked) validationErrors.push({ path: boardPath, message: `must not check off ${status} task ${id}` });

  const current = readBullet(board, 'Current');
  const next = readBullet(board, 'Next');
  validatePointer('Current', current, entries, boardPath, validationErrors);
  validatePointer('Next', next, entries, boardPath, validationErrors);
  if (status === 'done' && current === id) validationErrors.push({ path: boardPath, message: `Current still points to done task ${id}` });
}

function parseProgressLine(line) {
  const match = line.match(/^- \[([ xX])\]\s+(TASK-[0-9]{3,})\b.*\((draft|ready|open|blocked|done)\)\s*$/);
  return match ? { id: match[2], status: match[3], checked: /[xX]/.test(match[1]) } : null;
}

function validatePointer(label, value, entries, path, validationErrors) {
  if (!value) {
    validationErrors.push({ path, message: `${label} pointer is missing` });
    return;
  }
  const terminalValues = label === 'Current' ? ['none'] : ['complete', 'blocked'];
  if (terminalValues.includes(value)) return;
  if (!/^TASK-[0-9]{3,}$/.test(value)) {
    validationErrors.push({ path, message: `${label} pointer must be ${label === 'Current' ? 'TASK-NNN or none' : 'TASK-NNN, complete, or blocked'}: ${value}` });
    return;
  }
  const entry = entries.find((candidate) => candidate.id === value);
  if (!entry) validationErrors.push({ path, message: `${label} points to missing task ${value}` });
  else if (entry.status === 'done') validationErrors.push({ path, message: `${label} points to done task ${value}` });
}

function contractFingerprint(content, authorizationBasis) {
  const brief = readSection(content, 'Brief');
  const execute = readSection(content, 'Execute');
  const contract = {
    authorizationBasis: normalize(authorizationBasis),
    goal: readBullet(brief, 'Goal'),
    change: readBullet(brief, 'Change'),
    done: readBullet(brief, 'Done'),
    requiredBehavior: readBullets(execute, 'Required behavior'),
    requiredImplementation: readBullets(execute, 'Required implementation'),
    inScope: readBullets(execute, 'In scope'),
    outOfScope: readBullets(execute, 'Out of scope'),
    invariants: readBullets(execute, 'Invariants'),
  };
  return `sha256:${createHash('sha256').update(JSON.stringify(contract)).digest('hex')}`;
}

function containsTemplatePlaceholder(content) {
  if (/\b(?:TBD|TODO|FIXME|CHANGEME)\b|\{\{[^}\n]+\}\}|<(?:placeholder|replace-me|fill-me)>/i.test(content)) return true;
  const templatePrefix = /^(?:feature$|title$|verb \+ object\b|validator-generated\b|bounded request context\b|expected result\b|desired\b|one smallest\b|observable completion\b|durable path\b|path:symbol\b|TASK-|execution-critical\b|one observable\b|mandated\b|specific surfaces\b|adjacent behavior\b|existing behavior\b|specific local\b|externally observable\b|fixture\b|narrow command\b|API\/browser\b|important negative\b|regression command\b|task-specific\b|condition\b|optional information\b|human authorizer\b|Approved design\b)/i;
  for (const match of content.matchAll(/\{([^{}\n]+)\}/g)) {
    const inner = match[1].trim();
    if (/^(?:approved-design:|path:symbol$)/i.test(inner)) return true;
    if (/^[A-Za-z_$][\w$-]*\??\s*:/.test(inner)) continue;
    if (inner.includes('|') || templatePrefix.test(inner)) return true;
  }
  return false;
}

function readSection(content, heading) {
  const headingMatch = new RegExp(`^## ${escapeRegex(heading)}\\s*$`, 'm').exec(content);
  if (!headingMatch) return '';
  const remainder = content.slice(headingMatch.index + headingMatch[0].length);
  const nextHeading = remainder.search(/^## /m);
  return (nextHeading >= 0 ? remainder.slice(0, nextHeading) : remainder).trim();
}

function readBullets(section, label) {
  if (!section) return [];
  const expression = new RegExp(`^- ${escapeRegex(label)}:[ \\t]*(.*)$`, 'gm');
  return [...section.matchAll(expression)].map((match) => normalize(match[1]));
}

function readBullet(section, label) {
  return readBullets(section, label)[0] || '';
}

function normalize(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function projectRoot(taskPath) {
  const marker = `${sep}.features${sep}`;
  const index = taskPath.indexOf(marker);
  return index >= 0 ? taskPath.slice(0, index) : process.cwd();
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function exitWithErrors(validationErrors) {
  for (const error of validationErrors) console.error(`ERROR ${error.path}: ${error.message}`);
  process.exit(1);
}
