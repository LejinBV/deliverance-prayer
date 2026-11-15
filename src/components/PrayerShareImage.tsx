// Square (1:1) copy of the prayer's banner image for sharing, using the same
// bannerFocus as the prayer page. Drawn off-screen and saved at 1080 × 1080.
import { useState, type Ref } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

export const SHARE_SQUARE = 360; // drawn at 360 × 360, saved at 1080 × 1080

type Props = {
  source: number | { uri: string };
  bannerFocus?: string; // e.g. '65%' — same as the prayer page
  onReady: () => void;
  ref?: Ref<any>;
};

export default function PrayerShareImage({ source, bannerFocus, onReady, ref }: Props) {
  const [ratio, setRatio] = useState<number | null>(null); // image height / width
  const S = SHARE_SQUARE;
  const imgH = Math.max(S, S * (ratio ?? 1287 / 900));
  const focus = Math.min(100, Math.max(0, parseFloat(bannerFocus ?? '0') || 0)) / 100;

  return (
    <View
      ref={ref}
      collapsable={false}
      pointerEvents="none"
      style={{ position: 'absolute', left: -10000, top: 0, width: S, height: S, overflow: 'hidden', backgroundColor: '#1E0205' }}
    >
      <Image
        source={source}
        style={{ position: 'absolute', left: 0, width: S, height: imgH, top: -(imgH - S) * focus }}
        contentFit="cover"
        onLoad={e => {
          const { width, height } = e.source;
          if (width && height) setRatio(height / width);
          setTimeout(onReady, 100); // let the new size paint
        }}
        onError={onReady}
      />
    </View>
  );
}
