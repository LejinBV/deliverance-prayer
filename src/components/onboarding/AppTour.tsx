// App tour: shown once, right after the first-launch language choice.
// It can be played again from Settings → App Tour. Labels stay in English.
import { useRef, useState, type ReactNode } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { FadersIcon, HandsPrayingIcon, Heart, ListIcon, Quotes } from 'phosphor-react-native';
import { useApp } from '../../context/AppContext';
import { colors, fonts, palettes } from '../../theme';

const MEDAL = require('../../../assets/images/splash-icon.png');
const ICON = 56;

type Slide = { key: string; art: ReactNode; title: string; text: string };

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    art: <Image source={MEDAL} style={{ width: 160, height: 160 }} contentFit="contain" />,
    title: 'Welcome to Deliverance Prayer',
    text: 'Catholic prayers for deliverance, healing and protection, in Malayalam and English.',
  },
  {
    key: 'home',
    art: <Heart size={ICON} color={colors.redDark} weight="fill" />,
    title: 'Your favourite prayers',
    text: 'Swipe through the cards on Home and tap one to pray. Tap the heart on any prayer to add it to Home.',
  },
  {
    key: 'menu',
    art: <ListIcon size={ICON} color={colors.redDark} weight="bold" />,
    title: 'All prayers in the menu',
    text: 'Tap the menu button to see every prayer. Search for one, or drag them into your own order.',
  },
  {
    key: 'rosary',
    art: <HandsPrayingIcon size={ICON} color={colors.redDark} />,
    title: 'Pray the Holy Rosary',
    text: "Open the Rosary prayer and choose a mystery; today's is highlighted. Tap the bead button to count each prayer.",
  },
  {
    key: 'manna',
    art: <Quotes size={ICON} color={colors.redDark} weight="fill" />,
    title: 'Manna – a Word for today',
    text: 'Shake your phone or tap "Take a Word" to receive a Bible verse. Save it, or share it as a picture.',
  },
  {
    key: 'settings',
    art: <FadersIcon size={ICON} color={colors.redDark} />,
    title: 'Make it yours',
    text: 'Change the language, text size and dark mode anytime in Settings.',
  },
];

export default function AppTour() {
  const { finishTour } = useApp();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const isLast = index === SLIDES.length - 1;

  const goTo = (i: number) => {
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  };

  return (
    <LinearGradient colors={[palettes.light.red, palettes.light.redDeep]} style={styles.screen}>
      {/* Skip, top right */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        {!isLast && (
          <Pressable onPress={finishTour} hitSlop={12}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={s => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
        onMomentumScrollEnd={e => setIndex(Math.round(e.nativeEvent.contentOffset.x / W))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: W }]}>
            <View style={item.key === 'welcome' ? styles.artPlain : styles.artCircle}>{item.art}</View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />

      {/* Dots + buttons */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.buttons}>
          {index > 0 ? (
            <Pressable onPress={() => goTo(index - 1)} style={styles.backBtn} hitSlop={8}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Pressable
            onPress={() => (isLast ? finishTour() : goTo(index + 1))}
            style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.nextText}>{isLast ? 'Get Started' : 'Next'}</Text>
          </Pressable>
        </View>
      </View>
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
  },
  topBar: { alignItems: 'flex-end', paddingHorizontal: 24, minHeight: 56 },
  skip: { fontFamily: fonts.enBold, fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  artPlain: { marginBottom: 36 },
  artCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  title: {
    fontFamily: fonts.enBold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 14,
  },
  text: {
    fontFamily: fonts.en,
    fontSize: 16,
    lineHeight: 25,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  bottom: { paddingHorizontal: 28, gap: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 24, backgroundColor: colors.gold },
  buttons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 80, paddingVertical: 14 },
  backText: { fontFamily: fonts.enBold, fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  nextBtn: {
    flex: 1,
    backgroundColor: colors.gold,
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextText: { fontFamily: fonts.enBold, fontSize: 16, color: colors.redDark },
});
