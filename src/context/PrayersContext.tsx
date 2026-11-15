// Prayers come from GitHub (online), with the built-in list as a fallback.
//
// 1. The app starts with the last downloaded list (or the built-in one on first launch).
// 2. In the background it downloads prayers.json from GitHub Pages.
// 3. If the download is valid, it replaces the list and is saved for offline use.
//    A broken or missing file never breaks the app: the last good list stays.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Image } from 'expo-image';
import { PRAYERS as BUILT_IN, type Block, type Lang, type Prayer } from '../data/prayers';
import { useApp } from './AppContext';

export const CONTENT_URL = 'https://lejinbv.github.io/deliverance-prayer-content/';
const CACHE_KEY = 'prayers-cache-v1';
const TIMEOUT_MS = 10000;

type PrayersState = {
  prayers: Prayer[];
  getPrayer: (id: string) => Prayer | undefined;
  source: 'built-in' | 'saved' | 'online';
  refreshing: boolean;
  refresh: () => Promise<void>;
};

const PrayersContext = createContext<PrayersState | null>(null);

// ─── Checking a downloaded file ──────────────────────────────────────────
const isText = (v: unknown): v is string => typeof v === 'string';
const isLangText = (v: any) => v && isText(v.ml) && isText(v.en);

const lt = (v: any) => (isLangText(v) ? { ml: v.ml, en: v.en } : undefined);

// Read "blocks"; anything malformed is skipped rather than breaking the prayer
export function parseBlocks(raw: any): Block[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: Block[] = [];
  for (const b of raw) {
    if (!b || typeof b.type !== 'string') continue;
    if (b.type === 'text' || b.type === 'instruction' || b.type === 'heading') {
      const text = lt(b);
      if (text) out.push({ type: b.type, text });
    } else if (b.type === 'litany' && Array.isArray(b.items)) {
      const items = b.items.map(lt).filter(Boolean) as { ml: string; en: string }[];
      if (items.length) out.push({ type: 'litany', items, response: lt(b.response) });
    } else if (b.type === 'verse') {
      const text = lt(b);
      if (text) out.push({ type: 'verse', text, ref: lt(b.reference) });
    }
  }
  return out.length ? out : undefined;
}

// Plain text of the blocks (for search and the share preview)
function blocksText(blocks: Block[], lang: Lang) {
  return blocks
    .map(b => (b.type === 'litany' ? b.items.map(i => i[lang]).join('\n') : b.type === 'instruction' || b.type === 'heading' ? '' : b.text[lang]))
    .filter(Boolean)
    .join('\n\n');
}

function parseContent(json: any): { version: number; prayers: Prayer[] } | null {
  if (!json || typeof json.version !== 'number' || !Array.isArray(json.prayers)) return null;
  const seen = new Set<string>();
  const prayers: Prayer[] = [];
  for (const p of json.prayers) {
    // Skip anything incomplete instead of failing the whole file
    if (!p || !isText(p.id) || !p.id || seen.has(p.id) || !isLangText(p.title)) continue;
    if (p.published === false) continue;
    seen.add(p.id);
    const blocks = parseBlocks(p.blocks);
    prayers.push({
      id: p.id,
      title: { ml: p.title.ml, en: p.title.en },
      body: blocks
        ? { ml: blocksText(blocks, 'ml'), en: blocksText(blocks, 'en') }
        : isLangText(p.body) ? { ml: p.body.ml, en: p.body.en } : { ml: '', en: '' },
      blocks,
      image: isText(p.image) && p.image ? { uri: CONTENT_URL + p.image.replace(/^\//, '') } : undefined,
      showTitle: p.showTitle === false ? false : undefined,
      bannerFocus: isText(p.bannerFocus) ? p.bannerFocus : undefined,
      note: isLangText(p.note) ? { ml: p.note.ml, en: p.note.en } : undefined,
      verse:
        p.verse && isText(p.verse.ml) && isText(p.verse.en)
          ? {
              text: { ml: p.verse.ml, en: p.verse.en },
              ref: isLangText(p.verse.reference)
                ? { ml: p.verse.reference.ml, en: p.verse.reference.en }
                : { ml: '', en: '' },
            }
          : undefined,
    });
  }
  return prayers.length > 0 ? { version: json.version, prayers } : null;
}

// Save images to the phone so cards work offline
function prefetchImages(prayers: Prayer[]) {
  const urls = prayers
    .map(p => (p.image && typeof p.image === 'object' ? p.image.uri : null))
    .filter((u): u is string => !!u);
  if (urls.length) Image.prefetch(urls, 'disk').catch(() => {});
}

export function PrayersProvider({ children }: { children: ReactNode }) {
  const { tidyFavourites, order } = useApp();
  const [prayers, setPrayers] = useState<Prayer[]>(BUILT_IN);
  const [source, setSource] = useState<PrayersState['source']>('built-in');
  const [refreshing, setRefreshing] = useState(false);

  const download = useCallback(async () => {
    setRefreshing(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      // ?t= skips GitHub's 10-minute cache so new prayers show up quickly
      const res = await fetch(`${CONTENT_URL}prayers.json?t=${Date.now()}`, { signal: controller.signal });
      if (!res.ok) return;
      const parsed = parseContent(await res.json());
      if (!parsed) return; // broken file → keep what we have
      setPrayers(parsed.prayers);
      setSource('online');
      tidyFavourites(parsed.prayers.map(p => p.id));
      prefetchImages(parsed.prayers);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ version: parsed.version, prayers: parsed.prayers }));
    } catch {
      // Offline or timed out → keep what we have
    } finally {
      clearTimeout(timer);
      setRefreshing(false);
    }
  }, [tidyFavourites]);

  useEffect(() => {
    (async () => {
      // 1. Last saved list
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        const saved = raw ? JSON.parse(raw) : null;
        if (saved && Array.isArray(saved.prayers) && saved.prayers.length) {
          setPrayers(saved.prayers);
          setSource('saved');
        }
      } catch {}
      // 2. Fresh copy from GitHub
      download();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply the user's order; prayers they haven't placed keep the GitHub order, at the end
  const ordered = useMemo(() => {
    const rank = new Map(order.map((id, i) => [id, i]));
    return prayers
      .map((p, i) => ({ p, r: rank.has(p.id) ? (rank.get(p.id) as number) : order.length + i }))
      .sort((a, b) => a.r - b.r)
      .map(x => x.p);
  }, [prayers, order]);

  const value = useMemo<PrayersState>(
    () => ({
      prayers: ordered,
      getPrayer: (id: string) => prayers.find(p => p.id === id),
      source,
      refreshing,
      refresh: download,
    }),
    [ordered, prayers, source, refreshing, download]
  );

  return <PrayersContext.Provider value={value}>{children}</PrayersContext.Provider>;
}

export function usePrayers() {
  const ctx = useContext(PrayersContext);
  if (!ctx) throw new Error('usePrayers must be used inside PrayersProvider');
  return ctx;
}

export type { Lang };
