import { useEffect, useMemo, useRef } from 'react';
import { Bold, ChevronDown, ChevronUp, Highlighter, Italic, List, ListOrdered, Type, Underline } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  collapsed?: boolean;
  onToggleCollapsed: () => void;
  quote?: boolean;
}

const fonts = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'JetBrains Mono', label: 'Mono' }
];

function selectionBelongsToEditor(editor: HTMLDivElement, selection: Selection | null) {
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  return editor.contains(range.commonAncestorContainer);
}

export function RichTextEditor({ value, onChange, collapsed, onToggleCollapsed, quote = false }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const content = useMemo(() => value || '<p></p>', [value]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== content) editorRef.current.innerHTML = content;
  }, [content]);

  function saveSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selectionBelongsToEditor(editor, selection)) return;
    savedRangeRef.current = selection!.getRangeAt(0).cloneRange();
  }

  function restoreSelection() {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    if (savedRangeRef.current) selection.addRange(savedRangeRef.current);
  }

  function emitChange() {
    onChange(editorRef.current?.innerHTML ?? '');
  }

  function run(command: string, commandValue?: string) {
    restoreSelection();
    document.execCommand(command, false, commandValue);
    saveSelection();
    emitChange();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === 'b') {
      event.preventDefault();
      run('bold');
    }
    if (key === 'i') {
      event.preventDefault();
      run('italic');
    }
    if (key === 'u') {
      event.preventDefault();
      run('underline');
    }
  }

  const preventFocusLoss = (handler: () => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    handler();
  };

  return (
    <div className="rich-editor nodrag">
      <div className="rich-toolbar">
        <button type="button" onMouseDown={preventFocusLoss(() => run('bold'))} title="Жирный"><Bold size={14} /></button>
        <button type="button" onMouseDown={preventFocusLoss(() => run('italic'))} title="Курсив"><Italic size={14} /></button>
        <button type="button" onMouseDown={preventFocusLoss(() => run('underline'))} title="Подчеркивание"><Underline size={14} /></button>
        <button type="button" onMouseDown={preventFocusLoss(() => run('hiliteColor', '#fff3a3'))} title="Подсветка"><Highlighter size={14} /></button>
        <button type="button" onMouseDown={preventFocusLoss(() => run('insertUnorderedList'))} title="Маркированный список"><List size={14} /></button>
        <button type="button" onMouseDown={preventFocusLoss(() => run('insertOrderedList'))} title="Нумерованный список"><ListOrdered size={14} /></button>
        <button type="button" onMouseDown={preventFocusLoss(() => run('formatBlock', 'h3'))} title="Заголовок">H</button>
        <div className="rich-font-picker">
          <Type size={14} />
          <select
            defaultValue="Inter"
            onChange={(event) => {
              run('fontName', event.target.value);
              event.currentTarget.blur();
            }}
          >
            {fonts.map((font) => <option value={font.value} key={font.value}>{font.label}</option>)}
          </select>
        </div>
      </div>

      <div
        ref={editorRef}
        className={`node-body rich-body ${collapsed ? 'is-collapsed' : ''} ${quote ? 'quote-body' : ''}`}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onKeyDown={handleKeyDown}
        onBlur={saveSelection}
      />

      <div className="rich-footer">
        <button
          type="button"
          className="expand-button nodrag"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleCollapsed();
          }}
        >
          {collapsed ? <>Развернуть <ChevronDown size={14} /></> : <>Свернуть <ChevronUp size={14} /></>}
        </button>
      </div>
    </div>
  );
}
