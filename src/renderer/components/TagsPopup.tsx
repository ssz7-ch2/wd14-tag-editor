import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import {
  imagesTagsAtom,
  popupAtom,
  selectedImagesAtom,
} from 'renderer/atoms/atom';
import './TagsPopup.css';

function TagsPopup() {
  const setImagesTags = useSetAtom(imagesTagsAtom);
  const selectedImages = useAtomValue(selectedImagesAtom);
  const [popup, setPopup] = useAtom(popupAtom);
  const ref = useRef<HTMLInputElement>(null);
  console.log('render TagsPopup');

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
              setImagesTags((prev) => {
                const updated = { ...prev };
                if (popup.panel === 'all') {
                  Object.entries(updated).forEach(([imagePath, tags]) => {
                    updated[imagePath] = [{ name: tagName, score: 1 }, ...tags];
                  });
                } else {
                  selectedImages.forEach((imagePath) => {
                    updated[imagePath] = [
                      { name: tagName, score: 1 },
                      ...prev[imagePath],
                    ];
                  });
                }

                return updated;
              });
              setPopup((prev) => ({ ...prev, show: false }));
            }}
          >
            <label htmlFor="tag-input">Add tag to {popup.panel} images:</label>
            <input type="text" name="tag-input" id="tag-input" ref={ref} />
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
