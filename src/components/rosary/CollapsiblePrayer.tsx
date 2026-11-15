// A prayer box that shows its first words and opens to the full text (intro slide).
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CaretDown, CaretUp } from 'phosphor-react-native';
import { useApp } from '../../context/AppContext';
import { usePalette } from '../../hooks/usePalette';
import { fonts } from '../../theme';

export default function CollapsiblePrayer({ title, text }: { title: string; text: string }) {
  const [open, setOpen] = useState(false);
  const { lang, fontSize } = useApp();
  const palette = usePalette();
  const isMl = lang === 'ml';
  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderLeftColor: palette.red }]}>
      <Pressable onPress={() => setOpen(o => !o)} style={styles.header}>
        <Text style={[styles.title, { color: palette.text, fontFamily: isMl ? fonts.mlBold : fonts.enBold, fontSize: fontSize(15) }]}>
          {title}
        </Text>
        {open ? <CaretUp size={16} color={palette.intro} /> : <CaretDown size={16} color={palette.intro} />}
      </Pressable>
      {open && (
        <Text
          style={[
            styles.text,
            { color: palette.intro, fontFamily: isMl ? fonts.ml : fonts.en, fontSize: fontSize(15), lineHeight: fontSize(15) * 1.6 },
          ]}
        >
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderLeftWidth: 3, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, gap: 8 },
  title: { flex: 1 },
  text: { paddingHorizontal: 12, paddingBottom: 12 },
});
