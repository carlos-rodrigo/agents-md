import { LIMITS } from './spec-sequence-v2.mjs';

const HEADER_HEIGHT = 96;
const ROW_HEIGHT = 72;
const OUTER = 48;
const LANE_MIN = 220;
const NOTE_PADDING = 18;

export function layoutSequence(spec) {
  const metrics = measureSpec(spec);
  const participantWidths = spec.participants.map((participant) => Math.max(160, metrics.textWidth(participant.label, 16) + 48));
  const laneGaps = participantWidths.slice(0, -1).map(() => LANE_MIN);
  const participantX = [];
  let x = OUTER;
  spec.participants.forEach((participant, index) => {
    participantX.push(x + participantWidths[index] / 2);
    x += participantWidths[index] + (laneGaps[index] ?? 0);
  });
  const participantIndex = new Map(spec.participants.map((participant, index) => [participant.id, index]));
  const rows = [];
  const messages = [];
  const notes = [];
  const fragments = [];
  let row = 0;
  let maxLabelWidth = 0;

  function eventHeight(event) {
    if (event.type !== 'fragment') return 1;
    return event.branches.reduce((total, branch) => total + branch.events.reduce((count, child) => count + eventHeight(child), 0) + 1, 0) + 1;
  }

  function visitEvents(events, fragmentId = null) {
    for (const event of events) {
      if (event.type === 'fragment') {
        const startRow = row;
        row += 1;
        const branchLayouts = [];
        for (const branch of event.branches) {
          const branchStart = row;
          visitEvents(branch.events, event.id);
          branchLayouts.push({ id: branch.id, label: branch.label, startRow: branchStart, endRow: row });
          row += 1;
        }
        fragments.push({ ...event, startRow, endRow: row, branchLayouts, parentFragment: fragmentId });
        continue;
      }
      rows.push({ event, row, fragmentId });
      if (event.type === 'message') {
        const from = participantIndex.get(event.from); const to = participantIndex.get(event.to);
        const labelWidth = metrics.textWidth(event.label, 14) + 80;
        maxLabelWidth = Math.max(maxLabelWidth, labelWidth);
        if (from !== to) {
          for (let index = Math.min(from, to); index < Math.max(from, to); index += 1) laneGaps[index] = Math.max(laneGaps[index], Math.ceil(labelWidth / Math.max(1, Math.abs(to - from))) + 72);
        } else laneGaps[from] = Math.max(laneGaps[from] ?? LANE_MIN, 160);
        messages.push({ ...event, row, fromIndex: from, toIndex: to });
      } else {
        const width = Math.min(480, Math.max(160, metrics.textWidth(event.text, 14) + NOTE_PADDING * 2));
        notes.push({ ...event, row, width });
      }
      row += 1;
    }
  }
  visitEvents(spec.events);

  // Recompute participant centers after the one source-ordered gap-expansion pass.
  participantX.length = 0; x = OUTER;
  spec.participants.forEach((participant, index) => { participantX.push(Math.round(x + participantWidths[index] / 2)); x += participantWidths[index] + (laneGaps[index] ?? 0); });
  const width = Math.ceil(x + OUTER);
  const height = Math.ceil(OUTER + HEADER_HEIGHT + row * ROW_HEIGHT + 48);
  if (width > LIMITS.viewBoxWidth) throw new Error(`sequence layout width exceeds ${LIMITS.viewBoxWidth}`);
  if (height > LIMITS.viewBoxHeight) throw new Error(`sequence layout height exceeds ${LIMITS.viewBoxHeight}`);

  const participantLayouts = spec.participants.map((participant, index) => ({ ...participant, x: participantX[index], width: participantWidths[index], headerY: OUTER, lifelineStart: OUTER + HEADER_HEIGHT, lifelineEnd: height - OUTER }));
  const messageLayouts = messages.map((message) => ({ ...message, y: OUTER + HEADER_HEIGHT + message.row * ROW_HEIGHT + ROW_HEIGHT / 2, fromX: participantX[message.fromIndex], toX: participantX[message.toIndex] }));
  const noteLayouts = notes.map((note) => ({ ...note, y: OUTER + HEADER_HEIGHT + note.row * ROW_HEIGHT + ROW_HEIGHT / 2, x: participantX[participantIndex.get(note.anchor)] ?? OUTER + note.width / 2 }));
  const fragmentLayouts = fragments.map((fragment) => ({ ...fragment, top: OUTER + HEADER_HEIGHT + fragment.startRow * ROW_HEIGHT - 24, bottom: OUTER + HEADER_HEIGHT + fragment.endRow * ROW_HEIGHT + 24, branches: fragment.branchLayouts.map((branch) => ({ ...branch, top: OUTER + HEADER_HEIGHT + branch.startRow * ROW_HEIGHT, bottom: OUTER + HEADER_HEIGHT + branch.endRow * ROW_HEIGHT })) }));
  const activationLayouts = spec.activations.map((activation) => ({ ...activation, x: participantX[participantIndex.get(activation.participant)] + 16, top: OUTER + HEADER_HEIGHT + activation.startOrder * ROW_HEIGHT + 12, bottom: OUTER + HEADER_HEIGHT + (activation.endOrder + 1) * ROW_HEIGHT - 12 }));
  return { schemaVersion: spec.schemaVersion, diagramType: spec.diagramType, layoutVersion: spec.layoutVersion, id: spec.id, title: spec.title, desc: spec.desc, reviewPrefix: spec.reviewPrefix, width, height, participantLayouts, messageLayouts, noteLayouts, fragmentLayouts, activationLayouts, rows, maxLabelWidth };
}

function measureSpec(spec) {
  return { textWidth(text, size) { return Math.ceil([...String(text)].reduce((total, character) => total + (character === ' ' ? size * .5 : size), 0)); } };
}
