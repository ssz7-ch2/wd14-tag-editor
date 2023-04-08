import {
  faCircleMinus,
  faFilter,
  faFilterCircleXmark,
  faMinus,
  faPlus,
  faPlusCircle,
  faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';
import { useSetAtom } from 'jotai';
import {
  addTagsAllAtom,
  addTagsAtom,
  filterAtom,
  includeTagsAtom,
  removeFilterAtom,
  removeTagsAllAtom,
  removeTagsAtom,
} from 'renderer/atoms/derivedWriteAtom';
import MenuIcon from './MenuIcon';
import './TagsMenu.css';

function TagsMenu() {
  const addTags = useSetAtom(addTagsAtom);
  const addTagsAll = useSetAtom(addTagsAllAtom);
  const removeTags = useSetAtom(removeTagsAtom);
  const removeTagsAll = useSetAtom(removeTagsAllAtom);
  const filter = useSetAtom(filterAtom);
  const removeFilter = useSetAtom(removeFilterAtom);
  const includeTags = useSetAtom(includeTagsAtom);

  return (
    <div id="tags-menu">
      <MenuIcon icon={faPlus} text="Add Tag" color="rgb(116, 230, 101)" onClick={addTags} />
      <MenuIcon
        icon={faPlusCircle}
        text="Add To All"
        color="rgb(116, 230, 101)"
        onClick={addTagsAll}
      />
      <MenuIcon icon={faMinus} text="Remove Tag" color="rgb(236, 95, 100)" onClick={removeTags} />
      <MenuIcon
        icon={faCircleMinus}
        text="Remove From All"
        color="rgb(236, 95, 100)"
        onClick={removeTagsAll}
      />
      <MenuIcon icon={faFilter} text="Filter" color="rgb(101, 178, 230)" onClick={filter} />
      <MenuIcon
        icon={faFilterCircleXmark}
        text="Remove Filter"
        color="rgb(101, 178, 230)"
        onClick={removeFilter}
      />
      <MenuIcon
        icon={faPlusSquare}
        text="Include Tag"
        color="rgb(116, 230, 101)"
        onClick={includeTags}
      />
    </div>
  );
}

export default TagsMenu;
