// Calls onShake when the phone is shaken (two strong jolts within a short time).
// Only listens while `enabled` is true and the screen is in focus.
import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { Accelerometer } from 'expo-sensors';

const THRESHOLD = 1.3;   // how hard the jolt must be (in g, above normal gravity)
const WINDOW_MS = 800;   // two jolts within this time = a shake
const COOLDOWN_MS = 1500; // ignore further shakes for a moment after one

export function useShake(onShake: () => void, enabled = true) {
  const latest = useRef(onShake);
  latest.current = onShake;

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      let lastJolt = 0;
      let lastShake = 0;
      Accelerometer.setUpdateInterval(100);
      const sub = Accelerometer.addListener(({ x, y, z }) => {
        const force = Math.abs(Math.sqrt(x * x + y * y + z * z) - 1);
        if (force < THRESHOLD) return;
        const now = Date.now();
        if (now - lastShake < COOLDOWN_MS) return;
        if (now - lastJolt < WINDOW_MS) {
          lastShake = now;
          lastJolt = 0;
          latest.current();
        } else {
          lastJolt = now;
        }
      });
      return () => sub.remove();
    }, [enabled])
  );
}
