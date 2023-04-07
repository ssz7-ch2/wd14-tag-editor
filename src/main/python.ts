import axios from 'axios';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Task } from './task';

function spawnPython(venvDir: string) {
  const pythonPath = path.join(venvDir, 'Scripts/python');
  try {
    const task = new Task();
    task.start('Starting python');
    const python = spawn(pythonPath, ['./python/tagger.py']);

    python.on('spawn', () => task.end('Started python'));

    let taggerTask: Task;

    python.stdout.on('data', (data) => {
      const lines = String(data).split(/\r?\n/);
      lines.forEach((line) => {
        if (line && line.startsWith('taskStatus:start')) {
          taggerTask = new Task(async () => {
            try {
              await axios.post('http://127.0.0.1:5000/cancel');
              return true;
            } catch (error) {
              /* server not up yet */
              return false;
            }
          });
          taggerTask.start(line.replace('taskStatus:start|', ''));
        }
        if (line && line.startsWith('taskStatus:update')) {
          line = line.replace('taskStatus:update|', '');
          const progress = parseFloat(line.split('|', 1)[0]);
          const startIndex = line.indexOf('|');
          const message = line.slice(startIndex + 1);
          taggerTask.update(message, progress);
        }
        if (line && line.startsWith('taskStatus:end')) {
          taggerTask.end(line.replace('taskStatus:end|', ''));
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
