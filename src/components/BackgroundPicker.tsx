// Bottom sheet for choosing the Manna card background:
// slide left/right through the built-in images, or upload your own photo.
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckIcon, MagicWandIcon, MinusIcon, PlusIcon } from 'phosphor-react-native';
import { useApp } from '../context/AppContext';
import { useMannaBackground, type BgOption, type TextAlign, type TextPosition } from '../context/MannaBackgroundContext';
import { usePalette } from '../hooks/usePalette';
import { colors, fonts } from '../theme';

const THUMB_W = 96;
const THUMB_H = THUMB_W * (16 / 9);

const TEXT = {
  // Everything in this panel stays in English in both languages
  title: { ml: 'Background', en: 'Background' },
  position: { ml: 'Text position', en: 'Text position' },
  size: { ml: 'Text size', en: 'Text size' },
  align: { ml: 'Text align', en: 'Text align' },
  auto: { ml: 'Auto', en: 'Auto' },
  mine: { ml: 'My photo', en: 'My photo' },
  // Buttons stay in English in both languages
  upload: { ml: 'Upload Image', en: 'Upload Image' },
  done: { ml: 'Done', en: 'Done' },
};

export default function BackgroundPicker({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { lang } = useApp();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const {
    options, selectedId, customUri, choose, pickOwn,
    textPosition, setTextPosition, textStep, changeTextStep, textAlign, setTextAlign,
  } = useMannaBackground();
  const ALIGNS: { key: TextAlign; label: string }[] = [
    { key: 'left', label: 'Left' },
    { key: 'center', label: 'Center' },
    { key: 'right', label: 'Right' },
  ];
  const POSITIONS: { key: TextPosition; label: string }[] = [
    { key: 'top', label: 'Top' },
    { key: 'center', label: 'Middle' },
    { key: 'bottom', label: 'Bottom' },
  ];
  const font = (bold?: boolean) => (bold ? fonts.enBold : fonts.en); // English font for the whole panel

  // The user's own photo appears right after "Auto" once they have one
  const items: BgOption[] = customUri
    ? [options[0], { id: 'custom', source: { uri: customUri } }, ...options.slice(1)]
    : options;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: palette.background, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.handle} />
        <Text style={[styles.title, { color: palette.text, fontFamily: font(true) }]}>{TEXT.title[lang]}</Text>

        {/* Slide left / right */}
        <FlatList
          data={items}
          horizontal
          keyExtractor={o => o.id}
          showsHorizontalScrollIndicator={false}
          snapToInterval={THUMB_W + 12}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          renderItem={({ item }) => {
            const selected = item.id === selectedId;
            return (
              <Pressable onPress={() => choose(item.id)} style={[styles.thumb, selected && styles.thumbSelected]}>
                {item.source ? (
                  <Image source={item.source} style={StyleSheet.absoluteFill} contentFit="cover" />
                ) : (
                  <LinearGradient colors={['#5A0A12', '#1E0205']} style={[StyleSheet.absoluteFill, styles.center]}>
                    <MagicWandIcon size={26} color={colors.gold} />
                  </LinearGradient>
                )}
                {(item.id === 'auto' || item.id === 'custom') && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.id === 'auto' ? TEXT.auto[lang] : TEXT.mine[lang]}</Text>
                  </View>
                )}
                {selected && (
                  <View style={styles.check}>
                    <CheckIcon size={16} color={colors.redDark} weight="bold" />
                  </View>
                )}
              </Pressable>
            );
          }}
        />

        {/* Text position */}
        <Text style={[styles.label, { color: palette.text, fontFamily: font(true) }]}>{TEXT.position[lang]}</Text>
        <View style={[styles.segment, { backgroundColor: palette.card }]}>
          {POSITIONS.map(p => {
            const on = p.key === textPosition;
            return (
              <Pressable key={p.key} onPress={() => setTextPosition(p.key)} style={[styles.segBtn, on && { backgroundColor: palette.red }]}>
                <Text style={[styles.segText, { color: on ? colors.white : palette.text }]}>{p.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Text align */}
        <Text style={[styles.label, { color: palette.text, fontFamily: font(true) }]}>{TEXT.align[lang]}</Text>
        <View style={[styles.segment, { backgroundColor: palette.card }]}>
          {ALIGNS.map(a => {
            const on = a.key === textAlign;
            return (
              <Pressable key={a.key} onPress={() => setTextAlign(a.key)} style={[styles.segBtn, on && { backgroundColor: palette.red }]}>
                <Text style={[styles.segText, { color: on ? colors.white : palette.text }]}>{a.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Text size */}
        <View style={styles.sizeRow}>
          <Text style={[styles.label, { color: palette.text, fontFamily: font(true), marginTop: 0 }]}>{TEXT.size[lang]}</Text>
          <View style={[styles.stepper, { backgroundColor: palette.card }]}>
            <Pressable onPress={() => changeTextStep(-1)} hitSlop={10} style={styles.stepBtn}>
              <MinusIcon size={20} color={palette.text} weight="bold" />
            </Pressable>
            <Text style={[styles.stepValue, { color: palette.text }]}>{textStep > 0 ? `+${textStep}` : textStep}</Text>
            <Pressable onPress={() => changeTextStep(1)} hitSlop={10} style={styles.stepBtn}>
              <PlusIcon size={20} color={palette.text} weight="bold" />
            </Pressable>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Pressable onPress={pickOwn} style={[styles.btn, { backgroundColor: colors.activePill }]}>
            <Text style={[styles.btnText, { color: colors.redDark, fontFamily: fonts.enBold }]}>{TEXT.upload[lang]}</Text>
          </Pressable>
          <Pressable onPress={onClose} style={[styles.btn, { backgroundColor: palette.red }]}>
            <Text style={[styles.btnText, { color: colors.white, fontFamily: fonts.enBold }]}>{TEXT.done[lang]}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10 },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#C9C9C9', marginBottom: 12 },
  title: { fontSize: 18, paddingHorizontal: 20, marginBottom: 14 },
  thumb: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: '#2A0306',
  },
  thumbSelected: { borderColor: colors.gold },
  center: { alignItems: 'center', justifyContent: 'center' },
  tag: {
    position: 'absolute', left: 6, right: 6, bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingVertical: 3,
  },
  tagText: { color: '#fff', fontSize: 11, textAlign: 'center', fontFamily: fonts.enBold },
  check: {
    position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 15, paddingHorizontal: 20, marginTop: 22, marginBottom: 10 },
  segment: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 14, padding: 4 },
  segBtn: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segText: { fontFamily: fonts.enBold, fontSize: 14 },
  sizeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingRight: 20 },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 6, height: 44 },
  stepBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontFamily: fonts.enBold, fontSize: 15, minWidth: 28, textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 24 },
  btn: {
    flex: 1, flexDirection: 'row', gap: 8, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontSize: 15 },
});
