// Book Now items and About the App, both editable on GitHub (bookings.json, about.json).
// Built-in copy → last saved copy → fresh copy from GitHub. A broken file is ignored.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { BOOKINGS, BOOKING_ICONS, SHOW_BOOK_TAB_DEFAULT, type Booking, type BookingIcon } from '../data/bookings';
import type { Block } from '../data/prayers';
import { CONTENT_URL, parseBlocks } from './PrayersContext';

const TIMEOUT_MS = 10000;

type Bookings = { showTab: boolean; items: Booking[] };
type About = { image?: { uri: string }; blocks: Block[] };

type ExtrasState = { bookings: Bookings; about: About };

const ExtrasContext = createContext<ExtrasState | null>(null);

const isText = (v: unknown): v is string => typeof v === 'string';

function parseBookings(json: any): Bookings | null {
  if (!json || !Array.isArray(json.items)) return null;
  const seen = new Set<string>();
  const items: Booking[] = [];
  for (const b of json.items) {
    if (!b || !isText(b.id) || !b.id || seen.has(b.id) || !isText(b.title) || !b.title) continue;
    if (b.published === false) continue;
    seen.add(b.id);
    const icon: BookingIcon = BOOKING_ICONS.includes(b.icon) ? b.icon : 'link';
    items.push({ id: b.id, title: b.title, icon, url: isText(b.url) ? b.url.trim() : '' });
  }
  return { showTab: json.showTab === true, items };
}

function parseAbout(json: any): About | null {
  if (!json || typeof json !== 'object') return null;
  return {
    image: isText(json.image) && json.image ? { uri: CONTENT_URL + json.image.replace(/^\//, '') } : undefined,
    blocks: parseBlocks(json.blocks) ?? [],
  };
}

// Download one JSON file from GitHub; returns null if offline
async function download(file: string): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${CONTENT_URL}${file}?t=${Date.now()}`, { signal: controller.signal });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Saved copy first, then a fresh one from GitHub. The file is saved as downloaded,
// so the saved copy and the fresh copy go through the same checks.
function useRemote<T>(file: string, cacheKey: string, parse: (j: any) => T | null, builtIn: T) {
  const [value, setValue] = useState<T>(builtIn);
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(cacheKey);
        const saved = raw ? parse(JSON.parse(raw)) : null;
        if (saved) setValue(saved);
      } catch {}
      const json = await download(file);
      const fresh = json ? parse(json) : null;
      if (fresh) {
        setValue(fresh);
        AsyncStorage.setItem(cacheKey, JSON.stringify(json)).catch(() => {});
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

export function ExtrasProvider({ children }: { children: ReactNode }) {
  const bookings = useRemote('bookings.json', 'bookings-cache-v1', parseBookings, {
    showTab: SHOW_BOOK_TAB_DEFAULT,
    items: BOOKINGS,
  });
  const about = useRemote('about.json', 'about-cache-v1', parseAbout, { blocks: [] });

  const value = useMemo(() => ({ bookings, about }), [bookings, about]);
  return <ExtrasContext.Provider value={value}>{children}</ExtrasContext.Provider>;
}

export function useExtras() {
  const ctx = useContext(ExtrasContext);
  if (!ctx) throw new Error('useExtras must be used inside ExtrasProvider');
  return ctx;
}
