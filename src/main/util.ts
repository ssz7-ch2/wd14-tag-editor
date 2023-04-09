import path from 'path';
import { URL } from 'url';
import { TagType } from '../../types/types';

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

export const tagToString = (tag: TagType) =>
  `(${tag.name.replace(/(\(|\))/g, '\\$1')}:${tag.score.toFixed(2)})`;

// from https://github.com/AUTOMATIC1111/stable-diffusion-webui/blob/master/modules/prompt_parser.py
const re_attention = RegExp(
  /\\\(|\\\)|\\\[|\\]|\\\\|\\|\(|\[|:([+-]?[.\d]+)\)|\)|]|[^\\()\[\]:]+|:/g
);

export const parseTagString = (tagString: string): TagType => {
  tagString = tagString.trim();

  let roundBrackets = 0;
  let squareBrackets = 0;

  const roundBracketMultiplier = 1.1;
  const squareBracketMultiplier = 1 / 1.1;

  let tagName = '';
  let tagScore = 1.0;

  function multiplyRange(multiplier: number) {
    tagScore *= multiplier;
  }

  let match;
  while ((match = re_attention.exec(tagString)) !== null) {
    const token = match[0];
    const weight = match[1];

    if (token.startsWith('\\')) {
      tagName += token.slice(1);
    } else if (token === '(') {
      roundBrackets += 1;
    } else if (token === '[') {
      squareBrackets += 1;
    } else if (weight !== undefined && roundBrackets > 0) {
      tagScore *= parseFloat(weight);
      roundBrackets -= 1;
    } else if (token === ')' && roundBrackets > 0) {
      tagScore *= roundBracketMultiplier;
      roundBrackets -= 1;
    } else if (token === ']' && squareBrackets > 0) {
      tagScore *= squareBracketMultiplier;
      squareBrackets -= 1;
    } else {
      tagName += token;
    }
  }

  for (let i = 0; i < roundBrackets; i++) {
    multiplyRange(roundBracketMultiplier);
  }

  for (let i = 0; i < squareBrackets; i++) {
    multiplyRange(squareBracketMultiplier);
  }

  return {
    name: tagName,
    score: tagScore,
  };
};
