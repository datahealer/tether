import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useAuth } from '@/context/auth_context';
import { useGoogleAuth, processGoogleSignIn, signInWithApple } from '@/services/auth_service';
import { Colors, Spacing, FontSizes, FontWeights, ComponentSizes, BorderRadius } from '../../theme/constants';

export default function LoginScreen() {
  const router = useRouter();
  const { login, signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Google Sign In
  const { request, response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response);
    }
  }, [response]);

  const handleGoogleResponse = async (googleResponse: any) => {
    setLoading(true);
    try {
      const user = await processGoogleSignIn(googleResponse);
      await signIn(user);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/onboarding/privacy');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await promptAsync();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to initiate Google sign in');
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const user = await signInWithApple();
      await signIn(user);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/onboarding/privacy');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to sign in with Apple');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    
    try {
      await login(email, password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/onboarding/privacy');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Coming Soon', 'Password reset functionality coming soon');
  };

  return (
    <OnboardingLayout 
      progress={0.14} 
      showBackButton={true}
      // rightButton={
      //   <TouchableOpacity onPress={() => router.push('/onboarding/privacy')}>
      //     <Text style={styles.skipText}>Skip</Text>
      //   </TouchableOpacity>
      // }
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Heading */}
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

          {/* Email Input Field */}
          <View style={[
            styles.inputContainer,
            emailFocused && styles.inputFocused
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.darkGrey}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
            <Image
              source={require('../../assets/images/pencil.png')}
              style={styles.inputIcon}
              resizeMode="contain"
            />
          </View>

          {/* Password Input Field */}
          <View style={[
            styles.inputContainer,
            passwordFocused && styles.inputFocused
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.darkGrey}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowPassword(!showPassword);
              }}
            >
              <Image
                source={require('../../assets/images/eye.png')}
                style={styles.inputIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Platform-specific Auth Button */}
          {Platform.OS === 'ios' ? (
            <TouchableOpacity 
              style={styles.authButton}
              onPress={handleAppleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-apple" size={20} color={Colors.black} style={styles.buttonIcon} />
              <Text style={styles.authButtonText}>Sign in with Apple</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.authButton}
              onPress={handleGoogleSignIn}
              disabled={!request || loading}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={20} color={Colors.black} style={styles.buttonIcon} />
              <Text style={styles.authButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
          )}

          {/* Spacer */}
          <View style={{ flex: 1, minHeight: Spacing.xl }} />

          {/* Login Button */}
          <TouchableOpacity 
            style={[
              styles.button,
              loading && styles.buttonDisabled
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Text>
          </TouchableOpacity>

          {/* Don't have account */}
          <TouchableOpacity 
            style={styles.signupLink}
            onPress={() => router.back()}
          >
            <Text style={styles.signupLinkText}>
              Don't have an account? <Text style={styles.signupLinkBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  heading: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.heading,
    lineHeight: 36,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: Spacing.sm,
    letterSpacing: 0,
    textAlign: 'center',
    width: '100%',
  },
  subtitle: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    marginBottom: Spacing.xl + Spacing.md,
    letterSpacing: 0,
    textAlign: 'center',
    width: '100%',
  },
  skipText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.medium,
    color: Colors.darkOrange,
    fontWeight: FontWeights.medium,
  },
  inputContainer: {
    ...ComponentSizes.inputField,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputFill,
    marginBottom: Spacing.md,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  inputFocused: {
    borderWidth: 1,
    borderColor: Colors.lightOrange,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    // lineHeight: 24,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    letterSpacing: 0,
  },
  inputIcon: {
    width: 24,
    height: 24,
  },
  forgotPasswordContainer: {
    width: ComponentSizes.inputField.width,
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.darkOrange,
    letterSpacing: 0,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: ComponentSizes.inputField.width,
    marginVertical: Spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.mediumGrey,
  },
  dividerText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.darkGrey,
    marginHorizontal: Spacing.md,
    letterSpacing: 0,
  },
  authButton: {
    ...ComponentSizes.buttonLarge,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.mediumGrey,
    marginBottom: Spacing.md,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  authButtonText: {
    fontFamily: 'InterTight-SemiBold',
    color: Colors.black,
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.45,
    textAlign: 'center',
  },
  button: {
    ...ComponentSizes.buttonLarge,
    backgroundColor: Colors.darkOrange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'InterTight-SemiBold',
    color: Colors.white,
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.45,
    textAlign: 'center',
  },
  signupLink: {
    marginTop: Spacing.md,
  },
  signupLinkText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    color: Colors.inputText,
    textAlign: 'center',
  },
  signupLinkBold: {
    fontFamily: 'SFProDisplay-Semibold',
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
  },
});
