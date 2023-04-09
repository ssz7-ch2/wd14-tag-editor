import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { useContextMenu } from 'react-contexify';
import { filteredImagesAtom } from 'renderer/atoms/derivedReadAtom';
import { selectedImagesAtom } from 'renderer/atoms/primitiveAtom';
import { handleSelect } from 'renderer/utils';
import { ContextMenuIds } from '../../../types/types';
import './GalleryPanel.css';
import { displayedImageAtom } from './ImagePanel';

const menuId: ContextMenuIds = 'ImagePanel';

function GalleryPanel() {
  const [selectedImages, setSelectedImages] = useAtom(selectedImagesAtom);

  const imageList = useAtomValue(filteredImagesAtom);
  const displayedImage = useAtomValue(displayedImageAtom);

  const firstSelected = useRef<HTMLDivElement>(null);

  const { show } = useContextMenu({
    id: menuId,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      firstSelected.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }, 50);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [displayedImage, imageList]);

  return (
    <div
      id="gallery-panel"
      className="panel"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.ctrlKey && e.key.toLocaleUpperCase() === 'A') {
          e.preventDefault();
          setSelectedImages(imageList.map((image) => image.path));
        }
      }}
    >
      <h2 className="panel-header">All Images</h2>
      <div id="gallery" onContextMenu={(e) => show({ event: e })}>
        {imageList.map((image, i) => (
          <div
            key={image.path}
            className={`image-container${selectedImages.includes(image.path) ? ' selected' : ''}`}
            ref={
              selectedImages.length > 0 && selectedImages[selectedImages.length - 1] === image.path
                ? firstSelected
                : undefined
            }
            onClick={(e) => {
              setSelectedImages((prev) => {
                return handleSelect(
                  imageList.map((image) => image.path),
                  prev,
                  image.path,
                  e.ctrlKey,
                  e.shiftKey,
                  false
                );
              });
            }}
          >
            <img src={image.thumbnail} alt="" onDragStart={(e) => e.preventDefault()} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default GalleryPanel;
