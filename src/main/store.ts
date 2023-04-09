import Store, { Schema } from 'electron-store';

export type storeType = {
  batchSize: number;
  useTensorflow: boolean;
  taggerModel: 'swinv2' | 'convnextv2' | 'convnext' | 'combined';
  threshold: number;
  thresholdLow: number;
  saveScores: boolean;
};

const storeSchema: Schema<storeType> = {
  batchSize: {
    type: 'number',
    maximum: 100,
    minimum: 1,
    default: 8,
  },
  useTensorflow: {
    type: 'boolean',
    default: false,
  },
  taggerModel: {
    type: 'string',
    default: 'swinv2',
  },

  threshold: {
    type: 'number',
    default: 0.2,
    maximum: 1,
    minimum: 0,
  },
  thresholdLow: {
    type: 'number',
    default: 0.05,
    maximum: 1,
    minimum: 0.01,
  },
  saveScores: {
    type: 'boolean',
    default: false,
  },
};

export const settingsStore = new Store<storeType>({ schema: storeSchema });
