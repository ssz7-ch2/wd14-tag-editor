import { BrowserWindow, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { ImageFileInfo, Images, SaveTagsType, TagData, TagType } from '../../../types/types';
import { settingsStore } from '../store';
import { Task } from '../task';
import { isValidImage, parseTagString, tagToString } from '../util';

const getFileInfo = async (filePath: string): Promise<[ImageFileInfo, TagType[]]> => {
  const stats = await fs.promises.stat(filePath);

  const tagsFilePath = path.join(path.dirname(filePath), `${path.parse(filePath).name}.txt`);
  let tags: TagType[] = [];
  try {
    const content = await fs.promises.readFile(tagsFilePath, 'utf-8');
    tags = content.split(',').map(parseTagString);
  } catch (error) {
    /* tags don't exist */
  }

  let src = filePath;

  const sharpImage = sharp(filePath);

  const metadata = await sharpImage.metadata();
  const MAX_SIZE = 5000000;
  const MAX_DIMENSIONS = 5000000;
  if (stats.size > MAX_SIZE) {
    let resizeImage = sharpImage;
    if (metadata.width && metadata.height && metadata.width * metadata.height > MAX_DIMENSIONS) {
      resizeImage = sharpImage.resize({
        width: Math.floor(
          metadata.width / Math.sqrt((metadata.width * metadata.height) / MAX_DIMENSIONS)
        ),
      });
    }
    const buffer = await resizeImage.toFormat('jpg').jpeg({ quality: 80, force: true }).toBuffer();
    const imageData = buffer.toString('base64');
    src = `data:image/jpg;base64,${imageData}`;
  }

  const buffer = await sharpImage.resize({ width: 100 }).toBuffer();
  const imageData = buffer.toString('base64');
  const base64 = `data:image/${path.extname(filePath).replace('.', '')};base64,${imageData}`;

  return [
    {
      path: filePath,
      lastModified: stats.mtime.getTime(),
      size: stats.size,
      filename: path.basename(filePath),
      thumbnail: base64,
      src,
    },
    tags,
  ];
};

export async function handleFilesOpen(
  mainWindow: BrowserWindow | null
): Promise<[Images, TagData]> {
  if (mainWindow == null) return [{}, {}];
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Images',
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: 'Images',
        extensions: ['png', 'jpg', 'jpeg'],
      },
    ],
  });

  if (canceled) {
    return [{}, {}];
  }
  const task = new Task();
  task.start(`Loading images 0/${filePaths.length}`);
  let count = 0;
  const images: Images = {};
  const imagesTags: TagData = {};
  const res = filePaths.map(async (filePath) => {
    const [image, tags] = await getFileInfo(filePath);
    images[image.path] = image;
    imagesTags[image.path] = tags;
    count += 1;
    task.update(`Loading images ${count}/${filePaths.length}`, count / filePaths.length);
  });
  await Promise.all(res);

  task.end(`Loaded ${count} images`);

  return [images, imagesTags];
}

export async function handleFolderOpen(
  mainWindow: BrowserWindow | null
): Promise<[Images, TagData]> {
  if (mainWindow == null) return [{}, {}];

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Folder',
    properties: ['openDirectory'],
  });

  if (canceled) {
    return [{}, {}];
  }

  const files = await fs.promises.readdir(filePaths[0]);
  const imageNames = files.filter(isValidImage);

  if (imageNames.length === 0) return [{}, {}];

  const task = new Task();
  task.start(`Loading images 0/${imageNames.length}`);

  let count = 0;
  const images: Images = {};
  const imagesTags: TagData = {};

  const res = imageNames.map(async (imageName) => {
    const filePath = path.join(filePaths[0], imageName);
    const [image, tags] = await getFileInfo(filePath);
    images[image.path] = image;
    imagesTags[image.path] = tags;
    count += 1;
    task.update(`Loading images ${count}/${imageNames.length}`, count / imageNames.length);
  });

  await Promise.all(res);

  task.end(`Loaded ${count} images`);

  return [images, imagesTags];
}

export async function handleFilesDrop(
  mainWindow: BrowserWindow | null,
  filePaths: string[]
): Promise<[Images, TagData]> {
  if (mainWindow == null) return [{}, {}];

  const task = new Task();
  task.start(`Loading images 0/${filePaths.length}`);

  let count = 0;
  const images: Images = {};
  const imagesTags: TagData = {};
  const res = filePaths.map(async (filePath) => {
    const [image, tags] = await getFileInfo(filePath);
    images[image.path] = image;
    imagesTags[image.path] = tags;
    count += 1;
    task.update(`Loading images ${count}/${filePaths.length}`, count / filePaths.length);
  });
  await Promise.all(res);
  task.end(`Loaded ${count} images`);
  return [images, imagesTags];
}

export async function saveTags(mainWindow: BrowserWindow | null, imagesTags: SaveTagsType) {
  if (mainWindow == null || imagesTags.length === 0) return;
  const task = new Task();
  task.start(`Saving tags 0/${imagesTags.length}`);
  let count = 0;
  const saveScores = settingsStore.get('saveScores');
  const res = imagesTags.map(async (image) => {
    const tagsFilePath = path.join(
      path.dirname(image.path),
      `${path.basename(image.path, path.extname(image.path))}.txt`
    );
    try {
      const existingTagsFile = await fs.promises.readFile(tagsFilePath, 'utf-8');
      const existingTags = existingTagsFile
        .split(',')
        .map(parseTagString)
        .filter((tag) => !image.tags.some((t) => t.name === tag.name));
      image.tags = image.tags.concat(existingTags);
    } catch (error) {
      /* tags don't exist */
    }
    if (saveScores) {
      await fs.promises.writeFile(tagsFilePath, image.tags.map(tagToString).join(', '), 'utf-8');
    } else {
      await fs.promises.writeFile(
        tagsFilePath,
        image.tags.map((tag) => tag.name).join(', '),
        'utf-8'
      );
    }

    count += 1;
    task.update(`Saving Tags ${count}/${imagesTags.length}`, count / imagesTags.length);
  });
  await Promise.all(res);
  task.end(`Saved Tags`);
}
