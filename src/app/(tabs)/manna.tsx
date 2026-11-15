// Manna: draw a lot from the lot box to receive a Bible verse (Malayalam POC + English).
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowsClockwiseIcon,
  BookmarksSimpleIcon,
  CopyIcon,
  HeartIcon,
  ListIcon,
  ShareNetworkIcon,
} from 'phosphor-react-native';
import LotBox from '../../components/LotBox';
import VerseCard from '../../components/VerseCard';
import SavedVerses from '../../components/SavedVerses';
import BackgroundPicker from '../../components/BackgroundPicker';
import ShareCard from '../../components/ShareCard';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useMannaBackground } from '../../context/MannaBackgroundContext';
import { MANNA_IMAGES } from '../../data/mannaBackgrounds';
import type { Verse } from '../../data/verses';
import { useApp } from '../../context/AppContext';
import { useMenu } from '../../context/MenuContext';
import { useVerses } from '../../context/VersesContext';
import { usePalette } from '../../hooks/usePalette';
import { colors, fonts } from '../../theme';

const TEXT = {
  // Messages stay in English
  copied: { ml: 'Copied', en: 'Copied' },
  saved: { ml: 'Saved', en: 'Saved' },
  removed: { ml: 'Removed', en: 'Removed' },
};

// Share / copy the verse in the language the user has chosen
const shareText = (v: Verse, lang: 'ml' | 'en') => `${v.text[lang]}\n— ${v.ref[lang]}`;

export default function MannaScreen() {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const { lang } = useApp();
  const { openMenu } = useMenu();
  const { draw, backgrounds, isSaved, toggleSaved } = useVerses();

  const [verse, setVerse] = useState<Verse | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [showBg, setShowBg] = useState(false);

  // Share as a 9:16 image: draw the share card off-screen, wait for its image, capture, share
  const shareRef = useRef<any>(null);
  const [sharing, setSharing] = useState(false);
  const readyResolve = useRef<(() => void) | null>(null);
  const shareImage = async () => {
    if (!verse || sharing) return;
    setSharing(true);
    try {
      await new Promise<void>(resolve => {
        readyResolve.current = resolve;
        setTimeout(resolve, 3000); // don't wait forever for a slow image
      });
      await new Promise(r => setTimeout(r, 150)); // let it paint
      const uri = await captureRef(shareRef, {
        format: 'jpg',
        quality: 0.92,
        width: 1080,
        height: 1920,
        result: 'tmpfile',
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/jpeg', UTI: 'public.jpeg', dialogTitle: verse.ref[lang] });
      } else {
        await Share.share({ message: shareText(verse, lang) });
      }
    } catch {
      Share.share({ message: shareText(verse, lang) }).catch(() => {}); // fall back to text
    } finally {
      readyResolve.current = null;
      setSharing(false);
    }
  };
  const { sourceFor, resetBackground } = useMannaBackground();
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = (text: string) => {
    setMessage(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 1800);
  };

  // Auto: the verse's own image, otherwise a random photo picked each time a verse is shown
  const [autoBackground, setAutoBackground] = useState<number | { uri: string } | undefined>(undefined);
  const showVerse = (v: Verse | null) => {
    resetBackground(); // a new verse always starts on Auto (no uploaded photo)
    if (v) {
      const pool: (number | { uri: string })[] = backgrounds.length ? backgrounds : MANNA_IMAGES.map(m => m.source);
      setAutoBackground(v.image ?? pool[Math.floor(Math.random() * pool.length)]);
    }
    setVerse(v);
  };
  const background = sourceFor(autoBackground); // user's choice wins

  // 9:16 card that fits between the top bar, the buttons and the tab bar
  const cardW = Math.min(W * 0.82, 380, (H - insets.top - 300) * (9 / 16));

  const onDrawn = () => showVerse(draw() ?? null);

  const actions = verse
    ? [
        { key: 'share', icon: ShareNetworkIcon, onPress: shareImage },
        {
          key: 'save',
          icon: HeartIcon,
          filled: isSaved(verse.id),
          onPress: () => toast(toggleSaved(verse) ? TEXT.saved[lang] : TEXT.removed[lang]),
        },
        {
          key: 'copy',
          icon: CopyIcon,
          onPress: async () => {
            await Clipboard.setStringAsync(shareText(verse, lang));
            toast(TEXT.copied[lang]);
          },
        },
        { key: 'again', icon: ArrowsClockwiseIcon, onPress: () => showVerse(null) }, // back to the lot box
      ]
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={openMenu} style={styles.menuBtn} hitSlop={8}>
          <ListIcon size={28} color={colors.redDark} weight="bold" />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={() => setShowSaved(true)} style={[styles.pill, { backgroundColor: palette.red }]} hitSlop={6}>
            <BookmarksSimpleIcon size={22} color={colors.white} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 28, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' }}>
        {verse ? (
          <>
            <VerseCard verse={verse} background={background} width={cardW} onEdit={() => setShowBg(true)} />
            <View style={styles.actions}>
              {actions.map(a => (
                <Pressable key={a.key} onPress={a.onPress} style={styles.action} hitSlop={4}>
                  <a.icon size={26} color={colors.redDark} weight={a.filled ? 'fill' : 'regular'} />
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <LotBox onDrawn={onDrawn} />
        )}
      </ScrollView>

      {message && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{message}</Text>
        </View>
      )}

      <BackgroundPicker visible={showBg} onClose={() => setShowBg(false)} />

      {/* Off-screen 9:16 image used for sharing */}
      {sharing && verse && (
        <ShareCard
          ref={shareRef}
          verse={verse}
          lang={lang}
          background={background}
          width={cardW}
          onReady={() => readyResolve.current?.()}
        />
      )}

      <SavedVerses
        visible={showSaved}
        onClose={() => setShowSaved(false)}
        onOpen={v => {
          showVerse(v);
          setShowSaved(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  menuBtn: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: colors.activePill, alignItems: 'center', justifyContent: 'center',
  },
  pill: {
    height: 52, minWidth: 52, borderRadius: 14, flexDirection: 'row', gap: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  pillText: { color: colors.white, fontFamily: fonts.enBold, fontSize: 15 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 28 },
  action: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.activePill, alignItems: 'center', justifyContent: 'center',
  },
  toast: {
    position: 'absolute', alignSelf: 'center', bottom: 24,
    backgroundColor: colors.gold, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 20,
  },
  toastText: { color: colors.redDark, fontFamily: fonts.enBold },
});
