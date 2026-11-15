import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, Ticket, Quotes, FadersIcon } from 'phosphor-react-native';
import { colors, fonts } from '../../theme';
import { usePalette } from '../../hooks/usePalette';
import { useExtras } from '../../context/ExtrasContext';

// Take the tab bar's prop types straight from Expo Router, so they always match
type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];


const TABS: Record<string, { label: string; icon: (c: string) => React.ReactNode }> = {
  index: { label: 'Home',     icon: c => <House size={22} color={c} /> },
  book:  { label: 'Book Now', icon: c => <Ticket size={22} color={c} /> },
  manna: { label: 'Manna',    icon: c => <Quotes size={22} color={c} weight="bold" /> },
  settings: { label: 'Settings', icon: c => <FadersIcon size={22} color={c} /> },
};

function RedTabBar({ state, emitter, navigateToTab, showBook }: TabBarProps & { showBook: boolean }) {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  // Fill the space behind the bar's rounded corners with the page colour
  const behind = palette.background;
  return (
    <View style={{ backgroundColor: behind }}>
    <View style={[styles.bar, { paddingBottom: insets.bottom + 6, backgroundColor: palette.red }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        if (route.name === 'book' && !showBook) return null; // shown/hidden from bookings.json
        const focused = state.index === index;
        const onPress = () => {
          const e = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigateToTab(route.key);
        };
        return (
          <Pressable key={route.key} onPress={onPress} style={styles.item}>
            <View style={[styles.pill, focused && styles.pillActive]}>{tab.icon(focused ? colors.redDark : colors.white)}</View>
            <Text style={styles.label}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
    </View>
  );
}

export default function TabsLayout() {
  const palette = usePalette();
  const showBook = useExtras().bookings.showTab;
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: palette.background } }}
      tabBar={props => <RedTabBar {...props} showBook={showBook} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="book" options={showBook ? undefined : { href: null }} />
      <Tabs.Screen name="manna" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.red,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  item: { flex: 1, alignItems: 'center' },
  pill: {
    width: 64,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden', // keep the corners rounded on Android when the colour changes
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: colors.activePill },
  label: { color: colors.white, fontFamily: fonts.enBold, fontSize: 12, marginTop: 3 },
});