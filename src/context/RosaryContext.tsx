// Holy Rosary content: built-in copy → last saved copy → fresh rosary.json from GitHub.
// A broken or missing file never breaks the app: the last good copy stays.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Image } from 'expo-image';
import { ROSARY_BUILT_IN, type Decade, type LangRich, type LangText, type Mystery, type Rosary } from '../data/rosary';
import { CONTENT_URL } from './PrayersContext';

const CACHE_KEY = 'rosary-cache-v1';
const TIMEOUT_MS = 10000;

type RosaryState = {
  rosary: Rosary;
  getMystery: (id: string) => Mystery | undefined;
  imageUri: (path: string) => { uri: string };
};

const RosaryContext = createContext<RosaryState | null>(null);

// ─── Checking a downloaded file ──────────────────────────────────────────
const isText = (v: unknown): v is string => typeof v === 'string';
const isLangText = (v: any): v is LangText => !!v && isText(v.ml) && isText(v.en);
const isRich = (v: any) =>
  isText(v) || (Array.isArray(v) && v.every(s => s && isText(s.text)));
const isLangRich = (v: any): v is LangRich => !!v && isRich(v.ml) && isRich(v.en);
const emptyText: LangText = { ml: '', en: '' };

function parseDecade(d: any, i: number): Decade | null {
  if (!d || !isLangText(d.title) || !isLangText(d.reflection)) return null;
  return {
    number: typeof d.number === 'number' ? d.number : i + 1,
    ordinal: isLangText(d.ordinal) ? d.ordinal : emptyText,
    title: d.title,
    reflection: d.reflection,
    intercession: isLangText(d.intercession) ? d.intercession : emptyText,
    image: isText(d.image) ? d.image : '',
  };
}

function parseRosary(json: any): Rosary | null {
  const c = json?.common;
  if (!c || !Array.isArray(json.mysteries)) return null;
  const textOk =
    isLangText(c.introTitle) && isLangRich(c.openingPrayer) && Array.isArray(c.virtues) && c.virtues.every(isLangText) &&
    isLangText(c.ourFather) && isLangText(c.hailMary) && isLangText(c.gloryBe) &&
    isLangRich(c.fatimaPrayer) && isLangRich(c.queenOfRosary) && isLangRich(c.closing);
  if (!textOk) return null;

  const mysteries: Mystery[] = [];
  for (const m of json.mysteries) {
    if (!m || !isText(m.id) || !isLangText(m.name) || !Array.isArray(m.decades)) continue;
    const decades = m.decades.map(parseDecade).filter(Boolean) as Decade[];
    if (decades.length !== 5) continue; // a mystery must have all 5 decades
    mysteries.push({
      id: m.id,
      name: m.name,
      days: Array.isArray(m.days) ? m.days.filter(isText) : [],
      daysNote: isLangText(m.daysNote) ? m.daysNote : emptyText,
      icon: isText(m.icon) ? m.icon : '',
      introImage: isText(m.introImage) ? m.introImage : '',
      decades,
    });
  }
  return mysteries.length ? { common: c as Rosary['common'], mysteries } : null;
}

const imageUri = (path: string) => ({ uri: CONTENT_URL + path.replace(/^\//, '') });

// Save images to the phone so the rosary works offline
function prefetchImages(r: Rosary) {
  const urls = r.mysteries
    .flatMap(m => [m.icon, m.introImage, ...m.decades.map(d => d.image)])
    .filter(Boolean)
    .map(p => imageUri(p).uri);
  if (urls.length) Image.prefetch(urls, 'disk').catch(() => {});
}

export function RosaryProvider({ children }: { children: ReactNode }) {
  const [rosary, setRosary] = useState<Rosary>(ROSARY_BUILT_IN);

  useEffect(() => {
    (async () => {
      // 1. Last saved copy
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        const saved = raw ? parseRosary(JSON.parse(raw)) : null;
        if (saved) setRosary(saved);
      } catch {}

      // 2. Fresh copy from GitHub
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(`${CONTENT_URL}rosary.json?t=${Date.now()}`, { signal: controller.signal });
        if (!res.ok) return;
        const parsed = parseRosary(await res.json());
        if (!parsed) return; // broken file → keep what we have
        setRosary(parsed);
        prefetchImages(parsed);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
      } catch {
        // Offline or timed out → keep what we have
      } finally {
        clearTimeout(timer);
      }
    })();
  }, []);

  const value = useMemo<RosaryState>(
    () => ({
      rosary,
      getMystery: (id: string) => rosary.mysteries.find(m => m.id === id),
      imageUri,
    }),
    [rosary]
  );

  return <RosaryContext.Provider value={value}>{children}</RosaryContext.Provider>;
}

export function useRosary() {
  const ctx = useContext(RosaryContext);
  if (!ctx) throw new Error('useRosary must be used inside RosaryProvider');
  return ctx;
}
