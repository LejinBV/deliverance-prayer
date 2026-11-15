// Text layout shared by the on-screen verse card and the shared image, so they always match.
import type { TextAlign, TextPosition } from '../context/MannaBackgroundContext';

export const justifyFor = (p: TextPosition) =>
  p === 'top' ? 'flex-start' : p === 'center' ? 'center' : 'flex-end';

// Top position leaves room for the edit button
export const contentPaddingFor = (p: TextPosition) =>
  p === 'top' ? { padding: 28, paddingTop: 72 } : p === 'center' ? { padding: 28 } : { padding: 28, paddingTop: 80 };

// Card text size: the app's font size setting + the card's own size step
export const cardSizes = (fontSize: (b: number) => number, step: number, lang: 'ml' | 'en') => {
  const size = fontSize(22 + step * 2);
  return {
    size,
    lineHeight: size * (lang === 'ml' ? 1.45 : 1.35),
    refSize: fontSize(18 + step),
    quote: 56 + step * 4,
  };
};

// Horizontal alignment: the quote mark follows the text
export const quoteAlignFor = (a: TextAlign) =>
  a === 'center' ? 'center' : a === 'right' ? 'flex-end' : 'flex-start';
