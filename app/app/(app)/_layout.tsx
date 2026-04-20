/**
 * Authenticated area layout — the guard that protects all screens under (app)/.
 *
 * If the user is not signed in, redirects to /welcome. If signed in but
 * Trinity is incomplete, redirects to the right Trinity step.
 */

import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/state';

export default function AppLayout() {
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);

  // While the session is loading, render nothing (splash already shows).
  if (loading) return null;

  if (!user) return <Redirect href="/welcome" />;

  const { bvn, nin, liveness } = user.trinity;
  const trinityDone = bvn === 'verified' && nin === 'verified' && liveness === 'verified';

  if (!trinityDone) {
    if (bvn !== 'verified') return <Redirect href="/auth/trinity/bvn" />;
    if (nin !== 'verified') return <Redirect href="/auth/trinity/nin" />;
    return <Redirect href="/auth/trinity/liveness" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
