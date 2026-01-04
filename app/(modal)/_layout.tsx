/**
 * Modal Group Layout
 * Wraps modal screens with shared config
 */

import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen
        name="cart"
        options={{
          title: 'Your Cart',
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
}
