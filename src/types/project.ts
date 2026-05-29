import type { Edge, Node, XYPosition } from '@xyflow/react';

export type ThemeMode = 'light' | 'dark';

export type TraceNodeKind =
  | 'text'
  | 'image'
  | 'todo'
  | 'link'
  | 'quote'
  | 'source'
  | 'evidence'
  | 'hypothesis'
  | 'group';

export type TaskStatus = 'not-started' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TextStyleState {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontFamily?: string;
  accent?: boolean;
  highlight?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TraceTaskMeta {
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string;
  checklist: TodoItem[];
}

export interface TraceNodeData extends Record<string, unknown> {
  kind: TraceNodeKind;
  title: string;
  body?: string;
  url?: string;
  imageDataUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  cardWidth?: number;
  cardHeight?: number;
  borderEnabled?: boolean;
  borderColor?: string;
  tags: string[];
  comments?: string;
  color: string;
  textStyle?: TextStyleState;
  task?: TraceTaskMeta;
  collapsed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TraceNode = Node<TraceNodeData, 'traceNode'>;
export type TraceEdge = Edge<{ label?: string }>;

export interface ProjectViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface TraceProject {
  id: string;
  name: string;
  nodes: TraceNode[];
  edges: TraceEdge[];
  viewport: ProjectViewport;
  theme: ThemeMode;
  createdAt: string;
  updatedAt: string;
}

export interface ContextMenuState {
  open: boolean;
  screen: { x: number; y: number };
  canvas: XYPosition;
  nodeId?: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
}
