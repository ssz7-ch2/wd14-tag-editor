import { atom } from 'jotai';
import { sortTagName, sortTagScore } from 'renderer/utils';
import { ImageFileInfo } from '../../../types/types';
import {
  filterTagsAtom,
  imagesAtom,
  imagesTagsAtom,
  selectedImagesAtom,
} from './primitiveAtom';

export const filteredImagesAtom = atom<ImageFileInfo[]>((get) => {
  const images = get(imagesAtom);
  const imagesTags = get(imagesTagsAtom);
  const filterTags = get(filterTagsAtom);

  if (filterTags.size === 0) {
    return Object.values(images);
  }

  return Object.values(images).filter((image) =>
    [...filterTags].every((filterTag) =>
      imagesTags[image.path].some((tag) => tag.name === filterTag)
    )
  );
});

export const tagsListAllAtom = atom((get) => {
  const tagsDict: { [key: string]: number[] } = {};
  Object.values(get(imagesTagsAtom)).forEach((tags) => {
    tags.forEach((tag) => {
      if (!(tag.name in tagsDict)) {
        tagsDict[tag.name] = [];
      }
      tagsDict[tag.name].push(tag.score);
    });
  });

  return Object.entries(tagsDict)
    .map(([tag, scores]) => {
      return {
        name: tag,
        score: Math.max(...scores),
      };
    })
    .sort(sortTagName);
});

export const tagsListSelectedAtom = atom((get) => {
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
