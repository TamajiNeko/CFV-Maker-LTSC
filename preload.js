const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setTheme: (theme) => ipcRenderer.send('theme-changed', theme),
  onThemeUpdated: (callback) => {
    const subscription = (event, theme) => callback(theme);
    ipcRenderer.on('theme-updated', subscription);
    return () => {
      ipcRenderer.removeListener('theme-updated', subscription);
    };
  },
  newProject: () => ipcRenderer.send('new-project'),
  onCloseRequest: (callback) => {
    const subscription = () => callback();
    ipcRenderer.on('close-window-request', subscription);
    return () => {
      ipcRenderer.removeListener('close-window-request', subscription);
    };
  },
  forceClose: () => ipcRenderer.send('force-close-window'),
  saveFile: (data, defaultPath, filters) => ipcRenderer.invoke('save-file-dialog', { data, defaultPath, filters })
});
