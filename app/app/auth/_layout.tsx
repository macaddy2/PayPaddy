/**
 * Auth stack layout.
 * All screens under /auth/ share a headerless stack navigator.
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
