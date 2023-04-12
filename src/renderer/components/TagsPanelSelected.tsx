import { useAtomValue } from 'jotai';
import { tagsListSelectedAtom } from 'renderer/atoms/derivedReadAtom';
import TagsList from './TagsList';

function TagsPanelSelected() {
  const tagsList = useAtomValue(tagsListSelectedAtom);

  return (
    <div className="panel">
      <h2 className="panel-header">Selected Image Tags</h2>
      <TagsList tags={tagsList} panel="selected" />
    </div>
  );
}

export default TagsPanelSelected;
