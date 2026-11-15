import { useApp } from '../context/AppContext';
import { palettes } from '../theme';

// Current light or dark colours
export function usePalette() {
  const { isDark } = useApp();
  return isDark ? palettes.dark : palettes.light;
}
