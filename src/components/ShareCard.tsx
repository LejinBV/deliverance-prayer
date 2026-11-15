// The image that gets shared: an exact copy of the on-screen verse card layout
// (same width, text size, margins, text at the bottom) but full-bleed 9:16 with
// no rounded corners and no buttons. Drawn off-screen and saved at 1080 × 1920.
import type { Ref } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { QuotesIcon } from 'phosphor-react-native';
import type { Verse } from '../data/verses';
import type { BgSource } from '../context/MannaBackgroundContext';
import { useApp } from '../context/AppContext';
import { fonts } from '../theme';
import { useMannaBackground } from '../context/MannaBackgroundContext';
import { cardSizes, contentPaddingFor, justifyFor, quoteAlignFor } from './cardText';

type Props = {
  verse: Verse;
  lang: 'ml' | 'en';
  background?: BgSource;
  width: number;        // same width as the card on screen
  onReady: () => void;  // background has loaded (or there is none)
  ref?: Ref<any>;
};

export default function ShareCard({ verse, lang, background, width, onReady, ref }: Props) {
  const { fontSize } = useApp();
  const { textPosition, textStep, textAlign } = useMannaBackground();
  const { size, lineHeight, refSize, quote } = cardSizes(fontSize, textStep, lang); // same as VerseCard

  return (
    // Placed far off-screen; collapsable={false} keeps it capturable on Android
    <View
      ref={ref}
      collapsable={false}
      pointerEvents="none"
      style={[styles.card, { width, height: width * (16 / 9), justifyContent: justifyFor(textPosition) }]}
    >
      {background ? (
        <Image source={background} style={StyleSheet.absoluteFill} contentFit="cover" onLoad={onReady} onError={onReady} />
      ) : (
        <LinearGradient colors={['#5A0A12', '#1E0205']} style={StyleSheet.absoluteFill} onLayout={onReady} />
      )}
      <View style={[StyleSheet.absoluteFill, styles.dim]} />

      {/* Same layout as the card in the editor */}
      <View style={contentPaddingFor(textPosition)}>
        <QuotesIcon size={quote} color="#FFFFFF" weight="fill" style={{ alignSelf: quoteAlignFor(textAlign) }} />
        <Text style={[styles.text, { fontSize: size, lineHeight, textAlign }]}>{verse.text[lang]}</Text>
        <Text style={[styles.ref, { fontSize: refSize, textAlign }]}>{verse.ref[lang]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: -10000, // off-screen
    top: 0,
    overflow: 'hidden',
    backgroundColor: '#1E0205',
    justifyContent: 'flex-end', // text at the bottom, like the editor
  },
  dim: { backgroundColor: 'rgba(0,0,0,0.45)' },
  content: { padding: 28, paddingTop: 80 }, // same margins as VerseCard
  text: { color: '#FFFFFF', fontFamily: fonts.hand, marginTop: 14 },
  ref: { color: '#FFFFFF', fontFamily: fonts.hand, marginTop: 6, opacity: 0.9 },
});
