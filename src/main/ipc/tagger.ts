import axios, { AxiosError } from 'axios';
import { TagData } from '../../../types/types';
import { settingsStore } from '../store';

export async function tagImages(filePaths: string[]): Promise<TagData> {
  const data = {
    model: settingsStore.get('taggerModel'),
    image_paths: filePaths,
    batch_size: settingsStore.get('batchSize'),
    threshold_low: settingsStore.get('thresholdLow'),
  };
  try {
    const res = await axios.post('http://127.0.0.1:5000/tag', data);
    return res.data;
  } catch (error) {
    console.log((error as AxiosError).message);
    return {};
  }
}
