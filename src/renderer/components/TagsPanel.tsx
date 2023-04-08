import Split from 'react-split';
import TagsMenu from './TagsMenu';
import './TagsPanel.css';
import TagsPanelAll from './TagsPanelAll';
import TagsPanelSelected from './TagsPanelSelected';
import TagsPopup from './TagsPopup';

function TagsPanel() {
  return (
    <div id="tags-panel" tabIndex={0}>
      <Split
        className="tags-container"
        direction="vertical"
        sizes={[50, 50]}
        minSize={100}
        snapOffset={0}
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
