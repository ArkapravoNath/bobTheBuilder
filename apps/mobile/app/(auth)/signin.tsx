import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Platform, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/AuthContext';
import type { DevLoginProfile } from '../../src/auth/AuthContext';
import { BuddyButton } from '../../src/components/BuddyButton';
import { BuddyInput } from '../../src/components/BuddyInput';
import { C } from '../../src/theme/colors';

// ── Inline SVG-sourced brand icons via Text (cross-platform safe) ─────────────
function GoogleLogo() {
  return (
    <View style={logoStyles.gWrapper}>
      <Text style={[logoStyles.gLetter, { color: '#4285F4' }]}>G</Text>
      <Text style={[logoStyles.gLetter, { color: '#EA4335' }]}>o</Text>
      <Text style={[logoStyles.gLetter, { color: '#FBBC05' }]}>o</Text>
      <Text style={[logoStyles.gLetter, { color: '#4285F4' }]}>g</Text>
      <Text style={[logoStyles.gLetter, { color: '#34A853' }]}>l</Text>
      <Text style={[logoStyles.gLetter, { color: '#EA4335' }]}>e</Text>
    </View>
  );
}

function AppleLogo() {
  return <Text style={logoStyles.apple}></Text>;
}

const logoStyles = StyleSheet.create({
  gWrapper: { flexDirection: 'row', alignItems: 'center' },
  gLetter: { fontSize: 15, fontWeight: '700' },
  apple: { fontSize: 18, color: C.ink, lineHeight: 22 },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, devLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState<DevLoginProfile | null>(null);
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
      // Auth state is now set — app/index.tsx will redirect to /(app)/designs
      router.replace('/');
    } catch (e) {
      setError((e as Error).message ?? 'Sign-in failed. Check the mock API is running (pnpm mock-api:dev).');
    } finally {
      setLoading(false);
    }
  }

  async function handleDevLogin(profile: DevLoginProfile) {
    setDevLoading(profile);
    try {
      await devLogin(profile);
      router.replace('/');
    } finally {
      setDevLoading(null);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoArea}>
            <Image
              source={require('../../assets/brand/logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Build Buddy logo"
            />
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.headline}>Sign In</Text>
            <Text style={styles.sub}>Welcome back to your design workspace.</Text>

            <BuddyInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              variant="underline"
            />
            <BuddyInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
              variant="underline"
              rightIcon={
                <Text style={styles.showHide}>{showPassword ? 'Hide' : 'Show'}</Text>
              }
              onRightIconPress={() => setShowPassword((v) => !v)}
            />

            <View style={styles.forgotRow}>
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} accessibilityRole="link">
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {!!error && <Text style={styles.errorBanner}>{error}</Text>}

            <BuddyButton
              label="Sign In"
              onPress={handleSignIn}
              variant="primary"
              fullWidth
              loading={loading}
              uppercase
            />

            {/* Social divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialBtn}
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
              >
                <GoogleLogo />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialBtn}
                accessibilityRole="button"
                accessibilityLabel="Continue with Apple"
              >
                <AppleLogo />
                <Text style={styles.socialBtnText}>Apple</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/signup')} accessibilityRole="link">
                <Text style={styles.footerLink}>CREATE AN ACCOUNT</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Dev shortcut (only visible in __DEV__ builds) ── */}
          {__DEV__ && (
            <View style={styles.devPanel}>
              <Text style={styles.devLabel}>DEV TOOLS</Text>
              <TouchableOpacity
                style={[styles.devBtn, devLoading && { opacity: 0.5 }]}
                onPress={() => handleDevLogin('designer')}
                disabled={!!devLoading}
                accessibilityRole="button"
                accessibilityLabel="Dev login — skip auth and go to designs"
              >
                <Text style={styles.devBtnText}>
                  {devLoading === 'designer' ? 'Logging in…' : '⚡ Dev Login — skip to Designs'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.devBtn, styles.devBtnSecondary, devLoading && { opacity: 0.5 }]}
                onPress={() => handleDevLogin('onboarding')}
                disabled={!!devLoading}
                accessibilityRole="button"
                accessibilityLabel="Dev login — open onboarding flow"
              >
                <Text style={[styles.devBtnText, styles.devBtnTextSecondary]}>
                  {devLoading === 'onboarding' ? 'Logging in…' : 'Start onboarding as dev user'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48, alignItems: 'center' },

  logoArea: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 72, height: 72, borderRadius: 16 },

  card: {
    width: '100%',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 28,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },

  headline: { fontSize: 28, fontWeight: '700', color: C.ink, textAlign: 'center', marginBottom: 6 },
  sub:      { fontSize: 14, color: C.muted, textAlign: 'center', marginBottom: 28, lineHeight: 20 },

  showHide:  { fontSize: 13, color: C.muted },
  forgotRow: { alignItems: 'flex-end', marginTop: -8, marginBottom: 24 },
  forgotText:{ fontSize: 13, color: C.teak, fontWeight: '500' },

  errorBanner: {
    backgroundColor: '#FEF2F2', borderRadius: 6, padding: 12,
    fontSize: 13, color: C.error, marginBottom: 16,
  },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12 },
  dividerLine:{ flex: 1, height: 1, backgroundColor: C.border },
  dividerText:{ fontSize: 11, color: C.muted, fontWeight: '600', letterSpacing: 1 },

  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  socialBtn: {
    flex: 1, height: 48, borderRadius: 6, borderWidth: 1, borderColor: C.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.surface,
  },
  socialBtnText: { fontSize: 15, fontWeight: '500', color: C.ink },

  footer:     { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 4 },
  footerText: { fontSize: 13, color: C.muted },
  footerLink: { fontSize: 13, color: C.teak, fontWeight: '700', letterSpacing: 0.5 },

  // Dev tools panel — only rendered when __DEV__ is true
  devPanel: {
    width: '100%', marginTop: 24,
    borderWidth: 1, borderColor: '#3D3A37', borderRadius: 10,
    backgroundColor: '#1C1917', padding: 14,
  },
  devLabel: {
    fontSize: 10, fontWeight: '700', color: '#6B6560', letterSpacing: 1.2,
    marginBottom: 10,
  },
  devBtn: {
    backgroundColor: '#2A2724', borderRadius: 8,
    borderWidth: 1, borderColor: '#A06A3A',
    paddingVertical: 12, alignItems: 'center',
  },
  devBtnSecondary: {
    marginTop: 10,
    backgroundColor: '#1C1917',
    borderColor: '#3D3A37',
  },
  devBtnText: { fontSize: 13, color: '#A06A3A', fontWeight: '700' },
  devBtnTextSecondary: { color: '#D8D3CA' },
});
