import { atom } from 'jotai';
import { displayedImageAtom } from 'renderer/components/ImagePanel';
import { handleKeySelect, sortTagScore } from 'renderer/utils';
import { Images, SaveTagsType, TagData, TagType, TagsPanelType } from '../../../types/types';
import { filteredImagesAtom, tagsListAllAtom, tagsListSelectedAtom } from './derivedReadAtom';
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
    type: 'add',
  });
});

export const addTagsAllAtom = atom(null, (_get, set) => {
  set(popupAtom, {
    show: true,
    panel: 'all',
    type: 'add',
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
        (tag) => !selectedTags.some((selectedTag) => selectedTag.name === tag.name)
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
        (tag) => !selectedTags.some((selectedTag) => selectedTag.name === tag.name)
      );
      updated[imagePath] = updatedTags;
    });
    return updated;
  });
});

export const deleteTagsAtom = atom(null, (get, set) => {
  const selectedTags = get(selectedTagsAtom);
  if (selectedTags.length === 0) return;
  const selectedTagsPanel = get(selectedTagsPanelAtom);

  let tags: TagType[];
  if (selectedTagsPanel === 'selected') {
    tags = get(tagsListSelectedAtom);
  } else {
    tags = get(tagsListAllAtom);
  }

  let newSelectedTag: TagType | null = null;
  if (tags.length > 0 && selectedTags.some((tag) => tag.name === tags[tags.length - 1].name)) {
    for (let i = tags.length - 1; i >= 0; i--) {
      if (!selectedTags.some((tag) => tag.name === tags[i].name)) {
        newSelectedTag = tags[i];
        break;
      }
    }
  } else {
    for (let i = tags.length - 1; i >= 0; i--) {
      if (selectedTags.some((tag) => tag.name === tags[i].name)) {
        break;
      } else {
        newSelectedTag = tags[i];
      }
    }
  }

  set(imagesTagsAtom, (prev) => {
    const updated = { ...prev };
    let imagePaths = Object.keys(prev);
    if (selectedTagsPanel === 'selected') {
      imagePaths = get(selectedImagesAtom);
    }

    imagePaths.forEach((imagePath) => {
      const updatedTags = prev[imagePath].filter(
        (tag) => !selectedTags.some((selectedTag) => selectedTag.name === tag.name)
      );
      if (updatedTags.length !== prev[imagePath].length) {
        updated[imagePath] = updatedTags;
      }
    });

    return updated;
  });

  if (newSelectedTag) {
    set(selectedTagsAtom, [newSelectedTag]);
  } else {
    set(selectedTagsAtom, []);
  }
});

export const filterAtom = atom(null, (get, set) => {
  const selectedTags = get(selectedTagsAtom);
  const updatedFilter = new Set(selectedTags.map((tag) => tag.name));
  let update = true;
  set(filterTagsAtom, (prev) => {
    if (prev.size === updatedFilter.size && [...prev].every((tag) => updatedFilter.has(tag))) {
      update = false;
      return prev;
    }
    return updatedFilter;
  });
  if (!update) return;
  const imagesTags = get(imagesTagsAtom);
  set(selectedImagesAtom, (prev) => {
    const updated = prev.filter((imagePath) =>
      [...updatedFilter].every((filterTag) =>
        imagesTags[imagePath].some((tag) => tag.name === filterTag)
      )
    );
    if (updated.length === prev.length && updated.every((imagePath) => prev.includes(imagePath))) {
      return prev;
    }
    if (updated.length > 0) {
      return updated;
    } else {
      const first = Object.entries(imagesTags).find(([, tags]) =>
        [...updatedFilter].every((filterTag) => tags.some((tag) => tag.name === filterTag))
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

  const tagsList =
    selectedTagsPanel === 'selected' ? get(tagsListSelectedAtom) : get(tagsListAllAtom);

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

  const last = selectedTags.some((tag) => tag.name === tagsList[tagsList.length - 1].name);
  for (let i = tagsList.length - 1; i >= 0; i--) {
    if (last && !selectedTags.some((tag) => tag.name === tagsList[i].name)) {
      set(selectedTagsAtom, [tagsList[i]]);
      break;
    }
    if (!last && selectedTags.some((tag) => tag.name === tagsList[i].name)) {
      set(selectedTagsAtom, [tagsList[i + 1]]);
      break;
    }
  }
});

export const clearSelectedTagsAtom = atom(null, (get, set) => {
  set(selectedTagsAtom, (prev) => {
    if (prev.length === 0) return prev;
    return [];
  });
});

export const tagAllImagesAtom = atom(null, (get, set) => {
  const untagged = Object.entries(get(imagesTagsAtom))
    .filter(([, tags]) => tags.every((tag) => tag.score === 1))
    .map(([imagePath]) => imagePath);
  if (untagged.length === 0) return;

  window.electron.ipcRenderer.sendMessage('task:tagImages', untagged as string[]);
  window.electron.ipcRenderer.once('task:tagImages', (arg) => {
    const tagData = arg as TagData;
    set(imagesTagsAtom, (prev) => {
      const updated = { ...prev };
      Object.entries(tagData).forEach(([imagePath, tags]) => {
        const prevTags = prev[imagePath];
        updated[imagePath] = tags.concat(
          prevTags.filter((tag) => !tags.some((t) => t.name === tag.name))
        );
      });
      return updated;
    });
  });
});

export const tagSelectedImagesAtom = atom(null, (get, set) => {
  window.electron.ipcRenderer.sendMessage('task:tagImages', get(selectedImagesAtom) as string[]);
  window.electron.ipcRenderer.once('task:tagImages', (arg) => {
    const tagData = arg as TagData;
    set(imagesTagsAtom, (prev) => {
      const updated = { ...prev };
      Object.entries(tagData).forEach(([imagePath, tags]) => {
        const prevTags = prev[imagePath];
        updated[imagePath] = tags.concat(
          prevTags.filter((tag) => !tags.some((t) => t.name === tag.name))
        );
      });
      return updated;
    });
  });
});

export const saveTagsAtom = atom(null, (get) => {
  const tagThreshold = get(tagThresholdAtom);
  window.electron.ipcRenderer.sendMessage(
    'task:saveTags',
    Object.entries(get(imagesTagsAtom))
      .filter(([, tags]) => tags.length > 0)
      .map(([imagePath, tags]) => {
        return {
          path: imagePath,
          tags: tags.filter((tag) => tag.score > tagThreshold).sort(sortTagScore),
        };
      }) as SaveTagsType
  );
});

export const saveTagsSelectedAtom = atom(null, (get) => {
  const tagThreshold = get(tagThresholdAtom);
  const imagesTags = get(imagesTagsAtom);

  window.electron.ipcRenderer.sendMessage(
    'task:saveTags',
    get(selectedImagesAtom)
      .filter((imagePath) => imagesTags[imagePath].length > 0)
      .map((imagePath) => {
        return {
          path: imagePath,
          tags: imagesTags[imagePath].filter((tag) => tag.score > tagThreshold).sort(sortTagScore),
        };
      }) as SaveTagsType
  );
});

export const openFolderAtom = atom(null, (_get, set) => {
  window.electron.ipcRenderer.sendMessage('dialog:openFolder');
  window.electron.ipcRenderer.once('dialog:openFolder', (images, imagesTags) =>
    set(imagesDataAtom, images as Images, imagesTags as TagData, true)
  );
});

export const popupSetImagesTagsAtom = atom(
  null,
  (get, set, panel: TagsPanelType, value: string) => {
    let name = value;
    let score = 1;

    const split = value.split(':');
    const scoreString = split[split.length - 1];
    if (!isNaN(Number(scoreString)) && scoreString.length > 0) {
      score = Number(scoreString);
      name = value.replace(`:${scoreString}`, '');
    }

    set(imagesTagsAtom, (prev) => {
      const updated = { ...prev };
      if (panel === 'all') {
        Object.entries(updated).forEach(([imagePath, tags]) => {
          updated[imagePath] = [{ name, score }, ...tags.filter((tag) => tag.name !== name)];
        });
      } else {
        get(selectedImagesAtom).forEach((imagePath) => {
          updated[imagePath] = [
            { name, score },
            ...prev[imagePath].filter((tag) => tag.name !== name),
          ];
        });
      }

      return updated;
    });
  }
);

export const removeImageAtom = atom(null, (get, set) => {
  const selectedImages = get(selectedImagesAtom);
  if (selectedImages.length === 0) return;

  const gallery = get(filteredImagesAtom);

  set(imagesAtom, (prev) => {
    const updated = { ...prev };
    selectedImages.forEach((imagePath) => {
      delete updated[imagePath];
    });
    return updated;
  });
  set(imagesTagsAtom, (prev) => {
    const updated = { ...prev };
    selectedImages.forEach((imagePath) => {
      delete updated[imagePath];
    });
    return updated;
  });
  let nextImagePath: string | null = null;
  const isLast = selectedImages.includes(gallery[gallery.length - 1].path);
  for (let i = gallery.length - 1; i >= 0; i--) {
    if (!selectedImages.includes(gallery[i].path)) {
      nextImagePath = gallery[i].path;
      if (isLast) {
        break;
      }
    }
    if (selectedImages.includes(gallery[i].path) && nextImagePath != null) {
      break;
    }
  }
  if (nextImagePath) {
    set(selectedImagesAtom, [nextImagePath]);
  } else {
    set(selectedImagesAtom, []);
  }
});

export const removeAllImagesAtom = atom(null, (_get, set) => {
  set(imagesAtom, {});
  set(imagesTagsAtom, {});
  set(selectedImagesAtom, []);
  set(selectedTagsAtom, []);
  set(filterTagsAtom, new Set<string>());
});

export const changeSelectedImagesAtom = atom(
  null,
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  (get, set, delta: number, ctrlKey: boolean = false, shiftKey: boolean = false) => {
    const displayedImage = get(displayedImageAtom);
    const imageList = get(filteredImagesAtom);
    if (!displayedImage) {
      if (imageList.length > 0) set(selectedImagesAtom, [imageList[0].path]);
      return;
    }

    set(selectedImagesAtom, (prev) =>
      handleKeySelect(
        imageList.map((image) => image.path),
        prev,
        delta,
        ctrlKey,
        shiftKey,
        false
      )
    );
  }
);

export const changeSelectedTagsAtom = atom(
  null,
  (
    _get,
    set,
    tags: TagType[],
    delta: number,
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    ctrlKey: boolean = false,
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    shiftKey: boolean = false
  ) => {
    set(selectedTagsAtom, (prev) =>
      handleKeySelect(tags, prev, delta, ctrlKey, shiftKey, false, (a, b) => a.name === b.name)
    );
  }
);

export const selectAllFilteredImagesAtom = atom(null, (get, set) => {
  const imageList = get(filteredImagesAtom);
  set(
    selectedImagesAtom,
    imageList.map((image) => image.path)
  );
});

export const setFirstSelectedTag = atom(null, (get, set) => {
  const tagsList = get(tagsListSelectedAtom);
  if (tagsList.length === 0) return;
  set(selectedTagsAtom, [tagsList[0]]);
});

export const editTagsAtom = atom(
  null,
  (get, set, prevName: string, tagName: string, score: number) => {
    const selectedTagsPanel = get(selectedTagsPanelAtom);
    let tags: TagType[];
    if (selectedTagsPanel === 'selected') {
      tags = get(tagsListSelectedAtom);
    } else {
      tags = get(tagsListAllAtom);
    }

    let updatedTag: TagType;
    set(imagesTagsAtom, (prev) => {
      const updated = { ...prev };
      let imagePaths = Object.keys(prev);
      if (selectedTagsPanel === 'selected') {
        imagePaths = get(selectedImagesAtom);
      }
      imagePaths.forEach((imagePath) => {
        const target = prev[imagePath].find((tag) => tag.name === prevName);
        if (target) {
          let index = updated[imagePath].findIndex((tag) => tag.name === target.name);
          updated[imagePath] = [...updated[imagePath]];
          if (prevName !== tagName) {
            updated[imagePath] = updated[imagePath].filter((tag) => tag.name !== tagName);
            index = updated[imagePath].findIndex((tag) => tag.name === target.name);
          }
          updatedTag = { name: tagName, score: score };
          updated[imagePath].splice(index, 1, updatedTag);
        }
      });
      // set(selectedTagsAtom, [updatedTag]);
      return updated;
    });
  }
);

export const changePanelAtom = atom(
  null,
  (
    get,
    set,
    panel: TagsPanelType,
    direction: TagsPanelType,
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (direction === 'all' && panel === 'selected') {
      e.preventDefault();
      set(selectedTagsAtom, [get(tagsListAllAtom)[0]]);
      set(selectedTagsPanelAtom, 'all');
    } else if (direction === 'selected' && panel === 'all') {
      const tagsList = get(tagsListSelectedAtom);
      if (tagsList.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        set(selectedTagsAtom, [tagsList[tagsList.length - 1]]);
        set(selectedTagsPanelAtom, 'selected');
      }
    }
  }
);

export const popupSetSelectedTagAtom = atom(null, (get, set, value: string) => {
  let tag = get(tagsListSelectedAtom).find((tag) => tag.name.startsWith(value));
  if (tag) {
    set(selectedTagsAtom, [tag]);
    set(selectedTagsPanelAtom, 'selected');
  } else {
    tag = get(tagsListAllAtom).find((tag) => tag.name.startsWith(value));
    if (tag) {
      set(selectedTagsAtom, [tag]);
      set(selectedTagsPanelAtom, 'all');
    }
  }
});

export const tagItemContextMenuAtom = atom(null, (get, set, tag: TagType) => {
  const selectedTags = get(selectedTagsAtom);
  if (!selectedTags.includes(tag)) {
    set(selectedTagsAtom, [tag]);
  } else {
    set(selectedTagsAtom, (prev) => [...prev.filter((t) => t !== tag), tag]);
  }
});

export const copyTagsAtom = atom(null, (get, _set) => {
  const selectedTags = get(selectedTagsAtom);
  const tags =
    get(selectedTagsPanelAtom) === 'selected' ? get(tagsListSelectedAtom) : get(tagsListAllAtom);
  navigator.clipboard.writeText(
    tags
      .filter((tag) => selectedTags.some((t) => t.name === tag.name))
      .map((tag) => tag.name)
      .join(', ')
  );
});
