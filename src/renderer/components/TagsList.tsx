import { useAtomValue, useSetAtom } from 'jotai';
import { useContextMenu } from 'react-contexify';
import {
  changePanelAtom,
  changeSelectedTagsAtom,
  clearSelectedTagsAtom,
  copyTagsAtom,
  deleteTagsAtom,
  tagItemContextMenuAtom,
} from 'renderer/atoms/derivedWriteAtom';
import {
  selectedTagsAtom,
  selectedTagsPanelAtom,
  tagThresholdAtom,
} from 'renderer/atoms/primitiveAtom';
import { handleSelect } from 'renderer/utils';
import { ContextMenuIds, TagType, TagsPanelType } from '../../../types/types';
import TagItem from './TagItem';
import './TagsList.css';

type TagsListProps = {
  tags: TagType[];
  panel: TagsPanelType;
};

const menuId: ContextMenuIds = 'TagItem';

// TODO: copy tags to clipboard on ctrl + c

function TagsList({ tags, panel }: TagsListProps) {
  const setSelectedTags = useSetAtom(selectedTagsAtom);
  const setSelectedTagsPanel = useSetAtom(selectedTagsPanelAtom);
  const clearSelectedTags = useSetAtom(clearSelectedTagsAtom);
  const changeSelectedTags = useSetAtom(changeSelectedTagsAtom);
  const changePanel = useSetAtom(changePanelAtom);
  const tagItemContextMenu = useSetAtom(tagItemContextMenuAtom);
  const copyTags = useSetAtom(copyTagsAtom);

  const tagThreshold = useAtomValue(tagThresholdAtom);

  const deleteTags = useSetAtom(deleteTagsAtom);

  const { show } = useContextMenu({
    id: menuId,
  });

  return (
    <div
      className="tags-list"
      onFocus={() => setSelectedTagsPanel(panel)}
      tabIndex={0}
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
          case 'ArrowDown':
            e.preventDefault();
            e.stopPropagation();
            changeSelectedTags(tags, 1, e.ctrlKey, e.shiftKey);
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
    >
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
          onContextMenu={(e) => {
            tagItemContextMenu(tag);
            show({
              event: e,
              props: {
                name: tag.name,
              },
            });
          }}
          onKeyDown={(e) => {
            switch (e.key) {
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
              case 'c':
                if (e.ctrlKey) {
                  copyTags();
                }
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
