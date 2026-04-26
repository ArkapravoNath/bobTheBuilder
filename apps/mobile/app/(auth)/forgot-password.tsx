import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/AuthContext';
import { BuddyButton } from '../../src/components/BuddyButton';
import { BuddyInput } from '../../src/components/BuddyInput';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { requestReset } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleReset() {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestReset(email.trim().toLowerCase());
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Go back">
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>

          <View style={styles.logoPill}>
            <Text style={styles.logoText}>BUILD BUDDY</Text>
          </View>

          {sent ? (
            <View style={styles.sentState}>
              <Text style={styles.sentIcon}>📬</Text>
              <Text style={styles.headline}>Check your email</Text>
              <Text style={styles.sub}>
                We've sent a password reset link to <Text style={{ fontWeight: '600' }}>{email}</Text>.
                {'\n\n'}Didn't receive it? Check your spam folder or try again.
              </Text>
              <BuddyButton
                label="Back to Sign In"
                onPress={() => router.replace('/(auth)/signin')}
                variant="primary"
                fullWidth
                style={{ marginTop: 32 }}
              />
            </View>
          ) : (
            <>
              <Text style={styles.headline}>Forgot password?</Text>
              <Text style={styles.sub}>
                Enter your email and we'll send you a link to reset your password.
              </Text>

              <View style={styles.form}>
                <BuddyInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="done"
                  onSubmitEditing={handleReset}
                />

                {!!error && <Text style={styles.errorBanner}>{error}</Text>}

                <BuddyButton label="Send Reset Link" onPress={handleReset} variant="primary" fullWidth loading={loading} />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FBFAF7' },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 16, paddingBottom: 40 },
  backBtn: { marginBottom: 24, width: 44, height: 44, justifyContent: 'center' },
  backChevron: { fontSize: 28, color: '#2A2825', lineHeight: 32 },
  logoPill: {
    backgroundColor: '#2A2825', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, marginBottom: 24,
  },
  logoText: { color: '#FBFAF7', fontSize: 11, fontWeight: '700', letterSpacing: 3 },
  headline: { fontSize: 34, fontWeight: '600', color: '#2A2825', marginBottom: 8 },
  sub: { fontSize: 15, color: '#8A857C', marginBottom: 32, lineHeight: 22 },
  form: {},
  errorBanner: {
    backgroundColor: '#FDF0EE', borderRadius: 8, padding: 12,
    fontSize: 14, color: '#E74C3C', marginBottom: 16,
  },
  sentState: { alignItems: 'center', paddingTop: 32 },
  sentIcon: { fontSize: 56, marginBottom: 24 },
});
