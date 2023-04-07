import { atom } from 'jotai';
import { Images, TagData } from '../../../types/types';
import {
  filterTagsAtom,
  imagesAtom,
  imagesTagsAtom,
  popupAtom,
  selectedImagesAtom,
  selectedTagsAtom,
  selectedTagsPanelAtom,
  tagThresholdAtom,
} from './primitiveAtom';

export const imagesDataAtom = atom(
  null,
  (_get, set, images: Images, imagesTags: TagData, reset = false) => {
    if (Object.keys(images).length === 0) return;

    set(imagesAtom, (prev) => {
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

    set(imagesTagsAtom, (prev) => {
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

    const imageList = Object.values(images);

    set(selectedImagesAtom, (prev) => {
      const updated = prev.filter((imagePath) =>
        imageList.some((image) => image.path === imagePath)
      );

      if (updated.length === 0 && imageList.length > 0) {
        const firstImage = imageList[0];
        updated.push(firstImage.path);
      }
      return updated;
    });

    // remove filters
    set(filterTagsAtom, new Set<string>());
  }
);

export const addTagsAtom = atom(null, (_get, set) => {
  set(popupAtom, {
    show: true,
    panel: 'selected',
  });
});

export const addTagsAllAtom = atom(null, (_get, set) => {
  set(popupAtom, {
    show: true,
    panel: 'all',
  });
});

export const removeTagsAtom = atom(null, (get, set) => {
  const selectedTags = get(selectedTagsAtom);
  const selectedImages = get(selectedImagesAtom);

  if (selectedTags.length === 0 || selectedImages.length === 0) return;

  set(imagesTagsAtom, (prev) => {
    const updated = { ...prev };
    selectedImages.forEach((imagePath) => {
      let tags = [...updated[imagePath]];
      tags = tags.filter(
        (tag) =>
          !selectedTags.some((selectedTag) => selectedTag.name === tag.name)
      );
      updated[imagePath] = tags;
    });
    return updated;
  });
});

export const removeTagsAllAtom = atom(null, (get, set) => {
  const selectedTags = get(selectedTagsAtom);

  if (selectedTags.length === 0) return;

  set(imagesTagsAtom, (prev) => {
    const updated = { ...prev };
    Object.entries(updated).forEach(([imagePath, tags]) => {
      let updatedTags = [...tags];
      updatedTags = updatedTags.filter(
        (tag) =>
          !selectedTags.some((selectedTag) => selectedTag.name === tag.name)
      );
      updated[imagePath] = updatedTags;
    });
    return updated;
  });
});

export const filterAtom = atom(null, (get, set) => {
  const selectedTags = get(selectedTagsAtom);
  const updatedFilter = new Set(selectedTags.map((tag) => tag.name));
  set(filterTagsAtom, (prev) => {
    if (
      prev.size === updatedFilter.size &&
      [...prev].every((tag) => updatedFilter.has(tag))
    ) {
      return prev;
    }
    return updatedFilter;
  });
  const imagesTags = get(imagesTagsAtom);
  set(selectedImagesAtom, (prev) => {
    const updated = prev.filter((imagePath) =>
      [...updatedFilter].every((filterTag) =>
        imagesTags[imagePath].some((tag) => tag.name === filterTag)
      )
    );
    if (updated.length > 0) {
      return updated;
    } else {
      const first = Object.entries(imagesTags).find(([, tags]) =>
        [...updatedFilter].every((filterTag) =>
          tags.some((tag) => tag.name === filterTag)
        )
      );
      if (first) {
        return [first[0]];
      } else {
        return [];
      }
    }
  });
});

export const removeFilterAtom = atom(null, (_get, set) => {
  set(filterTagsAtom, (prev) => {
    if (prev.size === 0) {
      return prev;
    }
    return new Set<string>();
  });
});

export const includeTagsAtom = atom(null, (get, set) => {
  const selectedTags = get(selectedTagsAtom);
  const selectedTagsPanel = get(selectedTagsPanelAtom);
  let targetImages: string[];
  if (selectedTagsPanel === 'selected') {
    targetImages = get(selectedImagesAtom);
  }
  const selectedImages = get(selectedImagesAtom);
  const tagThreshold = get(tagThresholdAtom);

  if (selectedTags.length === 0 || selectedImages.length === 0) return;

  set(imagesTagsAtom, (prev) => {
    if (targetImages === undefined) {
      targetImages = Object.keys(prev);
    }
    const updated = { ...prev };
    let count = 0;
    targetImages.forEach((imagePath) => {
      const tags = [...updated[imagePath]];
      tags.forEach((tag) => {
        if (
          selectedTags.some((selectedTag) => selectedTag.name === tag.name) &&
          tag.score < tagThreshold
        ) {
          tag.score = tagThreshold;
          count += 1;
        }
      });
      updated[imagePath] = tags;
    });
    if (count == 0) {
      return prev;
    }
    return updated;
  });
});

export const clearSelectedTagsAtom = atom(null, (get, set) => {
  set(selectedTagsAtom, (prev) => {
    if (prev.length === 0) return prev;
    return [];
  });
});
