import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/AuthContext';
import { BuddyButton } from '../../src/components/BuddyButton';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/landing');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logoPill}>
          <Text style={styles.logoText}>BUILD BUDDY</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.icon}>✉️</Text>
          <Text style={styles.headline}>Verify your email</Text>
          <Text style={styles.sub}>
            We've sent a verification email to{'\n'}
            <Text style={styles.email}>{user?.email}</Text>
          </Text>
          <Text style={styles.instructions}>
            Click the link in the email to verify your account, then return here to continue.
          </Text>
        </View>

        <View style={styles.actions}>
          <BuddyButton
            label="I've verified my email"
            onPress={() => router.replace('/')}
            variant="primary"
            fullWidth
          />
          <View style={{ height: 12 }} />
          <BuddyButton
            label="Resend verification email"
            onPress={() => {}}
            variant="secondary"
            fullWidth
          />
        </View>

        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn} accessibilityRole="button">
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FBFAF7' },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 24, paddingBottom: 40 },
  logoPill: {
    backgroundColor: '#2A2825', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, marginBottom: 24,
  },
  logoText: { color: '#FBFAF7', fontSize: 11, fontWeight: '700', letterSpacing: 3 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 48 },
  icon: { fontSize: 64, marginBottom: 24 },
  headline: { fontSize: 30, fontWeight: '600', color: '#2A2825', marginBottom: 12, textAlign: 'center' },
  sub: { fontSize: 16, color: '#4A4744', textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  email: { fontWeight: '700', color: '#2A2825' },
  instructions: { fontSize: 14, color: '#8A857C', textAlign: 'center', lineHeight: 21 },
  actions: {},
  signOutBtn: { alignSelf: 'center', marginTop: 20, padding: 8 },
  signOutText: { fontSize: 14, color: '#8A857C' },
});
