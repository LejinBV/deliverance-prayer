// Manna verses: built-in list → last saved list → fresh verses.json from GitHub.
// Also keeps the user's saved (hearted) verses and picks lots without quick repeats.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Image } from 'expo-image';
import { VERSES as BUILT_IN, type Verse } from '../data/verses';
import { CONTENT_URL } from './PrayersContext';

const CACHE_KEY = 'verses-cache-v1';
const SAVED_KEY = 'saved-verses-v1';
const TIMEOUT_MS = 10000;

type VersesState = {
  verses: Verse[];
  backgrounds: { uri: string }[];
  draw: () => Verse | undefined;              // pick a lot
  saved: Verse[];
  isSaved: (id: string) => boolean;
  toggleSaved: (verse: Verse) => boolean;     // returns true if now saved
};

const VersesContext = createContext<VersesState | null>(null);

const isText = (v: unknown): v is string => typeof v === 'string';
const isLangText = (v: any) => v && isText(v.ml) && isText(v.en) && (v.ml || v.en);
const toUri = (path: string) => ({ uri: CONTENT_URL + path.replace(/^\//, '') });

function parseContent(json: any) {
  if (!json || typeof json.version !== 'number' || !Array.isArray(json.verses)) return null;
  const seen = new Set<string>();
  const verses: Verse[] = [];
  for (const v of json.verses) {
    if (!v || !isText(v.id) || !v.id || seen.has(v.id) || !isLangText(v.text) || !isLangText(v.ref)) continue;
    if (v.published === false) continue;
    seen.add(v.id);
    verses.push({
      id: v.id,
      ref: { ml: v.ref.ml, en: v.ref.en },
      text: { ml: v.text.ml, en: v.text.en },
      image: isText(v.image) && v.image ? toUri(v.image) : undefined,
    });
  }
  const backgrounds = Array.isArray(json.backgrounds) ? json.backgrounds.filter(isText).map(toUri) : [];
  return verses.length ? { verses, backgrounds } : null;
}

export function VersesProvider({ children }: { children: ReactNode }) {
  const [verses, setVerses] = useState<Verse[]>(BUILT_IN);
  const [backgrounds, setBackgrounds] = useState<{ uri: string }[]>([]);
  const [saved, setSaved] = useState<Verse[]>([]);
  const recent = useRef<string[]>([]);

  // Load saved hearts + cached list, then download
  useEffect(() => {
    (async () => {
      try {
        const s = await AsyncStorage.getItem(SAVED_KEY);
        if (s) setSaved(JSON.parse(s));
      } catch {}
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        const c = raw ? JSON.parse(raw) : null;
        if (c?.verses?.length) {
          setVerses(c.verses);
          setBackgrounds(c.backgrounds ?? []);
        }
      } catch {}

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(`${CONTENT_URL}verses.json?t=${Date.now()}`, { signal: controller.signal });
        if (!res.ok) return;
        const parsed = parseContent(await res.json());
        if (!parsed) return;
        setVerses(parsed.verses);
        setBackgrounds(parsed.backgrounds);
        const urls = [...parsed.backgrounds, ...parsed.verses.map(v => v.image)]
          .filter((i): i is { uri: string } => !!i && typeof i === 'object')
          .map(i => i.uri);
        if (urls.length) Image.prefetch(urls, 'disk').catch(() => {});
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
      } catch {
      } finally {
        clearTimeout(timer);
      }
    })();
  }, []);

  // Random verse, avoiding the last few drawn
  const draw = useCallback(() => {
    if (!verses.length) return undefined;
    const keep = Math.min(5, verses.length - 1);
    const pool = verses.filter(v => !recent.current.slice(0, keep).includes(v.id));
    const pick = pool[Math.floor(Math.random() * pool.length)] ?? verses[0];
    recent.current = [pick.id, ...recent.current].slice(0, 10);
    return pick;
  }, [verses]);

  const isSaved = useCallback((id: string) => saved.some(v => v.id === id), [saved]);

  const toggleSaved = useCallback(
    (verse: Verse) => {
      const exists = saved.some(v => v.id === verse.id);
      const next = exists ? saved.filter(v => v.id !== verse.id) : [verse, ...saved];
      setSaved(next);
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next)).catch(() => {});
      return !exists;
    },
    [saved]
  );

  const value = useMemo(
    () => ({ verses, backgrounds, draw, saved, isSaved, toggleSaved }),
    [verses, backgrounds, draw, saved, isSaved, toggleSaved]
  );
  return <VersesContext.Provider value={value}>{children}</VersesContext.Provider>;
}

export function useVerses() {
  const ctx = useContext(VersesContext);
  if (!ctx) throw new Error('useVerses must be used inside VersesProvider');
  return ctx;
}
