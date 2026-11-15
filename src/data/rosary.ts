// Holy Rosary content: types + the built-in copy (used until rosary.json downloads).
// The live content is rosary.json in the deliverance-prayer-content GitHub repo.
import BUILT_IN_JSON from './rosary.json';

export type LangText = { ml: string; en: string };

// A piece of styled text (same as Kontha's RichText)
export type Segment = { text: string; bold?: boolean; subtitle?: boolean; highlight?: boolean };
export type Rich = string | Segment[];
export type LangRich = { ml: Rich; en: Rich };

export type Decade = {
  number: number;
  ordinal: LangText;
  title: LangText;
  reflection: LangText;
  intercession: LangText; // empty until filled in on GitHub → section hidden
  image: string;          // path in the content repo, e.g. images/rosary/joyful-decade-1.jpg
};

export type Mystery = {
  id: string; // joyful | sorrowful | glorious | luminous
  name: LangText;
  days: string[]; // 'Mon', 'Tue', …
  daysNote: LangText;
  icon: string;
  introImage: string;
  decades: Decade[];
};

export type RosaryCommon = {
  introTitle: LangText;
  openingPrayer: LangRich;
  virtues: LangText[]; // faith, hope, charity
  ourFather: LangText;
  hailMary: LangText;
  gloryBe: LangText;
  fatimaPrayer: LangRich;
  queenOfRosary: LangRich;
  closing: LangRich;
};

export type Rosary = { common: RosaryCommon; mysteries: Mystery[] };

export const ROSARY_BUILT_IN = BUILT_IN_JSON as Rosary;

// Bead order for one decade (labels stay as in Kontha)
export type BeadKind = 'ourFather' | 'hailMary' | 'gloryBe';
export const BEAD_SEQUENCE: { kind: BeadKind; label: LangText }[] = [
  { kind: 'ourFather', label: { ml: '1 സ്വ', en: '1 OF' } },
  ...Array.from({ length: 10 }, (_, i) => ({
    kind: 'hailMary' as const,
    label: { ml: `${i + 1} നന്മ`, en: `${i + 1} HM` },
  })),
  { kind: 'gloryBe', label: { ml: '1 ത്രി', en: '1 GB' } },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Today's mystery (highlighted on the landing page)
export function todaysMysteryId(mysteries: Mystery[], date = new Date()) {
  const day = WEEKDAYS[date.getDay()];
  return mysteries.find(m => m.days.includes(day))?.id;
}
