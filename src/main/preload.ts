// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { storeType } from './store';

export type Channels =
  | 'dialog:openFolder'
  | 'dialog:openFiles'
  | 'taskStatus'
  | 'task:tagImages'
  | 'task:loadImages'
  | 'task:cancel'
  | 'task:saveTags'
  | 'openSettings'
  | 'setTagThreshold';

// use taskStatus:start|name|message
// use taskStatus:progress|name|message|percentage
// use taskStatus:end|name|message?

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, args?: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  store: {
    get<T extends keyof storeType>(key: T): storeType[T] {
      return ipcRenderer.sendSync('electron-store-get', key) as storeType[T];
    },
    set<T extends keyof storeType>(key: T, val: storeType[T]) {
      ipcRenderer.send('electron-store-set', key, val);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
