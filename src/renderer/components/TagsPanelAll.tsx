import { useAtomValue, useSetAtom } from 'jotai';
import { tagsListAllAtom } from 'renderer/atoms/derivedReadAtom';
import { imagesTagsAtom } from 'renderer/atoms/primitiveAtom';
import TagsList from './TagsList';

function TagsPanelAll() {
  console.log('render TagsPanelAll');
  const tagsList = useAtomValue(tagsListAllAtom);
  const setImagesTags = useSetAtom(imagesTagsAtom);
  return (
    <div className="panel">
      <h2 className="panel-header">All Image Tags</h2>
      <TagsList tags={tagsList} setImagesTags={setImagesTags} panel="all" />
    </div>
  );
}

export default TagsPanelAll;
