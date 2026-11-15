import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Manjari_400Regular, Manjari_700Bold } from '@expo-google-fonts/manjari';
import { Chilanka_400Regular } from '@expo-google-fonts/chilanka';
import { AppProvider } from '../context/AppContext';
import { MenuProvider } from '../context/MenuContext';
import { PrayersProvider } from '../context/PrayersContext';
import { VersesProvider } from '../context/VersesContext';
import { RosaryProvider } from '../context/RosaryContext';
import { ExtrasProvider } from '../context/ExtrasContext';
import { MannaBackgroundProvider } from '../context/MannaBackgroundContext';
import MenuDrawer from '../components/MenuDrawer';
import { usePalette } from '../hooks/usePalette';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Manjari_400Regular,
    Manjari_700Bold,
    Chilanka_400Regular,
  });

  useEffect(() => {
    if (loaded || fontError) SplashScreen.hideAsync();
    if (fontError) console.log('Font error:', fontError);
  }, [loaded, fontError]);

  if (!loaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <AppProvider>
    <PrayersProvider>
    <VersesProvider>
    <RosaryProvider>
    <ExtrasProvider>
    <MannaBackgroundProvider>
      <MenuProvider>
        <AppStack />
        <MenuDrawer />
      </MenuProvider>
    </MannaBackgroundProvider>
    </ExtrasProvider>
    </RosaryProvider>
    </VersesProvider>
    </PrayersProvider>
    </AppProvider>
    </GestureHandlerRootView>
  );
}

// Screens, with the page background following light/dark mode
function AppStack() {
  const palette = usePalette();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="prayer/[id]" />
      <Stack.Screen name="rosary/[id]" />
    </Stack>
  );
}
