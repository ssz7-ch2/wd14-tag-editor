import { atom } from 'jotai';
import {
  AddTagPopup,
  Images,
  TagData,
  TagsPanelType,
  TagType,
  TaskStatusType,
} from '../../../types/types';

export const imagesAtom = atom<Images>({});

export const selectedImagesAtom = atom<string[]>([]);

export const filterTagsAtom = atom<Set<string>>(new Set<string>());

export const imagesTagsAtom = atom<TagData>({});

export const selectedTagsAtom = atom<TagType[]>([]);

export const selectedTagsPanelAtom = atom<TagsPanelType>('selected');

export const taskStatusAtom = atom<TaskStatusType>({
  message: 'Idle',
  progress: 0,
  status: 'Idle',
});

export const popupAtom = atom<AddTagPopup>({
  show: false,
  panel: 'selected',
});

export const tagThresholdAtom = atom(0.2);

tagThresholdAtom.onMount = (setAtom) => {
  setAtom(window.electron.store.get('threshold'));
};
