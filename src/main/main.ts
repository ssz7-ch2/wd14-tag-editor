/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { BrowserWindow, app, ipcMain, shell } from 'electron';
import path from 'path';
// import { autoUpdater } from 'electron-updater';
// import log from 'electron-log';
import { ChildProcessWithoutNullStreams } from 'child_process';
import {
  handleFilesDrop,
  handleFilesOpen,
  handleFolderOpen,
  saveTags,
} from './ipc/file';
import { tagImages } from './ipc/tagger';
import setUp from './python';
import { Task } from './task';
import { resolveHtmlPath } from './util';

let mainWindow: BrowserWindow | null = null;
let python: ChildProcessWithoutNullStreams | null = null;

ipcMain.on('dialog:openFolder', async (event) => {
  const [images, imagesTags] = await handleFolderOpen(mainWindow);
  event.reply('dialog:openFolder', images, imagesTags);
});

ipcMain.on('dialog:openFiles', async (event) => {
  const [images, imagesTags] = await handleFilesOpen(mainWindow);
  event.reply('dialog:openFiles', images, imagesTags);
});

ipcMain.on('task:loadImages', async (event, arg) => {
  const [images, imagesTags] = await handleFilesDrop(mainWindow, arg);
  event.reply('task:loadImages', images, imagesTags);
});

ipcMain.on('task:tagImages', async (event, arg) => {
  const tags = await tagImages(arg);
  if (tags) {
    event.reply('task:tagImages', tags);
  }
});

ipcMain.on('task:cancel', async () => {
  Task.cancelAll();
});

ipcMain.on('task:saveTags', (_, arg) => {
  saveTags(mainWindow, arg);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 700,
    icon: getAssetPath('icon.png'),
    backgroundColor: 'black',
    minWidth: 1000,
    minHeight: 640,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      webSecurity: process.env.NODE_ENV !== 'development',
    },
  });

  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  Task.setBrowserWindow(mainWindow);

  mainWindow.webContents.on('did-finish-load', () => {
    Task.sendLatest();
  });

  python = await setUp();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  if (python) python.kill();
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
