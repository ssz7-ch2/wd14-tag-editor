import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import 'react-contexify/dist/ReactContexify.css';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import { TaskStatusType } from '../../types/types';
import './App.css';
import AppContainer from './AppContainer';
import Settings from './Settings';
import { tagThresholdAtom, taskStatusAtom } from './atoms/primitiveAtom';

function View() {
  if (window.location.search === '?settings') return <Settings />;
  return <AppContainer />;
}

export default function App() {
  const setTaskStatus = useSetAtom(taskStatusAtom);
  const setTagThreshold = useSetAtom(tagThresholdAtom);
  useEffect(() => {
    const remove1 = window.electron.ipcRenderer.on('taskStatus', (arg) => {
      setTaskStatus(arg as TaskStatusType);
    });

    const remove2 = window.electron.ipcRenderer.on('setTagThreshold', (arg) => {
      setTagThreshold(arg as number);
    });

    return () => {
      remove1();
      remove2();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<View />} />
      </Routes>
    </Router>
  );
}
