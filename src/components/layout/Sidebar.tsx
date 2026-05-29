import type { ComponentType } from 'react';
import {
  CheckSquare,
  FileJson,
  Image,
  Link2,
  Moon,
  Search,
  Sun,
  Text,
  Upload
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useProjectStore } from '../../store/useProjectStore';
import type { TraceNodeKind } from '../../types/project';
import { KIND_LABELS } from '../../utils/constants';
import { downloadTextFile } from '../../utils/export';
import logoUrl from '../../assets/canvasmd-logo.png';

const nodeButtons: Array<{ kind: TraceNodeKind; icon: ComponentType<{ size?: number }> }> = [
  { kind: 'text', icon: Text },
  { kind: 'todo', icon: CheckSquare },
  { kind: 'image', icon: Image },
  { kind: 'link', icon: Link2 }
];

export function Sidebar() {
  const project = useProjectStore((state) => state.project);
  const renameProject = useProjectStore((state) => state.renameProject);
  const setPendingNodeKind = useProjectStore((state) => state.setPendingNodeKind);
  const newProject = useProjectStore((state) => state.newProject);
  const importProject = useProjectStore((state) => state.importProject);
  const exportProject = useProjectStore((state) => state.exportProject);
  const toggleTheme = useProjectStore((state) => state.toggleTheme);
  const searchQuery = useProjectStore((state) => state.searchQuery);
  const setSearchQuery = useProjectStore((state) => state.setSearchQuery);
  const pendingNodeKind = useProjectStore((state) => state.pendingNodeKind);

  async function handleExport() {
    const payload = exportProject();
    if (window.canvasMDApi) {
      await window.canvasMDApi.saveJson(payload);
      return;
    }
    downloadTextFile(`${project.name.replace(/\s+/g, '-').toLowerCase()}.json`, payload);
  }

  async function handleImport() {
    if (window.canvasMDApi) {
      const result = await window.canvasMDApi.openJson();
      if (result.ok && result.content) importProject(result.content);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      file.text().then(importProject).catch((error) => window.alert(error.message));
    };
    input.click();
  }

  return (
    <aside className="sidebar glass-panel">
      <div className="brand brand-plain">
        <img className="brand-logo" src={logoUrl} alt="canvasMD" />
        <strong>canvasMD</strong>
      </div>

      <label className="field-label">Название проекта</label>
      <input className="text-field project-title" value={project.name} onChange={(event) => renameProject(event.target.value)} />

      <div className="sidebar-row">
        <Button onClick={newProject}>Новый</Button>
        <Button onClick={toggleTheme} title="Переключить тему">
          {project.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>

      <div className="sidebar-row">
        <Button onClick={handleImport}><Upload size={16} /> Импорт</Button>
        <Button onClick={handleExport}><FileJson size={16} /> Экспорт</Button>
      </div>

      <div className="search-box">
        <Search size={16} />
        <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Поиск по доске, тегам, комментариям" />
      </div>

      <div className="section-title">Создать блок</div>
      <div className="spawn-hint">Нажмите тип блока, затем кликните на точное место на холсте. Блок можно также перетащить мышью.</div>
      <div className="node-palette">
        {nodeButtons.map(({ kind, icon: Icon }) => (
          <button
            key={kind}
            className={`palette-button ${pendingNodeKind === kind ? 'is-armed' : ''}`}
            draggable
            onDragStart={(event) => event.dataTransfer.setData('application/canvasmd-node', kind)}
            onClick={() => setPendingNodeKind(pendingNodeKind === kind ? null : kind)}
          >
            <Icon size={17} />
            <span>{KIND_LABELS[kind]}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
