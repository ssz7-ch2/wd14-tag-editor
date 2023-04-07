import { atom, useAtomValue, useSetAtom } from 'jotai';
import { tagsListSelectedAtom } from 'renderer/atoms/derivedReadAtom';
import {
  imagesTagsAtom,
  selectedImagesAtom,
} from 'renderer/atoms/primitiveAtom';
import { TagData } from '../../../types/types';
import TagsList from './TagsList';

const setSelectedImagesTagsAtom = atom(
  null,
  (get, set, update: ((prev: TagData) => TagData) | TagData) => {
    const imagesTags = get(imagesTagsAtom);
    const selectedImages = get(selectedImagesAtom);
    const selectedImagesTags: TagData = {};
    selectedImages.forEach((imagePath) => {
      selectedImagesTags[imagePath] = imagesTags[imagePath];
    });
    const updated = { ...imagesTags };
    if (typeof update === 'function') {
      Object.entries(update(selectedImagesTags)).forEach(
        ([imagePath, tags]) => {
          updated[imagePath] = tags;
        }
      );
    } else {
      Object.entries(update).forEach(([imagePath, tags]) => {
        updated[imagePath] = tags;
      });
    }
    set(imagesTagsAtom, updated);
  }
);

function TagsPanelSelected() {
  console.log('render TagsPanelSelected');
  const tagsList = useAtomValue(tagsListSelectedAtom);
  const setSelectedImagesTags = useSetAtom(setSelectedImagesTagsAtom);

  return (
    <div className="panel">
      <h2 className="panel-header">Selected Image Tags</h2>
      <TagsList
        tags={tagsList}
        setImagesTags={setSelectedImagesTags}
        panel="selected"
      />
    </div>
  );
}

export default TagsPanelSelected;
