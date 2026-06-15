/**
 * Bottom tab navigator — Home / Deals / Agents / Me.
 *
 * Tab labels use the same emoji-first approach as the v2 prototype to avoid
 * an icon-font dependency in the MVP. Tab bar is styled with ink background
 * and lime active tint.
 */

import { Tabs } from 'expo-router';

import { colors, typography } from '@/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.ink,
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          paddingBottom: 6,
          height: 60,
        },
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.stone,
        tabBarLabelStyle: {
          fontSize: typography.caption.size,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: () => null }} />
      <Tabs.Screen name="commerce" options={{ title: 'Integrate', tabBarIcon: () => null }} />
      <Tabs.Screen name="deals" options={{ title: 'Deals', tabBarIcon: () => null }} />
      <Tabs.Screen name="agents" options={{ title: 'Agents', tabBarIcon: () => null }} />
      <Tabs.Screen name="settings" options={{ title: 'Me', tabBarIcon: () => null }} />
    </Tabs>
  );
}
