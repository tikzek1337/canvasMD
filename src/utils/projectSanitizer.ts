import type { TraceNode, TraceNodeKind, TraceProject } from '../types/project';

const ALLOWED_KINDS = new Set<TraceNodeKind>(['text', 'image', 'todo', 'link']);

const MIN_WIDTH_BY_KIND: Record<TraceNodeKind, number> = {
  text: 320,
  image: 340,
  todo: 360,
  link: 340,
  quote: 320,
  source: 320,
  evidence: 320,
  hypothesis: 320,
  group: 520
};

const DEFAULT_WIDTH_BY_KIND: Record<TraceNodeKind, number> = {
  text: 340,
  image: 420,
  todo: 380,
  link: 360,
  quote: 340,
  source: 340,
  evidence: 340,
  hypothesis: 340,
  group: 520
};

function normalizeKind(kind: TraceNodeKind): TraceNodeKind {
  return ALLOWED_KINDS.has(kind) ? kind : 'text';
}

function clampWidth(kind: TraceNodeKind, value: unknown) {
  const normalized = normalizeKind(kind);
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : DEFAULT_WIDTH_BY_KIND[normalized];
  return Math.min(860, Math.max(MIN_WIDTH_BY_KIND[normalized], Math.round(numeric)));
}

export function sanitizeProject(project: TraceProject): TraceProject {
  return {
    ...project,
    nodes: project.nodes.map((node) => sanitizeNode(node))
  };
}

function sanitizeNode(node: TraceNode): TraceNode {
  const originalKind = node.data.kind;
  const kind = normalizeKind(originalKind);
  const data = {
    ...node.data,
    kind,
    task: kind === 'todo' ? node.data.task : undefined,
    borderEnabled: Boolean(node.data.borderEnabled),
    borderColor: typeof node.data.borderColor === 'string' ? node.data.borderColor : '#ef4444',
    tags: Array.isArray(node.data.tags) ? node.data.tags : [],
    cardWidth: clampWidth(kind, node.data.cardWidth),
    cardHeight: undefined
  };

  if (originalKind !== kind) {
    data.borderEnabled = false;
    data.body = node.data.body || '<p>Импортированная заметка.</p>';
  }

  return {
    ...node,
    width: undefined,
    height: undefined,
    style: undefined,
    data
  } as TraceNode;
}
