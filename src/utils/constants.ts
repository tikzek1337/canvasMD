import type { TraceNodeKind } from '../types/project';

export const APP_NAME = 'canvasMD';
export const STORAGE_KEY = 'canvasmd.currentProject.v1';
export const PROJECTS_KEY = 'canvasmd.projects.v1';
export const ONBOARDING_KEY = 'canvasmd.onboardingDone.v1';

export const CREATABLE_NODE_KINDS = ['text', 'todo', 'image', 'link'] as const;
export type CreatableNodeKind = typeof CREATABLE_NODE_KINDS[number];

export const NODE_COLORS = [
  '#ffffff',
  '#fef3c7',
  '#dcfce7',
  '#dbeafe',
  '#fce7f3',
  '#ede9fe',
  '#fee2e2',
  '#e0f2fe'
];

export const OUTLINE_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#0ea5e9',
  '#8b5cf6',
  '#111827'
];

export const KIND_LABELS: Record<TraceNodeKind, string> = {
  text: 'Заметка',
  image: 'Изображение',
  todo: 'TODO',
  link: 'Ссылка',
  quote: 'Заметка',
  source: 'Заметка',
  evidence: 'Заметка',
  hypothesis: 'Заметка',
  group: 'Заметка'
};

export const KIND_DESCRIPTIONS: Record<TraceNodeKind, string> = {
  text: 'Обычная текстовая карточка для идей и заметок.',
  image: 'Карточка с изображением или скриншотом.',
  todo: 'Чек-лист с автоматическим статусом.',
  link: 'URL, профиль, статья или внешний материал.',
  quote: 'Устаревший тип. При загрузке преобразуется в заметку.',
  source: 'Устаревший тип. При загрузке преобразуется в заметку.',
  evidence: 'Устаревший тип. При загрузке преобразуется в заметку.',
  hypothesis: 'Устаревший тип. При загрузке преобразуется в заметку.',
  group: 'Устаревший тип. При загрузке преобразуется в заметку.'
};
