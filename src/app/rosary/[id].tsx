// One mystery of the Holy Rosary, as 7 swipeable slides (same flow as Kontha):
//   intro → decades 1–5 (with the bead counter) → closing prayers.
import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import { useRosary } from '../../context/RosaryContext';
import { useApp } from '../../context/AppContext';
import { usePalette } from '../../hooks/usePalette';
import { fonts } from '../../theme';
import type { Decade, Mystery, RosaryCommon } from '../../data/rosary';
import RichText from '../../components/rosary/RichText';
import IntroHeader from '../../components/rosary/IntroHeader';
import DecadeHeader from '../../components/rosary/DecadeHeader';
import ProgressBar from '../../components/rosary/ProgressBar';
import CollapsiblePrayer from '../../components/rosary/CollapsiblePrayer';
import EdgeNavArrow from '../../components/rosary/EdgeNavArrow';
import BeadButton from '../../components/rosary/BeadButton';
import PrayerCard from '../../components/rosary/PrayerCard';

type Page = { type: 'intro' } | { type: 'decade'; decade: Decade } | { type: 'closing' };

// Opening "Our Father / Hail Mary" boxes on the intro slide (same wording as Kontha)
const INTRO_TITLES = {
  ourFather: { ml: 'സ്വർഗ്ഗസ്ഥനായ ഞങ്ങളുടെ പിതാവേ...', en: 'Our Father...' },
  hailMary: { ml: 'കൃപ നിറഞ്ഞ മറിയമേ...', en: 'Hail Mary...' },
};

export default function MysteryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rosary, getMystery, imageUri } = useRosary();
  const mystery = getMystery(id);
  const { lang } = useApp();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const isMl = lang === 'ml';

  const [page, setPage] = useState(0);
  const [bead, setBead] = useState(0);
  const [flash, setFlash] = useState(0);
  const listRef = useRef<FlatList<Page>>(null);

  const pages: Page[] = mystery
    ? [{ type: 'intro' }, ...mystery.decades.map(d => ({ type: 'decade' as const, decade: d })), { type: 'closing' }]
    : [];
  const current = pages[page];
  const onDecade = current?.type === 'decade';
  const isFirst = page === 0;
  const isLast = page === pages.length - 1;

  const goTo = (i: number) => {
    if (i < 0 || i >= pages.length) return;
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setPage(i);
    setBead(0);
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Red header with back button and the mystery's name */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: palette.red }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <CaretLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text numberOfLines={1} style={[styles.headerTitle, { fontFamily: isMl ? fonts.mlBold : fonts.enBold }]}>
          {mystery ? mystery.name[lang] : 'Mystery not found'}
        </Text>
      </View>

      {mystery && (
        <>
          {current?.type === 'closing' && <ProgressBar current={page} />}
          <FlatList
            ref={listRef}
            data={pages}
            extraData={`${page}-${bead}-${flash}-${lang}`}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
            onMomentumScrollEnd={e => {
              const i = Math.round(e.nativeEvent.contentOffset.x / W);
              if (i !== page) {
                setPage(i);
                setBead(0);
                setFlash(0);
              }
            }}
            renderItem={({ item, index }) => (
              <Slide
                page={item}
                index={index}
                isCurrent={index === page}
                bead={index === page ? bead : 0}
                flash={flash}
                mystery={mystery}
                common={rosary.common}
                others={rosary.mysteries.filter(m => m.id !== mystery.id)}
                imageUri={imageUri}
                width={W}
                bottomSpace={insets.bottom}
              />
            )}
          />

          {/* Edge arrows on the intro and closing slides; the bead button on decades */}
          {!isFirst && !onDecade && <EdgeNavArrow direction="left" onPress={() => goTo(page - 1)} />}
          {!isLast && !onDecade && <EdgeNavArrow direction="right" onPress={() => goTo(page + 1)} />}
          {onDecade && (
            <BeadButton
              key={page}
              index={bead}
              bottom={insets.bottom + 32}
              onChange={i => {
                setBead(i);
                setFlash(f => f + 1);
              }}
              onDecadeComplete={() => goTo(page + 1)}
            />
          )}
        </>
      )}
    </View>
  );
}

type SlideProps = {
  page: Page;
  index: number;
  isCurrent: boolean;
  bead: number;
  flash: number;
  mystery: Mystery;
  common: RosaryCommon;
  others: Mystery[];
  imageUri: (path: string) => { uri: string };
  width: number;
  bottomSpace: number;
};

function Slide({ page, index, isCurrent, bead, flash, mystery, common, others, imageUri, width, bottomSpace }: SlideProps) {
  const { lang, fontSize } = useApp();
  const palette = usePalette();
  const isMl = lang === 'ml';
  const scrollRef = useRef<ScrollViewInstance>(null);
  const cardY = useRef(0);

  const textStyle = {
    color: palette.intro,
    fontFamily: isMl ? fonts.ml : fonts.en,
    fontSize: fontSize(15),
    lineHeight: fontSize(15) * 1.6,
  };

  // Keep the prayer card in view while counting beads
  useEffect(() => {
    if (page.type === 'decade' && bead > 0 && cardY.current > 0) {
      scrollRef.current?.scrollTo({ y: cardY.current - 16, animated: true });
    }
  }, [bead, page.type]);

  // Start each slide at the top when it comes on screen
  useEffect(() => {
    if (isCurrent) scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [isCurrent]);

  return (
    <ScrollView
      ref={scrollRef}
      style={{ width }}
      contentContainerStyle={[styles.slide, { paddingBottom: bottomSpace + (page.type === 'decade' ? 120 : 32) }]}
    >
      {page.type === 'intro' && (
        <>
          <IntroHeader
            image={mystery.icon ? imageUri(mystery.icon) : undefined}
            days={mystery.days}
            daysNote={mystery.daysNote}
            current={index}
          />
          <RichText content={common.openingPrayer[lang]} style={textStyle} />
          <CollapsiblePrayer title={INTRO_TITLES.ourFather[lang]} text={common.ourFather[lang]} />
          {common.virtues.map((v, i) => (
            <View key={i} style={{ gap: 16 }}>
              <Text style={textStyle}>{v[lang]}</Text>
              <CollapsiblePrayer title={INTRO_TITLES.hailMary[lang]} text={common.hailMary[lang]} />
            </View>
          ))}
        </>
      )}

      {page.type === 'decade' && (
        <>
          <DecadeHeader
            number={page.decade.number}
            ordinal={page.decade.ordinal}
            title={page.decade.title}
            image={page.decade.image ? imageUri(page.decade.image) : undefined}
            current={index}
            isCurrentPage={isCurrent}
          />
          <Text style={[textStyle, { fontSize: fontSize(16), lineHeight: fontSize(16) * 1.6 }]}>
            {page.decade.reflection[lang]}
          </Text>

          {/* Deliverance prayer / intercession for this decade (hidden until added on GitHub) */}
          {!!page.decade.intercession[lang] && (
            <View style={[styles.intercession, { borderColor: palette.red }]}>
              <Text style={[styles.intercessionLabel, { color: palette.red }]}>Intercession</Text>
              <Text style={[textStyle, { color: palette.text }]}>{page.decade.intercession[lang]}</Text>
            </View>
          )}

          <View onLayout={e => (cardY.current = e.nativeEvent.layout.y)}>
            <PrayerCard common={common} beadIndex={bead} flash={flash} />
          </View>
        </>
      )}

      {page.type === 'closing' && (
        <>
          <RichText content={common.closing[lang]} style={textStyle} />
          <Text style={[styles.othersTitle, { color: palette.text }]}>Other Mysteries</Text>
          <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.othersRow}>
            {others.map(m => (
              <Pressable
                key={m.id}
                onPress={() => router.replace(`/rosary/${m.id}`)}
                style={[styles.other, { backgroundColor: palette.card }]}
              >
                <Image source={m.icon ? imageUri(m.icon) : undefined} style={styles.otherIcon} contentFit="cover" />
                <Text style={[styles.otherName, { color: palette.text, fontFamily: isMl ? fonts.mlBold : fonts.enBold }]}>
                  {m.name[lang]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  back: { padding: 8 },
  headerTitle: { flex: 1, color: '#FFFFFF', fontSize: 16, paddingVertical: 14, paddingRight: 16 },
  slide: { padding: 20, gap: 16 },
  intercession: { borderWidth: 1.5, borderRadius: 12, padding: 16, gap: 6 },
  intercessionLabel: { fontFamily: fonts.enBold, fontSize: 13, letterSpacing: 0.5 },
  othersTitle: { fontFamily: fonts.enBold, fontSize: 16, marginTop: 24 },
  othersRow: { gap: 12, paddingBottom: 8 },
  other: { width: 200, borderRadius: 16, padding: 20, alignItems: 'center', gap: 8 },
  otherIcon: { width: 150, height: 150, borderRadius: 75 },
  otherName: { fontSize: 14, textAlign: 'center' },
});
