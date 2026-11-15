// Styled text for rosary content: plain text, or segments marked bold / subtitle / highlight.
import { Text, type StyleProp, type TextStyle } from 'react-native';
import type { Rich } from '../../data/rosary';
import { useApp } from '../../context/AppContext';
import { usePalette } from '../../hooks/usePalette';
import { fonts } from '../../theme';

type Props = { content: Rich; style?: StyleProp<TextStyle>; highlightColor?: string };

export default function RichText({ content, style, highlightColor }: Props) {
  const { lang, fontSize } = useApp();
  const palette = usePalette();
  const isMl = lang === 'ml';
  if (typeof content === 'string') return <Text style={style}>{content}</Text>;

  return (
    <Text style={style}>
      {content.map((s, i) => {
        const seg: TextStyle = {
          ...(s.highlight ? { color: highlightColor ?? palette.red } : null),
          ...(s.bold || s.subtitle ? { fontFamily: isMl ? fonts.mlBold : fonts.enBold } : null),
          ...(s.subtitle ? { fontSize: fontSize(18), color: palette.text } : null),
        };
        return <Text key={i} style={seg}>{s.text}</Text>;
      })}
    </Text>
  );
}
