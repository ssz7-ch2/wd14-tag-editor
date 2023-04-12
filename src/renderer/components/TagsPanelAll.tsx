import { useAtomValue } from 'jotai';
import { tagsListAllAtom } from 'renderer/atoms/derivedReadAtom';
import TagsList from './TagsList';

function TagsPanelAll() {
  const tagsList = useAtomValue(tagsListAllAtom);
  return (
    <div className="panel">
      <h2 className="panel-header">All Image Tags</h2>
      <TagsList tags={tagsList} panel="all" />
    </div>
  );
}

export default TagsPanelAll;
