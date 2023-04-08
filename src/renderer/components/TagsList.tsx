import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import {
  clearSelectedTagsAtom,
  includeTagsAtom,
} from 'renderer/atoms/derivedWriteAtom';
import {
  selectedTagsAtom,
  selectedTagsPanelAtom,
  tagThresholdAtom,
} from 'renderer/atoms/primitiveAtom';
import { SetImagesTags, TagType, TagsPanelType } from '../../../types/types';
import TagItem from './TagItem';
import './TagsList.css';

type TagsListProps = {
  tags: TagType[];
  setImagesTags: SetImagesTags;
  panel: TagsPanelType;
};

// TODO: copy tags to clipboard on ctrl + c

function TagsList({ tags, setImagesTags, panel }: TagsListProps) {
  const setSelectedTags = useSetAtom(selectedTagsAtom);
  const setSelectedTagsPanel = useSetAtom(selectedTagsPanelAtom);
  const clearSelectedTags = useSetAtom(clearSelectedTagsAtom);
  const includeTags = useSetAtom(includeTagsAtom);

  const tagThreshold = useAtomValue(tagThresholdAtom);

  const deleteTagsAtom = useMemo(
    () =>
      atom(null, (get, set, tags: TagType[]) => {
        const selectedTags = get(selectedTagsAtom);
        if (selectedTags.length === 0) return;

        let newSelectedTag: TagType | null = null;
        if (tags.length > 0 && selectedTags.includes(tags[tags.length - 1])) {
          for (let i = tags.length - 1; i >= 0; i--) {
            if (!selectedTags.includes(tags[i])) {
              newSelectedTag = tags[i];
              break;
            }
          }
        } else {
          for (let i = tags.length - 1; i >= 0; i--) {
            if (selectedTags.includes(tags[i])) {
              break;
            } else {
              newSelectedTag = tags[i];
            }
          }
        }

        setImagesTags((prev) => {
          if (Object.keys(prev).length === 0) {
            return prev;
          }
          const updated = { ...prev };
          Object.entries(updated).forEach(([imagePath, tags]) => {
            let updatedTags = [...tags];
            updatedTags = updatedTags.filter(
              (tag) =>
                !selectedTags.some(
                  (selectedTag) => selectedTag.name === tag.name
                )
            );
            updated[imagePath] = updatedTags;
          });
          return updated;
        });

        if (newSelectedTag) {
          set(selectedTagsAtom, [newSelectedTag]);
        } else {
          set(selectedTagsAtom, []);
        }
      }),
    [setImagesTags]
  );

  const deleteTags = useSetAtom(deleteTagsAtom);

  return (
    <div
      className="tags-list"
      onClick={() => setSelectedTagsPanel(panel)}
      onMouseDown={(e) => e.preventDefault()}
      onFocus={() => setSelectedTagsPanel(panel)}
    >
      {tags.map((tag, i) => (
        <TagItem
          key={tag.name}
          tag={tag}
          panel={panel}
          style={{
            color:
              tag.score < tagThreshold ? 'hsla(0, 100%, 100%, 0.4)' : undefined,
          }}
          onEdit={(value) => {
            setImagesTags((prev) => {
              const updated = { ...prev };
              Object.entries(updated).forEach(([imagePath, tags]) => {
                const target = tags.find((t) => t.name === tag.name);
                if (target) {
                  updated[imagePath] = tags.filter((tag) => tag.name !== value);
                  target.name = value;
                }
              });
              return updated;
            });
          }}
          onClickHandler={(e) => {
            setSelectedTags((prev) => {
              if (prev.length === 1 && prev[0] === tag) {
                return prev;
              }
              if (prev.length === 0) {
                return [tag];
              }
              if (e.ctrlKey) {
                if (prev.some((t) => t === tag)) {
                  return prev.filter((t) => t.name !== tag.name);
                }

                return [...prev, tag];
              }
              if (e.shiftKey) {
                const prevIndex = tags.findIndex(
                  (t) => t === prev[prev.length - 1]
                );
                const addTags: TagType[] = [];

                tags
                  .slice(
                    prevIndex > i ? i : prevIndex,
                    prevIndex > i ? prevIndex + 1 : i + 1
                  )
                  .forEach((t) => {
                    if (!prev.includes(t)) {
                      addTags.push(t);
                    }
                  });
                if (prevIndex > i) {
                  addTags.reverse();
                }
                return [...prev, ...addTags];
              }
              return [tag];
            });
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
                if (i < tags.length - 1) {
                  setSelectedTags([tags[i + 1]]);
                }
                break;
              case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                if (i > 0) {
                  setSelectedTags([tags[i - 1]]);
                }
                break;
              case 'Delete':
                e.preventDefault();
                e.stopPropagation();
                deleteTags(tags);
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
