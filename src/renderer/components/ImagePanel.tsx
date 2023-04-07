import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Menu as ContextMenu, Item, useContextMenu } from 'react-contexify';
import {
  imagesDataAtom,
  tagSelectedImagesAtom,
} from 'renderer/atoms/derivedWriteAtom';
import { imagesAtom, selectedImagesAtom } from 'renderer/atoms/primitiveAtom';
import {
  ContextMenuIds,
  ImageFileInfo,
  Images,
  TagData,
} from '../../../types/types';
import './ImagePanel.css';

const menuId: ContextMenuIds = 'ImagePanel';

// TODO: on left or right key press, change image
export const displayedImageAtom = atom((get) => {
  const imageList: ImageFileInfo[] = [];
  const images = get(imagesAtom);
  const selectedImages = get(selectedImagesAtom);
  Object.values(images).forEach((image) => {
    if (selectedImages.includes(image.path)) {
      imageList.push(image);
    }
  });
  if (imageList.length === 0) return null;
  return imageList[imageList.length - 1];
});

function ImagePanel() {
  const displayedImage = useAtomValue(displayedImageAtom);
  const setImagesData = useSetAtom(imagesDataAtom);
  const tagSelectedImages = useSetAtom(tagSelectedImagesAtom);

  const { show } = useContextMenu({
    id: menuId,
  });

  console.log('render ImagePanel');
  return (
    <div id="image-panel" className="panel" tabIndex={0}>
      <h2 className="panel-header">Selected Image</h2>
      <div
        id="image-viewer"
        onDragStart={(e) => e.preventDefault()}
        onDoubleClick={() => {
          window.electron.ipcRenderer.sendMessage('dialog:openFiles');
          window.electron.ipcRenderer.once(
            'dialog:openFiles',
            (images, imagesTags) =>
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
          window.electron.ipcRenderer.once(
            'task:loadImages',
            (images, imagesTags) =>
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

      <ContextMenu id={menuId}>
        <Item onClick={() => tagSelectedImages(true)}>Tag Image</Item>
        <Item onClick={() => tagSelectedImages(false)}>Tag Selected</Item>
      </ContextMenu>
    </div>
  );
}

export default ImagePanel;
