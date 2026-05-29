import type { ComponentType } from 'react';
import { CheckSquare, Image, Link2, Text, Trash2 } from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import type { TraceNodeKind } from '../../types/project';
import { KIND_LABELS } from '../../utils/constants';

const items: Array<{ kind: TraceNodeKind; icon: ComponentType<{ size?: number }> }> = [
  { kind: 'text', icon: Text },
  { kind: 'todo', icon: CheckSquare },
  { kind: 'image', icon: Image },
  { kind: 'link', icon: Link2 }
];

export function ContextMenu() {
  const menu = useProjectStore((state) => state.contextMenu);
  const addNode = useProjectStore((state) => state.addNode);
  const deleteNode = useProjectStore((state) => state.deleteNode);
  const closeContextMenu = useProjectStore((state) => state.closeContextMenu);

  if (!menu.open) return null;

  return (
    <div className="context-menu glass-panel" style={{ left: menu.screen.x, top: menu.screen.y }} onMouseLeave={closeContextMenu}>
      {menu.nodeId && (
        <button className="context-danger" onClick={() => { deleteNode(menu.nodeId!); closeContextMenu(); }}>
          <Trash2 size={15} /> Удалить карточку
        </button>
      )}
      <div className="context-title">Добавить на холст</div>
      {items.map(({ kind, icon: Icon }) => (
        <button
          key={kind}
          onClick={() => {
            addNode(kind, menu.canvas);
            closeContextMenu();
          }}
        >
          <Icon size={15} /> {KIND_LABELS[kind]}
        </button>
      ))}
    </div>
  );
}
