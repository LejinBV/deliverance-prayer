export const colors = {
  red: '#D10029',
  redDark: '#7A0008',
  redMuted: '#A5001C',
  activePill: '#FFDB66', // same gold as the language selector (colors.gold)
  gold: '#FFDB66',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#555555',
  card: '#F4F4F4',
};

export const fonts = {
  en: 'Poppins_400Regular',
  enBold: 'Poppins_600SemiBold',
  ml: 'Manjari_400Regular',
  mlBold: 'Manjari_700Bold',
  hand: 'Chilanka_400Regular',
};

// Light / dark colours for page backgrounds and text.
// Brand colours above (red, gold) stay the same in both modes.
export const palettes = {
  light: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    intro: '#333333',
    card: '#F4F4F4',
    dot: '#E3E3E3',
    red: '#D10029',      // arch, tab bar, menu
    redDeep: '#7A0008',  // bottom of the menu gradient
    redMuted: '#A5001C', // rows inside the menu
  },
  dark: {
    background: '#140A0B',
    text: '#F2ECEC',
    intro: '#E6DCDC',
    card: '#24171A',
    dot: '#4A3A3C',
    red: '#8E1626',      // softer red for dark mode
    redDeep: '#3E050C',
    redMuted: '#6A0E1A',
  },
};

export type Palette = typeof palettes.light;
