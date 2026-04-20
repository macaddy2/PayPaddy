/**
 * Trinity sub-stack layout.
 * Slides forward through BVN → NIN → Liveness → Success.
 */

import { Stack } from 'expo-router';

export default function TrinityLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
