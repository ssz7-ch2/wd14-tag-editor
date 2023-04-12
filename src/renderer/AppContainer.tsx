import { useAtomValue, useSetAtom } from 'jotai';
import { Menu as ContextMenu, Item } from 'react-contexify';
import Split from 'react-split';
import './AppContainer.css';
import {
  changeSelectedImagesAtom,
  copyTagsAtom,
  filterAtom,
  removeFilterAtom,
  saveTagsAtom,
  setFirstSelectedTag,
  tagAllImagesAtom,
  tagSelectedImagesAtom,
} from './atoms/derivedWriteAtom';
import { imagesAtom, popupAtom } from './atoms/primitiveAtom';
import GalleryPanel from './components/GalleryPanel';
import ImagePanel from './components/ImagePanel';
import Menu from './components/Menu';
import SelectImages from './components/SelectImages';
import TagsPanel from './components/TagsPanel';

function AppContainer() {
  const images = useAtomValue(imagesAtom);
  const setPopup = useSetAtom(popupAtom);
  const changeSelectedImages = useSetAtom(changeSelectedImagesAtom);
  const tagAllImages = useSetAtom(tagAllImagesAtom);
  const tagSelectedImages = useSetAtom(tagSelectedImagesAtom);
  const saveTags = useSetAtom(saveTagsAtom);
  const setFirstSelected = useSetAtom(setFirstSelectedTag);
  const filter = useSetAtom(filterAtom);
  const removeFilter = useSetAtom(removeFilterAtom);
  const copyTags = useSetAtom(copyTagsAtom);

  return (
    <div
      id="app-container"
      tabIndex={0}
      onKeyDown={(e) => {
        // TODO: add ctrl + f for searching tag (add search to popup)
        switch (e.key.toUpperCase()) {
          case 'A':
            if (Object.keys(images).length === 0) return;
            if (e.shiftKey && e.altKey) {
              e.preventDefault();
              setPopup((prev) => {
                if (prev.show && prev.panel === 'all') {
                  return {
                    show: false,
                    panel: 'all',
                    type: 'add',
                  };
                }
                return {
                  show: true,
                  panel: 'all',
                  type: 'add',
                };
              });
            } else if (e.altKey) {
              e.preventDefault();
              setPopup((prev) => {
                if (prev.show && prev.panel === 'selected') {
                  return {
                    show: false,
                    panel: 'selected',
                    type: 'add',
                  };
                }
                return {
                  show: true,
                  panel: 'selected',
                  type: 'add',
                };
              });
            }
            break;

          case 'D':
            if (e.altKey) {
              e.preventDefault();
              saveTags();
            }
            break;
          case 'F':
            if (e.ctrlKey) {
              e.preventDefault();
              setPopup((prev) => {
                if (prev.show) {
                  return {
                    show: false,
                    panel: 'all',
                    type: 'find',
                  };
                }
                return {
                  show: true,
                  panel: 'all',
                  type: 'find',
                };
              });
            } else if (e.altKey) {
              e.preventDefault();
              if (e.shiftKey) {
                removeFilter();
              } else {
                filter();
              }
            }
            break;
          case 'S':
            if (e.shiftKey && e.altKey) {
              e.preventDefault();
              tagAllImages();
            } else if (e.altKey) {
              e.preventDefault();
              tagSelectedImages();
            }
            break;
          case 'ESCAPE':
            e.preventDefault();
            setPopup((prev) => {
              if (prev.show) {
                return { ...prev, show: false };
              }
              return prev;
            });
            break;
          case 'ARROWLEFT':
            e.preventDefault();
            changeSelectedImages(-1, e.ctrlKey, e.shiftKey);
            break;
          case 'ARROWRIGHT':
            e.preventDefault();
            changeSelectedImages(1, e.ctrlKey, e.shiftKey);
            break;
          case 'ARROWUP':
          case 'ARROWDOWN':
            e.preventDefault();
            setFirstSelected();
            break;
          default:
            break;
        }
      }}
    >
      <Menu />
      <div id="main-panel">
        {Object.keys(images).length === 0 && <SelectImages />}
        <Split
          className="split"
          snapOffset={0}
          sizes={[55, 12, 33]}
          minSize={[400, 100, 250]}
          expandToMin
        >
          <ImagePanel />
          <GalleryPanel />
          <TagsPanel />
        </Split>
      </div>
      <ContextMenu id="TagItem">
        <Item
          onClick={() => {
            copyTags();
          }}
        >
          Copy Selected Tags
        </Item>
        <Item
          onClick={(e) => {
            window.electron.ipcRenderer.sendMessage('openUrl', [
              `https://danbooru.donmai.us/wiki_pages/${e.props.name}`,
            ]);
          }}
        >
          Open Danbooru Tag Wiki
        </Item>
      </ContextMenu>
    </div>
  );
}

export default AppContainer;
