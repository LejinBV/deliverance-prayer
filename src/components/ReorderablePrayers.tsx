// Drag-to-reorder list for the side menu: hold the grip (⋮⋮) on the right and drag up or down.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { DotsSixVerticalIcon } from 'phosphor-react-native';
import type { Prayer } from '../data/prayers';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme';

const LINE_HEIGHT = 1.25;

type Props = {
  prayers: Prayer[];
  onDragChange?: (dragging: boolean) => void; // lets the menu pause scrolling while dragging
};

export default function ReorderablePrayers({ prayers, onDragChange }: Props) {
  const { lang, fontSize, setOrder } = useApp();

  // Row heights (measured), the row being dragged, how far it moved, and where it would land
  const [heights, setHeights] = useState<number[]>([]);
  const tops = useSharedValue<number[]>([]);
  const sizes = useSharedValue<number[]>([]);
  const active = useSharedValue(-1);
  const dragY = useSharedValue(0);
  const target = useSharedValue(-1);

  const onRowLayout = (i: number, h: number) => {
    setHeights(prev => {
      if (prev[i] === h) return prev;
      const next = [...prev];
      next[i] = h;
      // cumulative tops for hit-testing on the UI thread
      let y = 0;
      tops.value = next.map(v => {
        const t = y;
        y += v ?? 0;
        return t;
      });
      sizes.value = next;
      return next;
    });
  };

  const commit = (from: number, to: number) => {
    if (from !== to && from >= 0 && to >= 0) {
      const ids = prayers.map(p => p.id);
      const [moved] = ids.splice(from, 1);
      ids.splice(to, 0, moved);
      setOrder(ids);
    }
    onDragChange?.(false);
  };

  const titleFont = lang === 'ml' ? fonts.ml : fonts.en;
  const size = fontSize(17);

  return (
    <View>
      {prayers.map((p, i) => (
        <Row
          key={p.id}
          index={i}
          count={prayers.length}
          title={p.title[lang]}
          titleStyle={{ fontFamily: titleFont, fontSize: size, lineHeight: size * LINE_HEIGHT }}
          active={active}
          dragY={dragY}
          target={target}
          tops={tops}
          sizes={sizes}
          onLayout={h => onRowLayout(i, h)}
          onStart={() => onDragChange?.(true)}
          onEnd={commit}
        />
      ))}
    </View>
  );
}

type RowProps = {
  index: number;
  count: number;
  title: string;
  titleStyle: object;
  active: SharedValue<number>;
  dragY: SharedValue<number>;
  target: SharedValue<number>;
  tops: SharedValue<number[]>;
  sizes: SharedValue<number[]>;
  onLayout: (h: number) => void;
  onStart: () => void;
  onEnd: (from: number, to: number) => void;
};

function Row({ index, count, title, titleStyle, active, dragY, target, tops, sizes, onLayout, onStart, onEnd }: RowProps) {
  const pan = usePanGesture({
    minDistance: 0,
    onActivate: () => {
      'worklet';
      active.value = index;
      target.value = index;
      dragY.value = 0;
      scheduleOnRN(onStart);
    },
    onUpdate: e => {
      'worklet';
      dragY.value = e.translationY;
      // Which slot is the middle of the dragged row over?
      const t = tops.value;
      const s = sizes.value;
      const mid = (t[index] ?? 0) + (s[index] ?? 0) / 2 + e.translationY;
      let k = 0;
      for (let j = 0; j < count; j++) {
        if (mid >= (t[j] ?? 0)) k = j;
      }
      target.value = k;
    },
    onDeactivate: () => {
      'worklet';
      const from = active.value;
      const to = target.value;
      active.value = -1;
      target.value = -1;
      dragY.value = 0;
      scheduleOnRN(onEnd, from, to);
    },
  });

  const style = useAnimatedStyle(() => {
    const a = active.value;
    if (a === index) {
      return {
        zIndex: 10,
        transform: [{ translateY: dragY.value }, { scale: 1.03 }],
        backgroundColor: 'rgba(0,0,0,0.18)',
        borderRadius: 12,
      };
    }
    let shift = 0;
    const h = sizes.value[a] ?? 0;
    const tg = target.value;
    if (a >= 0 && a < index && index <= tg) shift = -h;
    if (a >= 0 && tg <= index && index < a) shift = h;
    return {
      zIndex: 0,
      transform: [{ translateY: withTiming(shift, { duration: 150 }) }, { scale: 1 }],
      backgroundColor: 'transparent',
      borderRadius: 12,
    };
  });

  return (
    <Animated.View
      style={[styles.row, index < count - 1 && styles.divider, style]}
      onLayout={e => onLayout(e.nativeEvent.layout.height)}
    >
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      <GestureDetector gesture={pan}>
        <View style={styles.grip} hitSlop={10}>
          <DotsSixVerticalIcon size={26} color={colors.gold} weight="bold" />
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255, 219, 102, 0.3)' },
  title: { flex: 1, color: colors.gold },
  grip: { paddingLeft: 14, paddingVertical: 6 },
});
