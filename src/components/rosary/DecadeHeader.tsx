// Decade slide header: the mystery picture slowly zooming, number circle + title on top.
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import ProgressBar from './ProgressBar';
import type { LangText } from '../../data/rosary';
import { useApp } from '../../context/AppContext';
import { usePalette } from '../../hooks/usePalette';
import { fonts } from '../../theme';

const HEIGHT = 255;

type Props = {
  number: number;
  ordinal: LangText;
  title: LangText;
  image?: { uri: string };
  current: number;
  isCurrentPage: boolean;
};

export default function DecadeHeader({ number, ordinal, title, image, current, isCurrentPage }: Props) {
  const { lang, fontSize } = useApp();
  const palette = usePalette();
  const { width: W } = useWindowDimensions();
  const isMl = lang === 'ml';
  const scale = useRef(new Animated.Value(1)).current;

  // Slow zoom while this decade is on screen; reset when leaving
  useEffect(() => {
    scale.stopAnimation();
    scale.setValue(1);
    if (isCurrentPage) {
      Animated.timing(scale, { toValue: 1.15, duration: 8000, useNativeDriver: true }).start();
    }
  }, [isCurrentPage, scale]);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.banner, { width: W, backgroundColor: palette.red }]}>
        <Animated.View style={{ width: W, height: HEIGHT, transform: [{ scale }] }}>
          <Image source={image} style={{ width: W, height: HEIGHT }} contentFit="cover" transition={200} />
        </Animated.View>
        <View style={styles.overlay}>
          <View style={styles.numberCircle}>
            <Text style={[styles.number, { color: palette.red, fontSize: fontSize(22) }]}>{number}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.ordinal, { fontFamily: isMl ? fonts.ml : fonts.en, fontSize: fontSize(13) }]}>
              {ordinal[lang]}
            </Text>
            <Text
              style={[
                styles.title,
                { fontFamily: isMl ? fonts.mlBold : fonts.enBold, fontSize: fontSize(20), lineHeight: fontSize(20) * 1.3 },
              ]}
            >
              {title[lang]}
            </Text>
          </View>
        </View>
      </View>
      <ProgressBar current={current} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: -20, marginTop: -20, marginBottom: 8 },
  banner: { height: HEIGHT, overflow: 'hidden' },
  overlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { fontFamily: fonts.enBold },
  ordinal: { color: 'rgba(255,255,255,0.85)', marginBottom: 2 },
  title: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    paddingRight: 16,
  },
});
