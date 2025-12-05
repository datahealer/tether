



// // app/onboarding/account-creation.tsx
// import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';
// import { useState, useEffect } from 'react';
// import { useAuth } from '@/context/auth_context';
// import { useOnboarding } from '@/context/onboarding_context';
// import { useGoogleAuth, processGoogleSignIn, isAppleAuthAvailable, signInWithApple } from '@/services/auth_service';
// import { updateOnboardingData } from '@/services/onboarding_service';
// import * as AppleAuthentication from 'expo-apple-authentication';

// export default function AccountCreationScreen() {
//   const router = useRouter();
//   const { signIn } = useAuth();
//   const { onboardingData } = useOnboarding();
//   const { request, response, promptAsync } = useGoogleAuth();
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

//   useEffect(() => {
//     checkAppleAuth();
//   }, []);

//   const checkAppleAuth = async () => {
//     const available = await isAppleAuthAvailable();
//     setAppleAuthAvailable(available);
//   };

//   useEffect(() => {
//     if (response?.type === 'success') {
//       handleGoogleResponse();
//     }
//   }, [response]);

//   const syncOnboardingDataToBackend = async () => {
//     try {
//       await updateOnboardingData(onboardingData);
//     } catch (error: any) {
//       console.error('Failed to sync onboarding data:', error);
//     }
//   };

//   const handleEmailSignUp = async () => {
//     if (!name.trim() || !email.trim() || !password.trim()) {
//       Alert.alert('Error', 'Please fill in all fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/signup`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ name, email, password }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to create account');
//       }

//       const userData = await response.json();
//       await signIn(userData);
//       await syncOnboardingDataToBackend();
//       router.push('/onboarding/partner-invite');
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to create account');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleResponse = async () => {
//     try {
//       setLoading(true);
//       const user = await processGoogleSignIn(response);
//       await signIn(user);
//       await syncOnboardingDataToBackend();
//       router.push('/onboarding/partner-invite');
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Google sign-in failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     if (!request) {
//       Alert.alert('Error', 'Google Sign-In not ready');
//       return;
//     }
//     try {
//       await promptAsync();
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to sign in with Google');
//     }
//   };

//   const handleAppleSignIn = async () => {
//     setLoading(true);
//     try {
//       const userData = await signInWithApple();
//       await signIn(userData);
//       await syncOnboardingDataToBackend();
//       router.push('/onboarding/partner-invite');
//     } catch (error: any) {
//       if (error.message !== 'Sign in was canceled') {
//         Alert.alert('Error', error.message || 'Failed to sign in with Apple');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <LinearGradient
//       colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
//       style={styles.container}
//     >
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} disabled={loading}>
//           <Text style={styles.backText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.progress}>7/8</Text>
//         <TouchableOpacity onPress={() => router.push('/onboarding/partner-invite')} disabled={loading}>
//           <Text style={styles.closeText}>✕</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
//         <Text style={styles.title}>You're almost ready to start</Text>
//         <Text style={styles.subtitle}>Create your account to save your progress</Text>

//         <View style={styles.form}>
//           <TextInput
//             style={styles.input}
//             placeholder="Name"
//             placeholderTextColor="#999"
//             value={name}
//             onChangeText={setName}
//             editable={!loading}
//           />

//           <TextInput
//             style={styles.input}
//             placeholder="Email"
//             placeholderTextColor="#999"
//             value={email}
//             onChangeText={setEmail}
//             keyboardType="email-address"
//             autoCapitalize="none"
//             editable={!loading}
//           />

//           <View style={styles.passwordContainer}>
//             <TextInput
//               style={styles.passwordInput}
//               placeholder="Password"
//               placeholderTextColor="#999"
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry={!showPassword}
//               autoCapitalize="none"
//               editable={!loading}
//             />
//             <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
//               <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <TouchableOpacity
//           style={[styles.createButton, loading && styles.buttonDisabled]}
//           onPress={handleEmailSignUp}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#FFFFFF" />
//           ) : (
//             <Text style={styles.createButtonText}>Create Account</Text>
//           )}
//         </TouchableOpacity>

//         <Text style={styles.orText}>or</Text>

//         {appleAuthAvailable && (
//           <AppleAuthentication.AppleAuthenticationButton
//             buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
//             buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
//             cornerRadius={12}
//             style={styles.appleButton}
//             onPress={() => {
//               if (!loading) {
//                 void handleAppleSignIn();
//               }
//             }}
//           />
//         )}

//         <TouchableOpacity 
//           style={[styles.googleButton, loading && styles.buttonDisabled]} 
//           onPress={handleGoogleSignIn}
//           disabled={loading || !request}
//         >
//           {loading ? (
//             <ActivityIndicator color="#2C2C2C" />
//           ) : (
//             <>
//               <Text style={styles.googleIcon}>G</Text>
//               <Text style={styles.googleButtonText}>Sign Up with Google</Text>
//             </>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 60,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingBottom: 16,
//   },
//   backText: {
//     fontSize: 28,
//     color: '#2C2C2C',
//   },
//   progress: {
//     fontSize: 16,
//     color: '#666',
//   },
//   closeText: {
//     fontSize: 24,
//     color: '#2C2C2C',
//   },
//   content: {
//     flex: 1,
//   },
//   contentContainer: {
//     paddingHorizontal: 24,
//     paddingBottom: 50,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#2C2C2C',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 32,
//   },
//   form: {
//     gap: 16,
//     marginBottom: 24,
//   },
//   input: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 18,
//     fontSize: 16,
//     color: '#2C2C2C',
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     paddingRight: 18,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   passwordInput: {
//     flex: 1,
//     padding: 18,
//     fontSize: 16,
//     color: '#2C2C2C',
//   },
//   eyeIcon: {
//     fontSize: 20,
//   },
//   createButton: {
//     backgroundColor: '#FF9B7A',
//     paddingVertical: 18,
//     borderRadius: 30,
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   createButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   buttonDisabled: {
//     opacity: 0.5,
//   },
//   orText: {
//     textAlign: 'center',
//     color: '#666',
//     fontSize: 14,
//     marginBottom: 16,
//   },
//   appleButton: {
//     height: 50,
//     marginBottom: 12,
//   },
//   googleButton: {
//     backgroundColor: '#FFFFFF',
//     paddingVertical: 16,
//     borderRadius: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     gap: 8,
//     height: 50,
//   },
//   googleIcon: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   googleButtonText: {
//     color: '#2C2C2C',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useAuth } from '@/context/auth_context';

WebBrowser.maybeCompleteAuthSession();

export default function AccountCreationScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savePassword, setSavePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Google Sign In configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication?.accessToken);
    }
  }, [response]);

  const handleGoogleSignIn = async (token: string | undefined) => {
    if (!token) return;
    
    setLoading(true);
    try {
      await signInWithGoogle(token);
      router.push('/onboarding/privacy');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      router.push('/onboarding/privacy');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout progress={0.14}>
      <View style={styles.content}>
        <Text style={styles.title}>Create an account</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Ionicons name="create-outline" size={20} color="#999" style={styles.inputIcon} />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.inputIcon}
          >
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#999" 
            />
          </TouchableOpacity>
        </View>

        {/* Save Password Toggle */}
        <View style={styles.savePasswordContainer}>
          <Text style={styles.savePasswordText}>Save Password</Text>
          <Switch
            value={savePassword}
            onValueChange={setSavePassword}
            trackColor={{ false: '#E0D0B8', true: '#D97E5A' }}
            thumbColor="#FFF"
          />
        </View>

        {/* OR Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {/* Google Sign In Button */}
        <TouchableOpacity 
          style={styles.googleButton}
          onPress={() => promptAsync()}
          disabled={!request || loading}
        >
          <Ionicons name="logo-google" size={20} color="#000" style={styles.buttonIcon} />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Create Account Button */}
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreateAccount}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create account'}
          </Text>
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0D0B8',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#000',
  },
  inputIcon: {
    padding: 5,
  },
  savePasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  savePasswordText: {
    fontSize: 16,
    color: '#000',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0D0B8',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0D0B8',
    marginBottom: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#D97E5A',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});