import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('canvasMDApi', {
  saveJson: (payload: string) => ipcRenderer.invoke('project:saveJson', payload),
  openJson: () => ipcRenderer.invoke('project:openJson')
});
