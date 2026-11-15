// The lot box: a box of folded paper lots. Tap "Draw" → the box shakes, one lot rises, then onDrawn().
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp } from '../context/AppContext';
import { usePalette } from '../hooks/usePalette';
import { colors, fonts } from '../theme';
import { useShake } from '../hooks/useShake';

const TEXT = {
  prayer: {
    ml: 'കർത്താവേ, അങ്ങയുടെ വചനത്തിലൂടെ ഇന്ന് എന്നോട് സംസാരിക്കണമേ.',
    en: 'Lord, speak to me today through Your Word.',
  },
  draw: { ml: 'Take a Word', en: 'Take a Word' }, // same in both languages
  shake: { ml: 'or shake your phone to take a word', en: 'or shake your phone to take a word' }, // same in both languages
};

// Folded lots peeking out of the box: x offset, tilt, height
const LOTS = [
  { x: -70, r: -14, h: 74 },
  { x: -36, r: -6, h: 88 },
  { x: 0, r: 3, h: 96 },
  { x: 36, r: 9, h: 84 },
  { x: 70, r: 16, h: 70 },
];

export default function LotBox({ onDrawn }: { onDrawn: () => void }) {
  const { lang, fontSize } = useApp();
  const palette = usePalette();
  const [busy, setBusy] = useState(false);

  const shake = useSharedValue(0); // box rotation (deg)
  const rise = useSharedValue(0);  // chosen lot rising out (0 → 1)

  const boxStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${shake.value}deg` }] }));
  const chosenStyle = useAnimatedStyle(() => ({
    opacity: rise.value === 0 ? 0 : 1 - Math.max(0, rise.value - 0.7) / 0.3,
    transform: [{ translateY: -rise.value * 140 }, { scale: 1 + rise.value * 0.4 }, { rotate: `${rise.value * 360}deg` }],
  }));

  const finish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setBusy(false);
    onDrawn();
  };

  const draw = () => {
    if (busy) return;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    rise.value = 0;
    const s = (deg: number) => withTiming(deg, { duration: 90, easing: Easing.inOut(Easing.quad) });
    shake.value = withSequence(s(-8), s(8), s(-7), s(7), s(-5), s(5), s(-3), s(0));
    rise.value = withDelay(
      760,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }, done => {
        if (done) scheduleOnRN(finish);
      })
    );
  };

  // Shaking the phone draws a lot too
  useShake(draw, !busy);

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.prayer,
          { color: palette.intro, fontSize: fontSize(lang === 'ml' ? 20 : 19), lineHeight: fontSize(20) * 1.5 },
        ]}
      >
        {TEXT.prayer[lang]}
      </Text>

      <View style={styles.stage}>
        <Animated.View style={[styles.boxWrap, boxStyle]}>
          {/* Lots */}
          {LOTS.map((l, i) => (
            <View
              key={i}
              style={[styles.lot, { height: l.h, transform: [{ translateX: l.x }, { rotate: `${l.r}deg` }] }]}
            >
              <View style={styles.fold} />
            </View>
          ))}
          {/* Box */}
          <LinearGradient colors={[palette.red, palette.redDeep]} style={styles.box}>
            <View style={styles.boxRim} />
            <Text style={styles.boxCross}>✝</Text>
          </LinearGradient>
        </Animated.View>

        {/* The lot that comes out */}
        <Animated.View style={[styles.lot, styles.chosen, chosenStyle]} pointerEvents="none">
          <View style={styles.fold} />
        </Animated.View>
      </View>

      <Pressable onPress={draw} disabled={busy} style={[styles.button, busy && { opacity: 0.6 }]}>
        <Text style={[styles.buttonText, { fontFamily: fonts.enBold }]}>
          {TEXT.draw[lang]}
        </Text>
      </Pressable>
      <Text style={[styles.hint, { color: palette.intro, fontFamily: fonts.en }]}>
        {TEXT.shake[lang]}
      </Text>
    </View>
  );
}

const BOX_W = 230;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 32 },
  prayer: { fontFamily: fonts.hand, textAlign: 'center', marginBottom: 24 },
  stage: { height: 300, width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  boxWrap: { width: BOX_W, alignItems: 'center', justifyContent: 'flex-end' },
  lot: {
    position: 'absolute',
    bottom: 120,
    width: 46,
    borderRadius: 6,
    backgroundColor: '#FFF6E0',
    borderWidth: 1,
    borderColor: '#E9D7A8',
    alignItems: 'center',
  },
  fold: { width: '100%', height: 1, backgroundColor: '#E2CC93', marginTop: 18 },
  chosen: { bottom: 150, height: 90 },
  box: {
    width: BOX_W,
    height: 150,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  boxRim: { position: 'absolute', top: 0, left: 0, right: 0, height: 14, backgroundColor: 'rgba(255,219,102,0.35)' },
  boxCross: { color: colors.gold, fontSize: 44 },
  button: {
    marginTop: 36,
    backgroundColor: colors.activePill,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 44,
  },
  buttonText: { color: colors.redDark, fontSize: 18 },
  hint: { marginTop: 12, fontSize: 14, opacity: 0.8 },
});
