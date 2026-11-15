import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle, Path } from 'react-native-svg';

type Props = {
  size: number;
  color?: string;
  rays?: number;
  showRays?: boolean;
};

export default function DivineHalo({ size, color = '#FFE7A3', rays = 28, showRays = true }: Props) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 60000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    if (showRays) spinLoop.start();
    pulseLoop.start();
    return () => {
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, [showRays]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.06] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] });

  const c = size / 2;
  const R = size / 2;
  const half = (Math.PI / rays) * 0.45;
  const raysPath = Array.from({ length: rays }, (_, i) => {
    const a = (i * 2 * Math.PI) / rays;
    const x1 = c + R * Math.cos(a - half);
    const y1 = c + R * Math.sin(a - half);
    const x2 = c + R * Math.cos(a + half);
    const y2 = c + R * Math.sin(a + half);
    return `M${c},${c} L${x1},${y1} L${x2},${y2} Z`;
  }).join(' ');

  return (
    <View pointerEvents="none" style={{ width: size, height: size }}>
      {/* Rotating rays (optional) */}
      {showRays && (
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id="rayGrad" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={color} stopOpacity={0.6} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Path d={raysPath} fill="url(#rayGrad)" />
          </Svg>
        </Animated.View>
      )}

      {/* Breathing glow */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity, transform: [{ scale }] }]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={color} stopOpacity={0.9} />
              <Stop offset="0.45" stopColor={color} stopOpacity={0.35} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={c} cy={c} r={R} fill="url(#glowGrad)" />
        </Svg>
      </Animated.View>
    </View>
  );
}