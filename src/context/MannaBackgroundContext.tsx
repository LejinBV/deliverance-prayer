// The background for the Manna verse card. It is NOT saved: every new verse starts on Auto
// (a random built-in photo), and an uploaded photo is only used for the current verse.
//   auto   → the verse's own image, or one of the online backgrounds (default)
//   preset → one of the built-in / online images
//   custom → a photo the user picked from their gallery (for this verse only)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { BUILT_IN_BACKGROUNDS } from '../data/mannaBackgrounds';
import { useVerses } from './VersesContext';

const STYLE_KEY = 'manna-card-style-v1';

export type TextPosition = 'top' | 'center' | 'bottom';
export type TextAlign = 'left' | 'center' | 'right';
export const TEXT_STEP_MIN = -3;
export const TEXT_STEP_MAX = 5;

export type BgSource = number | { uri: string };
export type BgOption = { id: string; source?: BgSource }; // no source = Auto
type Choice = { kind: 'auto' } | { kind: 'preset'; id: string } | { kind: 'custom'; uri: string };

type State = {
  options: BgOption[];          // Auto + built-in + online backgrounds
  choice: Choice;
  selectedId: string;           // 'auto' | preset id | 'custom'
  customUri?: string;
  choose: (id: string) => void;
  pickOwn: () => Promise<boolean>; // opens the gallery; true if a photo was chosen
  sourceFor: (fallback?: BgSource) => BgSource | undefined;
  resetBackground: () => void;      // back to Auto, forget any uploaded photo
  textPosition: TextPosition;
  setTextPosition: (p: TextPosition) => void;
  textStep: number;                 // card text size: 0 = normal
  changeTextStep: (d: 1 | -1) => void;
  textAlign: TextAlign;
  setTextAlign: (a: TextAlign) => void;
};

const Ctx = createContext<State | null>(null);

export function MannaBackgroundProvider({ children }: { children: ReactNode }) {
  const { backgrounds } = useVerses();
  const [choice, setChoice] = useState<Choice>({ kind: 'auto' });
  const [cardStyle, setCardStyle] = useState<{ textPosition: TextPosition; textStep: number; textAlign: TextAlign }>({
    textPosition: 'bottom',
    textStep: 0,
    textAlign: 'left',
  });

  useEffect(() => {
    AsyncStorage.getItem(STYLE_KEY)
      .then(raw => raw && setCardStyle(s => ({ ...s, ...JSON.parse(raw) })))
      .catch(() => {});
  }, []);

  const saveStyle = (next: typeof cardStyle) => {
    setCardStyle(next);
    AsyncStorage.setItem(STYLE_KEY, JSON.stringify(next)).catch(() => {});
  };
  const setTextPosition = (textPosition: TextPosition) => saveStyle({ ...cardStyle, textPosition });
  const setTextAlign = (textAlign: TextAlign) => saveStyle({ ...cardStyle, textAlign });
  const changeTextStep = (d: 1 | -1) =>
    saveStyle({
      ...cardStyle,
      textStep: Math.min(TEXT_STEP_MAX, Math.max(TEXT_STEP_MIN, cardStyle.textStep + d)),
    });

  const save = (c: Choice) => setChoice(c); // kept in memory only

  const options = useMemo<BgOption[]>(
    () => [
      { id: 'auto' },
      ...BUILT_IN_BACKGROUNDS,
      ...backgrounds.map(b => ({ id: b.uri, source: b })),
    ],
    [backgrounds]
  );

  const choose = useCallback((id: string) => {
    if (id === 'auto') save({ kind: 'auto' });
    else if (id === 'custom') {
      if (choice.kind === 'custom') save(choice);
    } else save({ kind: 'preset', id });
  }, [choice]);

  const pickOwn = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return false;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,   // lets the user crop
      aspect: [9, 16],       // same shape as the card
      quality: 0.85,
    });
    if (res.canceled || !res.assets?.[0]) return false;

    save({ kind: 'custom', uri: res.assets[0].uri }); // temporary, for this verse only
    return true;
  }, [choice]);

  const sourceFor = useCallback(
    (fallback?: BgSource): BgSource | undefined => {
      if (choice.kind === 'custom') return { uri: choice.uri };
      if (choice.kind === 'preset') return options.find(o => o.id === choice.id)?.source ?? fallback;
      return fallback;
    },
    [choice, options]
  );

  const value: State = {
    options,
    choice,
    selectedId: choice.kind === 'auto' ? 'auto' : choice.kind === 'custom' ? 'custom' : choice.id,
    customUri: choice.kind === 'custom' ? choice.uri : undefined,
    choose,
    pickOwn,
    sourceFor,
    resetBackground: () => setChoice({ kind: 'auto' }),
    textPosition: cardStyle.textPosition,
    setTextPosition,
    textStep: cardStyle.textStep,
    changeTextStep,
    textAlign: cardStyle.textAlign,
    setTextAlign,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMannaBackground() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMannaBackground must be used inside MannaBackgroundProvider');
  return ctx;
}
