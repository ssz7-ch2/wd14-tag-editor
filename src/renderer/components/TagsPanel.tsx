import Split from 'react-split';
import TagsMenu from './TagsMenu';
import './TagsPanel.css';
import TagsPanelAll from './TagsPanelAll';
import TagsPanelSelected from './TagsPanelSelected';
import TagsPopup from './TagsPopup';

function TagsPanel() {
  const tagsPanelSizes = window.electron.store.get('tagsPanelSizes');
  return (
    <div id="tags-panel" tabIndex={0}>
      <Split
        className="tags-container"
        direction="vertical"
        sizes={tagsPanelSizes}
        minSize={100}
        snapOffset={0}
        onDragEnd={(sizes) => window.electron.store.set('tagsPanelSizes', sizes)}
      >
        <TagsPanelSelected />
        <TagsPanelAll />
      </Split>
      <TagsMenu />
      <TagsPopup />
    </div>
  );
}

export default TagsPanel;
