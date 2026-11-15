// List of verses the user saved with the heart (opens from the Manna screen).
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeartIcon, XIcon } from 'phosphor-react-native';
import type { Verse } from '../data/verses';
import { useApp } from '../context/AppContext';
import { useVerses } from '../context/VersesContext';
import { usePalette } from '../hooks/usePalette';
import { colors, fonts } from '../theme';

const TEXT = {
  // Titles and messages stay in English; only the verses follow the language
  title: { ml: 'Saved Verses', en: 'Saved Verses' },
  empty: {
    ml: 'Tap ♥ on a verse to save it here.',
    en: 'Tap ♥ on a verse to save it here.',
  },
};

type Props = { visible: boolean; onClose: () => void; onOpen: (v: Verse) => void };

export default function SavedVerses({ visible, onClose, onOpen }: Props) {
  const { lang } = useApp();
  const { saved, toggleSaved } = useVerses();
  const palette = usePalette();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.screen, { backgroundColor: palette.background, paddingTop: insets.top + 16 }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text, fontFamily: fonts.enBold }]}>
            {TEXT.title[lang]}
          </Text>
          <Pressable onPress={onClose} style={styles.close} hitSlop={8}>
            <XIcon size={24} color={colors.redDark} weight="bold" />
          </Pressable>
        </View>

        <FlatList
          data={saved}
          keyExtractor={v => v.id}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 12 }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: palette.intro }]}>{TEXT.empty[lang]}</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onOpen(item)}
              style={[styles.row, { backgroundColor: palette.card }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.ref, { color: palette.red }]}>{item.ref[lang]}</Text>
                <Text numberOfLines={2} style={[styles.text, { color: palette.text }]}>
                  {item.text[lang]}
                </Text>
              </View>
              <Pressable onPress={() => toggleSaved(item)} hitSlop={10}>
                <HeartIcon size={24} color={palette.red} weight="fill" />
              </Pressable>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  title: { fontSize: 22 },
  close: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.activePill, alignItems: 'center', justifyContent: 'center',
  },
  empty: { textAlign: 'center', marginTop: 60, fontFamily: fonts.en, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18 },
  ref: { fontFamily: fonts.enBold, fontSize: 13, marginBottom: 4 },
  text: { fontFamily: fonts.hand, fontSize: 17, lineHeight: 24 },
});
