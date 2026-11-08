import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { Colors, Radius, Typography } from '../constants/theme';

WebBrowser.maybeCompleteAuthSession();

function getRedirectUrl() {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? (window as any).location.origin : '';
  }
  return 'metastock://auth/callback';
}

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const redirectTo = getRedirectUrl();

      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error) throw error;
        if (data?.url) {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          if (result.type === 'success' && result.url) {
            const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
            if (sessionError) throw sessionError;
          }
        }
      }
    } catch (e: any) {
      Alert.alert('Sign in failed', e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <View style={styles.hero}>
          <Text style={styles.logo}>MetaStock</Text>
          <Text style={styles.tagline}>AI-powered metadata for stock creators</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign in to continue</Text>
          <Text style={styles.cardSub}>Your metadata history syncs across devices</Text>

          <TouchableOpacity
            style={[styles.googleBtn, loading && styles.googleBtnDisabled]}
            onPress={signInWithGoogle}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textPrimary} size="small" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>By signing in, you agree to our Terms of Service</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', gap: 20 },

  hero: { alignItems: 'center', gap: 8, marginBottom: 12 },
  logo: { fontSize: 48, fontFamily: Typography.displayItalic, color: Colors.textPrimary },
  tagline: { fontSize: 14, fontFamily: Typography.body, color: Colors.textTertiary, textAlign: 'center', lineHeight: 20 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 24,
    gap: 16,
  },
  cardTitle: { fontSize: 18, fontFamily: Typography.bodyMedium, color: Colors.textPrimary, textAlign: 'center' },
  cardSub: { fontSize: 13, fontFamily: Typography.body, color: Colors.textTertiary, textAlign: 'center' },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: 14,
    marginTop: 4,
  },
  googleBtnDisabled: { opacity: 0.6 },
  googleIcon: { fontSize: 17, fontFamily: Typography.bodyMedium, color: Colors.textPrimary },
  googleBtnText: { fontSize: 15, fontFamily: Typography.bodyMedium, color: Colors.textPrimary },

  terms: { fontSize: 11, fontFamily: Typography.body, color: Colors.textTertiary, textAlign: 'center' },
});
