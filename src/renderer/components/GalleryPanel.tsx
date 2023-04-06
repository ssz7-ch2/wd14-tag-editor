import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import {
  filterTagsAtom,
  imagesAtom,
  imagesTagsAtom,
  selectedImagesAtom,
} from 'renderer/atoms/atom';
import './GalleryPanel.css';

export const imageListAtom = atom((get) => {
  const images = get(imagesAtom);
  const imagesTags = get(imagesTagsAtom);
  const filterTags = get(filterTagsAtom);

  return Object.values(images).filter(
    (image) =>
      filterTags.size === 0 ||
      [...filterTags].every((filterTag) =>
        imagesTags[image.path].some((tag) => tag.name === filterTag)
      )
  );
});

// TODO: convert all actions to write only atoms

function GalleryPanel() {
  const [selectedImages, setSelectedImages] = useAtom(selectedImagesAtom);
  const [prevIndex, setPrevIndex] = useState(0);

  const imageList = useAtomValue(imageListAtom);

  const firstSelected = useRef<HTMLDivElement>(null);

  console.log('render GalleryPanel');

  // TODO: on right click gallery, option to clear images
  useEffect(() => {
    setTimeout(() => {
      firstSelected.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }, 50);
  }, [selectedImages]);

  useEffect(() => {
    setSelectedImages((prev) => {
      const updated = prev.filter((imagePath) =>
        imageList.some((image) => image.path === imagePath)
      );

      if (updated.length === 0 && imageList.length > 0) {
        const firstImage = imageList[0];
        updated.push(firstImage.path);
      }
      return updated;
    });
  }, [imageList]);

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
      <div id="gallery">
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
              if (!e.shiftKey) {
                setPrevIndex(i);
              }
              setSelectedImages((prev) => {
                if (prev.length === 1 && prev.includes(imageList[i].path)) {
                  return prev;
                }

                if (e.ctrlKey) {
                  if (prev.includes(image.path)) {
                    return prev.filter((imagePath) => imagePath !== image.path);
                  }

                  return [...prev, image.path];
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

                return [image.path];
              });
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
