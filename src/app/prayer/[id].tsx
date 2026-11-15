// TEMPORARY prayer page — shows the prayer text until the final design is ready.
import { useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, Share, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, ShareNetworkIcon } from 'phosphor-react-native';
import { APP_LINK, APP_NAME } from '../../config';
import { captureRef } from 'react-native-view-shot';
import PrayerShareImage from '../../components/PrayerShareImage';
import { shareImageWithText } from '../../utils/shareImageWithText';

const PREVIEW_CHARS = 220; // how much of the prayer goes into the share text
import { usePrayers } from '../../context/PrayersContext';
import PrayerBlocks from '../../components/PrayerBlocks';
import RosaryLanding from '../../components/RosaryLanding';

// This prayer page is the Holy Rosary landing page (4 mystery tiles)
const ROSARY_PAGE_ID = 'rosary-mother';
import { blocksFor } from '../../data/prayers';
import { useApp, MIN_FAVOURITES } from '../../context/AppContext';
import { usePalette } from '../../hooks/usePalette';
import { colors, fonts } from '../../theme';

const TEXT = {
  // Messages stay in English
  notFound: { ml: 'Prayer not found', en: 'Prayer not found' },
  comingSoon: { ml: 'Prayer text coming soon', en: 'Prayer text coming soon' },
  minFav: {
    ml: `Keep at least ${MIN_FAVOURITES} prayers on Home`,
    en: `Keep at least ${MIN_FAVOURITES} prayers on Home`,
  },
};

const HEADER_H = 260;

export default function PrayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPrayer } = usePrayers();
  const prayer = getPrayer(id);
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const { lang, fontSize, isFavourite, toggleFavourite } = useApp();

  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Banner: the image fills the width; bannerFocus slides it up to show a lower part.
  const { width: W } = useWindowDimensions();
  const [imgRatio, setImgRatio] = useState(1287 / 900); // height / width, updated when the image loads
  const bannerH = HEADER_H + insets.top;
  const imgH = Math.max(bannerH, W * imgRatio);
  const focus = Math.min(100, Math.max(0, parseFloat(prayer?.bannerFocus ?? '0') || 0)) / 100;
  const imgTop = -(imgH - bannerH) * focus;

  const isMl = lang === 'ml';
  const bodySize = fontSize(isMl ? 18 : 17);
  // Does this prayer have anything to show in the selected language?
  const hasContent =
    !!prayer &&
    blocksFor(prayer).some(b => (b.type === 'litany' ? b.items.some(i => i[lang]) : !!b.text[lang]));
  const fav = prayer ? isFavourite(prayer.id) : false;
  const isRosary = prayer?.id === ROSARY_PAGE_ID;

  // Share: square banner image + the first few lines of the prayer + app link.
  // The full prayer is only in the app.
  const toast = (text: string, ms = 3000) => {
    setMessage(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), ms);
  };

  const shareRef = useRef<any>(null);
  const [sharing, setSharing] = useState(false);
  const readyResolve = useRef<(() => void) | null>(null);

  const shareText = () => {
    if (!prayer) return '';
    const body = prayer.body[lang].replace(/\s+/g, ' ').trim();
    let preview = body;
    if (body.length > PREVIEW_CHARS) {
      const cut = body.slice(0, PREVIEW_CHARS);
      preview = cut.slice(0, Math.max(cut.lastIndexOf(' '), PREVIEW_CHARS * 0.7)).trim() + '…';
    }
    return [
      prayer.title[lang],
      preview,
      `Read the full prayer in the ${APP_NAME} app:\n${APP_LINK}`,
    ].filter(Boolean).join('\n\n');
  };

  const onShare = async () => {
    if (!prayer || sharing) return;
    const text = shareText();
    if (!prayer.image) {
      Share.share({ message: text }).catch(() => {});
      return;
    }
    setSharing(true);
    try {
      await new Promise<void>(resolve => {
        readyResolve.current = resolve;
        setTimeout(resolve, 3000); // don't wait forever for a slow image
      });
      const uri = await captureRef(shareRef, { format: 'jpg', quality: 0.9, width: 1080, height: 1080, result: 'tmpfile' });
      const copied = await shareImageWithText(uri, text, prayer.title[lang]);
      if (copied) toast('Prayer text copied – paste it with the image');
    } catch {
      Share.share({ message: text }).catch(() => {}); // fall back to text only
    } finally {
      readyResolve.current = null;
      setSharing(false);
    }
  };

  const onHeart = () => {
    if (!prayer) return;
    if (!toggleFavourite(prayer.id)) {
      setMessage(TEXT.minFav[lang]);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(null), 2500);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}>
        {/* Header image */}
        <View style={{ height: bannerH, backgroundColor: palette.red, overflow: 'hidden' }}>
          {prayer?.image && (
            <Image
              source={prayer.image}
              style={{ position: 'absolute', left: 0, width: W, height: imgH, top: imgTop }}
              contentFit="cover"
              transition={200}
              onLoad={e => {
                const { width, height } = e.source;
                if (width && height) setImgRatio(height / width);
              }}
            />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'transparent', palette.background]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Title + text */}
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              {
                color: palette.text,
                fontFamily: isMl ? fonts.mlBold : fonts.enBold,
                fontSize: fontSize(isMl ? 26 : 24),
                lineHeight: fontSize(isMl ? 26 : 24) * 1.35,
              },
            ]}
          >
            {prayer ? prayer.title[lang] : TEXT.notFound[lang]}
          </Text>

          <View style={[styles.rule, { backgroundColor: palette.red }]} />

          {prayer && !hasContent && !isRosary && (
            <Text style={[styles.empty, { color: palette.intro, fontFamily: fonts.en }]}>
              {TEXT.comingSoon[lang]}
            </Text>
          )}

          {/* Content, styled block by block */}
          {prayer && <PrayerBlocks blocks={blocksFor(prayer)} lang={lang} />}

          {isRosary && <RosaryLanding />}
        </View>
      </ScrollView>

      {/* Back + heart buttons */}
      <View style={[styles.topBar, { top: insets.top + 16 }]} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} style={styles.btn} hitSlop={8}>
          <ArrowLeft size={26} color={colors.redDark} weight="bold" />
        </Pressable>
        {prayer && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={onShare} style={styles.btn} hitSlop={8}>
              <ShareNetworkIcon size={26} color={colors.redDark} weight="bold" />
            </Pressable>
          <Pressable onPress={onHeart} style={styles.btn} hitSlop={8}>
            <Heart size={26} color={colors.redDark} weight={fav ? 'fill' : 'bold'} />
          </Pressable>
          </View>
        )}
      </View>

      {/* Off-screen square image used for sharing */}
      {sharing && prayer?.image && (
        <PrayerShareImage
          ref={shareRef}
          source={prayer.image}
          bannerFocus={prayer.bannerFocus}
          onReady={() => readyResolve.current?.()}
        />
      )}

      {message && (
        <View style={[styles.toast, { bottom: insets.bottom + 24 }]} pointerEvents="none">
          <Text style={styles.toastText}>{message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, marginTop: -40 },
  title: {},
  rule: { width: 48, height: 3, borderRadius: 2, marginTop: 14, marginBottom: 22 },
  empty: { fontSize: 16, fontStyle: 'italic' },
  note: { fontStyle: 'italic', marginBottom: 20 },
  verse: { borderLeftWidth: 4, borderRadius: 12, padding: 16, marginTop: 4 },
  verseRef: { fontFamily: fonts.enBold, marginTop: 8 },
  topBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.activePill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toast: {
    position: 'absolute',
    left: 32,
    right: 32,
    backgroundColor: colors.gold,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toastText: { color: colors.redDark, fontFamily: fonts.enBold, textAlign: 'center' },
});
