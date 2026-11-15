import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowsDownUpIcon, CheckIcon, MagnifyingGlassIcon, XIcon } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useMenu } from '../context/MenuContext';
import PrayerList from './PrayerList';
import { usePalette } from '../hooks/usePalette';
import { colors, fonts } from '../theme';

const MENU_WIDTH = 285;

export default function MenuDrawer() {
  const { open, closeMenu } = useMenu();
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const [visible, setVisible] = useState(false);
  const [reorder, setReorder] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const closeSearch = () => {
    setQuery('');
    setSearching(false);
  };
  const progress = useRef(new Animated.Value(0)).current;
  const afterClose = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (visible) {
      Animated.timing(progress, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        setReorder(false);
        closeSearch();
        afterClose.current?.();
        afterClose.current = null;
      });
    }
  }, [open]);

  // Close the drawer, then (optionally) go somewhere
  const closeThen = (fn?: () => void) => {
    afterClose.current = fn ?? null;
    closeMenu();
  };

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-MENU_WIDTH, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => closeThen()}
    >
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        {/* Dimmed background — tap to close */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: progress }]}>
          <Pressable style={{ flex: 1 }} onPress={() => closeThen()} />
        </Animated.View>

        {/* Sliding panel */}
        <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
          <LinearGradient colors={[palette.red, palette.redDeep]} style={{ flex: 1 }}>
            <ScrollView
              scrollEnabled={!dragging}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
              ]}
            >
              {/* Two icons: Search and Sort. Each opens its own feature. */}
              {!searching && !reorder && (
                <View style={styles.tools}>
                  <Pressable onPress={() => setSearching(true)} style={styles.toolBtn} hitSlop={6}>
                    <MagnifyingGlassIcon size={20} color={colors.gold} weight="bold" />
                  </Pressable>
                  <Pressable onPress={() => setReorder(true)} style={styles.toolBtn} hitSlop={6}>
                    <ArrowsDownUpIcon size={20} color={colors.gold} weight="bold" />
                  </Pressable>
                </View>
              )}

              {/* Search */}
              {searching && (
                <View style={styles.search}>
                  <MagnifyingGlassIcon size={18} color={colors.gold} />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search prayers"
                    placeholderTextColor="rgba(255, 219, 102, 0.6)"
                    style={styles.searchInput}
                    autoCorrect={false}
                    autoFocus
                    returnKeyType="search"
                  />
                  <Pressable onPress={closeSearch} hitSlop={10}>
                    <XIcon size={16} color={colors.gold} weight="bold" />
                  </Pressable>
                </View>
              )}

              {/* Sort: drag mode, with Done to finish */}
              {reorder && (
                <View style={styles.tools}>
                  <Text style={styles.hint}>Drag ⋮⋮ to reorder</Text>
                  <Pressable onPress={() => setReorder(false)} style={styles.doneBtn} hitSlop={6}>
                    <CheckIcon size={16} color={colors.redDark} weight="bold" />
                    <Text style={styles.doneText}>Done</Text>
                  </Pressable>
                </View>
              )}

              <PrayerList reorder={reorder} query={query} onDragChange={setDragging} onSelect={id => closeThen(() => router.push(`/prayer/${id}`))} />
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: MENU_WIDTH,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
  },
  content: { paddingHorizontal: 20 },
  divider: { height: 24 },
  reorderBtn: {
    alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: 'rgba(255, 219, 102, 0.18)', marginBottom: 6,
  },
  // marginRight -8 lines the sort icon up with the hearts below (40px button vs 24px heart)
  tools: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginBottom: 10, marginRight: -8 },
  toolBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255, 219, 102, 0.14)',
  },
  hint: { flex: 1, color: colors.gold, opacity: 0.8, fontFamily: fonts.en, fontSize: 13 },
  doneBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 14,
    borderRadius: 18, backgroundColor: colors.gold,
  },
  doneText: { color: colors.redDark, fontFamily: fonts.enBold, fontSize: 14 },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, borderRadius: 22,
    paddingHorizontal: 14, backgroundColor: 'rgba(255, 219, 102, 0.14)', marginBottom: 12,
  },
  searchInput: { flex: 1, color: colors.gold, fontFamily: fonts.en, fontSize: 15, paddingVertical: 0 },
  reorderText: { color: colors.gold, fontFamily: fonts.enBold, fontSize: 13 },
});
