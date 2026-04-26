import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/AuthContext';
import { BuddyButton } from '../../src/components/BuddyButton';
import { BuddyInput } from '../../src/components/BuddyInput';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignUp() {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim() || undefined);
      router.replace('/');
    } catch (e) {
      setError((e as Error).message ?? 'Sign-up failed. Please try again.');
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

          <Text style={styles.headline}>Create account</Text>
          <Text style={styles.sub}>Start designing your dream home today.</Text>

          <View style={styles.form}>
            <BuddyInput
              label="Name (optional)"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoComplete="name"
              returnKeyType="next"
            />
            <BuddyInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
            />
            <BuddyInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
              rightIcon={
                <Text style={{ fontSize: 13, color: '#8A857C' }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              }
              onRightIconPress={() => setShowPassword((v) => !v)}
            />

            {!!error && <Text style={styles.errorBanner}>{error}</Text>}

            <BuddyButton label="Create Account" onPress={handleSignUp} variant="primary" fullWidth loading={loading} />

            <Text style={styles.terms}>
              By continuing you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/signin')} accessibilityRole="link">
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
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
  form: { gap: 0 },
  errorBanner: {
    backgroundColor: '#FDF0EE', borderRadius: 8, padding: 12,
    fontSize: 14, color: '#E74C3C', marginBottom: 16,
  },
  terms: { fontSize: 12, color: '#8A857C', textAlign: 'center', marginTop: 16, lineHeight: 17 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: 32 },
  footerText: { fontSize: 14, color: '#8A857C' },
  footerLink: { fontSize: 14, color: '#1E6FD9', fontWeight: '600' },
});
