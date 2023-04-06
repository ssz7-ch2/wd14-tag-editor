import { BrowserWindow } from 'electron';
import { TaskStatusType } from '../../types/types';

export class Task {
  static #browserWindow: BrowserWindow;
  static #runningTasks: Task[] = [];
  static #defaultStatus: TaskStatusType = {
    message: 'Idle',
    progress: 1,
    status: 'Idle',
  };

  cancel: (() => Promise<boolean>) | undefined;
  status: TaskStatusType;
  cancelled = false;

  constructor(cancel?: () => Promise<boolean>) {
    this.cancel = cancel;
    this.status = Task.#defaultStatus;
  }

  start(message: string) {
    if (this.cancelled) return;
    this.status = {
      message: message,
      progress: 0,
      status: 'Processing',
    };
    Task.#runningTasks.push(this);
    Task.#sendStatus(this.status);
  }

  update(message: string, progress: number) {
    if (this.cancelled) return;
    this.status = {
      message: message,
      progress: progress,
      status: 'Processing',
    };
    Task.#sendStatus(this.status);
  }

  end(message: string) {
    if (this.cancelled) return;
    this.status = {
      message: message,
      progress: 1,
      status: 'Idle',
    };
    Task.#runningTasks = Task.#runningTasks.filter((task) => task !== this);
    if (Task.#runningTasks.length === 0) {
      Task.#sendStatus(this.status);
    } else {
      Task.#sendStatus(
        Task.#runningTasks[Task.#runningTasks.length - 1].status
      );
    }
  }

  static setBrowserWindow(browserWindow: BrowserWindow) {
    Task.#browserWindow = browserWindow;
  }

  static sendLatest() {
    if (Task.#runningTasks.length > 0) {
      Task.#sendStatus(
        Task.#runningTasks[Task.#runningTasks.length - 1].status
      );
    } else {
      Task.#sendStatus(Task.#defaultStatus);
    }
  }

  static async cancelAll() {
    const cancellable = Task.#runningTasks.filter(
      (task) => task.cancel != null
    );
    if (cancellable.length > 0) {
      const res = cancellable.map(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        async (task) => (task.cancelled = await task.cancel!())
      );
      await Promise.all(res);
      let count = 0;
      cancellable.forEach((task) => {
        if (task.cancelled) {
          count += 1;
          Task.#runningTasks = Task.#runningTasks.filter((t) => task !== t);
        }
      });
      if (cancellable.length === count) {
        Task.#sendStatus({
          message: 'Cancelled task',
          progress: 1,
          status: 'Idle',
        });
      }
    }
  }

  static #sendStatus(status: TaskStatusType) {
    Task.#browserWindow.webContents.send('taskStatus', status);
  }
}
