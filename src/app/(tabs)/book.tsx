// Book Now: links to booking pages. The items, links and whether this tab shows
// all come from bookings.json on GitHub (see ExtrasContext).
// Web links open in the in-app browser; phone, email, WhatsApp etc. open their own app.
import { useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import {
  ArrowUpRightIcon, CalendarDotsIcon, CalendarIcon, ChurchIcon, EnvelopeSimpleIcon, HandsPrayingIcon,
  LinkIcon, ListIcon, MapPinIcon, PhoneIcon, WhatsappLogoIcon,
} from 'phosphor-react-native';
import type { Booking } from '../../data/bookings';
import { useExtras } from '../../context/ExtrasContext';
import { useMenu } from '../../context/MenuContext';
import { usePalette } from '../../hooks/usePalette';
import { colors, fonts } from '../../theme';

const ICONS = {
  mass: ChurchIcon,
  retreat: HandsPrayingIcon,
  schedule: CalendarDotsIcon,
  calendar: CalendarIcon,
  phone: PhoneIcon,
  whatsapp: WhatsappLogoIcon,
  email: EnvelopeSimpleIcon,
  location: MapPinIcon,
  link: LinkIcon,
};

export default function BookScreen() {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const { openMenu } = useMenu();
  const { bookings } = useExtras();
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = async (b: Booking) => {
    if (!b.url) {
      setMessage('Coming soon');
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(null), 1800);
      return;
    }
    if (/^https?:\/\//i.test(b.url) && !/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(b.url)) {
      await WebBrowser.openBrowserAsync(b.url, { toolbarColor: palette.red, controlsColor: colors.gold }).catch(() => {});
    } else {
      // tel:, mailto:, WhatsApp, maps… open in their own app
      await Linking.openURL(b.url).catch(() => {});
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={openMenu} style={styles.menuBtn} hitSlop={8}>
          <ListIcon size={28} color={colors.redDark} weight="bold" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {bookings.items.map(b => {
          const Icon = ICONS[b.icon];
          return (
            <Pressable
              key={b.id}
              onPress={() => open(b)}
              style={({ pressed }) => [styles.row, { backgroundColor: palette.card, opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={styles.iconCircle}>
                <Icon size={26} color={colors.redDark} />
              </View>
              <Text style={[styles.title, { color: palette.text }]}>{b.title}</Text>
              <ArrowUpRightIcon size={24} color={palette.text} />
            </Pressable>
          );
        })}
      </ScrollView>

      {message && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: 20 },
  menuBtn: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: colors.activePill, alignItems: 'center', justifyContent: 'center',
  },
  list: { padding: 20, paddingTop: 28, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 16 },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  title: { flex: 1, fontFamily: fonts.hand, fontSize: 21 },
  toast: {
    position: 'absolute', alignSelf: 'center', bottom: 24,
    backgroundColor: colors.gold, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 20,
  },
  toastText: { color: colors.redDark, fontFamily: fonts.enBold },
});
