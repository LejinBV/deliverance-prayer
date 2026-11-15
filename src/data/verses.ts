// Built-in verses: shown on first launch / offline until verses.json is downloaded from GitHub.
// Malayalam: POC Bible. English: Catholic-approved translation (to be confirmed).
import type { Lang } from './prayers';

export type Verse = {
  id: string;
  ref: Record<Lang, string>;   // e.g. { ml: 'സുഭാഷിതങ്ങൾ 16:3', en: 'Proverbs 16:3' }
  text: Record<Lang, string>;
  image?: number | { uri: string }; // optional background just for this verse
};

// TEST VERSE from the Manna design — replace with POC / approved English text.
export const VERSES: Verse[] = [
  {
    id: 'proverbs-16-3',
    ref: { ml: 'സുഭാഷിതങ്ങൾ 16:3', en: 'Proverbs 16:3' },
    text: {
      ml: 'നിന്റെ പ്രയത്നം കർത്താവിൽ അർപ്പിക്കുക; നിന്റെ പദ്ധതികൾ ഫലമണിയും.',
      en: 'Commit your work to the LORD, and your plans will be established.',
    },
  },
];
