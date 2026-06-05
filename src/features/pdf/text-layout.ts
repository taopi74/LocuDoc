import { Platform } from 'react-native';

import { Font } from '@/constants/theme';

export const EDITOR_FONT_SIZE = 15;
export const EDITOR_LINE_HEIGHT = 22;
export const PAGE_MARGIN = 40;

export type PageLayout = {
  contentWidth: number;
  contentHeight: number;
};

export function createTextMeasurer(fontSize = EDITOR_FONT_SIZE): (text: string) => number {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `${fontSize}px ${Font.regular}, Inter, system-ui, sans-serif`;
      return (text: string) => ctx.measureText(text).width;
    }
  }
  return (text: string) => text.length * fontSize * 0.52;
}

/** Word-wrap plain text to visual lines at a given pixel width. */
export function wrapTextToLines(
  text: string,
  measureWidth: (line: string) => number,
  maxWidth: number
): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    const words = para.split(/\s+/);
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (measureWidth(test) <= maxWidth) {
        line = test;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }

  return lines.length ? lines : [''];
}

export function maxLinesForHeight(contentHeight: number): number {
  return Math.max(1, Math.floor(contentHeight / EDITOR_LINE_HEIGHT));
}

/** Split wrapped lines into page-sized text chunks. */
export function linesToPages(lines: string[], maxLines: number): string[] {
  if (!lines.length) return [''];
  const pages: string[] = [];
  for (let i = 0; i < lines.length; i += maxLines) {
    pages.push(lines.slice(i, i + maxLines).join('\n'));
  }
  return pages.length ? pages : [''];
}

/** Paginate a continuous document string into fixed-height editor pages. */
export function paginateDocument(text: string, layout: PageLayout): string[] {
  if (layout.contentWidth <= 0 || layout.contentHeight <= 0) return text ? [text] : [''];
  const measure = createTextMeasurer();
  const lines = wrapTextToLines(text, measure, layout.contentWidth);
  const maxLines = maxLinesForHeight(layout.contentHeight);
  return linesToPages(lines, maxLines);
}

/** Rebuild pages after the user edits one page — overflow flows forward automatically. */
export function reflowAfterPageEdit(
  pages: string[],
  pageIndex: number,
  newPageText: string,
  layout: PageLayout
): { pages: string[]; nextPage: number } {
  const merged = pages.slice(0, pageIndex).join('') + newPageText + pages.slice(pageIndex + 1).join('');
  const reflowed = paginateDocument(merged, layout);
  const prevLen = pages[pageIndex]?.length ?? 0;
  const grew = newPageText.length > prevLen;
  const split = reflowed[pageIndex] !== newPageText;

  let nextPage = pageIndex;
  if (grew && split && pageIndex < reflowed.length - 1) {
    nextPage = pageIndex + 1;
  } else if (pageIndex >= reflowed.length) {
    nextPage = Math.max(0, reflowed.length - 1);
  }

  return { pages: reflowed, nextPage };
}
