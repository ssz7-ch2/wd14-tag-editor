import axios from 'axios';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { settingsStore } from './store';
import { Task } from './task';

function spawnPython(venvDir: string) {
  const pythonPath = path.join(venvDir, 'Scripts/python');
  const task = new Task();
  try {
    task.start('Starting python');
    const args = ['./python/tagger.py'];

    if (settingsStore.get('useTensorflow')) {
      args.push('--use_tensorflow');
      args.push('--model');
      args.push(settingsStore.get('taggerModel'));
    }

    const python = spawn(pythonPath, args);

    python.on('error', () => {
      task.end('Running without taggers');
    });

    python.on('spawn', () => task.end('Started python'));

    const taggerTasks: { [key: string]: Task } = {};

    python.stdout.on('data', (data) => {
      const lines = String(data).split(/\r?\n/);
      lines.forEach((line) => {
        if (!line.startsWith('taskStatus')) return;
        const taskId = line.split('|', 2)[1];
        if (line.startsWith('taskStatus:start')) {
          taggerTasks[taskId] = new Task(async () => {
            try {
              await axios.post('http://127.0.0.1:5000/cancel');
              return true;
            } catch (error) {
              /* server not up yet */
              return false;
            }
          });
          taggerTasks[taskId].start(line.replace(`taskStatus:start|${taskId}|`, ''));
        }
        if (line.startsWith('taskStatus:update')) {
          line = line.replace(`taskStatus:update|${taskId}|`, '');
          const progress = parseFloat(line.split('|', 1)[0]);
          const startIndex = line.indexOf('|');
          const message = line.slice(startIndex + 1);
          taggerTasks[taskId].update(message, progress);
        }
        if (line.startsWith('taskStatus:end')) {
          taggerTasks[taskId].end(line.replace(`taskStatus:end|${taskId}|`, ''));
          delete taggerTasks[taskId];
        }
      });
    });
    python.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    return python;
  } catch (error) {
    console.log(error);
  }
  return null;
}

export default async function setUp() {
  const mainDir = process.cwd();
  const venvDir = path.join(mainDir, 'python/venv');
  const venvTask = new Task();
  try {
    venvTask.start('Loading venv');
    await fs.promises.access(venvDir, fs.constants.F_OK);
    venvTask.end('Loaded venv');
    // assume that venv has necessary packages if it exists
    return spawnPython(venvDir);
  } catch (error) {
    venvTask.end("Venv doesn't exist");
    const createVenvTask = new Task();
    createVenvTask.start('Creating venv');
    const createVenv = spawn('python', ['-m', 'venv', venvDir]);
    await new Promise((resolve) => {
      createVenv.on('close', resolve);
    });
    createVenvTask.end('Created venv');

    const pipPath = path.join(venvDir, 'Scripts/pip');
    const torchTask = new Task();
    torchTask.start('Installing torch');

    const torch = spawn(pipPath, [
      'install',
      'torch',
      'torchvision',
      '--index-url',
      'https://download.pytorch.org/whl/cu117',
    ]);
    await new Promise((resolve) => {
      torch.on('close', resolve);
    });

    torchTask.end('Installed python packages');

    const pipTask = new Task();
    pipTask.start('Installing python packages');

    const pip = spawn(pipPath, ['install', '-r', './python/requirements.txt']);
    await new Promise((resolve) => {
      pip.on('close', resolve);
    });

    pipTask.end('Installed python packages');

    return spawnPython(venvDir);
  }
}
