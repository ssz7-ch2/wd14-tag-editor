import axios, { AxiosError } from 'axios';
import { TagData } from '../../../types/types';

export async function tagImages(filePaths: string[]): Promise<TagData> {
  // TODO: use electron store for loading settings
  const data = {
    model: 'swinv2',
    image_paths: filePaths,
    batch_size: 8,
    threshold_low: 0.05,
  };
  try {
    const res = await axios.post('http://127.0.0.1:5000/tag', data);
    return res.data;
  } catch (error) {
    console.log((error as AxiosError).message);
    return {};
  }
}
