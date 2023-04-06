import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import { TaskStatusType } from '../../types/types';
import './App.css';
import AppContainer from './AppContainer';
import { taskStatusAtom } from './atoms/atom';

export default function App() {
  const setTaskStatus = useSetAtom(taskStatusAtom);
  useEffect(() => {
    const remove = window.electron.ipcRenderer.on('taskStatus', (arg) => {
      setTaskStatus(arg as TaskStatusType);
    });

    return () => {
      remove();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContainer />} />
      </Routes>
    </Router>
  );
}