import { atom, useAtomValue, useSetAtom } from 'jotai';
import {
  ComponentProps,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  selectedTagsAtom,
  selectedTagsPanelAtom,
} from 'renderer/atoms/primitiveAtom';
import { TagType, TagsPanelType } from '../../../types/types';
import './TagItem.css';

type TagItemProps = ComponentProps<'div'> & {
  tag: TagType;
  onEdit: (value: string) => void;
  moveToNext: () => void;
  panel: TagsPanelType;
  onClickHandler: React.MouseEventHandler<HTMLInputElement>;
};

const TagItem = memo(function TagItem({
  tag,
  onEdit,
  moveToNext,
  panel,
  onClickHandler,
  ...props
}: TagItemProps) {
  const [tagName, setTagName] = useState(tag.name);
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedAtom = useMemo(
    () =>
      atom(
        (get) =>
          get(selectedTagsPanelAtom) === panel &&
          get(selectedTagsAtom).some((t) => t.name === tag.name)
      ),
    [tag]
  );
  const focusAtom = useMemo(
    () =>
      atom((get) => {
        const selectedTags = get(selectedTagsAtom);
        return (
          selectedTags.length > 0 &&
          selectedTags[selectedTags.length - 1] === tag
        );
      }),
    [tag]
  );
  const selected = useAtomValue(selectedAtom);
  const focus = useAtomValue(focusAtom);

  const setSelectedTags = useSetAtom(selectedTagsAtom);

  useEffect(() => {
    if (focus && ref.current) {
      ref.current.querySelector('input')?.focus();
      ref.current.querySelector('input')?.setSelectionRange(null, null);
    }
  }, [focus, ref.current, selected]);

  const handleOnClick = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    if (e.detail === 1 && selected && !editing) {
      setSelectedTags([]);
    } else {
      onClickHandler(e);
    }
  };

  return (
    <div
      className={`tag${selected ? ' selected' : ''}${editing ? ' edit' : ''}`}
      ref={ref}
      {...props}
    >
      <div className="score" style={{ width: `${tag.score * 100}%` }} />
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
            onEdit(tagName);
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
            case 'ArrowLeft':
              e.stopPropagation();
              if (!editing) {
                e.preventDefault();
                setEditing(true);
                ref.current?.querySelector('input')?.setSelectionRange(0, 0);
              }
              break;
            case 'ArrowRight':
              e.stopPropagation();
              if (!editing) {
                e.preventDefault();
                setEditing(true);
                ref.current
                  ?.querySelector('input')
                  ?.setSelectionRange(tagName.length, tagName.length);
              }
              break;
            default:
              break;
          }
        }}
      />
    </div>
  );
});

export default TagItem;
