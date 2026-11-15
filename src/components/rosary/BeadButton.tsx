// The round bead button (same as Kontha): each tap moves one bead.
// Our Father → 10 Hail Marys → Glory Be → arrow (finishes the decade and moves to the next slide).
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { ArrowRight, Cross } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { BEAD_SEQUENCE } from '../../data/rosary';
import { useApp } from '../../context/AppContext';
import { fonts } from '../../theme';

export const ARROW_INDEX = BEAD_SEQUENCE.length;
const SIZE = 64;

// Colour per prayer, same as Kontha
const STEP = { hailMary: 0, ourFather: 1, gloryBe: 2, arrow: 3 } as const;
const COLOURS = ['#F08A24', '#D6303A', '#34C759', '#0088FF'];

const stepFor = (i: number) => (i >= ARROW_INDEX ? STEP.arrow : STEP[BEAD_SEQUENCE[i].kind]);

type Props = {
  index: number;
  onChange: (next: number) => void;
  onDecadeComplete: () => void;
  bottom: number;
};

export default function BeadButton({ index, onChange, onDecadeComplete, bottom }: Props) {
  const { lang } = useApp();
  const progress = useRef(new Animated.Value(stepFor(index))).current;
  const isArrow = index >= ARROW_INDEX;
  const isGloryBe = !isArrow && BEAD_SEQUENCE[index].kind === 'gloryBe';

  useEffect(() => {
    Animated.timing(progress, { toValue: stepFor(index), duration: 200, useNativeDriver: false }).start();
  }, [index, progress]);

  const color = progress.interpolate({ inputRange: [0, 1, 2, 3], outputRange: COLOURS });

  const onPress = () => {
    if (isArrow) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onDecadeComplete();
      onChange(0);
      return;
    }
    const next = index + 1;
    const nextKind = BEAD_SEQUENCE[next]?.kind;
    Haptics.impactAsync(
      nextKind === 'ourFather' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    ).catch(() => {});
    onChange(next);
  };

  return (
    <Pressable onPress={onPress} style={[styles.position, { bottom }]}>
      <Animated.View style={[styles.bead, { backgroundColor: color, shadowColor: color }]}>
        {isArrow ? (
          <ArrowRight size={28} color="#FFFFFF" />
        ) : isGloryBe ? (
          <Cross size={28} color="#FFFFFF" />
        ) : (
          <Text style={[styles.label, { fontFamily: lang === 'ml' ? fonts.mlBold : fonts.enBold }]}>
            {BEAD_SEQUENCE[index].label[lang]}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  position: { position: 'absolute', right: 24 },
  bead: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  label: { color: '#FFFFFF', fontSize: 14, textAlign: 'center' },
});
