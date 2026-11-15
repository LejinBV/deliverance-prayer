// About the App. The text (and an optional image) comes from about.json on GitHub,
// written in the same blocks format as prayers. Until it's added, "Coming soon" shows.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Constants from 'expo-constants';
import { ArrowLeft } from 'phosphor-react-native';
import PrayerBlocks from '../components/PrayerBlocks';
import { useExtras } from '../context/ExtrasContext';
import { useApp } from '../context/AppContext';
import { usePalette } from '../hooks/usePalette';
import { APP_NAME } from '../config';
import { colors, fonts } from '../theme';

export default function AboutScreen() {
  const { about } = useExtras();
  const { lang } = useApp();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version;

  // Anything to show in the selected language?
  const hasContent = about.blocks.some(b => (b.type === 'litany' ? b.items.some(i => i[lang]) : !!b.text[lang]));

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 48 }]}>
        <Pressable onPress={() => router.back()} style={styles.btn} hitSlop={8}>
          <ArrowLeft size={26} color={colors.redDark} weight="bold" />
        </Pressable>

        <Text style={[styles.title, { color: palette.text }]}>About the App</Text>
        <View style={[styles.rule, { backgroundColor: palette.red }]} />

        {about.image && <Image source={about.image} style={styles.image} contentFit="cover" transition={200} />}

        {hasContent ? (
          <PrayerBlocks blocks={about.blocks} lang={lang} />
        ) : (
          <Text style={[styles.empty, { color: palette.intro }]}>Coming soon</Text>
        )}

        <Text style={[styles.version, { color: palette.intro }]}>
          {APP_NAME}
          {version ? `  ·  Version ${version}` : ''}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24 },
  btn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.activePill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontFamily: fonts.enBold, fontSize: 24 },
  rule: { width: 48, height: 3, borderRadius: 2, marginTop: 14, marginBottom: 22 },
  image: { width: '100%', aspectRatio: 16 / 9, borderRadius: 16, marginBottom: 22 },
  empty: { fontFamily: fonts.en, fontSize: 16, fontStyle: 'italic' },
  version: { fontFamily: fonts.en, fontSize: 13, marginTop: 32, textAlign: 'center', opacity: 0.8 },
});
