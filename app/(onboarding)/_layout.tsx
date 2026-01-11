/**
 * Onboarding Group Layout
 * Wraps walkthrough screens
 */

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen
        name="walkthrough"
        options={{
          title: 'Walkthrough',
        }}
      />
    </Stack>
  );
}
