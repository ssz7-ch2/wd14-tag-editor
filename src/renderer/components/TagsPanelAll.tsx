import { atom, useAtomValue, useSetAtom } from 'jotai';
import { imagesTagsAtom } from 'renderer/atoms/atom';
import { sortTagName } from 'renderer/utils';
import TagsList from './TagsList';

const tagsListAtom = atom((get) => {
  const tagsDict: { [key: string]: number[] } = {};
  Object.values(get(imagesTagsAtom)).forEach((tags) => {
    tags.forEach((tag) => {
      if (!(tag.name in tagsDict)) {
        tagsDict[tag.name] = [];
      }
      tagsDict[tag.name].push(tag.score);
    });
  });

  return Object.entries(tagsDict)
    .map(([tag, scores]) => {
      return {
        name: tag,
        score: Math.max(...scores),
      };
    })
    .sort(sortTagName);
});

function TagsPanelAll() {
  console.log('render TagsPanelAll');
  const tagsList = useAtomValue(tagsListAtom);
  const setImagesTags = useSetAtom(imagesTagsAtom);
  return (
    <div className="panel">
      <h2 className="panel-header">All Image Tags</h2>
      <TagsList tags={tagsList} setImagesTags={setImagesTags} />
    </div>
  );
}

export default TagsPanelAll;
