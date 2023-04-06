import {
  faCircleStop,
  faFolder,
  faGear,
  faPlayCircle,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { useAtom, useSetAtom } from 'jotai';
import {
  filterTagsAtom,
  imagesAtom,
  imagesTagsAtom,
} from 'renderer/atoms/atom';
import { handleImageFiles } from 'renderer/utils';
import { Images, SaveTagsType, TagData } from '../../../types/types';
import './Menu.css';
import MenuIcon from './MenuIcon';
import TaskStatus from './TaskStatus';

// TODO: setting for tag images, replace existing tags or combine with existing tags

function Menu() {
  const [imagesTags, setImagesTags] = useAtom(imagesTagsAtom);
  const setFilterTags = useSetAtom(filterTagsAtom);
  const setImages = useSetAtom(imagesAtom);

  console.log('render Menu');

  const actions = {
    openFolder: () => {
      window.electron.ipcRenderer.sendMessage('dialog:openFolder');
      window.electron.ipcRenderer.once(
        'dialog:openFolder',
        (images, imagesTags) =>
          handleImageFiles(
            images as Images,
            imagesTags as TagData,
            setImages,
            setImagesTags,
            setFilterTags,
            true
          )
      );
    },
    tagImages: async () => {
      const untagged = Object.entries(imagesTags)
        .filter(([, tags]) => tags.every((tag) => tag.score === 1))
        .map(([imagePath]) => imagePath);
      if (untagged.length === 0) return;

      window.electron.ipcRenderer.sendMessage(
        'task:tagImages',
        untagged as string[]
      );
      window.electron.ipcRenderer.once('task:tagImages', (arg) => {
        const tagData = arg as TagData;
        setImagesTags((prev) => {
          const updated = { ...prev };
          Object.entries(tagData).forEach(([imagePath, tags]) => {
            updated[imagePath] = tags;
          });
          return updated;
        });
      });
    },
    cancel: () => {
      window.electron.ipcRenderer.sendMessage('task:cancel');
    },
    saveTags: () => {
      window.electron.ipcRenderer.sendMessage(
        'task:saveTags',
        Object.entries(imagesTags)
          .filter(([, tags]) => tags.length > 0)
          .map(([imagePath, tags]) => {
            return {
              path: imagePath,
              tags: tags.map((tag) => tag.name),
            };
          }) as SaveTagsType
      );
    },
    openSettings: () => {
      // open settings
    },
  };

  return (
    <div id="menu">
      <MenuIcon
        icon={faFolder}
        text="Open Folder"
        color="rgb(219, 190, 25)"
        onClick={actions.openFolder}
      />
      <MenuIcon
        icon={faPlayCircle}
        text="Tag Images"
        color="rgb(116, 230, 101)"
        onClick={actions.tagImages}
      />
      <MenuIcon
        icon={faCircleStop}
        text="Cancel"
        color="rgb(236, 95, 100)"
        onClick={actions.cancel}
      />
      <MenuIcon
        icon={faSave}
        text="Save Tags"
        color="rgb(101, 178, 230)"
        onClick={actions.saveTags}
      />
      <MenuIcon icon={faGear} text="Settings" onClick={actions.openSettings} />
      <TaskStatus />
    </div>
  );
}

export default Menu;
