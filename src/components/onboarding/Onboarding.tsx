// First launch flow: language choice → app tour → the app.
// While saved settings are still loading, a plain red cover (same as the splash) avoids a flash of Home.
import { View } from 'react-native';
import { useApp } from '../../context/AppContext';
import { palettes } from '../../theme';
import LanguagePicker from './LanguagePicker';
import AppTour from './AppTour';

export default function Onboarding() {
  const { ready, welcomed, toured } = useApp();

  if (!ready) {
    return (
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, backgroundColor: palettes.light.red }}
      />
    );
  }
  if (!welcomed) return <LanguagePicker />;
  if (!toured) return <AppTour />;
  return null;
}
