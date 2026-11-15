// Rosary landing: the 4 mysteries as tiles (same as Kontha's home grid).
// Today's mystery is highlighted in gold so the user knows which one to pray.
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRosary } from '../context/RosaryContext';
import { todaysMysteryId } from '../data/rosary';
import { useApp } from '../context/AppContext';
import { usePalette } from '../hooks/usePalette';
import { colors, fonts } from '../theme';

const ICON_SIZE = 90;

export default function RosaryLanding() {
  const { rosary, imageUri } = useRosary();
  const { lang, fontSize } = useApp();
  const palette = usePalette();
  const todayId = todaysMysteryId(rosary.mysteries);
  const isMl = lang === 'ml';

  return (
    <View style={styles.grid}>
      {rosary.mysteries.map(m => {
        const isToday = m.id === todayId;
        return (
          <Pressable
            key={m.id}
            onPress={() => router.push(`/rosary/${m.id}`)}
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: isToday ? colors.gold : palette.card, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Image
              source={m.icon ? imageUri(m.icon) : undefined}
              style={styles.icon}
              contentFit="cover"
              transition={200}
            />
            <Text
              style={[
                styles.name,
                {
                  color: isToday ? colors.redDark : palette.text,
                  fontFamily: isMl ? fonts.mlBold : fonts.enBold,
                  fontSize: fontSize(isMl ? 15 : 13),
                  lineHeight: fontSize(isMl ? 15 : 13) * 1.35,
                },
              ]}
            >
              {m.name[lang]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    marginTop: 4,
  },
  tile: {
    flexBasis: '47%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
  },
  name: {
    textAlign: 'center',
  },
});
