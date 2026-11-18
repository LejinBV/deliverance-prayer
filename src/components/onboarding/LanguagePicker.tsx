// First launch: choose the language for prayers and content (same idea as Kontha).
// All on-screen labels stay in English; the language names show in their own script.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useApp } from '../../context/AppContext';
import type { Lang } from '../../data/prayers';
import { colors, fonts, palettes } from '../../theme';

const MEDAL = require('../../../assets/images/splash-icon.png');

const OPTIONS: { key: Lang; label: string; font: string }[] = [
  { key: 'ml', label: 'മലയാളം', font: fonts.mlBold },
  { key: 'en', label: 'English', font: fonts.enBold },
];

export default function LanguagePicker() {
  const { chooseLanguage } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[palettes.light.red, palettes.light.redDeep]}
      style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}
    >
      <View style={styles.top}>
        <Image source={MEDAL} style={styles.medal} contentFit="contain" />
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Choose the language for your prayers</Text>
      </View>

      <View style={styles.options}>
        {OPTIONS.map(o => (
          <Pressable
            key={o.key}
            onPress={() => chooseLanguage(o.key)}
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
          >
            <Text style={[styles.optionLabel, { fontFamily: o.font }]}>{o.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.hint}>You can change this anytime in Settings</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  top: { alignItems: 'center', marginTop: 48 },
  medal: { width: 150, height: 150, marginBottom: 28 },
  title: { fontFamily: fonts.enBold, fontSize: 28, color: colors.white, marginBottom: 8 },
  subtitle: { fontFamily: fonts.en, fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  options: { gap: 14 },
  option: {
    backgroundColor: colors.gold,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  optionPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  optionLabel: { fontSize: 20, color: colors.redDark },
  hint: { fontFamily: fonts.en, fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
});
