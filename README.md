# canvasMD

canvasMD — локальное Windows-приложение для визуальных заметок, TODO-карточек, изображений, ссылок и связей на бесконечном холсте.

## Возможности MVP

- бесконечный холст с zoom колесиком мыши;
- перемещение по холсту мышью;
- карточки: заметка, TODO, изображение, ссылка;
- связи между карточками через точки по сторонам;
- подписи к связям через верхнюю панель;
- удаление связи двойным кликом;
- ручное изменение ширины карточки через кнопку resize в карточке;
- редактор текста с форматированием отдельных выделенных слов;
- теги, комментарии и поиск;
- локальное автосохранение;
- импорт и экспорт всего проекта в JSON, включая изображения в base64/dataURL;
- светлая и черная тема;
- Windows NSIS-инсталлер с выбором папки установки.

## Установка зависимостей

```bash
npm install
```

## Запуск в режиме разработки

```bash
npm run dev
```

## Сборка Windows-инсталлера

```bash
npm run dist:win
```

Готовый установщик появится в папке `release/`. Установщик NSIS позволяет выбрать директорию установки.

## Структура проекта

```text
canvasmd/
├─ build/                 # Windows icon
├─ electron/              # main/preload Electron
├─ src/
│  ├─ assets/             # logo assets
│  ├─ components/         # UI, canvas, nodes, layout
│  ├─ pages/              # application pages
│  ├─ services/           # storage service
│  ├─ store/              # Zustand project store
│  ├─ styles/             # global styles
│  ├─ types/              # TypeScript types
│  └─ utils/              # helpers
├─ package.json
├─ vite.config.ts
└─ README.md
```

## Технологии

- Electron
- React
- TypeScript
- Vite
- React Flow / XYFlow
- Zustand
- electron-builder

## Оптимизация сборки

В v8 сборка переведена на один основной Windows target — NSIS installer, без обязательного portable-артефакта. Также отключены sourcemap-файлы в production-сборке, включен `asar` и `compression: maximum` в electron-builder.

## Планы развития

- вкладки проектов;
- плагины;
- синхронизация;
- горячие клавиши для всех операций;
- экспорт доски в PNG/PDF;
- расширенный markdown-редактор.
