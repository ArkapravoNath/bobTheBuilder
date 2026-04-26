import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="archetype" />
      <Stack.Screen name="location" />
      <Stack.Screen name="details" />
    </Stack>
  );
}
