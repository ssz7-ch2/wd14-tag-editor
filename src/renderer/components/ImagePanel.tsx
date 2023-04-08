import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Menu as ContextMenu, Item, useContextMenu } from 'react-contexify';
import {
  imagesDataAtom,
  removeAllImagesAtom,
  removeImageAtom,
  selectAllFilteredImagesAtom,
  tagSelectedImagesAtom,
} from 'renderer/atoms/derivedWriteAtom';
import { imagesAtom, selectedImagesAtom } from 'renderer/atoms/primitiveAtom';
import { ContextMenuIds, ImageFileInfo, Images, TagData } from '../../../types/types';
import './ImagePanel.css';

const menuId: ContextMenuIds = 'ImagePanel';

export const displayedImageAtom = atom((get) => {
  const imageList: ImageFileInfo[] = [];
  const images = get(imagesAtom);
  const selectedImages = get(selectedImagesAtom);
  selectedImages.forEach((imagePath) => {
    if (imagePath in images) {
      imageList.push(images[imagePath]);
    }
  });
  if (imageList.length === 0) return null;
  return imageList[imageList.length - 1];
});

function ImagePanel() {
  const displayedImage = useAtomValue(displayedImageAtom);
  const setImagesData = useSetAtom(imagesDataAtom);
  const tagSelectedImages = useSetAtom(tagSelectedImagesAtom);
  const removeImage = useSetAtom(removeImageAtom);
  const removeAllImages = useSetAtom(removeAllImagesAtom);
  const selectAllFilteredImages = useSetAtom(selectAllFilteredImagesAtom);

  const { show } = useContextMenu({
    id: menuId,
  });

  return (
    <div
      id="image-panel"
      className="panel"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.ctrlKey && e.key.toLocaleUpperCase() === 'A') {
          e.preventDefault();
          selectAllFilteredImages();
        }
      }}
    >
      <h2 className="panel-header">Selected Image</h2>
      <div
        id="image-viewer"
        onDragStart={(e) => e.preventDefault()}
        onDoubleClick={() => {
          window.electron.ipcRenderer.sendMessage('dialog:openFiles');
          window.electron.ipcRenderer.once('dialog:openFiles', (images, imagesTags) =>
            setImagesData(images as Images, imagesTags as TagData)
          );
        }}
        onContextMenu={(e) => show({ event: e })}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();

          let filePaths: string[];
          if (e.dataTransfer.items) {
            filePaths = [...e.dataTransfer.items]
              .filter((item) => item.kind === 'file')
              .map((item) => item.getAsFile()?.path) as string[];
          } else {
            filePaths = [...e.dataTransfer.files].map((file) => file.path);
          }

          window.electron.ipcRenderer.sendMessage('task:loadImages', filePaths);
          window.electron.ipcRenderer.once('task:loadImages', (images, imagesTags) =>
            setImagesData(images as Images, imagesTags as TagData)
          );
        }}
      >
        {displayedImage === null ? (
          <p>No selected images</p>
        ) : (
          <img src={displayedImage.src} alt="" />
        )}
      </div>

      {/* TODO: right click open folder option, refactor context menu to AppContainer */}

      <ContextMenu id={menuId}>
        <Item onClick={tagSelectedImages}>Tag Selected Images</Item>
        <Item onClick={removeImage}>Remove Selected Images</Item>
        <Item onClick={removeAllImages}>Remove All Images</Item>
      </ContextMenu>
    </div>
  );
}

export default ImagePanel;
