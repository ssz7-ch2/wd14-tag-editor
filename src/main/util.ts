import path from 'path';
import { URL } from 'url';

export function resolveHtmlPath(htmlFileName: string, view = '') {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    url.search = view;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}?${view}`;
}

export const isValidImage = (filePath: string) =>
  filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg');
