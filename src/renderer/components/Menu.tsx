import {
  faCircleStop,
  faFolder,
  faGear,
  faPlayCircle,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { useSetAtom } from 'jotai';
import {
  openFolderAtom,
  saveTagsAtom,
  tagAllImagesAtom,
} from 'renderer/atoms/derivedWriteAtom';
import './Menu.css';
import MenuIcon from './MenuIcon';
import TaskStatus from './TaskStatus';

// TODO: setting for tag images, replace existing tags or combine with existing tags

function Menu() {
  const tagAllImages = useSetAtom(tagAllImagesAtom);
  const saveTags = useSetAtom(saveTagsAtom);
  const openFolder = useSetAtom(openFolderAtom);

  const cancel = () => {
    window.electron.ipcRenderer.sendMessage('task:cancel');
  };

  const openSettings = () => {
    window.electron.ipcRenderer.sendMessage('openSettings');
  };

  return (
    <div id="menu">
      <MenuIcon
        icon={faFolder}
        text="Open Folder"
        color="rgb(219, 190, 25)"
        onClick={openFolder}
      />
      <MenuIcon
        icon={faPlayCircle}
        text="Tag Images"
        color="rgb(116, 230, 101)"
        onClick={tagAllImages}
      />
      <MenuIcon
        icon={faCircleStop}
        text="Cancel"
        color="rgb(236, 95, 100)"
        onClick={cancel}
      />
      <MenuIcon
        icon={faSave}
        text="Save Tags"
        color="rgb(101, 178, 230)"
        onClick={saveTags}
      />
      <MenuIcon icon={faGear} text="Settings" onClick={openSettings} />
      <TaskStatus />
    </div>
  );
}

export default Menu;
