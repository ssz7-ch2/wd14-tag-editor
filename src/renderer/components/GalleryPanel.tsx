import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useContextMenu } from 'react-contexify';
import { filteredImagesAtom } from 'renderer/atoms/derivedReadAtom';
import { selectedImagesAtom } from 'renderer/atoms/primitiveAtom';
import { ContextMenuIds } from '../../../types/types';
import './GalleryPanel.css';
import { displayedImageAtom } from './ImagePanel';

const menuId: ContextMenuIds = 'ImagePanel';

function GalleryPanel() {
  const [selectedImages, setSelectedImages] = useAtom(selectedImagesAtom);
  const [prevIndex, setPrevIndex] = useState(0);

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
        block: 'center',
        inline: 'nearest',
      });
    }, 50);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [displayedImage, imageList]);

  const handleOnClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    i: number,
    path: string
  ) => {
    // TODO: move to derivedWriteAtom.ts, combine with changeSelectedImagesAtom
    if (!e.shiftKey) {
      setPrevIndex(i);
    }
    setSelectedImages((prev) => {
      if (prev.length === 1 && prev.includes(imageList[i].path)) {
        return prev;
      }

      if (e.ctrlKey) {
        if (prev.includes(path)) {
          return prev.filter((imagePath) => imagePath !== path);
        }

        return [...prev, path];
      }
      if (e.shiftKey) {
        const updated: string[] = [];

        imageList
          .slice(
            prevIndex > i ? i : prevIndex,
            prevIndex > i ? prevIndex + 1 : i + 1
          )
          .forEach((image) => updated.push(image.path));

        if (prevIndex > i) {
          updated.reverse();
        }
        return [...prev, ...updated];
      }

      return [path];
    });
  };

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
            className={`image-container${
              selectedImages.includes(image.path) ? ' selected' : ''
            }`}
            ref={
              selectedImages.length > 0 &&
              selectedImages[selectedImages.length - 1] === image.path
                ? firstSelected
                : undefined
            }
            onClick={(e) => {
              handleOnClick(e, i, image.path);
            }}
          >
            <img
              src={image.thumbnail}
              alt=""
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default GalleryPanel;
