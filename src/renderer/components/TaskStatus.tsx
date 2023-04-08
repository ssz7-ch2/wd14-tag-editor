import { useAtomValue } from 'jotai';
import { taskStatusAtom } from 'renderer/atoms/primitiveAtom';
import './TaskStatus.css';

function TaskStatus() {
  const taskStatus = useAtomValue(taskStatusAtom);
  return (
    <div id="task-status" className={taskStatus.status === 'Processing' ? 'processing' : undefined}>
      <div
        id="task-progress"
        style={{
          width: `${(taskStatus.progress * 100).toFixed(2)}%`,
          opacity: taskStatus.status === 'Processing' ? 1 : 0,
        }}
      />
      <p>{taskStatus.message}</p>
    </div>
  );
}

export default TaskStatus;
