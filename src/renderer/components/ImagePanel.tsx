import { atom, useAtomValue, useSetAtom } from 'jotai';
import { imagesDataAtom } from 'renderer/atoms/derivedWriteAtom';
import { imagesAtom, selectedImagesAtom } from 'renderer/atoms/primitiveAtom';
import { ImageFileInfo, Images, TagData } from '../../../types/types';
import './ImagePanel.css';

// TODO: on left or right key press, change image
const imageListAtom = atom((get) => {
  const imageList: ImageFileInfo[] = [];
  const images = get(imagesAtom);
  const selectedImages = get(selectedImagesAtom);
  Object.values(images).forEach((image) => {
    if (selectedImages.includes(image.path)) {
      imageList.push(image);
    }
  });
  return imageList;
});

function ImagePanel() {
  const imageList = useAtomValue(imageListAtom);
  const setImagesData = useSetAtom(imagesDataAtom);

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
        {imageList.length === 0 ? (
          <p>No selected images</p>
        ) : (
          <img src={imageList[imageList.length - 1].src} alt="" />
        )}
      </div>
    </div>
  );
}

export default ImagePanel;
