import { ImageFileInfo, TagType } from '../../types/types';

export const sortImagePath = (a: ImageFileInfo, b: ImageFileInfo) => {
  if (a.path < b.path) return -1;
  if (a.path > b.path) return 1;
  return 0;
};

export const sortTagName = (a: TagType, b: TagType) => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
};

export const sortTagScore = (a: TagType, b: TagType) => {
  if (a.score > b.score) return -1;
  if (a.score < b.score) return 1;
  return 0;
};
