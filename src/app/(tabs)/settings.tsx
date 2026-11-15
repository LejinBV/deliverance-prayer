// Settings tab: language, font size, dark mode and About the App.
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsPanel from '../../components/SettingsPanel';
import { useApp } from '../../context/AppContext';
import { usePalette } from '../../hooks/usePalette';
import { fonts } from '../../theme';

const TITLE = { ml: 'Settings', en: 'Settings' }; // titles stay in English

export default function SettingsScreen() {
  const palette = usePalette();
  const { lang } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: palette.text, fontFamily: fonts.enBold }]}>
            {TITLE[lang]}
          </Text>
          <SettingsPanel />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 32, paddingTop: 40, paddingBottom: 48 },
  title: { fontSize: 28, marginBottom: 28 },
});
