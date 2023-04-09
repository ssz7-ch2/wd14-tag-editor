import { storeType } from '../main/store';
import './Settings.css';
import Checkbox from './components/Checkbox';
import Select from './components/Select';
import Slider from './components/Slider';

const taggerModels = ['swinv2', 'convnextv2', 'convnext'];

function Settings() {
  const settings: (keyof storeType)[] = [
    'taggerModel',
    'batchSize',
    'threshold',
    'thresholdLow',
    'useTensorflow',
    'saveScores',
  ];
  const taggerModel = window.electron.store.get('taggerModel');
  const batchSize = window.electron.store.get('batchSize');
  const threshold = window.electron.store.get('threshold');
  const thresholdLow = window.electron.store.get('thresholdLow');
  const useTensorFlow = window.electron.store.get('useTensorflow');
  const saveScores = window.electron.store.get('saveScores');

  return (
    <form
      id="settings"
      onSubmit={(e) => {
        e.preventDefault();
        settings.forEach((name) => {
          const element = e.currentTarget.elements.namedItem(name) as HTMLInputElement;

          switch (name) {
            case 'taggerModel':
              window.electron.store.set(name, element.value as storeType['taggerModel']);
              break;
            case 'batchSize':
              window.electron.store.set(name, parseInt(element.value));
              break;
            case 'threshold':
              window.electron.ipcRenderer.sendMessage('setTagThreshold', [
                parseFloat(element.value),
              ]);
            case 'thresholdLow':
              window.electron.store.set(name, parseFloat(element.value));
              break;
            case 'useTensorflow':
              window.electron.store.set(name, element.checked);
              break;
            case 'saveScores':
              window.electron.store.set(name, element.checked);
            default:
              break;
          }
        });
        window.close();
      }}
    >
      <h1>Settings</h1>
      <div className="option-h">
        <p>Tagger Model</p>
        <Select options={taggerModels} initial={taggerModel} name="taggerModel" />
      </div>
      <div className="option-h">
        <p>Use Tensorflow (requires restart)</p>
        <Checkbox name="useTensorflow" initial={useTensorFlow} />
      </div>
      <div className="option">
        <p>Batch Size</p>
        <Slider min={1} max={20} step={1} initial={batchSize} decimals={0} name="batchSize" />
      </div>
      <div className="option">
        <p>Threshold</p>
        <Slider min={0.01} max={1} step={0.01} initial={threshold} decimals={2} name="threshold" />
      </div>
      <div className="option">
        <p>Threshold Low</p>
        <Slider
          min={0.01}
          max={1}
          step={0.01}
          initial={thresholdLow}
          decimals={2}
          name="thresholdLow"
        />
      </div>
      <div className="option-h">
        <p>Save Tag Scores</p>
        <Checkbox name="saveScores" initial={saveScores} />
      </div>
      <br />
      <button type="submit">Save</button>
    </form>
  );
}

export default Settings;
