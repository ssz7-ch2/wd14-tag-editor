import { SetStateAction } from 'jotai';

export type ImageFileInfo = {
  path: string;
  lastModified: number;
  size: number;
  filename: string;
  index?: number;
  thumbnail: string;
  src: string;
};

export type TagData = {
  [key: string]: TagType[];
};

export type TagType = { name: string; score: number };

export type SaveTagsType = { path: string; tags: string[] }[];

export type Images = { [key: string]: ImageFileInfo };
export type SetImages = (arg: (prev: Images) => Images) => void;
export type SetImagesTags = (arg: SetStateAction<TagData>) => void;
export type SetFilterTags = (arg: SetStateAction<Set<string>>) => void;

export type TaskStatusType = {
  message: string;
  progress: number;
  status: 'Idle' | 'Processing';
};

export type TagsPanelType = 'all' | 'selected';

export type AddTagPopup = {
  show: boolean;
  panel: TagsPanelType;
};

export type ContextMenuIds = 'ImagePanel' | 'TagItem';
