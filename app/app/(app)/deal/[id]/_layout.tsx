/**
 * Deal detail stack — wraps the deal room and all sub-screens for a deal
 * (fund flow, complete, receipt, dispute).
 */

import { Stack } from 'expo-router';

export default function DealDetailLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
