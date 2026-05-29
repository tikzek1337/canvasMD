import { useCallback, useEffect, useMemo, type DragEvent, type MouseEvent as ReactMouseEvent } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ConnectionMode,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import type { EdgeMouseHandler, NodeMouseHandler } from '@xyflow/react';
import { useProjectStore } from '../../store/useProjectStore';
import { TraceNodeCard } from '../nodes/TraceNodeCard';
import { ContextMenu } from './ContextMenu';
import { readFileAsDataUrl } from '../../utils/file';
import type { TraceNode, TraceNodeKind } from '../../types/project';
import { CREATABLE_NODE_KINDS } from '../../utils/constants';

const nodeTypes = { traceNode: TraceNodeCard };

async function readImagePayload(file: File) {
  const imageDataUrl = await readFileAsDataUrl(file);
  const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.src = imageDataUrl;
  });
  return { imageDataUrl, ...dimensions };
}

function getImageNodeWidth(width?: number, height?: number) {
  if (!width || !height) return 380;
  const ratio = width / height;
  if (ratio >= 1.9) return 560;
  if (ratio >= 1.6) return 520;
  if (ratio >= 1.25) return 460;
  if (ratio >= 0.9) return 380;
  return 320;
}


function searchableText(node: TraceNode) {
  const data = node.data;
  const plainBody = (data.body ?? '').replace(/<[^>]*>/g, ' ');
  return [data.title, plainBody, data.url, data.comments, ...data.tags].join(' ').toLowerCase();
}

function CanvasInner() {
  const project = useProjectStore((state) => state.project);
  const searchQuery = useProjectStore((state) => state.searchQuery);
  const selectedNodeIds = useProjectStore((state) => state.selectedNodeIds);
  const onNodesChange = useProjectStore((state) => state.onNodesChange);
  const onEdgesChange = useProjectStore((state) => state.onEdgesChange);
  const onConnect = useProjectStore((state) => state.onConnect);
  const onSelectionChange = useProjectStore((state) => state.onSelectionChange);
  const setViewport = useProjectStore((state) => state.setViewport);
  const setContextMenu = useProjectStore((state) => state.setContextMenu);
  const closeContextMenu = useProjectStore((state) => state.closeContextMenu);
  const deleteSelected = useProjectStore((state) => state.deleteSelected);
  const duplicateSelected = useProjectStore((state) => state.duplicateSelected);
  const addNode = useProjectStore((state) => state.addNode);
  const deleteEdge = useProjectStore((state) => state.deleteEdge);
  const setLastCanvasPosition = useProjectStore((state) => state.setLastCanvasPosition);
  const placePendingNodeAt = useProjectStore((state) => state.placePendingNodeAt);
  const pendingNodeKind = useProjectStore((state) => state.pendingNodeKind);
  const { screenToFlowPosition, getViewport, fitView } = useReactFlow();

  const query = searchQuery.trim().toLowerCase();
  const nodes = useMemo(() => {
    if (!query) return project.nodes;
    return project.nodes.map((node) => ({
      ...node,
      className: searchableText(node).includes(query) ? 'search-match' : 'search-dim'
    }));
  }, [project.nodes, query]);

  const onPaneContextMenu = useCallback((event: ReactMouseEvent<Element> | globalThis.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      open: true,
      screen: { x: event.clientX, y: event.clientY },
      canvas: screenToFlowPosition({ x: event.clientX, y: event.clientY })
    });
  }, [screenToFlowPosition, setContextMenu]);

  const onPaneMouseMove = useCallback((event: ReactMouseEvent<Element> | globalThis.MouseEvent) => {
    setLastCanvasPosition(screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  }, [screenToFlowPosition, setLastCanvasPosition]);

  const onNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({
      open: true,
      screen: { x: event.clientX, y: event.clientY },
      canvas: node.position,
      nodeId: node.id
    });
  }, [setContextMenu]);

  const onPaneClick = useCallback((event: ReactMouseEvent<Element> | globalThis.MouseEvent) => {
    closeContextMenu();
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    placePendingNodeAt(position);
  }, [closeContextMenu, placePendingNodeAt, screenToFlowPosition]);

  const onEdgeDoubleClick: EdgeMouseHandler = useCallback((_event, edge) => {
    deleteEdge(edge.id);
  }, [deleteEdge]);

  const onDrop = useCallback(async (event: DragEvent<Element>) => {
    event.preventDefault();
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const droppedKind = event.dataTransfer.getData('application/canvasmd-node');
    if (droppedKind && (CREATABLE_NODE_KINDS as readonly string[]).includes(droppedKind)) {
      addNode(droppedKind as TraceNodeKind, position);
      return;
    }

    const file = event.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) {
      const payload = await readImagePayload(file);
      addNode('image', position, {
        imageDataUrl: payload.imageDataUrl,
        body: file.name,
        title: file.name.replace(/\.[^.]+$/, ''),
        imageWidth: payload.width,
        imageHeight: payload.height,
        cardWidth: getImageNodeWidth(payload.width, payload.height)
      });
      return;
    }
    const url = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain');
    if (url) addNode('link', position, { title: 'Новая ссылка', url, body: url, tags: ['link'] });
  }, [addNode, screenToFlowPosition]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
      if (isTyping) return;
      if (event.key === 'Delete' || event.key === 'Backspace') deleteSelected();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        duplicateSelected();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === '0') {
        event.preventDefault();
        fitView({ padding: 0.2, duration: 500 });
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [deleteSelected, duplicateSelected, fitView]);

  useEffect(() => {
    document.documentElement.dataset.theme = project.theme;
  }, [project.theme]);

  return (
    <div className="canvas-wrap" onDragOver={(event) => event.preventDefault()}>
      <ReactFlow
        key={project.id}
        nodes={nodes}
        edges={project.edges}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        onPaneMouseMove={onPaneMouseMove}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onMoveEnd={() => setViewport(getViewport())}
        onDrop={onDrop}
        defaultViewport={project.viewport}
        minZoom={0.15}
        maxZoom={2.4}
        fitView
        snapToGrid
        snapGrid={[12, 12]}
        panOnScroll={false}
        zoomOnScroll
        selectionOnDrag
        multiSelectionKeyCode="Shift"
        deleteKeyCode={null}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} />
        <Controls showInteractive={false} />
        <MiniMap zoomable pannable nodeStrokeWidth={3} nodeColor={(node) => String((node as TraceNode).data.color ?? '#ffffff')} />
      </ReactFlow>
      <ContextMenu />
      {pendingNodeKind && <div className="placement-chip glass-panel">Кликните по холсту, чтобы поставить блок</div>}
      {selectedNodeIds.length > 1 && <div className="selection-chip glass-panel">Выбрано карточек: {selectedNodeIds.length}</div>}
    </div>
  );
}

export function InfiniteCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
