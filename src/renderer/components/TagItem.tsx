import { atom, useAtomValue, useSetAtom } from 'jotai';
import { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import { editTagsAtom, includeTagsAtom } from 'renderer/atoms/derivedWriteAtom';
import { selectedTagsAtom, selectedTagsPanelAtom } from 'renderer/atoms/primitiveAtom';
import { TagType, TagsPanelType } from '../../../types/types';
import './TagItem.css';

type TagItemProps = ComponentProps<'div'> & {
  tag: TagType;
  moveToNext: () => void;
  panel: TagsPanelType;
  onClickHandler: React.MouseEventHandler<HTMLInputElement>;
};

function TagItem({ tag, moveToNext, panel, onClickHandler, ...props }: TagItemProps) {
  const [tagName, setTagName] = useState(tag.name);
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const editTags = useSetAtom(editTagsAtom);
  const includeTags = useSetAtom(includeTagsAtom);

  const selectedAtom = useMemo(
    () => atom((get) => get(selectedTagsAtom).some((t) => t.name === tag.name)),
    [tag]
  );

  const isLastSelectedAtom = useMemo(
    () =>
      atom((get) => {
        const selectedTags = get(selectedTagsAtom);
        return selectedTags.length > 0 && selectedTags[selectedTags.length - 1].name === tag.name;
      }),
    [tag]
  );

  const focusAtom = useMemo(
    () =>
      atom((get) => {
        const selectedTags = get(selectedTagsAtom);
        const selectedPanel = get(selectedTagsPanelAtom);
        return (
          selectedTags.length > 0 &&
          selectedTags[selectedTags.length - 1].name === tag.name &&
          panel === selectedPanel
        );
      }),
    [tag]
  );
  const selected = useAtomValue(selectedAtom);
  const isLastSelected = useAtomValue(isLastSelectedAtom);
  const focus = useAtomValue(focusAtom);

  const setSelectedTags = useSetAtom(selectedTagsAtom);

  //console.log('render TagItem');

  useEffect(() => {
    if (focus && ref.current) {
      ref.current.querySelector('input')?.focus();
      ref.current.querySelector('input')?.setSelectionRange(null, null);
    } else if (isLastSelected && ref.current) {
      ref.current.querySelector('input')?.scrollIntoView({
        block: 'nearest',
      });
    }
    if (!focus && editing) {
      setEditing(false);
    }
  }, [focus, ref.current, isLastSelected, tag, tag.name]);

  const handleOnClick = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    e.stopPropagation();
    if (e.detail === 1 && focus && !editing) {
      console.log('remove');
      setSelectedTags([]);
    } else if ((e.detail === 2 && !selected) || (e.detail === 1 && !editing)) {
      onClickHandler(e);
    }
  };

  //console.log('render tagitem');

  return (
    <div
      className={`tag${selected ? ' selected' : ''}${focus ? ' focus' : ''}${
        editing ? ' edit' : ''
      }`}
      ref={ref}
      {...props}
    >
      <div className="score" style={{ width: `${Math.min(Math.max(tag.score, 0), 1) * 100}%` }} />
      <input
        type="text"
        name={tag.score.toString()}
        id=""
        value={tagName}
        readOnly={!editing}
        onChange={(e) => setTagName(e.target.value)}
        onDoubleClick={() => setEditing(true)}
        onContextMenu={handleOnClick}
        onClick={handleOnClick}
        onBlur={() => {
          setEditing(false);
          if (tagName !== tag.name) {
            const split = tagName.split(':');
            const score = split[split.length - 1];
            if (!isNaN(Number(score)) && score.length > 0) {
              console.log(tagName.replace(`:${score}`, ''));
              editTags(tag.name, tagName.replace(`:${score}`, ''), Number(score));
              setTagName(tagName.replace(`:${score}`, ''));
            } else {
              editTags(tag.name, tagName, tag.score);
            }
          }
        }}
        onKeyDown={(e) => {
          switch (e.key) {
            case 'Enter':
              e.preventDefault();
              if (editing) {
                setEditing(false);
                moveToNext();
              } else {
                setEditing(true);
                ref.current?.querySelector('input')?.select();
              }
              break;
            case 'Escape':
              if (editing) {
                setEditing(false);
                setTagName(tag.name);
              }
              break;
            case 'ArrowRight':
            case 'ArrowLeft':
              if (editing) {
                e.stopPropagation();
              }
              break;
            case 'i':
              if (!editing) {
                e.preventDefault();
                includeTags();
              }
            default:
              break;
          }
        }}
      />
    </div>
  );
}

export default TagItem;
