import { Redirect } from 'expo-router';
import { useAuth } from '../src/auth/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBFAF7' }}>
        <ActivityIndicator size="large" color="#1E6FD9" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/landing" />;
  }

  if (!user.onboardingComplete) {
    return <Redirect href="/(onboarding)/archetype" />;
  }

  return <Redirect href="/(app)/designs" />;
}
