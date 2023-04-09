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

export function handleKeySelect<T>(
  list: T[],
  selected: T[],
  delta: number,
  ctrlKey: boolean,
  shiftKey: boolean,
  removable = false
): T[] {
  if (selected.length === 0) {
    if (list.length === 0) return [];
    return [list[0]];
  }
  const prevIndex = list.indexOf(selected[selected.length - 1]);
  const currIndex = Math.min(Math.max(prevIndex + delta, 0), list.length - 1);
  return handleSelect(list, selected, list[currIndex], ctrlKey, shiftKey, removable);
}

export function handleSelect<T>(
  list: T[],
  selected: T[],
  curr: T,
  ctrlKey: boolean,
  shiftKey: boolean,
  removable = true
): T[] {
  if (selected.length === 0) {
    return [curr];
  }

  if (selected.length === 1 && selected.includes(curr)) {
    return removable ? [] : selected;
  }

  if (shiftKey) {
    const prevIndex = list.indexOf(selected[selected.length - 1]);
    const currIndex = list.indexOf(curr);

    if (selected.includes(curr)) {
      let updated = selected;
      if (prevIndex > currIndex) {
        for (let i = prevIndex; i >= currIndex; i--) {
          updated = updated.filter((item) => item !== list[i]);
        }
      } else {
        for (let i = prevIndex; i <= currIndex; i++) {
          updated = updated.filter((item) => item !== list[i]);
        }
      }
      return [...updated, curr];
    }
    const slice = list.slice(Math.min(prevIndex, currIndex), Math.max(prevIndex, currIndex) + 1);
    if (prevIndex > currIndex) {
      slice.reverse();
    }
    return [...selected, ...slice.filter((item) => !selected.includes(item))];
  }
  if (ctrlKey) {
    if (selected.includes(curr)) {
      return selected.filter((item) => item !== curr);
    }

    return [...selected, curr];
  }

  return [curr];
}
