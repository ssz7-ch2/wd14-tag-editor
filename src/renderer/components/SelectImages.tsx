import { useSetAtom } from 'jotai';
import {
  filterTagsAtom,
  imagesAtom,
  imagesTagsAtom,
} from 'renderer/atoms/atom';
import { handleImageFiles } from 'renderer/utils';
import { Images, TagData } from '../../../types/types';
import './SelectImages.css';

function SelectImages() {
  const setImages = useSetAtom(imagesAtom);
  const setImagesTags = useSetAtom(imagesTagsAtom);
  const setFilterTags = useSetAtom(filterTagsAtom);

  console.log('render SelectImages');
  return (
    <div
      id="select-images"
      onClick={() => {
        window.electron.ipcRenderer.sendMessage('dialog:openFiles');
        window.electron.ipcRenderer.once(
          'dialog:openFiles',
          (images, imagesTags) =>
            handleImageFiles(
              images as Images,
              imagesTags as TagData,
              setImages,
              setImagesTags,
              setFilterTags
            )
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
            handleImageFiles(
              images as Images,
              imagesTags as TagData,
              setImages,
              setImagesTags,
              setFilterTags
            )
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
