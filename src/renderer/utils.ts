import {
  ImageFileInfo,
  Images,
  SetFilterTags,
  SetImages,
  SetImagesTags,
  TagData,
  TagType,
} from '../../types/types';

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

export function handleImageFiles(
  images: Images,
  imagesTags: TagData,
  setImages: SetImages,
  setImagesTags: SetImagesTags,
  setFilterTags: SetFilterTags,
  reset = false
) {
  if (Object.keys(images).length === 0) return;

  setImages((prev) => {
    if (reset) {
      return images;
    }

    const updated = { ...prev };
    Object.values(images).forEach((image) => {
      if (!(image.path in prev)) {
        updated[image.path] = image;
      }
    });
    return updated;
  });

  setImagesTags((prev) => {
    if (reset) {
      return imagesTags;
    }

    const updated = { ...prev };
    Object.entries(imagesTags).forEach(([imagePath, tags]) => {
      if (!(imagePath in prev)) {
        updated[imagePath] = tags;
      }
    });
    return updated;
  });

  // remove filters
  setFilterTags(new Set<string>());
}
