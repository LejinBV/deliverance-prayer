// The prayer card on each decade slide, following the bead button (same as Kontha):
//   Our Father → Hail Mary with count → Glory Be + Fatima Prayer → Queen of the Holy Rosary.
// It flashes softly on every tap.
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import RichText from './RichText';
import { ARROW_INDEX } from './BeadButton';
import { BEAD_SEQUENCE, type BeadKind, type RosaryCommon } from '../../data/rosary';
import { useApp } from '../../context/AppContext';
import { usePalette } from '../../hooks/usePalette';
import { fonts } from '../../theme';

const TITLES: Record<BeadKind | 'fatima' | 'queen', { ml: string; en: string }> = {
  ourFather: { ml: 'സ്വർഗ്ഗസ്ഥനായ ഞങ്ങളുടെ പിതാവേ...', en: 'Our Father...' },
  hailMary: { ml: 'കൃപ നിറഞ്ഞ മറിയമേ...', en: 'Hail Mary...' },
  gloryBe: { ml: 'പിതാവിനും പുത്രനും...', en: 'Glory Be...' },
  fatima: { ml: 'ഫാത്തിമ ജപം', en: 'Fatima Prayer' },
  queen: { ml: 'പരിശുദ്ധ ജപമാലയുടെ രാജ്ഞി', en: 'Queen of the Holy Rosary' },
};

type Props = { common: RosaryCommon; beadIndex: number; flash: number };

export default function PrayerCard({ common, beadIndex, flash }: Props) {
  const { lang, fontSize, isDark } = useApp();
  const palette = usePalette();
  const isMl = lang === 'ml';
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: false }),
      Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start();
  }, [flash, anim]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.card, isDark ? '#4A1F24' : '#FFE4E4'],
  });

  const titleStyle = [styles.title, { color: palette.text, fontFamily: isMl ? fonts.mlBold : fonts.enBold, fontSize: fontSize(16) }];
  const textStyle = [
    styles.text,
    { color: palette.intro, fontFamily: isMl ? fonts.ml : fonts.en, fontSize: fontSize(15), lineHeight: fontSize(15) * 1.6 },
  ];
  const cardStyle = [styles.card, { backgroundColor, borderLeftColor: palette.red }];

  if (beadIndex >= ARROW_INDEX) {
    return (
      <Animated.View style={cardStyle}>
        <Text style={titleStyle}>{TITLES.queen[lang]}</Text>
        <RichText content={common.queenOfRosary[lang]} style={textStyle} />
      </Animated.View>
    );
  }

  const kind = BEAD_SEQUENCE[beadIndex].kind;
  const text = common[kind][lang];

  return (
    <Animated.View style={cardStyle}>
      <View style={styles.titleRow}>
        {kind === 'hailMary' && (
          <View style={[styles.count, { backgroundColor: palette.text }]}>
            <Text style={[styles.countText, { color: palette.background }]}>{beadIndex}</Text>
          </View>
        )}
        <Text style={[titleStyle, { flex: 1, marginBottom: 0 }]}>{TITLES[kind][lang]}</Text>
      </View>
      <Text style={textStyle}>{text}</Text>

      {kind === 'gloryBe' && (
        <>
          <View style={[styles.divider, { backgroundColor: palette.dot }]} />
          <Text style={titleStyle}>{TITLES.fatima[lang]}</Text>
          <RichText content={common.fatimaPrayer[lang]} style={[textStyle, { color: palette.red }]} />
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, borderLeftWidth: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  title: { marginBottom: 6 },
  count: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  countText: { fontSize: 13, fontFamily: fonts.enBold },
  text: { marginBottom: 4 },
  divider: { height: 1, marginVertical: 12 },
});
