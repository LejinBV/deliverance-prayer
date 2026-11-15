// Renders a prayer's content blocks, each styled by its nature.
import { StyleSheet, Text, View } from 'react-native';
import { QuotesIcon } from 'phosphor-react-native';
import type { Block, Lang } from '../data/prayers';
import { useApp } from '../context/AppContext';
import { usePalette } from '../hooks/usePalette';
import { fonts } from '../theme';

const paragraphs = (s: string) => s.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

export default function PrayerBlocks({ blocks, lang }: { blocks: Block[]; lang: Lang }) {
  const { fontSize } = useApp();
  const palette = usePalette();
  const isMl = lang === 'ml';
  const body = fontSize(isMl ? 18 : 17);
  const bodyFont = isMl ? fonts.ml : fonts.en;
  const boldFont = isMl ? fonts.mlBold : fonts.enBold;

  return (
    <View>
      {blocks.map((b, i) => {
        switch (b.type) {
          // Normal prayer text
          case 'text':
            if (!b.text[lang]) return null;
            return paragraphs(b.text[lang]).map((p, j) => (
              <Text
                key={`${i}-${j}`}
                selectable
                style={{ color: palette.text, fontFamily: bodyFont, fontSize: body, lineHeight: body * 1.75, marginBottom: body }}
              >
                {p}
              </Text>
            ));

          // Guidance in italics
          case 'instruction':
            if (!b.text[lang]) return null;
            return (
              <Text
                key={i}
                style={[styles.instruction, { color: palette.intro, fontFamily: bodyFont, fontSize: fontSize(15), lineHeight: fontSize(15) * 1.6 }]}
              >
                {b.text[lang]}
              </Text>
            );

          // Small section title
          case 'heading':
            if (!b.text[lang]) return null;
            return (
              <Text key={i} style={[styles.heading, { color: palette.red, fontFamily: boldFont, fontSize: fontSize(17) }]}>
                {b.text[lang]}
              </Text>
            );

          // Bulleted invocations, each followed by the response
          case 'litany':
            return (
              <View key={i} style={styles.litany}>
                {b.items.map((item, j) =>
                  item[lang] ? (
                    <View key={j} style={styles.litanyRow}>
                      <View style={[styles.bullet, { backgroundColor: palette.red, marginTop: body * 0.62 }]} />
                      <View style={{ flex: 1 }}>
                        <Text selectable style={{ color: palette.text, fontFamily: bodyFont, fontSize: body, lineHeight: body * 1.6 }}>
                          {item[lang]}
                        </Text>
                        {b.response?.[lang] ? (
                          <Text style={[styles.response, { color: palette.red, fontFamily: bodyFont, fontSize: fontSize(15) }]}>
                            {b.response[lang]}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  ) : null
                )}
              </View>
            );

          // Bible verse: big quotation mark, like the Manna card
          case 'verse':
            if (!b.text[lang]) return null;
            return (
              <View key={i} style={[styles.verse, { backgroundColor: palette.card }]}>
                <QuotesIcon size={44} color={palette.red} weight="fill" />
                <Text
                  selectable
                  style={{ color: palette.text, fontFamily: fonts.hand, fontSize: fontSize(21), lineHeight: fontSize(21) * 1.5, marginTop: 10 }}
                >
                  {b.text[lang]}
                </Text>
                {b.ref?.[lang] ? (
                  <Text style={[styles.verseRef, { color: palette.red, fontFamily: fonts.hand, fontSize: fontSize(17) }]}>
                    — {b.ref[lang]}
                  </Text>
                ) : null}
              </View>
            );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  instruction: { fontStyle: 'italic', marginBottom: 18 },
  heading: { marginTop: 8, marginBottom: 12, letterSpacing: 0.3 },
  litany: { marginBottom: 18, gap: 12 },
  litanyRow: { flexDirection: 'row', gap: 12 },
  bullet: { width: 7, height: 7, borderRadius: 4 },
  response: { fontStyle: 'italic', marginTop: 2 },
  verse: { borderRadius: 20, padding: 20, marginVertical: 12 },
  verseRef: { marginTop: 10 },
});
