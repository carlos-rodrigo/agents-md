const SCHEMA_VERSION = 'system-diagram-v2';
const DIAGRAM_TYPE = 'sequence';
const LAYOUT_VERSION = 'sequence-v1';
const MODES = new Set(['component-communication', 'causal-code-flow', 'outside-in-slice']);
const PARTICIPANT_KINDS = new Set(['actor', 'external', 'system', 'service', 'store']);
const MESSAGE_TYPES = new Set(['sync', 'async', 'return', 'self']);
const SEMANTIC_KINDS = new Set(['primary', 'secondary', 'success', 'warning', 'risk']);
const FRAGMENT_TYPES = new Set(['alt', 'opt', 'loop']);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REVIEW_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const LIMITS = Object.freeze({
  sourceBytes: 64 * 1024, participants: 8, messages: 48, events: 64, notes: 16,
  fragments: 12, fragmentDepth: 3, activationSpans: 16, activationDepth: 3,
  idLength: 64, titleLength: 120, descLength: 600, participantLabelLength: 64,
  messageLabelLength: 120, fragmentLabelLength: 120, noteLength: 300,
  viewBoxWidth: 4096, viewBoxHeight: 8192, svgBytes: 1024 * 1024,
});

export { DIAGRAM_TYPE, LAYOUT_VERSION, LIMITS, SCHEMA_VERSION };

export function validateSequenceSourceText(sourceText) {
  if (typeof sourceText !== 'string') throw new Error('sequence source must be text');
  if (Buffer.byteLength(sourceText, 'utf8') > LIMITS.sourceBytes) throw new Error(`sequence source exceeds ${LIMITS.sourceBytes} bytes before parsing`);
}

export function normalizeSequenceSpec(spec) {
  if (!isObject(spec)) throw new Error('sequence spec must be an object');
  requireOnly(spec, ['schemaVersion', 'diagramType', 'layoutVersion', 'mode', 'id', 'title', 'desc', 'reviewPrefix', 'participants', 'events', 'activations'], 'sequence spec');
  requireExact(spec.schemaVersion, SCHEMA_VERSION, 'sequence schemaVersion');
  requireExact(spec.diagramType, DIAGRAM_TYPE, 'sequence diagramType');
  requireExact(spec.layoutVersion, LAYOUT_VERSION, 'sequence layoutVersion');
  requireEnum(spec.mode, MODES, 'sequence mode');
  validateId(spec.id, 'sequence id');
  validateLength(spec.id, LIMITS.idLength, 'sequence id');
  requireText(spec.title, 'sequence title');
  requireLength(spec.title, LIMITS.titleLength, 'sequence title');
  requireText(spec.desc, 'sequence desc');
  requireLength(spec.desc, LIMITS.descLength, 'sequence desc');
  if (spec.reviewPrefix !== undefined) {
    if (typeof spec.reviewPrefix !== 'string' || !REVIEW_PATTERN.test(spec.reviewPrefix)) throw new Error('sequence reviewPrefix must use lowercase dot/kebab notation');
  }
  if (!Array.isArray(spec.participants) || spec.participants.length < 1 || spec.participants.length > LIMITS.participants) throw new Error(`sequence participants must contain 1 to ${LIMITS.participants} items`);
  if (!Array.isArray(spec.events) || spec.events.length < 1) throw new Error('sequence events must be a non-empty array');
  if (!Array.isArray(spec.activations)) throw new Error('sequence activations must be an array');

  const ids = new Set();
  const participants = spec.participants.map((participant, index) => normalizeParticipant(participant, index, ids));
  const participantIds = new Set(participants.map((participant) => participant.id));
  const eventMap = new Map();
  const messages = [];
  const notes = [];
  const fragments = [];
  const branches = [];
  let eventCount = 0;
  let fragmentDepth = 0;

  function normalizeEvents(events, container, depth) {
    if (!Array.isArray(events) || events.length === 0) throw new Error(`${container} events must be a non-empty array`);
    return events.map((event, index) => {
      eventCount += 1;
      if (eventCount > LIMITS.events) throw new Error(`sequence events exceed ${LIMITS.events}`);
      const normalized = normalizeEvent(event, `${container} event ${index + 1}`, ids, participantIds, eventMap, messages, notes, fragments, branches, depth, normalizeEvents);
      normalized.order = eventCount - 1;
      normalized.container = container;
      eventMap.set(normalized.id, normalized);
      return normalized;
    });
  }

  const events = normalizeEvents(spec.events, 'root', 0);
  if (messages.length < 1 || messages.length > LIMITS.messages) throw new Error(`sequence messages must contain 1 to ${LIMITS.messages}`);
  if (notes.length > LIMITS.notes) throw new Error(`sequence notes exceed ${LIMITS.notes}`);
  if (fragments.length > LIMITS.fragments) throw new Error(`sequence fragments exceed ${LIMITS.fragments}`);

  for (const message of messages) {
    if (message.messageType === 'return') {
      const reply = eventMap.get(message.replyTo);
      if (!reply || reply.type !== 'message' || reply.messageType === 'return') throw new Error(`message ${message.id} replyTo must reference an earlier non-return message`);
      if (reply.from !== message.to || reply.to !== message.from) throw new Error(`message ${message.id} return endpoints must reverse ${message.replyTo}`);
      if (message.order <= reply.order) throw new Error(`message ${message.id} return must follow ${message.replyTo}`);
    } else if (message.replyTo !== undefined) {
      throw new Error(`message ${message.id} replyTo is only valid for return messages`);
    }
  }

  const activations = spec.activations.map((activation, index) => normalizeActivation(activation, index, ids, participantIds, eventMap));
  if (activations.length > LIMITS.activationSpans) throw new Error(`sequence activations exceed ${LIMITS.activationSpans}`);
  validateActivationDepth(activations);

  return {
    schemaVersion: SCHEMA_VERSION, diagramType: DIAGRAM_TYPE, layoutVersion: LAYOUT_VERSION,
    mode: spec.mode, id: spec.id, title: spec.title.trim(), desc: spec.desc.trim(),
    reviewPrefix: spec.reviewPrefix ?? '', participants, events, activations,
    messages, notes, fragments, branches, eventMap,
  };
}

function normalizeParticipant(value, index, ids) {
  requireOnly(value, ['id', 'kind', 'label'], `participant ${index + 1}`);
  validateId(value?.id, `participant ${index + 1} id`); register(value.id, ids, `participant ${value.id}`);
  requireEnum(value.kind, PARTICIPANT_KINDS, `participant ${value.id} kind`);
  requireText(value.label, `participant ${value.id} label`); requireLength(value.label, LIMITS.participantLabelLength, `participant ${value.id} label`);
  return { id: value.id, kind: value.kind, label: value.label.trim() };
}

function normalizeEvent(value, label, ids, participantIds, eventMap, messages, notes, fragments, branches, depth, walkEvents) {
  if (!isObject(value)) throw new Error(`${label} must be an object`);
  if (value.type === 'message') {
    requireOnly(value, ['id', 'type', 'messageType', 'from', 'to', 'label', 'kind', 'replyTo'], label);
    validateId(value.id, `${label} id`); register(value.id, ids, `event ${value.id}`);
    requireEnum(value.messageType, MESSAGE_TYPES, `message ${value.id} messageType`);
    requireParticipant(value.from, participantIds, `message ${value.id} from`); requireParticipant(value.to, participantIds, `message ${value.id} to`);
    if (value.messageType === 'self' && value.from !== value.to) throw new Error(`message ${value.id} self endpoints must match`);
    if (value.messageType !== 'self' && value.from === value.to) throw new Error(`message ${value.id} non-self endpoints must differ`);
    requireText(value.label, `message ${value.id} label`); requireLength(value.label, LIMITS.messageLabelLength, `message ${value.id} label`); requireEnum(value.kind, SEMANTIC_KINDS, `message ${value.id} kind`);
    const message = { id: value.id, type: 'message', messageType: value.messageType, from: value.from, to: value.to, label: value.label.trim(), kind: value.kind, replyTo: value.replyTo, order: messages.length };
    messages.push(message); return message;
  }
  if (value.type === 'note') {
    requireOnly(value, ['id', 'type', 'text', 'kind', 'anchor'], label);
    validateId(value.id, `${label} id`); register(value.id, ids, `event ${value.id}`); requireText(value.text, `note ${value.id} text`); requireLength(value.text, LIMITS.noteLength, `note ${value.id} text`); requireEnum(value.kind, SEMANTIC_KINDS, `note ${value.id} kind`); requireText(value.anchor, `note ${value.id} anchor`);
    if (!participantIds.has(value.anchor) && !eventMap.has(value.anchor)) throw new Error(`note ${value.id} anchor must reference a participant or earlier event`);
    const note = { id: value.id, type: 'note', text: value.text.trim(), kind: value.kind, anchor: value.anchor, order: notes.length }; notes.push(note); return note;
  }
  if (value.type === 'fragment') {
    requireOnly(value, ['id', 'type', 'fragmentType', 'label', 'kind', 'branches'], label);
    validateId(value.id, `${label} id`); register(value.id, ids, `event ${value.id}`); requireEnum(value.fragmentType, FRAGMENT_TYPES, `fragment ${value.id} fragmentType`); requireText(value.label, `fragment ${value.id} label`); requireLength(value.label, LIMITS.fragmentLabelLength, `fragment ${value.id} label`); requireEnum(value.kind, SEMANTIC_KINDS, `fragment ${value.id} kind`);
    if (depth + 1 > LIMITS.fragmentDepth) throw new Error(`fragment ${value.id} exceeds nesting depth ${LIMITS.fragmentDepth}`);
    const min = value.fragmentType === 'alt' ? 2 : 1; const max = value.fragmentType === 'alt' ? 4 : 1;
    if (!Array.isArray(value.branches) || value.branches.length < min || value.branches.length > max) throw new Error(`fragment ${value.id} requires ${min === max ? min : `${min} to ${max}`} branches`);
    const normalizedBranches = value.branches.map((branch, index) => {
      requireOnly(branch, ['id', 'label', 'events'], `fragment ${value.id} branch ${index + 1}`); validateId(branch?.id, `branch ${value.id} id`); register(branch.id, ids, `branch ${branch.id}`); requireText(branch.label, `branch ${branch.id} label`); requireTextArray(branch.events, `branch ${branch.id} events`);
      const normalizedBranch = { id: branch.id, label: branch.label.trim(), events: walkEvents(branch.events, `branch ${branch.id}`, depth + 1) }; branches.push(normalizedBranch); return normalizedBranch;
    });
    const fragment = { id: value.id, type: 'fragment', fragmentType: value.fragmentType, label: value.label.trim(), kind: value.kind, branches: normalizedBranches, depth }; fragments.push(fragment); return fragment;
  }
  throw new Error(`${label} type must be message, note, or fragment`);

}

function normalizeActivation(value, index, ids, participantIds, eventMap) {
  requireOnly(value, ['id', 'participant', 'startEvent', 'endEvent'], `activation ${index + 1}`); validateId(value?.id, `activation ${index + 1} id`); register(value.id, ids, `activation ${value.id}`); requireParticipant(value.participant, participantIds, `activation ${value.id} participant`);
  const start = eventMap.get(value.startEvent); const end = eventMap.get(value.endEvent);
  if (!start || start.type !== 'message' || !end || end.type !== 'message') throw new Error(`activation ${value.id} endpoints must reference messages`);
  if (![start.from, start.to].includes(value.participant) || ![end.from, end.to].includes(value.participant)) throw new Error(`activation ${value.id} endpoints must involve ${value.participant}`);
  if (start.order >= end.order) throw new Error(`activation ${value.id} startEvent must precede endEvent`);
  if (start.container !== end.container) throw new Error(`activation ${value.id} cannot cross event-container or branch boundaries`);
  return { id: value.id, participant: value.participant, startEvent: value.startEvent, endEvent: value.endEvent, startOrder: start.order, endOrder: end.order };
}

function validateActivationDepth(activations) {
  for (const participant of new Set(activations.map((item) => item.participant))) {
    const points = [...new Set(activations.filter((item) => item.participant === participant).flatMap((item) => [item.startOrder, item.endOrder]))].sort((a, b) => a - b);
    for (const point of points) { const depth = activations.filter((item) => item.participant === participant && item.startOrder <= point && item.endOrder >= point).length; if (depth > LIMITS.activationDepth) throw new Error(`participant ${participant} exceeds activation depth ${LIMITS.activationDepth}`); }
  }
}

function requireParticipant(value, ids, label) { if (typeof value !== 'string' || !ids.has(value)) throw new Error(`${label} must reference an existing participant`); }
function register(id, ids, label) { if (ids.has(id)) throw new Error(`${label} id must be globally unique`); ids.add(id); }
function requireOnly(value, allowed, label) { if (!isObject(value)) throw new Error(`${label} must be an object`); for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`${label}.${key} is unsupported`); }
function requireText(value, label) { if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be non-empty text`); if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) throw new Error(`${label} contains an XML-invalid control character`); }
function requireTextArray(value, label) { if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} events must be a non-empty array`); }
function requireEnum(value, allowed, label) { if (!allowed.has(value)) throw new Error(`${label} must be one of: ${[...allowed].join(', ')}`); }
function requireExact(value, expected, label) { if (value !== expected) throw new Error(`${label} must equal "${expected}"`); }
function validateId(value, label) { if (typeof value !== 'string' || !ID_PATTERN.test(value)) throw new Error(`${label} must use lowercase kebab notation`); }
function validateLength(value, max, label) { if ([...value].length > max) throw new Error(`${label} exceeds ${max} characters`); }
function requireLength(value, max, label) { validateLength(value.trim(), max, label); }
function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
