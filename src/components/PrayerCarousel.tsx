import { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  cancelAnimation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GestureDetector, useCompetingGestures, usePanGesture, useTapGesture } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Cross, CrossIcon, Heart } from 'phosphor-react-native';
import type { Prayer } from '../data/prayers';
import { usePrayers } from '../context/PrayersContext';
import { useApp, MIN_FAVOURITES } from '../context/AppContext';
import { colors, fonts } from '../theme';
import { usePalette } from '../hooks/usePalette';

// ─── Tuning ──────────────────────────────────────────────────────────────
const CARD_RATIO = 1287 / 900; // height / width of the card artwork
const MAX_CARD_W = 300;
const SIDE_ROTATE = 38;        // degrees the side cards turn
const SIDE_SCALE = 0.86;       // size of the side cards
const PARALLAX = 24;           // how far the image slides inside its card
const SPRING = { damping: 20, stiffness: 170, mass: 1 };
const HEART_HIT = 64;          // tap area for the heart (top-right corner)
const SWIPE_THRESHOLD = 0.15;  // drag 15% of a card to move to the next one
const FLICK_SPEED = 0.5;       // a quick flick (cards/second) always moves a card
const DOUBLE_FLICK = 6;        // a very fast flick moves two cards
// ─────────────────────────────────────────────────────────────────────────

const MIN_MESSAGE = {
  ml: `Keep at least ${MIN_FAVOURITES} prayers on Home`,
  en: `Keep at least ${MIN_FAVOURITES} prayers on Home`,
};

// Distance of card `i` from the centre, wrapped so the carousel loops forever
function relative(i: number, pos: number, n: number) {
  'worklet';
  let r = (((i - pos) % n) + n) % n;
  if (r > n / 2) r -= n;
  return r;
}

export default function PrayerCarousel() {
  const { width: W } = useWindowDimensions();
  const { lang, favourites, toggleFavourite } = useApp();
  const palette = usePalette();

  // Cards = hearted prayers, in menu order
  const { prayers } = usePrayers();
  const cards = useMemo(() => prayers.filter(p => favourites.includes(p.id)), [prayers, favourites]);
  const n = cards.length;

  const cardW = Math.min(MAX_CARD_W, W * 0.75);
  const cardH = cardW * CARD_RATIO;
  const spacing = cardW * 0.32;     // how far the side cards sit from the centre
  const dragDistance = cardW * 0.55; // finger travel that moves one card
  const top = 12;
  const stageH = cardH + top * 2 + 24;

  const pos = useSharedValue(0);  // which card is in front (fractional while moving)
  const start = useSharedValue(0);

  // Toast for the "minimum 4" rule
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openPrayer = (index: number) => {
    const p = cards[index];
    if (p) router.push(`/prayer/${p.id}`);
  };

  const unheart = (index: number) => {
    const p = cards[index];
    if (!p) return;
    if (!toggleFavourite(p.id)) {
      setMessage(MIN_MESSAGE[lang]);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(null), 2500);
    }
  };

  const pan = usePanGesture({
    activeOffsetX: [-6, 6],
    failOffsetY: [-24, 24], // only a clearly vertical swipe scrolls the page
    onActivate: e => {
      'worklet';
      // Drag really started: grab the carousel where it is (even mid-spin)
      cancelAnimation(pos);
      start.value = pos.value + e.translationX / dragDistance;
    },
    onUpdate: e => {
      'worklet';
      pos.value = start.value - e.translationX / dragDistance;
    },
    onDeactivate: e => {
      'worklet';
      const velocity = -e.velocityX / dragDistance; // cards per second
      const from = Math.round(start.value);
      const moved = pos.value - start.value;        // cards dragged
      let target = from;
      if (Math.abs(velocity) > FLICK_SPEED) {
        // Quick flick: go with it, even if the finger only moved a little
        target = from + Math.sign(velocity) * (Math.abs(velocity) > DOUBLE_FLICK ? 2 : 1);
      } else if (Math.abs(moved) > SWIPE_THRESHOLD) {
        // Slow drag: move past the threshold and it goes to the next card
        target = from + Math.sign(moved) * Math.max(1, Math.round(Math.abs(moved)));
      }
      pos.value = withSpring(target, { ...SPRING, velocity });
    },
  });

  const tap = useTapGesture({
    maxDeltaX: 10,
    maxDeltaY: 10,
    onActivate: e => {
      'worklet';
      if (n === 0) return;
      const settled = Math.round(pos.value);
      const left = (W - cardW) / 2;
      const right = left + cardW;

      // Side card tapped → bring it to the front
      if (e.x < left) {
        pos.value = withSpring(settled - 1, SPRING);
        return;
      }
      if (e.x > right) {
        pos.value = withSpring(settled + 1, SPRING);
        return;
      }

      const index = ((settled % n) + n) % n;
      const onHeart = e.x > right - HEART_HIT && e.y < top + HEART_HIT;
      scheduleOnRN(onHeart ? unheart : openPrayer, index);
    },
  });

  const gesture = useCompetingGestures(pan, tap);

  if (n === 0) return null;

  return (
    <View>
      <GestureDetector gesture={gesture}>
        <View style={{ width: W, height: stageH }}>
          {cards.map((prayer, i) => (
            <Card
              key={prayer.id}
              prayer={prayer}
              index={i}
              count={n}
              pos={pos}
              lang={lang}
              cardW={cardW}
              cardH={cardH}
              spacing={spacing}
              left={(W - cardW) / 2}
              top={top}
            />
          ))}
        </View>
      </GestureDetector>

      {/* Position dots */}
      <View style={styles.dots}>
        {cards.map((p, i) => (
          <Dot key={p.id} index={i} count={n} pos={pos} idle={palette.dot} active={palette.red} />
        ))}
      </View>

      {message && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{message}</Text>
        </View>
      )}
    </View>
  );
}

// ─── One card ────────────────────────────────────────────────────────────
type CardProps = {
  prayer: Prayer;
  index: number;
  count: number;
  pos: SharedValue<number>;
  lang: 'ml' | 'en';
  cardW: number;
  cardH: number;
  spacing: number;
  left: number;
  top: number;
};

function Card({ prayer, index, count, pos, lang, cardW, cardH, spacing, left, top }: CardProps) {
  const cardStyle = useAnimatedStyle(() => {
    const r = relative(index, pos.value, count);
    const a = Math.abs(r);
    return {
      zIndex: 10 - Math.round(a * 2), // only changes when cards swap order
      opacity: interpolate(a, [0, 1.3, 1.9], [1, 1, 0], Extrapolation.CLAMP),
      transform: [
        { perspective: 1200 },
        { translateX: interpolate(r, [-2, -1, 0, 1, 2], [-spacing * 1.6, -spacing, 0, spacing, spacing * 1.6]) },
        { rotateY: `${interpolate(r, [-2, -1, 0, 1, 2], [-55, -SIDE_ROTATE, 0, SIDE_ROTATE, 55], Extrapolation.CLAMP)}deg` },
        { scale: interpolate(a, [0, 1, 2], [1, SIDE_SCALE, SIDE_SCALE * 0.85], Extrapolation.CLAMP) },
      ],
    };
  }, [index, count, spacing]);

  // Image slides slightly inside the card (parallax)
  const imageStyle = useAnimatedStyle(() => {
    const r = relative(index, pos.value, count);
    return {
      transform: [{ translateX: interpolate(r, [-1, 0, 1], [PARALLAX, 0, -PARALLAX], Extrapolation.CLAMP) }],
    };
  }, [index, count]);

  // Side cards are a little darker
  const shadeStyle = useAnimatedStyle(() => {
    const a = Math.abs(relative(index, pos.value, count));
    return { opacity: interpolate(a, [0, 1], [0, 0.45], Extrapolation.CLAMP) };
  }, [index, count]);

  const showTitle = prayer.showTitle !== false;

  return (
    <Animated.View style={[styles.cardOuter, { left, top, width: cardW, height: cardH }, cardStyle]}>
      <View style={styles.cardInner}>
        {/* Background */}
        <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left: -PARALLAX, right: -PARALLAX }, imageStyle]}>
          {prayer.image ? (
            <Image source={prayer.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
          ) : (
            <LinearGradient colors={['#5A0A12', '#2A0306']} style={[StyleSheet.absoluteFill, styles.placeholder]}>
              <Cross size={cardW * 0.4} color="rgba(255, 219, 102, 0.18)" weight="thin" />
            </LinearGradient>
          )}
        </Animated.View>

        {/* Bottom fade so the title is readable */}
        {showTitle && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.85)']}
            locations={[0, 0.5, 1]}
            style={styles.fade}
          />
        )}

        {/* Title */}
        {showTitle && (
          <View style={styles.titleBox}>
            <CrossIcon size={44} color={colors.white} style={styles.titleIcon} />
            <Text
              style={[styles.title, { fontFamily: lang === 'ml' ? fonts.mlBold : fonts.enBold }]}
              numberOfLines={3}
            >
              {prayer.title[lang]}
            </Text>
          </View>
        )}

        {/* Heart */}
        <View style={styles.heart} pointerEvents="none">
          <Heart size={28} color={colors.gold} weight="fill" />
        </View>

        {/* Darken side cards */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.shade, shadeStyle]} pointerEvents="none" />

        {/* Gold border */}
        <View style={styles.border} pointerEvents="none" />
      </View>
    </Animated.View>
  );
}

// ─── Dot ─────────────────────────────────────────────────────────────────
function Dot({ index, count, pos, idle, active }: { index: number; count: number; pos: SharedValue<number>; idle: string; active: string }) {
  const style = useAnimatedStyle(() => {
    const a = Math.min(1, Math.abs(relative(index, pos.value, count)));
    return {
      width: interpolate(a, [0, 1], [22, 8]),
      backgroundColor: interpolateColor(a, [0, 1], [active, idle]),
    };
  }, [index, count, idle, active]);
  return <Animated.View style={[styles.dot, style]} />;
}

const RADIUS = 15;

const styles = StyleSheet.create({
  cardOuter: {
    position: 'absolute',
    borderRadius: RADIUS,
    boxShadow: '0px 18px 32px rgba(0, 0, 0, 0.28)',
  },
  cardInner: {
    flex: 1,
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: '#2A0306',
  },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%' },
  titleBox: { position: 'absolute', left: 28, right: 28, bottom: 30 },
  titleIcon: { marginBottom: 10 },
  title: { color: colors.white, fontSize: 26, lineHeight: 34 },
  heart: { position: 'absolute', top: 20, right: 20 },
  shade: { backgroundColor: '#000' },
  border: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 102, 0.7)',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 },
  dot: { height: 8, borderRadius: 4 },
  toast: {
    position: 'absolute',
    left: 32,
    right: 32,
    bottom: 28,
    backgroundColor: colors.gold,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toastText: { color: colors.redDark, fontFamily: fonts.enBold, textAlign: 'center' },
});
