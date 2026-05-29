import { memo, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Handle, NodeResizer, Position, useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import clsx from 'clsx';
import {
  CalendarDays,
  ImagePlus,
  Link2,
  Maximize2,
  MessageSquare,
  Plus,
  Tag,
  Trash2
} from 'lucide-react';
import type { TraceNode, TraceNodeKind } from '../../types/project';
import { KIND_LABELS } from '../../utils/constants';
import { readFileAsDataUrl } from '../../utils/file';
import { getTaskProgress, taskStatusLabel } from '../../utils/tasks';
import { useProjectStore } from '../../store/useProjectStore';
import { RichTextEditor } from '../ui/RichTextEditor';

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

const MAX_CARD_WIDTH = 860;
const connectPositions = [Position.Left, Position.Right, Position.Top, Position.Bottom];

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
  if (!width || !height) return 420;
  const ratio = width / height;
  if (ratio >= 2.1) return 660;
  if (ratio >= 1.75) return 600;
  if (ratio >= 1.45) return 540;
  if (ratio >= 1.1) return 460;
  if (ratio >= 0.82) return 390;
  return 340;
}

function clampWidth(kind: TraceNodeKind, value?: number) {
  const min = MIN_WIDTH_BY_KIND[kind] ?? 320;
  const fallback = kind === 'image' ? 420 : min;
  const numeric = Number.isFinite(value) ? Number(value) : fallback;
  return Math.min(MAX_CARD_WIDTH, Math.max(min, numeric));
}

function TagInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState(value.join(', '));

  useEffect(() => {
    setDraft(value.join(', '));
  }, [value.join('|')]);

  function parseTags(raw: string) {
    return raw
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  function update(raw: string) {
    setDraft(raw);
    onChange(parseTags(raw));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== ' ') return;
    const raw = event.currentTarget.value;
    const trimmed = raw.trimEnd();
    if (!trimmed || trimmed.endsWith(',')) return;
    event.preventDefault();
    update(`${trimmed}, `);
  }

  return (
    <input
      value={draft}
      placeholder="теги через пробел или запятую"
      onKeyDown={handleKeyDown}
      onChange={(event) => update(event.target.value)}
      onBlur={() => setDraft(parseTags(draft).join(', '))}
    />
  );
}

function TraceNodeCardComponent({ id, data, selected, width }: NodeProps<TraceNode>) {
  const updateNodeData = useProjectStore((state) => state.updateNodeData);
  const addTodoItem = useProjectStore((state) => state.addTodoItem);
  const updateTodoItem = useProjectStore((state) => state.updateTodoItem);
  const removeTodoItem = useProjectStore((state) => state.removeTodoItem);
  const updateTodoMeta = useProjectStore((state) => state.updateTodoMeta);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resizeMode, setResizeMode] = useState(false);
  const updateNodeInternals = useUpdateNodeInternals();

  const taskProgress = getTaskProgress(data.task);
  const isCollapsed = Boolean(data.collapsed);
  const imageRatio = data.imageWidth && data.imageHeight ? `${data.imageWidth} / ${data.imageHeight}` : '4 / 3';
  const imageNodeWidth = data.kind === 'image' ? getImageNodeWidth(data.imageWidth, data.imageHeight) : undefined;
  const savedWidth = typeof data.cardWidth === 'number' ? data.cardWidth : undefined;
  const measuredWidth = typeof width === 'number' && width > 0 ? width : undefined;
  const cardWidth = clampWidth(data.kind, savedWidth ?? imageNodeWidth ?? measuredWidth);
  const canResize = selected && data.kind !== 'group';
  const outlineEnabled = Boolean(data.borderEnabled);
  const customStyle = {
    background: data.color,
    width: cardWidth,
    '--node-outline-color': data.borderColor ?? '#ef4444',
    '--node-checkbox-color': data.color
  } as CSSProperties;

  useEffect(() => {
    if (!selected) setResizeMode(false);
  }, [selected]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => updateNodeInternals(id));
    return () => window.cancelAnimationFrame(frame);
  }, [id, cardWidth, data.collapsed, data.imageWidth, data.imageHeight, updateNodeInternals]);

  async function handleImageChange(file?: File) {
    if (!file) return;
    const payload = await readImagePayload(file);
    updateNodeData(id, {
      imageDataUrl: payload.imageDataUrl,
      body: file.name,
      title: file.name.replace(/\.[^.]+$/, ''),
      imageWidth: payload.width,
      imageHeight: payload.height,
      cardWidth: getImageNodeWidth(payload.width, payload.height),
      cardHeight: undefined
    });
  }

  function stopPointer(event: React.PointerEvent | React.MouseEvent) {
    event.stopPropagation();
  }

  return (
    <div
      className={clsx(
        'trace-node',
        `node-${data.kind}`,
        selected && 'is-selected',
        outlineEnabled && 'has-custom-outline',
        data.textStyle?.accent && 'is-accent',
        data.kind === 'todo' && `todo-status-${taskProgress.status}`
      )}
      style={customStyle}
    >
      {canResize && resizeMode && (
        <NodeResizer
          isVisible
          minWidth={MIN_WIDTH_BY_KIND[data.kind] ?? 320}
          minHeight={140}
          lineClassName="resize-line nodrag nopan"
          handleClassName="resize-handle nodrag nopan"
          lineStyle={{ borderColor: 'rgba(180, 160, 255, .95)' }}
          handleStyle={{ width: 12, height: 12, background: '#9b7cff', border: '2px solid white', borderRadius: 999 }}
          onResize={(_event, params) => {
            updateNodeData(id, { cardWidth: clampWidth(data.kind, Math.round(params.width)), cardHeight: undefined });
            window.requestAnimationFrame(() => updateNodeInternals(id));
          }}
          onResizeEnd={(_event, params) => {
            updateNodeData(id, { cardWidth: clampWidth(data.kind, Math.round(params.width)), cardHeight: undefined });
            window.requestAnimationFrame(() => updateNodeInternals(id));
          }}
        />
      )}

      {connectPositions.map((position) => (
        <div key={position}>
          <Handle id={`source-${position}`} type="source" position={position} className="node-handle node-handle-loose node-handle-source" />
          <Handle id={`target-${position}`} type="target" position={position} className="node-handle node-handle-loose node-handle-target" />
        </div>
      ))}

      <div className="node-header">
        <span className="node-kind">{KIND_LABELS[data.kind]}</span>
        <div className="node-title-row">
          <input
            className="node-title nodrag"
            value={data.title}
            onChange={(event) => updateNodeData(id, { title: event.target.value })}
          />
          {selected && (
            <button
              type="button"
              className={clsx('resize-toggle nodrag', resizeMode && 'is-active')}
              title="Изменить размер"
              onPointerDown={stopPointer}
              onClick={(event) => {
                event.stopPropagation();
                setResizeMode((value) => !value);
              }}
            >
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </div>

      {data.kind === 'image' && (
        <div className="image-area nodrag">
          <div className="image-frame" style={{ aspectRatio: imageRatio }}>
            {data.imageDataUrl ? <img src={data.imageDataUrl} alt={data.title} /> : <div className="image-placeholder">Нет изображения</div>}
          </div>
          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept="image/*"
            onChange={(event) => handleImageChange(event.target.files?.[0])}
          />
          <button className="inline-action" onPointerDown={stopPointer} onClick={() => fileInputRef.current?.click()}><ImagePlus size={15} /> Загрузить</button>
        </div>
      )}

      {data.kind === 'link' && (
        <div className="link-area nodrag">
          <Link2 size={15} />
          <input value={data.url ?? data.body ?? ''} onChange={(event) => updateNodeData(id, { url: event.target.value, body: event.target.value })} />
          {(data.url || data.body) && <button onPointerDown={stopPointer} onClick={() => window.open(data.url ?? data.body, '_blank')}>Открыть</button>}
        </div>
      )}

      {data.kind === 'todo' && data.task && (
        <div className="todo-editor nodrag">
          <div className="todo-summary">
            <div className="todo-status-pill">{taskStatusLabel(taskProgress.status)}</div>
            <strong>{taskProgress.completed}/{taskProgress.total} выполнено</strong>
            <div className="progress-line"><i style={{ width: `${taskProgress.percent}%` }} /></div>
          </div>
          <label className="todo-deadline">
            <span><CalendarDays size={13} /> Дедлайн</span>
            <input type="date" value={data.task.deadline ?? ''} onChange={(event) => updateTodoMeta(id, { deadline: event.target.value })} />
          </label>
          <div className="checklist">
            {data.task.checklist.map((item) => (
              <label className={clsx('check-item', item.completed && 'is-checked')} key={item.id}>
                <input
                  className="check-native"
                  type="checkbox"
                  checked={item.completed}
                  onChange={(event) => updateTodoItem(id, item.id, { completed: event.target.checked })}
                />
                <span className="fake-checkbox" />
                <input
                  type="text"
                  value={item.text}
                  onChange={(event) => updateTodoItem(id, item.id, { text: event.target.value })}
                />
                <button onPointerDown={stopPointer} onClick={() => removeTodoItem(id, item.id)} title="Удалить пункт"><Trash2 size={13} /></button>
              </label>
            ))}
          </div>
          <button className="inline-action" onPointerDown={stopPointer} onClick={() => addTodoItem(id)}><Plus size={14} /> Добавить пункт</button>
        </div>
      )}

      {data.kind === 'text' && (
        <RichTextEditor
          value={data.body ?? ''}
          onChange={(value) => updateNodeData(id, { body: value })}
          collapsed={isCollapsed}
          onToggleCollapsed={() => updateNodeData(id, { collapsed: !isCollapsed })}
        />
      )}

      {data.kind !== 'todo' && (
        <div className="node-extra nodrag">
          <label className="tag-line">
            <Tag size={13} />
            <TagInput value={data.tags} onChange={(tags) => updateNodeData(id, { tags })} />
          </label>
          <label className="comment-line">
            <MessageSquare size={13} />
            <input
              value={data.comments ?? ''}
              placeholder="комментарий"
              onChange={(event) => updateNodeData(id, { comments: event.target.value })}
            />
          </label>
        </div>
      )}
    </div>
  );
}

export const TraceNodeCard = memo(TraceNodeCardComponent);
