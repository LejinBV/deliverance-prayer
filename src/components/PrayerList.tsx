import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Heart } from 'phosphor-react-native';
import { router } from 'expo-router';
import { usePrayers } from '../context/PrayersContext';
import ReorderablePrayers from './ReorderablePrayers';
import { useApp, MIN_FAVOURITES } from '../context/AppContext';
import { colors, fonts } from '../theme';

// Line spacing of the prayer titles (1 = tight, 1.6 = loose)
const LINE_HEIGHT = 1.25;

const MIN_MESSAGE = {
  ml: `Keep at least ${MIN_FAVOURITES} prayers on Home`,
  en: `Keep at least ${MIN_FAVOURITES} prayers on Home`,
};

export default function PrayerList({
  onSelect,
  reorder = false,
  onDragChange,
  query = '',
}: {
  onSelect?: (id: string) => void;
  reorder?: boolean;
  onDragChange?: (dragging: boolean) => void;
  query?: string; // search text: filters by title or prayer text, in both languages
}) {
  const { lang, fontSize, isFavourite, toggleFavourite } = useApp();
  const { prayers: ALL } = usePrayers();

  // Search: match the title or the prayer text, in Malayalam or English
  const q = query.trim().toLowerCase();
  const PRAYERS = q
    ? ALL.filter(p =>
        [p.title.ml, p.title.en, p.body.ml, p.body.en].some(t => t.toLowerCase().includes(q))
      )
    : ALL;
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onHeart = (id: string) => {
    const ok = toggleFavourite(id);
    if (!ok) {
      setMessage(MIN_MESSAGE[lang]);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(null), 2500);
    }
  };

  const titleFont = lang === 'ml' ? fonts.ml : fonts.en;


  // Reorder mode: drag by the grip
  if (reorder) return <ReorderablePrayers prayers={ALL} onDragChange={onDragChange} />;

  if (q && PRAYERS.length === 0) {
    return <Text style={styles.noResults}>No prayers found</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {PRAYERS.map((p, i) => {
        const fav = isFavourite(p.id);
        return (
          <View key={p.id} style={[styles.row, i < PRAYERS.length - 1 && styles.divider]}>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => (onSelect ? onSelect(p.id) : router.push(`/prayer/${p.id}`))}
            >
              <Text style={[styles.title, { fontFamily: titleFont, fontSize: fontSize(17), lineHeight: fontSize(17) * LINE_HEIGHT }]}>
                {p.title[lang]}
              </Text>
            </Pressable>
            <Pressable onPress={() => onHeart(p.id)} hitSlop={12} style={styles.heart}>
              <Heart size={24} color={colors.gold} weight={fav ? 'fill' : 'regular'} />
            </Pressable>
          </View>
        );
      })}

      {message && (
        <View style={styles.snack}>
          <Text style={styles.snackText}>{message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start', // heart sits at the top, beside the first line
    paddingVertical: 10,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 219, 102, 0.3)', // gold at 30%
  },
  title: { color: colors.gold },
  heart: { marginLeft: 16 },
  noResults: { color: colors.gold, opacity: 0.8, fontFamily: fonts.en, fontSize: 15, paddingVertical: 16 },
  snack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    backgroundColor: colors.gold,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  snackText: { color: colors.redDark, fontFamily: fonts.enBold, textAlign: 'center' },
});