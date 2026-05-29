import { Copy, Link2, Palette, Square, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useProjectStore } from '../../store/useProjectStore';
import { NODE_COLORS, OUTLINE_COLORS } from '../../utils/constants';

export function Topbar() {
  const selectedNodeIds = useProjectStore((state) => state.selectedNodeIds);
  const selectedEdgeIds = useProjectStore((state) => state.selectedEdgeIds);
  const nodes = useProjectStore((state) => state.project.nodes);
  const edges = useProjectStore((state) => state.project.edges);
  const autosaveState = useProjectStore((state) => state.autosaveState);
  const updateNodeData = useProjectStore((state) => state.updateNodeData);
  const duplicateSelected = useProjectStore((state) => state.duplicateSelected);
  const deleteSelected = useProjectStore((state) => state.deleteSelected);
  const updateEdgeLabel = useProjectStore((state) => state.updateEdgeLabel);

  const selectedCount = selectedNodeIds.length + selectedEdgeIds.length;
  const selectedEdge = selectedEdgeIds.length === 1 ? edges.find((edge) => edge.id === selectedEdgeIds[0]) : undefined;
  const selectedNode = selectedNodeIds.length === 1 ? nodes.find((node) => node.id === selectedNodeIds[0]) : undefined;
  const hasSelectedNodes = selectedNodeIds.length > 0;

  function setColor(color: string) {
    selectedNodeIds.forEach((id) => updateNodeData(id, { color }));
  }

  function setOutline(enabled: boolean) {
    selectedNodeIds.forEach((id) => updateNodeData(id, { borderEnabled: enabled }));
  }

  function setOutlineColor(color: string) {
    selectedNodeIds.forEach((id) => updateNodeData(id, { borderColor: color, borderEnabled: true }));
  }

  return (
    <header className="topbar glass-panel">
      <div className="selection-state">
        <strong>{selectedCount ? `Выбрано: ${selectedCount}` : 'Холст готов'}</strong>
        <span>{autosaveState === 'saved' ? 'Автосохранено' : 'Сохранение...'}</span>
      </div>

      {selectedEdge ? (
        <label className="edge-label-editor">
          <Link2 size={16} />
          <span>Текст связи</span>
          <input
            value={String(selectedEdge.label ?? '')}
            placeholder="Пусто"
            onChange={(event) => updateEdgeLabel(selectedEdge.id, event.target.value)}
          />
        </label>
      ) : (
        <>
          <div className="toolbar-group color-toolbar" aria-label="Цвет карточки">
            <Palette size={16} />
            {NODE_COLORS.map((color) => (
              <button
                key={color}
                className="color-dot"
                style={{ background: color }}
                disabled={!hasSelectedNodes}
                onClick={() => setColor(color)}
                title={color}
              />
            ))}
          </div>
          <div className="outline-toolbar">
            <button
              className={`outline-switch ${selectedNode?.data.borderEnabled ? 'is-active' : ''}`}
              disabled={!hasSelectedNodes}
              onClick={() => setOutline(!selectedNode?.data.borderEnabled)}
              title="Включить / выключить обводку"
            >
              <Square size={15} /> Обводка
            </button>
            {OUTLINE_COLORS.map((color) => (
              <button
                key={color}
                className="outline-dot"
                style={{ background: color }}
                disabled={!hasSelectedNodes}
                onClick={() => setOutlineColor(color)}
                title={`Обводка ${color}`}
              />
            ))}
          </div>
        </>
      )}

      <div className="toolbar-actions">
        {selectedNode && <span className="selected-node-kind">{selectedNode.data.title}</span>}
        <Button disabled={!selectedNodeIds.length} onClick={duplicateSelected}><Copy size={16} /> Дублировать</Button>
        <Button variant="danger" disabled={!selectedCount} onClick={deleteSelected}><Trash2 size={16} /> Удалить</Button>
      </div>
    </header>
  );
}
