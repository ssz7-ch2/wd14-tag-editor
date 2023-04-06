import {
  faCircleMinus,
  faFilter,
  faFilterCircleXmark,
  faMinus,
  faPlus,
  faPlusCircle,
  faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  filterTagsAtom,
  imagesTagsAtom,
  popupAtom,
  selectedImagesAtom,
  selectedTagsAtom,
  tagThresholdAtom,
} from 'renderer/atoms/atom';
import MenuIcon from './MenuIcon';
import './TagsMenu.css';

function TagsMenu() {
  console.log('render TagsMenu');
  const setPopup = useSetAtom(popupAtom);
  const selectedImages = useAtomValue(selectedImagesAtom);
  const selectedTags = useAtomValue(selectedTagsAtom);
  const setImagesTags = useSetAtom(imagesTagsAtom);
  const setFilterTags = useSetAtom(filterTagsAtom);
  const tagThreshold = useAtomValue(tagThresholdAtom);

  const actions = {
    addTags: () => {
      setPopup({
        show: true,
        panel: 'selected',
      });
    },
    addTagsAll: () => {
      setPopup({
        show: true,
        panel: 'all',
      });
    },
    removeTags: () => {
      if (selectedTags.length === 0 || selectedImages.length === 0) return;

      setImagesTags((prev) => {
        const updated = { ...prev };
        selectedImages.forEach((imagePath) => {
          let tags = [...updated[imagePath]];
          tags = tags.filter(
            (tag) =>
              !selectedTags.some((selectedTag) => selectedTag.name === tag.name)
          );
          updated[imagePath] = tags;
        });
        return updated;
      });
    },
    removeTagsAll: () => {
      if (selectedTags.length === 0) return;

      setImagesTags((prev) => {
        const updated = { ...prev };
        Object.entries(updated).forEach(([imagePath, tags]) => {
          let updatedTags = [...tags];
          updatedTags = updatedTags.filter(
            (tag) =>
              !selectedTags.some((selectedTag) => selectedTag.name === tag.name)
          );
          updated[imagePath] = updatedTags;
        });
        return updated;
      });
    },
    filter: () => {
      setFilterTags((prev) => {
        const updated = new Set(selectedTags.map((tag) => tag.name));
        if (
          prev.size === updated.size &&
          [...prev].every((tag) => updated.has(tag))
        ) {
          return prev;
        }
        return updated;
      });
    },
    removeFilter: () => {
      setFilterTags((prev) => {
        if (prev.size === 0) {
          return prev;
        }
        return new Set<string>();
      });
    },
    includeTags: () => {
      if (selectedTags.length === 0 || selectedImages.length === 0) return;

      setImagesTags((prev) => {
        const updated = { ...prev };
        let count = 0;
        selectedImages.forEach((imagePath) => {
          const tags = [...updated[imagePath]];
          tags.forEach((tag) => {
            if (
              selectedTags.some(
                (selectedTag) => selectedTag.name === tag.name
              ) &&
              tag.score < tagThreshold
            ) {
              tag.score = tagThreshold;
              count += 1;
            }
          });
          updated[imagePath] = tags;
        });
        if (count == 0) {
          return prev;
        }
        return updated;
      });
    },
  };

  return (
    <div id="tags-menu">
      <MenuIcon
        icon={faPlus}
        text="Add Tag"
        color="rgb(116, 230, 101)"
        onClick={actions.addTags}
      />
      <MenuIcon
        icon={faPlusCircle}
        text="Add To All"
        color="rgb(116, 230, 101)"
        onClick={actions.addTagsAll}
      />
      <MenuIcon
        icon={faMinus}
        text="Remove Tag"
        color="rgb(236, 95, 100)"
        onClick={actions.removeTags}
      />
      <MenuIcon
        icon={faCircleMinus}
        text="Remove From All"
        color="rgb(236, 95, 100)"
        onClick={actions.removeTagsAll}
      />
      <MenuIcon
        icon={faFilter}
        text="Filter"
        color="rgb(101, 178, 230)"
        onClick={actions.filter}
      />
      <MenuIcon
        icon={faFilterCircleXmark}
        text="Remove Filter"
        color="rgb(101, 178, 230)"
        onClick={actions.removeFilter}
      />
      <MenuIcon
        icon={faPlusSquare}
        text="Include Tag"
        color="rgb(116, 230, 101)"
        onClick={actions.includeTags}
      />
    </div>
  );
}

export default TagsMenu;
