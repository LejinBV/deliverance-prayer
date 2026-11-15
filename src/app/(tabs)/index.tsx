import { View, Text, Pressable, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler'; // works together with the carousel swipe
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { List } from 'phosphor-react-native';
import { useApp } from '../../context/AppContext';
import { useMenu } from '../../context/MenuContext';
import DivineHalo from '../../components/DivineHalo';
import HeartRays from '../../components/HeartRays';
import PrayerCarousel from '../../components/PrayerCarousel';
import { usePalette } from '../../hooks/usePalette';
import { colors, fonts } from '../../theme';

const HERO = require('../../../assets/images/hero.png');
const heroSource = Image.resolveAssetSource(HERO);
const HERO_RATIO =
  heroSource?.width && heroSource?.height ? heroSource.height / heroSource.width : 1080 / 875;

const INTRO = {
  ml: 'ദുഷ്ടശക്തികളിൽ നിന്നുള്ള സംരക്ഷണത്തിനും, തലമുറകളുടെ ശാപമോചനത്തിനും, അസാധ്യങ്ങൾ സാധ്യമാക്കാനുമുള്ള വിടുതൽ പ്രാർത്ഥനകൾ.',
  en: 'Deliverance prayers for protection from evil forces, release from generational curses, and making the impossible possible.',
};

export default function Home() {
  const { width: W } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { lang, fontSize } = useApp();
  const { openMenu } = useMenu();
  const palette = usePalette();

  // Red arch
  const archBottom = W * 0.7;
  const archSize = W * 1.06;

  // Hero image
  const heroW = Math.min(290, W * 0.8);
  const heroH = heroW * HERO_RATIO;

  // Glow
  const haloSize = heroW * 1.5;
  const HALO_CENTER = 0.5;

  // Heart rays
  const HEART_X = 0.509;
  const HEART_Y = 0.468;
  const rayLength = heroH * 1.1;
  const rayCanvasH = heroH * HEART_Y + rayLength;
  const rayOffsetX = (W - heroW) / 2;

  const introSize = fontSize(lang === 'ml' ? 15 : 10);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: palette.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Red arch background */}
      <View style={[styles.archFill, { height: archBottom - archSize / 2, backgroundColor: palette.red }]} />
      <View
        style={[
          styles.arch,
          {
            width: archSize,
            height: archSize,
            borderRadius: archSize / 2,
            top: archBottom - archSize,
            left: (W - archSize) / 2,
            backgroundColor: palette.red,
          },
        ]}
      />

      {/* Hero image with glow and heart rays */}
      <View style={{ alignSelf: 'center', marginTop: insets.top + 44, width: heroW, height: heroH }}>
        <View
          style={{
            position: 'absolute',
            top: heroH * HALO_CENTER - haloSize / 2,
            left: (heroW - haloSize) / 2,
          }}
        >
          <DivineHalo size={haloSize} showRays={false} />
        </View>

        <Image source={HERO} style={{ width: heroW, height: heroH }} resizeMode="contain" />

        <View style={{ position: 'absolute', top: 0, left: -rayOffsetX }}>
          <HeartRays
            width={W}
            height={rayCanvasH}
            originX={rayOffsetX + heroW * HEART_X}
            originY={heroH * HEART_Y}
            length={rayLength}
            intensity={0.8}
          />
        </View>
      </View>

      {/* Intro text */}
      <Text
        style={[
          styles.intro,
          {
            fontFamily: fonts.hand,
            color: palette.intro,
            textShadowColor: palette.intro,
            fontSize: introSize,
            lineHeight: introSize * 1.6,
          },
        ]}
      >
        {INTRO[lang]}
      </Text>

      {/* 3D prayer carousel */}
      <View style={{ marginTop: 36 }}>
        <PrayerCarousel />
      </View>

      {/* Hamburger */}
      <Pressable
        onPress={openMenu}
        style={[styles.menuBtn, { top: insets.top + 16 }]}
        hitSlop={8}
      >
        <List size={30} color={colors.redDark} weight="bold" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  archFill: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: colors.red },
  arch: { position: 'absolute', backgroundColor: colors.red },
  intro: {
    color: '#333333',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: 40,
    textShadowColor: '#333333',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.8,
  },
  menuBtn: {
    position: 'absolute',
    left: 20,
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: colors.activePill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});