import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Minus, Plus, ArrowRight, Moon } from 'phosphor-react-native';
import { useApp } from '../context/AppContext';
import type { Lang } from '../data/prayers';
import { colors, fonts } from '../theme';
import { usePalette } from '../hooks/usePalette';

const LANGS: { key: Lang; label: string }[] = [
  { key: 'ml', label: 'Malayalam' },
  { key: 'en', label: 'English' },
];

type Props = {
  compact?: boolean;    // smaller version for the 285px drawer
  onAbout?: () => void; // custom action for "About the App"
  show?: 'settings' | 'about' | 'all'; // which rows to show (default: all)
};

export default function SettingsPanel({ compact = false, onAbout, show = 'all' }: Props) {
  const { lang, setLang, fontStep, changeFont, isDark, setDark } = useApp();
  const s = compact ? small : regular;
  const muted = { backgroundColor: usePalette().redMuted };
  const iconSize = compact ? 22 : 26;

  return (
    <View style={s.wrap}>
      {show !== 'about' && (
      <>
      {/* Language */}
      <View style={s.langRow}>
        {LANGS.map(l => {
          const active = lang === l.key;
          return (
            <Pressable
              key={l.key}
              onPress={() => setLang(l.key)}
              style={[s.langPill, muted, active && s.langPillActive]}
            >
              <Text style={[s.langText, active && s.langTextActive]}>{l.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Font size */}
      <View style={[s.row, muted]}>
        <Text style={s.rowLabel}>Font Size</Text>
        <View style={s.stepper}>
          <Pressable onPress={() => changeFont(-1)} hitSlop={10}>
            <Minus size={iconSize} color={colors.gold} />
          </Pressable>
          <Text style={s.stepValue}>{fontStep}</Text>
          <Pressable onPress={() => changeFont(1)} hitSlop={10}>
            <Plus size={iconSize} color={colors.gold} />
          </Pressable>
        </View>
      </View>

      {/* Dark mode */}
      <Pressable style={[s.row, muted]} onPress={() => setDark(!isDark)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Moon size={iconSize - 4} color={colors.gold} weight={isDark ? 'fill' : 'regular'} />
          <Text style={s.rowLabel}>Dark Mode</Text>
        </View>
        <View style={[s.track, isDark && s.trackOn]}>
          <View style={[s.knob, isDark && s.knobOn]} />
        </View>
      </Pressable>

      </>
      )}

      {/* About */}
      {show !== 'settings' && (
      <Pressable style={[s.row, muted]} onPress={onAbout ?? (() => router.push('/about'))}>
        <Text style={s.rowLabel}>About the App</Text>
        <ArrowRight size={iconSize} color={colors.gold} />
      </Pressable>
      )}
    </View>
  );
}

const regular = StyleSheet.create({
  wrap: { gap: 14 },
  langRow: { flexDirection: 'row', gap: 12 },
  langPill: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30, backgroundColor: colors.redMuted, overflow: 'hidden' },
  langPillActive: { backgroundColor: colors.gold, paddingHorizontal: 40 },
  langText: { fontFamily: fonts.enBold, fontSize: 16, color: colors.gold },
  langTextActive: { color: colors.redDark },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.redMuted,
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  rowLabel: { fontFamily: fonts.enBold, fontSize: 16, color: colors.gold },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  stepValue: { fontFamily: fonts.en, fontSize: 16, color: colors.white, minWidth: 18, textAlign: 'center' },
  ...switchStyles(48, 28),
});

const small = StyleSheet.create({
  wrap: { gap: 10 },
  langRow: { flexDirection: 'row', gap: 8 },
  langPill: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 24, backgroundColor: colors.redMuted, overflow: 'hidden' },
  langPillActive: { backgroundColor: colors.gold },
  langText: { fontFamily: fonts.enBold, fontSize: 14, color: colors.gold },
  langTextActive: { color: colors.redDark },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.redMuted,
    borderRadius: 24,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  rowLabel: { fontFamily: fonts.enBold, fontSize: 14, color: colors.gold },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepValue: { fontFamily: fonts.en, fontSize: 14, color: colors.white, minWidth: 14, textAlign: 'center' },
  ...switchStyles(42, 24),
});

// On/off switch: gold track with a dark red knob when on
function switchStyles(w: number, h: number) {
  const k = h - 6;
  return {
    track: {
      width: w,
      height: h,
      borderRadius: h / 2,
      padding: 3,
      backgroundColor: 'rgba(255, 219, 102, 0.25)',
      justifyContent: 'center' as const,
    },
    trackOn: { backgroundColor: colors.gold },
    knob: { width: k, height: k, borderRadius: k / 2, backgroundColor: colors.gold },
    knobOn: { backgroundColor: colors.redDark, transform: [{ translateX: w - k - 6 }] },
  };
}
