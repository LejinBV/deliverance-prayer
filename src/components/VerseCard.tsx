// The Manna verse card: background photo, quote mark, verse in Malayalam (POC) and English.
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PencilSimpleIcon, QuotesIcon } from 'phosphor-react-native';
import type { Verse } from '../data/verses';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme';
import { useMannaBackground } from '../context/MannaBackgroundContext';
import { cardSizes, contentPaddingFor, justifyFor, quoteAlignFor } from './cardText';

type Props = {
  verse: Verse;
  background?: { uri: string } | number;
  width: number;
  onEdit?: () => void; // shows the edit (background) button
};

export default function VerseCard({ verse, background, width, onEdit }: Props) {
  const { fontSize, lang } = useApp();
  const { textPosition, textStep, textAlign } = useMannaBackground();
  const { size, lineHeight, refSize, quote } = cardSizes(fontSize, textStep, lang);

  // Card turns in like a lot being unfolded
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = 0;
    t.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [verse.id]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [
      { perspective: 1200 },
      { rotateX: `${(1 - t.value) * 70}deg` },
      { scale: 0.85 + t.value * 0.15 },
    ],
  }));

  const image = background; // chosen by the Manna screen (user's choice, verse image or rotating)

  return (
    <Animated.View style={[styles.card, { width, minHeight: width * (16 / 9), justifyContent: justifyFor(textPosition) }, style]}>
      {/* Background */}
      {image ? (
        <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
      ) : (
        <LinearGradient colors={['#5A0A12', '#1E0205']} style={StyleSheet.absoluteFill} />
      )}
      <View style={[StyleSheet.absoluteFill, styles.dim]} />

      {/* Text */}
      <View style={contentPaddingFor(textPosition)}>
        <QuotesIcon size={quote} color="#FFFFFF" weight="fill" style={{ alignSelf: quoteAlignFor(textAlign) }} />

        {/* Only the language chosen in Settings */}
        <Text style={[styles.text, { fontSize: size, lineHeight, textAlign }]}>{verse.text[lang]}</Text>
        <Text style={[styles.ref, { fontSize: refSize, textAlign }]}>{verse.ref[lang]}</Text>
      </View>

      <View style={styles.border} pointerEvents="none" />

      {/* Edit background */}
      {onEdit && (
        <Pressable onPress={onEdit} style={styles.edit} hitSlop={8}>
          <PencilSimpleIcon size={20} color={colors.redDark} weight="bold" />
        </Pressable>
      )}
    </Animated.View>
  );
}

const RADIUS = 36;

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: '#1E0205',
    justifyContent: 'flex-end',
  },
  dim: { backgroundColor: 'rgba(0,0,0,0.45)' },
  edit: {
    position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.activePill, alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: 28, paddingTop: 80 },
  text: { color: '#FFFFFF', fontFamily: fonts.hand, marginTop: 14 },
  ref: { color: '#FFFFFF', fontFamily: fonts.hand, marginTop: 6, opacity: 0.9 },
  border: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 102, 0.6)',
  },
});
