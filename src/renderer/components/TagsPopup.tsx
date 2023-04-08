import { atom, useAtom, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { popupSetImagesTagsAtom } from 'renderer/atoms/derivedWriteAtom';
import { popupAtom } from 'renderer/atoms/primitiveAtom';
import './TagsPopup.css';

const popupTagAtom = atom('');

function TagsPopup() {
  const popupSetImagesTags = useSetAtom(popupSetImagesTagsAtom);
  const [popup, setPopup] = useAtom(popupAtom);
  const ref = useRef<HTMLInputElement>(null);
  const [popupTag, setPopupTag] = useAtom(popupTagAtom);

  useEffect(() => {
    ref.current?.focus();
    return () => {
      document.querySelector<HTMLDivElement>('#app-container')?.focus();
    };
  }, [popup.show]);

  return (
    <>
      {popup.show && (
        <div
          id="tags-popup"
          onClick={() => setPopup((prev) => ({ ...prev, show: false }))}
        >
          <form
            id="tags-popup-container"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              const tagName =
                document.querySelector<HTMLInputElement>('#tag-input')?.value;
              if (!tagName || tagName.length === 0) return;
              popupSetImagesTags(popup.panel, tagName);
              setPopup((prev) => ({ ...prev, show: false }));
            }}
          >
            <label htmlFor="tag-input">Add tag to {popup.panel} images:</label>
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
              <button
                type="button"
                onClick={() => setPopup((prev) => ({ ...prev, show: false }))}
              >
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
