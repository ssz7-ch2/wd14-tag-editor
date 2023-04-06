import { atom, useAtomValue, useSetAtom } from 'jotai';
import { imagesTagsAtom, selectedImagesAtom } from 'renderer/atoms/atom';
import { sortTagScore } from 'renderer/utils';
import { TagData } from '../../../types/types';
import TagsList from './TagsList';

const tagsListAtom = atom((get) => {
  const tagsDict: { [key: string]: number[] } = {};
  const selectedImages = get(selectedImagesAtom);
  Object.entries(get(imagesTagsAtom)).forEach(([imagePath, tags]) => {
    if (selectedImages.includes(imagePath)) {
      tags.forEach((tag) => {
        if (!(tag.name in tagsDict)) {
          tagsDict[tag.name] = [];
        }
        tagsDict[tag.name].push(tag.score);
      });
    }
  });

  return Object.entries(tagsDict)
    .map(([tag, scores]) => {
      return {
        name: tag,
        score: Math.max(...scores),
      };
    })
    .sort(sortTagScore);
});

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
  const tagsList = useAtomValue(tagsListAtom);
  const setSelectedImagesTags = useSetAtom(setSelectedImagesTagsAtom);

  return (
    <div className="panel">
      <h2 className="panel-header">Selected Image Tags</h2>
      <TagsList tags={tagsList} setImagesTags={setSelectedImagesTags} />
    </div>
  );
}

export default TagsPanelSelected;
