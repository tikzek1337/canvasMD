import {
  addEdge as addReactFlowEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type OnSelectionChangeParams,
  type Viewport,
  type XYPosition
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import type {
  ContextMenuState,
  TaskStatus,
  TextStyleState,
  ThemeMode,
  TraceEdge,
  TraceNode,
  TraceNodeData,
  TraceNodeKind,
  TraceProject
} from '../types/project';
import { ONBOARDING_KEY } from '../utils/constants';
import { nowIso } from '../utils/date';
import { parseProjectJson, serializeProject } from '../utils/export';
import { createStarterProject, makeEdge, makeNode } from './projectFactory';
import { loadCurrentProject, saveCurrentProject } from '../services/storageService';

interface ProjectState {
  project: TraceProject;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  searchQuery: string;
  taskStatusFilter: 'all' | TaskStatus;
  contextMenu: ContextMenuState;
  onboardingOpen: boolean;
  autosaveState: 'saved' | 'saving';
  lastCanvasPosition: XYPosition;
  pendingNodeKind: TraceNodeKind | null;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onSelectionChange: (params: OnSelectionChangeParams) => void;
  setViewport: (viewport: Viewport) => void;
  setLastCanvasPosition: (position: XYPosition) => void;
  setPendingNodeKind: (kind: TraceNodeKind | null) => void;
  placePendingNodeAt: (position: XYPosition) => boolean;
  addNode: (kind: TraceNodeKind, position: XYPosition, overrides?: Partial<TraceNodeData>) => string;
  updateNodeData: (id: string, patch: Partial<TraceNodeData>) => void;
  patchSelectedTextStyle: (patch: Partial<TextStyleState>) => void;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  deleteNode: (id: string) => void;
  deleteEdge: (edgeId: string) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  setSearchQuery: (value: string) => void;
  setTaskStatusFilter: (value: 'all' | TaskStatus) => void;
  setContextMenu: (menu: ContextMenuState) => void;
  closeContextMenu: () => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  renameProject: (name: string) => void;
  newProject: () => void;
  importProject: (raw: string) => void;
  exportProject: () => string;
  addTodoItem: (nodeId: string) => void;
  updateTodoItem: (nodeId: string, itemId: string, patch: { text?: string; completed?: boolean }) => void;
  removeTodoItem: (nodeId: string, itemId: string) => void;
  updateTodoMeta: (nodeId: string, patch: { deadline?: string }) => void;
  dismissOnboarding: () => void;
}

function withUpdatedProject(project: TraceProject, patch: Partial<TraceProject>): TraceProject {
  return {
    ...project,
    ...patch,
    updatedAt: nowIso()
  };
}

function loadInitialProject() {
  return loadCurrentProject() ?? createStarterProject();
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: loadInitialProject(),
  selectedNodeIds: [],
  selectedEdgeIds: [],
  searchQuery: '',
  taskStatusFilter: 'all',
  contextMenu: { open: false, screen: { x: 0, y: 0 }, canvas: { x: 0, y: 0 } },
  onboardingOpen: localStorage.getItem(ONBOARDING_KEY) !== 'true',
  autosaveState: 'saved',
  lastCanvasPosition: { x: 0, y: 0 },
  pendingNodeKind: null,

  onNodesChange: (changes) => {
    const project = get().project;
    const nodes = applyNodeChanges(changes, project.nodes) as TraceNode[];
    set({ project: withUpdatedProject(project, { nodes }), autosaveState: 'saving' });
  },

  onEdgesChange: (changes) => {
    const project = get().project;
    const edges = applyEdgeChanges(changes, project.edges) as TraceEdge[];
    set({ project: withUpdatedProject(project, { edges }), autosaveState: 'saving' });
  },

  onConnect: (connection) => {
    if (!connection.source || !connection.target) return;
    const project = get().project;
    const edge = {
      ...makeEdge(connection.source, connection.target, ''),
      sourceHandle: connection.sourceHandle ?? undefined,
      targetHandle: connection.targetHandle ?? undefined
    } as TraceEdge;
    set({
      project: withUpdatedProject(project, {
        edges: addReactFlowEdge(edge, project.edges) as TraceEdge[]
      }),
      autosaveState: 'saving'
    });
  },

  onSelectionChange: ({ nodes, edges }) => {
    set({
      selectedNodeIds: nodes.map((node) => node.id),
      selectedEdgeIds: edges.map((edge) => edge.id)
    });
  },

  setViewport: (viewport) => {
    const project = get().project;
    set({ project: withUpdatedProject(project, { viewport }), autosaveState: 'saving' });
  },

  setLastCanvasPosition: (position) => set({ lastCanvasPosition: position }),

  setPendingNodeKind: (kind) => set({ pendingNodeKind: kind }),

  placePendingNodeAt: (position) => {
    const kind = get().pendingNodeKind;
    if (!kind) return false;
    get().addNode(kind, position);
    set({ pendingNodeKind: null });
    return true;
  },

  addNode: (kind, position, overrides = {}) => {
    const node = makeNode(kind, position, overrides);
    const project = get().project;
    set({
      project: withUpdatedProject(project, { nodes: [...project.nodes, node] }),
      selectedNodeIds: [node.id],
      autosaveState: 'saving'
    });
    return node.id;
  },

  updateNodeData: (id, patch) => {
    const project = get().project;
    const nodes = project.nodes.map((node) => {
      if (node.id !== id) return node;
      return {
        ...node,
        data: {
          ...node.data,
          ...patch,
          updatedAt: nowIso()
        }
      } as TraceNode;
    });
    set({ project: withUpdatedProject(project, { nodes }), autosaveState: 'saving' });
  },

  patchSelectedTextStyle: (patch) => {
    const ids = get().selectedNodeIds;
    if (ids.length === 0) return;
    const project = get().project;
    const nodes = project.nodes.map((node) => {
      if (!ids.includes(node.id)) return node;
      return {
        ...node,
        data: {
          ...node.data,
          textStyle: { ...node.data.textStyle, ...patch },
          updatedAt: nowIso()
        }
      } as TraceNode;
    });
    set({ project: withUpdatedProject(project, { nodes }), autosaveState: 'saving' });
  },

  duplicateSelected: () => {
    const ids = get().selectedNodeIds;
    if (ids.length === 0) return;
    const project = get().project;
    const clones = project.nodes
      .filter((node) => ids.includes(node.id))
      .map((node) => ({
        ...node,
        id: nanoid(10),
        position: { x: node.position.x + 36, y: node.position.y + 36 },
        selected: false,
        data: { ...node.data, title: `${node.data.title} копия`, updatedAt: nowIso() }
      })) as TraceNode[];

    set({
      project: withUpdatedProject(project, { nodes: [...project.nodes, ...clones] }),
      selectedNodeIds: clones.map((node) => node.id),
      autosaveState: 'saving'
    });
  },

  deleteSelected: () => {
    const { selectedNodeIds, selectedEdgeIds, project } = get();
    if (selectedNodeIds.length === 0 && selectedEdgeIds.length === 0) return;
    set({
      project: withUpdatedProject(project, {
        nodes: project.nodes.filter((node) => !selectedNodeIds.includes(node.id)),
        edges: project.edges.filter(
          (edge) =>
            !selectedEdgeIds.includes(edge.id) &&
            !selectedNodeIds.includes(edge.source) &&
            !selectedNodeIds.includes(edge.target)
        )
      }),
      selectedNodeIds: [],
      selectedEdgeIds: [],
      autosaveState: 'saving'
    });
  },

  deleteNode: (id) => {
    const project = get().project;
    set({
      project: withUpdatedProject(project, {
        nodes: project.nodes.filter((node) => node.id !== id),
        edges: project.edges.filter((edge) => edge.source !== id && edge.target !== id)
      }),
      selectedNodeIds: get().selectedNodeIds.filter((nodeId) => nodeId !== id),
      autosaveState: 'saving'
    });
  },

  deleteEdge: (edgeId) => {
    const project = get().project;
    set({
      project: withUpdatedProject(project, { edges: project.edges.filter((edge) => edge.id !== edgeId) }),
      selectedEdgeIds: get().selectedEdgeIds.filter((id) => id !== edgeId),
      autosaveState: 'saving'
    });
  },

  updateEdgeLabel: (edgeId, label) => {
    const project = get().project;
    const edges = project.edges.map((edge) =>
      edge.id === edgeId ? ({ ...edge, label, data: { ...edge.data, label } } as TraceEdge) : edge
    );
    set({ project: withUpdatedProject(project, { edges }), autosaveState: 'saving' });
  },

  setSearchQuery: (value) => set({ searchQuery: value }),
  setTaskStatusFilter: (value) => set({ taskStatusFilter: value }),
  setContextMenu: (menu) => set({ contextMenu: menu }),
  closeContextMenu: () => set({ contextMenu: { open: false, screen: { x: 0, y: 0 }, canvas: { x: 0, y: 0 } } }),

  toggleTheme: () => {
    const nextTheme = get().project.theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  setTheme: (theme) => {
    const project = get().project;
    set({ project: withUpdatedProject(project, { theme }), autosaveState: 'saving' });
  },

  renameProject: (name) => {
    const project = get().project;
    set({ project: withUpdatedProject(project, { name: name.trim() || 'Без названия' }), autosaveState: 'saving' });
  },

  newProject: () => set({ project: createStarterProject(), selectedNodeIds: [], selectedEdgeIds: [], autosaveState: 'saving' }),

  importProject: (raw) => {
    const project = parseProjectJson(raw);
    set({ project, selectedNodeIds: [], selectedEdgeIds: [], autosaveState: 'saving' });
  },

  exportProject: () => serializeProject(get().project),

  addTodoItem: (nodeId) => {
    const node = get().project.nodes.find((item) => item.id === nodeId);
    if (!node?.data.task) return;
    get().updateNodeData(nodeId, {
      task: {
        ...node.data.task,
        checklist: [...node.data.task.checklist, { id: nanoid(8), text: 'Новая задача', completed: false }]
      }
    });
  },

  updateTodoItem: (nodeId, itemId, patch) => {
    const node = get().project.nodes.find((item) => item.id === nodeId);
    if (!node?.data.task) return;
    get().updateNodeData(nodeId, {
      task: {
        ...node.data.task,
        checklist: node.data.task.checklist.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
      }
    });
  },

  removeTodoItem: (nodeId, itemId) => {
    const node = get().project.nodes.find((item) => item.id === nodeId);
    if (!node?.data.task) return;
    get().updateNodeData(nodeId, {
      task: {
        ...node.data.task,
        checklist: node.data.task.checklist.filter((item) => item.id !== itemId)
      }
    });
  },

  updateTodoMeta: (nodeId, patch) => {
    const node = get().project.nodes.find((item) => item.id === nodeId);
    if (!node?.data.task) return;
    get().updateNodeData(nodeId, {
      task: {
        ...node.data.task,
        ...patch
      }
    });
  },

  dismissOnboarding: () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    set({ onboardingOpen: false });
  }
}));

let saveTimer: number | undefined;
useProjectStore.subscribe((state, previousState) => {
  if (state.project === previousState.project || state.autosaveState !== 'saving') return;

  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveCurrentProject(useProjectStore.getState().project);
    useProjectStore.setState({ autosaveState: 'saved' });
  }, 400);
});
