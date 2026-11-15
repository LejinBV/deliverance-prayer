import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { DEFAULT_FAVOURITES, type Lang } from '../data/prayers';

export const MIN_FAVOURITES = 4;
const FONT_MIN = -2;
const FONT_MAX = 4;
const STORAGE_KEY = 'app-settings-v1';

// dark: null = follow the phone's setting, true/false = user's choice
type Saved = { lang: Lang; fontStep: number; favourites: string[]; dark: boolean | null; order: string[] };

type AppState = Saved & {
  ready: boolean;
  isDark: boolean;
  setDark: (on: boolean) => void;
  setLang: (l: Lang) => void;
  changeFont: (delta: 1 | -1) => void;
  fontSize: (base: number) => number;
  isFavourite: (id: string) => boolean;
  toggleFavourite: (id: string) => boolean;
  tidyFavourites: (validIds: string[]) => void;
  setOrder: (ids: string[]) => void; // the user's own prayer order (menu + Home)
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Saved>({
    lang: 'ml',
    fontStep: 0,
    favourites: DEFAULT_FAVOURITES,
    dark: null,
    order: [],
  });
  const systemDark = useColorScheme() === 'dark';
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) setState(s => ({ ...s, ...JSON.parse(raw) }));
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const setLang = (lang: Lang) => setState(s => ({ ...s, lang }));
  const isDark = state.dark ?? systemDark;
  const setDark = (on: boolean) => setState(s => ({ ...s, dark: on }));

  const changeFont = (delta: 1 | -1) =>
    setState(s => ({
      ...s,
      fontStep: Math.min(FONT_MAX, Math.max(FONT_MIN, s.fontStep + delta)),
    }));

  const fontSize = (base: number) => base + state.fontStep * 2;

  const isFavourite = (id: string) => state.favourites.includes(id);

   const toggleFavourite = (id: string) => {
    if (isFavourite(id)) {
      if (state.favourites.length <= MIN_FAVOURITES) return false;
      setState(s => ({ ...s, favourites: s.favourites.filter(f => f !== id) }));
    } else {
      setState(s => ({ ...s, favourites: [...s.favourites, id] }));
    }
    return true;
  };

  // When the prayer list changes online: drop hearts on prayers that no longer exist,
  // and top up to the minimum so Home always has enough cards.
  const tidyFavourites = useCallback((validIds: string[]) => {
    setState(s => {
      let favs = s.favourites.filter(id => validIds.includes(id));
      for (const id of [...DEFAULT_FAVOURITES, ...validIds]) {
        if (favs.length >= MIN_FAVOURITES) break;
        if (validIds.includes(id) && !favs.includes(id)) favs = [...favs, id];
      }
      const same = favs.length === s.favourites.length && favs.every((f, i) => f === s.favourites[i]);
      return same ? s : { ...s, favourites: favs };
    });
  }, []);

  const setOrder = useCallback((order: string[]) => setState(s => ({ ...s, order })), []);

  return (
    <AppContext.Provider
      value={{ ...state, ready, isDark, setDark, setLang, changeFont, fontSize, isFavourite, toggleFavourite, tidyFavourites, setOrder }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}