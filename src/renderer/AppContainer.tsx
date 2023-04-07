import { useAtomValue, useSetAtom } from 'jotai';
import Split from 'react-split';
import './AppContainer.css';
import { imagesAtom, popupAtom } from './atoms/primitiveAtom';
import GalleryPanel from './components/GalleryPanel';
import ImagePanel from './components/ImagePanel';
import Menu from './components/Menu';
import SelectImages from './components/SelectImages';
import TagsPanel from './components/TagsPanel';

function AppContainer() {
  const images = useAtomValue(imagesAtom);
  const setPopup = useSetAtom(popupAtom);
  console.log('render AppContainer');

  return (
    <div
      id="app-container"
      tabIndex={0}
      onKeyDown={(e) => {
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
                  };
                }
                return {
                  show: true,
                  panel: 'all',
                };
              });
            } else if (e.altKey) {
              e.preventDefault();
              setPopup((prev) => {
                if (prev.show && prev.panel === 'selected') {
                  return {
                    show: false,
                    panel: 'selected',
                  };
                }
                return {
                  show: true,
                  panel: 'selected',
                };
              });
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
    </div>
  );
}

export default AppContainer;
