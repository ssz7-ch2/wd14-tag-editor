import { useSetAtom } from 'jotai';
import { imagesDataAtom } from 'renderer/atoms/derivedWriteAtom';
import { Images, TagData } from '../../../types/types';
import './SelectImages.css';

function SelectImages() {
  const setImagesData = useSetAtom(imagesDataAtom);

  return (
    <div
      id="select-images"
      onClick={() => {
        window.electron.ipcRenderer.sendMessage('dialog:openFiles');
        window.electron.ipcRenderer.once('dialog:openFiles', (images, imagesTags) =>
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
        window.electron.ipcRenderer.once('task:loadImages', (images, imagesTags) =>
          setImagesData(images as Images, imagesTags as TagData)
        );
      }}
      aria-hidden="true"
    >
      <button type="button">Browse</button>
      <p>or drag & drop images here</p>
    </div>
  );
}

export default SelectImages;
