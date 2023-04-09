import { useAtomValue, useSetAtom } from 'jotai';
import {
  changePanelAtom,
  changeSelectedTagsAtom,
  clearSelectedTagsAtom,
  deleteTagsAtom,
  includeTagsAtom,
} from 'renderer/atoms/derivedWriteAtom';
import {
  selectedTagsAtom,
  selectedTagsPanelAtom,
  tagThresholdAtom,
} from 'renderer/atoms/primitiveAtom';
import { handleSelect } from 'renderer/utils';
import { TagType, TagsPanelType } from '../../../types/types';
import TagItem from './TagItem';
import './TagsList.css';

type TagsListProps = {
  tags: TagType[];
  panel: TagsPanelType;
};

// TODO: copy tags to clipboard on ctrl + c

function TagsList({ tags, panel }: TagsListProps) {
  const setSelectedTags = useSetAtom(selectedTagsAtom);
  const setSelectedTagsPanel = useSetAtom(selectedTagsPanelAtom);
  const clearSelectedTags = useSetAtom(clearSelectedTagsAtom);
  const includeTags = useSetAtom(includeTagsAtom);
  const changeSelectedTags = useSetAtom(changeSelectedTagsAtom);
  const changePanel = useSetAtom(changePanelAtom);

  const tagThreshold = useAtomValue(tagThresholdAtom);

  const deleteTags = useSetAtom(deleteTagsAtom);

  return (
    <div className="tags-list" onFocus={() => setSelectedTagsPanel(panel)} tabIndex={0}>
      {tags.map((tag, i) => (
        <TagItem
          key={tag.name}
          tag={tag}
          panel={panel}
          style={{
            color: tag.score < tagThreshold ? 'hsla(0, 100%, 100%, 0.4)' : undefined,
          }}
          onClickHandler={(e) => {
            setSelectedTags((prev) => handleSelect(tags, prev, tag, e.ctrlKey, e.shiftKey, true));
          }}
          onKeyDown={(e) => {
            switch (e.key) {
              case 'a':
              case 'A':
                if (e.ctrlKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedTags(tags);
                }
                break;
              case 'd':
                if (e.ctrlKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  clearSelectedTags();
                }
                break;
              case 'i':
                e.preventDefault();
                e.stopPropagation();
                includeTags();
                break;
              case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                changeSelectedTags(tags, 1, e.ctrlKey, e.shiftKey);
                break;
              case 'Tab':
                if (e.shiftKey) {
                  if (i > 0) {
                    e.preventDefault();
                    changeSelectedTags(tags, -1);
                  } else {
                    changePanel(panel, 'selected', e);
                  }
                } else {
                  if (i < tags.length - 1) {
                    e.preventDefault();
                    changeSelectedTags(tags, 1);
                  } else {
                    console.log('test');
                    changePanel(panel, 'all', e);
                  }
                }
                break;
              case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                changeSelectedTags(tags, -1, e.ctrlKey, e.shiftKey);
                break;
              case 'Delete':
                e.preventDefault();
                e.stopPropagation();
                deleteTags();
                break;
              default:
                break;
            }
          }}
          moveToNext={() => {
            setSelectedTags([tags[Math.min(tags.length - 1, i + 1)]]);
          }}
        />
      ))}
    </div>
  );
}

export default TagsList;
