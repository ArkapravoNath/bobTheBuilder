import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/AuthContext';
import { BuddyButton } from '../../src/components/BuddyButton';
import { BuddyInput } from '../../src/components/BuddyInput';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace('/');
    } catch (e) {
      setError((e as Error).message ?? 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>

          <View style={styles.logoPill}>
            <Text style={styles.logoText}>BUILD BUDDY</Text>
          </View>

          <Text style={styles.headline}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to continue designing.</Text>

          {/* Form */}
          <View style={styles.form}>
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
              placeholder="Your password"
              secureTextEntry={!showPassword}
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
              rightIcon={
                <Text style={{ fontSize: 13, color: '#8A857C' }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              }
              onRightIconPress={() => setShowPassword((v) => !v)}
            />

            {!!error && <Text style={styles.errorBanner}>{error}</Text>}

            <BuddyButton
              label="Sign In"
              onPress={handleSignIn}
              variant="primary"
              fullWidth
              loading={loading}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotBtn}
              accessibilityRole="link"
            >
              <Text style={styles.forgotText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/signup')} accessibilityRole="link">
              <Text style={styles.footerLink}>Sign up</Text>
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
    backgroundColor: '#2A2825',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 24,
  },
  logoText: { color: '#FBFAF7', fontSize: 11, fontWeight: '700', letterSpacing: 3 },
  headline: { fontSize: 34, fontWeight: '600', color: '#2A2825', marginBottom: 8 },
  sub: { fontSize: 15, color: '#8A857C', marginBottom: 32, lineHeight: 22 },
  form: { gap: 0 },
  errorBanner: {
    backgroundColor: '#FDF0EE',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#E74C3C',
    marginBottom: 16,
  },
  forgotBtn: { alignSelf: 'center', marginTop: 16, padding: 8 },
  forgotText: { fontSize: 14, color: '#1E6FD9', fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: 32 },
  footerText: { fontSize: 14, color: '#8A857C' },
  footerLink: { fontSize: 14, color: '#1E6FD9', fontWeight: '600' },
});
