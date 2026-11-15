// Small arrow at the screen edge: shows there are more slides and moves one slide.
import { Pressable, StyleSheet } from 'react-native';
import { CaretLeft, CaretRight } from 'phosphor-react-native';

export default function EdgeNavArrow({ direction, onPress }: { direction: 'left' | 'right'; onPress: () => void }) {
  const left = direction === 'left';
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.wrapper, left ? { left: 4 } : { right: 4 }]}>
      {left ? <CaretLeft size={24} color="#999999" /> : <CaretRight size={24} color="#999999" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
