/**
 * Root layout — wraps the entire expo-router tree.
 *
 * Responsibilities:
 *   1. Provide the SafeAreaProvider required by react-native-safe-area-context.
 *   2. Restore the auth session on cold launch (calls `useAuth.loadMe`).
 *   3. Render the slot (child routes) once the session check is done.
 */

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/state';

export default function RootLayout() {
  const loadMe = useAuth((s) => s.loadMe);

  // On app start, check if a session exists in the mock store.
  // With a real backend this would read a stored JWT from SecureStore.
  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const id = 'paypaddy-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700;800&family=Manrope:wght@400;500;600;700;800;900&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
