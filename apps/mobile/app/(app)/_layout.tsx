import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="designs" />
      <Stack.Screen name="canvas/[designId]" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
