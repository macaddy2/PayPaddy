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
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/state';

export default function RootLayout() {
  const loadMe = useAuth((s) => s.loadMe);

  // On app start, check if a session exists in the mock store.
  // With a real backend this would read a stored JWT from SecureStore.
  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
