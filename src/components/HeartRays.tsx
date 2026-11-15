import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Path, Circle } from 'react-native-svg';

type Props = {
  width: number;
  height: number;
  originX: number;
  originY: number;
  length: number;
  intensity?: number; // 0–1, overall strength
  sparks?: number;    // number of sparks
};

type Ray = { a: number; w: number; o: number; color: string };

// Angles: 90 = straight down, >90 = down-left, <90 = down-right
const RED = '#E23B52';
const PINK = '#F27D8E';
const BLUE = '#A9D8F0';
const PALE = '#DDF1FB';

// Bright inner-core colour for each ray colour
const CORE: Record<string, string> = {
  [RED]: '#FF9AA8',
  [PINK]: '#FFD0D7',
  [BLUE]: '#E6F6FD',
  [PALE]: '#FFFFFF',
};

const RAYS: Ray[] = [
  // Blood (red) — down-left
  { a: 96, w: 2.6, o: 0.6, color: PINK },
  { a: 100, w: 3.4, o: 0.8, color: RED },
  { a: 105, w: 2.4, o: 0.6, color: PINK },
  { a: 109, w: 3.8, o: 0.85, color: RED },
  { a: 114, w: 2.8, o: 0.65, color: PINK },
  { a: 118, w: 3.4, o: 0.75, color: RED },
  { a: 123, w: 2.4, o: 0.55, color: PINK },
  { a: 128, w: 3.0, o: 0.6, color: RED },
  { a: 133, w: 2.2, o: 0.45, color: PINK },
  // Water (pale blue) — down-right
  { a: 47, w: 2.2, o: 0.45, color: BLUE },
  { a: 52, w: 3.0, o: 0.6, color: PALE },
  { a: 57, w: 2.4, o: 0.55, color: BLUE },
  { a: 62, w: 3.4, o: 0.75, color: PALE },
  { a: 66, w: 2.8, o: 0.65, color: BLUE },
  { a: 71, w: 3.8, o: 0.85, color: PALE },
  { a: 75, w: 2.4, o: 0.6, color: BLUE },
  { a: 80, w: 3.4, o: 0.8, color: PALE },
  { a: 85, w: 2.6, o: 0.6, color: BLUE },
];

// Rays are drawn in a few groups (one layer each) instead of one layer per ray.
// Far fewer animated layers = much lighter on the phone.
const GROUPS = 4;
const RAY_GROUPS = Array.from({ length: GROUPS }, (_, g) =>
  RAYS.map((r, i) => ({ ...r, i })).filter(r => r.i % GROUPS === g)
);
const COLORS = [RED, PINK, BLUE, PALE];

const rad = (d: number) => (d * Math.PI) / 180;
const rand = (min: number, max: number) => min + Math.random() * (max - min);

function rayPath(ox: number, oy: number, L: number, angle: number, halfWidth: number) {
  const x1 = ox + L * Math.cos(rad(angle - halfWidth));
  const y1 = oy + L * Math.sin(rad(angle - halfWidth));
  const x2 = ox + L * Math.cos(rad(angle + halfWidth));
  const y2 = oy + L * Math.sin(rad(angle + halfWidth));
  return `M${ox},${oy} L${x1},${y1} L${x2},${y2} Z`;
}

// Radial fade from the heart — every ray fades at its tip, whatever its angle
function RayFade({ id, color, ox, oy, L }: { id: string; color: string; ox: number; oy: number; L: number }) {
  return (
    <RadialGradient id={id} gradientUnits="userSpaceOnUse" cx={ox} cy={oy} r={L} fx={ox} fy={oy}>
      <Stop offset="0" stopColor={color} stopOpacity={0} />
      <Stop offset="0.06" stopColor={color} stopOpacity={0.95} />
      <Stop offset="0.4" stopColor={color} stopOpacity={0.5} />
      <Stop offset="0.75" stopColor={color} stopOpacity={0.12} />
      <Stop offset="1" stopColor={color} stopOpacity={0} />
    </RadialGradient>
  );
}

export default function HeartRays({
  width,
  height,
  originX,
  originY,
  length,
  intensity = 0.8,
  sparks = 10,
}: Props) {
  const origin = `${originX}px ${originY}px`;

  // Sway + flicker per ray group
  const rayAnims = useRef(
    RAY_GROUPS.map(() => ({
      sway: new Animated.Value(0),
      flicker: new Animated.Value(0),
      swayAmp: rand(2, 5),
      swayDur: rand(2800, 5200),
      flickerDur: rand(250, 900),
      delay: rand(0, 2000),
    }))
  ).current;

  // Two energy surges, half a cycle apart
  const surges = useRef([new Animated.Value(0), new Animated.Value(0)]).current;

  // Sparks flying out along the rays
  const sparkAnims = useRef(
    Array.from({ length: sparks }, () => {
      const ray = RAYS[Math.floor(Math.random() * RAYS.length)];
      const angle = rad(ray.a + rand(-2, 2));
      const dist = length * rand(0.45, 0.85);
      return {
        t: new Animated.Value(0),
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: rand(2, 4.5),
        color: CORE[ray.color],
        dur: rand(1400, 2600),
        delay: rand(0, 2500),
      };
    })
  ).current;

  // Heart glow
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops: Animated.CompositeAnimation[] = [];

    rayAnims.forEach(an => {
      loops.push(
        Animated.sequence([
          Animated.delay(an.delay),
          Animated.loop(
            Animated.sequence([
              Animated.timing(an.sway, { toValue: 1, duration: an.swayDur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              Animated.timing(an.sway, { toValue: 0, duration: an.swayDur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ])
          ),
        ]),
        Animated.loop(
          Animated.sequence([
            Animated.timing(an.flicker, { toValue: 1, duration: an.flickerDur, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(an.flicker, { toValue: 0, duration: an.flickerDur * 1.4, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          ])
        )
      );
    });

    surges.forEach((s, i) => {
      loops.push(
        Animated.sequence([
          Animated.delay(i * 1100),
          Animated.loop(
            Animated.sequence([
              Animated.timing(s, { toValue: 1, duration: 1600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
              Animated.timing(s, { toValue: 0, duration: 0, useNativeDriver: true }),
              Animated.delay(600),
            ])
          ),
        ])
      );
    });

    sparkAnims.forEach(sp => {
      loops.push(
        Animated.loop(
          Animated.sequence([
            Animated.delay(sp.delay),
            Animated.timing(sp.t, { toValue: 1, duration: sp.dur, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(sp.t, { toValue: 0, duration: 0, useNativeDriver: true }),
          ])
        )
      );
    });

    loops.push(
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      )
    );

    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, []);

  const glowR = length * 0.14;

  return (
    <View pointerEvents="none" style={{ width, height }}>
      {/* 1. Rays — soft outer beam + bright inner core (grouped) */}
      {RAY_GROUPS.map((group, g) => {
        const an = rayAnims[g];
        const rotate = an.sway.interpolate({
          inputRange: [0, 1],
          outputRange: [`${-an.swayAmp}deg`, `${an.swayAmp}deg`],
        });
        const opacity = an.flicker.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

        return (
          <Animated.View
            key={`group-${g}`}
            style={[StyleSheet.absoluteFill, { transformOrigin: origin, opacity, transform: [{ rotate }] }]}
          >
            <Svg width={width} height={height}>
              <Defs>
                {COLORS.map(c => (
                  <RayFade key={`o${c}`} id={`outer-${g}-${c.slice(1)}`} color={c} ox={originX} oy={originY} L={length} />
                ))}
                {COLORS.map(c => (
                  <RayFade key={`c${c}`} id={`core-${g}-${c.slice(1)}`} color={CORE[c]} ox={originX} oy={originY} L={length * 0.9} />
                ))}
              </Defs>
              {group.map(r => {
                const outer = `url(#outer-${g}-${r.color.slice(1)})`;
                const core = `url(#core-${g}-${r.color.slice(1)})`;
                return [
                  // Wide, faint outer beam (soft edges)
                  <Path key={`w${r.i}`} d={rayPath(originX, originY, length, r.a, r.w * 2)} fill={outer} opacity={r.o * intensity * 0.35} />,
                  // Main beam
                  <Path key={`m${r.i}`} d={rayPath(originX, originY, length, r.a, r.w)} fill={outer} opacity={r.o * intensity} />,
                  // Bright thin core
                  <Path key={`c${r.i}`} d={rayPath(originX, originY, length * 0.9, r.a, r.w * 0.35)} fill={core} opacity={r.o * intensity} />,
                ];
              })}
            </Svg>
          </Animated.View>
        );
      })}

      {/* 2. Energy surges shooting outward */}
      {surges.map((s, si) => (
        <Animated.View
          key={`surge-${si}`}
          style={[
            StyleSheet.absoluteFill,
            {
              transformOrigin: origin,
              opacity: s.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.9, 0] }),
              transform: [{ scale: s.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.05] }) }],
            },
          ]}
        >
          <Svg width={width} height={height}>
            <Defs>
              <RayFade id={`surge-${si}`} color="#FFFFFF" ox={originX} oy={originY} L={length} />
            </Defs>
            {RAYS.map((r, i) => (
              <Path
                key={i}
                d={rayPath(originX, originY, length, r.a, r.w * 0.5)}
                fill={`url(#surge-${si})`}
                opacity={intensity}
              />
            ))}
          </Svg>
        </Animated.View>
      ))}

      {/* 3. Sparks */}
      {sparkAnims.map((sp, i) => (
        <Animated.View
          key={`spark-${i}`}
          style={{
            position: 'absolute',
            left: originX - sp.size / 2,
            top: originY - sp.size / 2,
            width: sp.size,
            height: sp.size,
            borderRadius: sp.size / 2,
            backgroundColor: sp.color,
            opacity: sp.t.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 0.8, 0] }),
            transform: [
              { translateX: sp.t.interpolate({ inputRange: [0, 1], outputRange: [0, sp.dx] }) },
              { translateY: sp.t.interpolate({ inputRange: [0, 1], outputRange: [0, sp.dy] }) },
              { scale: sp.t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] }) },
            ],
          }}
        />
      ))}

      {/* 4. Glowing light at the heart */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transformOrigin: origin,
            opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
            transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) }],
          },
        ]}
      >
        <Svg width={width} height={height}>
          <Defs>
            <RadialGradient
              id="heartGlow"
              gradientUnits="userSpaceOnUse"
              cx={originX}
              cy={originY}
              r={glowR}
              fx={originX}
              fy={originY}
            >
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
              <Stop offset="0.4" stopColor="#FFFFFF" stopOpacity={0} />
              <Stop offset="0.6" stopColor="#FFF4C8" stopOpacity={0.1} />
              <Stop offset="1" stopColor="#FFE7A3" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={originX} cy={originY} r={glowR} fill="url(#heartGlow)" />
        </Svg>
      </Animated.View>
    </View>
  );
}