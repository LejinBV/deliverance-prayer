// Intro slide header: red area with the mystery's round image and the days it is prayed.
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import ProgressBar from './ProgressBar';
import type { LangText } from '../../data/rosary';
import { useApp } from '../../context/AppContext';
import { usePalette } from '../../hooks/usePalette';
import { fonts } from '../../theme';

const CIRCLE = 230;
const HEIGHT = 342;

type Props = { image?: { uri: string }; days: string[]; daysNote: LangText; current: number };

export default function IntroHeader({ image, days, daysNote, current }: Props) {
  const { lang } = useApp();
  const palette = usePalette();
  const isMl = lang === 'ml';
  return (
    <View style={styles.wrapper}>
      <View style={[styles.red, { backgroundColor: palette.red }]}>
        <View style={styles.circle}>
          <Image source={image} style={styles.image} contentFit="cover" transition={200} />
        </View>
        {!!daysNote[lang] && (
          <Text style={[styles.note, { fontFamily: isMl ? fonts.ml : fonts.en }]}>{daysNote[lang]}</Text>
        )}
        {days.length > 0 && <Text style={[styles.days, { fontFamily: fonts.enBold }]}>({days.join(', ')})</Text>}
      </View>
      <ProgressBar current={current} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: -20, marginTop: -20, marginBottom: 16 },
  red: { height: HEIGHT, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  image: { width: '100%', height: '100%' },
  note: { fontSize: 12, lineHeight: 18, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 12 },
  days: { fontSize: 12, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 4 },
});
