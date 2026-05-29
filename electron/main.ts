import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

let mainWindow: BrowserWindow | null = null;

function getRendererEntry() {
  return path.resolve(__dirname, '..', 'dist', 'index.html');
}

function getIconPath() {
  if (app.isPackaged) return path.join(process.resourcesPath, 'icon.ico');
  return path.resolve(__dirname, '..', 'build', 'icon.ico');
}

async function loadRenderer(window: BrowserWindow) {
  if (!app.isPackaged) {
    await window.loadURL('http://localhost:5173');
    window.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  const indexPath = getRendererEntry();
  if (!existsSync(indexPath)) {
    await window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
      <body style="margin:0;background:#020202;color:#f5f5f7;font-family:Segoe UI,Arial;padding:32px">
        <h2>canvasMD не нашел файл интерфейса</h2>
        <p>Ожидался файл:</p>
        <pre>${indexPath}</pre>
        <p>Пересоберите приложение командой <b>npm run dist:win</b>.</p>
      </body>
    `)}`);
    return;
  }

  await window.loadFile(indexPath);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 1120,
    minHeight: 720,
    backgroundColor: '#020202',
    title: 'canvasMD',
    icon: getIconPath(),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('[canvasMD] Renderer load failed:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('[canvasMD] Renderer process gone:', details.reason);
  });

  loadRenderer(mainWindow).catch(async (error) => {
    console.error('[canvasMD] Failed to load renderer:', error);
    await mainWindow?.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
      <body style="margin:0;background:#020202;color:#f5f5f7;font-family:Segoe UI,Arial;padding:32px">
        <h2>canvasMD не смог загрузить интерфейс</h2>
        <pre>${String(error?.stack ?? error)}</pre>
      </body>
    `)}`);
    mainWindow?.show();
  });
}

app.whenReady().then(() => {
  app.setName('canvasMD');
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('project:saveJson', async (_event, payload: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    title: 'Экспорт проекта canvasMD',
    defaultPath: 'canvasmd-project.json',
    filters: [{ name: 'canvasMD JSON', extensions: ['json'] }]
  });

  if (result.canceled || !result.filePath) return { ok: false, canceled: true };
  await fs.writeFile(result.filePath, payload, 'utf8');
  return { ok: true, path: result.filePath };
});

ipcMain.handle('project:openJson', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Импорт проекта canvasMD',
    filters: [{ name: 'canvasMD JSON', extensions: ['json'] }],
    properties: ['openFile']
  });

  if (result.canceled || result.filePaths.length === 0) return { ok: false, canceled: true };
  const content = await fs.readFile(result.filePaths[0], 'utf8');
  return { ok: true, content, path: result.filePaths[0] };
});
