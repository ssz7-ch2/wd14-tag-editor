import { atom, useAtom, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { popupSetImagesTagsAtom, popupSetSelectedTagAtom } from 'renderer/atoms/derivedWriteAtom';
import { popupAtom } from 'renderer/atoms/primitiveAtom';
import './TagsPopup.css';

const popupTagAtom = atom('');

function TagsPopup() {
  const popupSetImagesTags = useSetAtom(popupSetImagesTagsAtom);
  const popupSetSelectedTag = useSetAtom(popupSetSelectedTagAtom);
  const [popup, setPopup] = useAtom(popupAtom);
  const ref = useRef<HTMLInputElement>(null);
  const [popupTag, setPopupTag] = useAtom(popupTagAtom);

  useEffect(() => {
    ref.current?.focus();
    if (popup.type === 'find') {
      setPopupTag('');
    }
    return () => {
      document.querySelector<HTMLDivElement>('#app-container')?.focus();
    };
  }, [popup]);

  const getText = () => {
    switch (popup.type) {
      case 'add':
        return `Add tag to ${popup.panel} images:`;
      case 'find':
        return 'Find tag:';
      default:
        return '';
    }
  };

  return (
    <>
      {popup.show && (
        <div id="tags-popup" onClick={() => setPopup((prev) => ({ ...prev, show: false }))}>
          <form
            id="tags-popup-container"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              const tagName = document.querySelector<HTMLInputElement>('#tag-input')?.value;
              if (!tagName || tagName.length === 0) return;
              switch (popup.type) {
                case 'add':
                  popupSetImagesTags(popup.panel, tagName);
                  break;
                case 'find':
                  popupSetSelectedTag(tagName);
                  break;
                default:
                  break;
              }

              setPopup((prev) => ({ ...prev, show: false }));
            }}
          >
            <label htmlFor="tag-input">{getText()}</label>
            <input
              type="text"
              name="tag-input"
              id="tag-input"
              ref={ref}
              value={popupTag}
              onChange={(e) => setPopupTag(e.target.value)}
            />
            <div>
              <button type="submit">OK</button>
              <button type="button" onClick={() => setPopup((prev) => ({ ...prev, show: false }))}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default TagsPopup;
