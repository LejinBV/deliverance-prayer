// Thin segmented strip: intro + 5 decades + closing = 7 segments.
import { StyleSheet, View } from 'react-native';
import { usePalette } from '../../hooks/usePalette';
import { colors } from '../../theme';

const TOTAL = 7;

export default function ProgressBar({ current }: { current: number }) {
  const palette = usePalette();
  return (
    <View style={styles.row}>
      {Array.from({ length: TOTAL }, (_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            { backgroundColor: i < current ? colors.gold : i === current ? palette.red : palette.dot },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, paddingHorizontal: 16, paddingVertical: 8 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
});
