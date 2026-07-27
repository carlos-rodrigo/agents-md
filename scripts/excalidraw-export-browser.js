import {
  convertToExcalidrawElements,
  exportToSvg,
  FONT_FAMILY,
} from '@excalidraw/excalidraw';
import { exportedElementId, normalizeSpec, reviewId } from './excalidraw-diagram-spec.mjs';

const EDITORIAL_INK = Object.freeze({
  paper: '#fffefa',
  primary: '#211f1b',
  accent: '#a33b20',
  info: '#285a75',
  infoSoft: '#eaf2f8',
  success: '#276544',
  successSoft: '#e8f2eb',
  warning: '#8b4d00',
  warningSoft: '#f8eedb',
  danger: '#a11c1c',
  dangerSoft: '#f8e8e5',
  external: '#654a80',
  externalSoft: '#f1ecf6',
});

window.renderExcalidrawDiagram = async (rawSpec) => {
  const spec = normalizeSpec(rawSpec);
  const skeleton = [
    ...spec.nodes.map((node) => toNode(spec, node)),
    ...spec.edges.map((edge) => toEdge(spec, edge)),
  ];
  const elements = convertToExcalidrawElements(skeleton, { regenerateIds: false });
  const svg = await exportToSvg({
    elements,
    appState: {
      exportBackground: true,
      viewBackgroundColor: spec.backgroundColor,
      exportWithDarkMode: false,
      exportEmbedScene: false,
    },
    files: null,
    exportPadding: spec.padding,
  });

  decorateSvg(svg, spec);
  return svg.outerHTML;
};

function toNode(spec, node) {
  const colors = nodeColors(node);
  const id = exportedElementId(spec, node.id);
  return {
    type: 'rectangle',
    id,
    seed: stableSeed(id),
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    strokeColor: colors.stroke,
    backgroundColor: colors.fill,
    fillStyle: node.fillStyle ?? 'solid',
    strokeWidth: node.strokeWidth,
    roughness: node.roughness,
    roundness: { type: 3 },
    label: {
      text: node.text,
      fontSize: node.fontSize,
      fontFamily: fontFamily(node.fontFamily),
      textAlign: 'center',
      verticalAlign: 'middle',
    },
  };
}

function toEdge(spec, edge) {
  const id = exportedElementId(spec, edge.id);
  return {
    type: 'arrow',
    id,
    seed: stableSeed(id),
    x: edge.x,
    y: edge.y,
    points: edge.points,
    strokeColor: edgeColor(edge),
    strokeWidth: edge.strokeWidth,
    roughness: edge.roughness,
    endArrowhead: edge.endArrowhead ?? 'arrow',
    label: edge.label ? {
      text: edge.label,
      fontSize: edge.fontSize,
      fontFamily: fontFamily(edge.fontFamily),
      textAlign: 'center',
      verticalAlign: 'middle',
    } : undefined,
  };
}

function decorateSvg(svg, spec) {
  const ns = 'http://www.w3.org/2000/svg';
  const titleId = safeId(`${spec.id}-title`);
  const descId = safeId(`${spec.id}-desc`);
  const title = document.createElementNS(ns, 'title');
  title.id = titleId;
  title.textContent = spec.title;
  const desc = document.createElementNS(ns, 'desc');
  desc.id = descId;
  desc.textContent = spec.desc;
  svg.prepend(desc);
  svg.prepend(title);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-labelledby', `${titleId} ${descId}`);
  svg.removeAttribute('aria-label');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('data-review-id', reviewId(spec, 'svg', undefined, spec.reviewId));

  // Pinned Excalidraw exports each labelled rectangle as adjacent shape/text
  // groups in skeleton order. The fixture test deliberately guards this API.
  const topGroups = Array.from(svg.querySelectorAll(':scope > g'));
  const expectedNodeGroups = spec.nodes.length * 2;
  if (topGroups.length < expectedNodeGroups) {
    throw new Error(`Excalidraw export returned ${topGroups.length} top-level groups; expected at least ${expectedNodeGroups}`);
  }
  const nodeGroups = topGroups.slice(0, expectedNodeGroups);
  spec.nodes.forEach((node, index) => {
    const wrapper = revealWrapper(ns, 'diagram-node diagram-reveal', node.revealDelay ?? index * spec.motion.stepMs);
    wrapper.setAttribute('data-review-id', reviewId(spec, 'node', node.id, node.reviewId));
    const shape = nodeGroups[index * 2];
    const text = nodeGroups[index * 2 + 1];
    shape.before(wrapper);
    wrapper.append(shape, text);
  });

  const nodeIndex = new Map(spec.nodes.map((node, index) => [node.id, index]));
  spec.edges.forEach((edge, index) => {
    const mask = svg.querySelector(`#mask-${CSS.escape(exportedElementId(spec, edge.id))}`);
    const edgeGroup = mask?.previousElementSibling;
    const labelGroup = mask?.nextElementSibling;
    if (!mask || !edgeGroup) throw new Error(`could not locate exported edge ${edge.id}`);

    const sourceIndex = nodeIndex.get(edge.from) ?? index;
    const delay = edge.revealDelay ?? sourceIndex * spec.motion.stepMs + Math.round(spec.motion.stepMs * 0.4);
    const edgeWrapper = revealWrapper(ns, 'diagram-edge diagram-reveal', delay);
    edgeWrapper.setAttribute('data-review-id', reviewId(spec, 'edge', edge.id, edge.reviewIds?.edge));
    edgeGroup.before(edgeWrapper);
    edgeWrapper.append(edgeGroup);

    if (edge.label) {
      if (!labelGroup || labelGroup.tagName.toLowerCase() !== 'g') {
        throw new Error(`could not locate exported label for edge ${edge.id}`);
      }
      const labelWrapper = revealWrapper(ns, 'diagram-edge-label diagram-reveal', delay + 50);
      labelWrapper.setAttribute('data-review-id', reviewId(spec, 'edge-label', edge.id, edge.reviewIds?.label));
      labelGroup.before(labelWrapper);
      labelWrapper.append(labelGroup);
    }
  });
}

function revealWrapper(ns, className, delay) {
  const wrapper = document.createElementNS(ns, 'g');
  wrapper.setAttribute('class', className);
  wrapper.setAttribute('style', `--reveal-delay:${delay}ms`);
  return wrapper;
}

function nodeColors(node) {
  if (node.fill || node.stroke) return { fill: node.fill ?? EDITORIAL_INK.paper, stroke: node.stroke ?? EDITORIAL_INK.primary };
  switch (node.kind) {
    case 'entry': return { fill: EDITORIAL_INK.infoSoft, stroke: EDITORIAL_INK.info };
    case 'domain': return { fill: EDITORIAL_INK.successSoft, stroke: EDITORIAL_INK.success };
    case 'repository': return { fill: EDITORIAL_INK.warningSoft, stroke: EDITORIAL_INK.warning };
    case 'feedback': return { fill: EDITORIAL_INK.externalSoft, stroke: EDITORIAL_INK.external };
    case 'risk': return { fill: EDITORIAL_INK.dangerSoft, stroke: EDITORIAL_INK.danger };
    default: return { fill: EDITORIAL_INK.paper, stroke: EDITORIAL_INK.primary };
  }
}

function edgeColor(edge) {
  if (edge.stroke) return edge.stroke;
  switch (edge.kind) {
    case 'boundary': return EDITORIAL_INK.info;
    case 'feedback': return EDITORIAL_INK.external;
    case 'risk': return EDITORIAL_INK.danger;
    case 'repository': return EDITORIAL_INK.warning;
    default: return EDITORIAL_INK.primary;
  }
}

function fontFamily(value) {
  if (value === 'cascadia' || value === 'mono') return FONT_FAMILY.Cascadia;
  return FONT_FAMILY.Virgil;
}

function stableSeed(value) {
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return Math.abs(hash) || 1;
}

function safeId(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}
