


// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TextInput, 
//   TouchableOpacity, 
//   Switch, 
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
// import { useAuth } from '@/context/auth_context';
// import { useGoogleAuth, processGoogleSignIn } from '@/services/auth_service';
// import { Colors, Spacing, FontSizes, FontWeights, ComponentSizes, BorderRadius } from '../../theme/constants';

// export default function AccountCreationScreen() {
//   const router = useRouter();
//   const { signUp, signIn } = useAuth();
  
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [savePassword, setSavePassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [emailFocused, setEmailFocused] = useState(false);
//   const [passwordFocused, setPasswordFocused] = useState(false);

//   // Google Sign In
//   const { request, response, promptAsync } = useGoogleAuth();

//   useEffect(() => {
//     if (response?.type === 'success') {
//       handleGoogleResponse(response);
//     }
//   }, [response]);

//   const handleGoogleResponse = async (googleResponse: any) => {
//     setLoading(true);
//     try {
//       const user = await processGoogleSignIn(googleResponse);
//       await signIn(user);
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//       router.push('/onboarding/privacy');
//     } catch (error: any) {
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       Alert.alert('Error', error.message || 'Failed to sign in with Google');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     try {
//       await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//       await promptAsync();
//     } catch (error: any) {
//       Alert.alert('Error', 'Failed to initiate Google sign in');
//     }
//   };

//   const handleCreateAccount = async () => {
//     if (!email || !password) {
//       Alert.alert('Error', 'Please fill in all fields');
//       return;
//     }

//     if (password.length < 8) {
//       Alert.alert('Error', 'Password must be at least 8 characters');
//       return;
//     }

//     await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     setLoading(true);
    
//     try {
//       await signUp(email, password);
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//       router.push('/onboarding/privacy');
//     } catch (error: any) {
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       Alert.alert('Error', error.message || 'Failed to create account');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <OnboardingLayout progress={0.14} showBackButton={true}>
//       <KeyboardAvoidingView 
//         style={styles.container}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <ScrollView 
//           style={styles.scrollView}
//           contentContainerStyle={styles.content}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Heading: Inter Tight Semi Bold, 28, Line Height 36, Centered */}
//           <Text style={styles.heading}>Create an account</Text>

//           {/* Email Input Field: 358x64, Corner Radius 16 */}
//           <View style={[
//             styles.inputContainer,
//             emailFocused && styles.inputFocused
//           ]}>
//             <TextInput
//               style={styles.input}
//               placeholder="Email"
//               placeholderTextColor={Colors.darkGrey}
//               value={email}
//               onChangeText={setEmail}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               autoComplete="email"
//               onFocus={() => setEmailFocused(true)}
//               onBlur={() => setEmailFocused(false)}
//             />
//             <Ionicons name="create-outline" size={20} color={Colors.inputText} />
//           </View>

//           {/* Password Input Field: 358x64, Corner Radius 16 */}
//           <View style={[
//             styles.inputContainer,
//             passwordFocused && styles.inputFocused
//           ]}>
//             <TextInput
//               style={styles.input}
//               placeholder="Password"
//               placeholderTextColor={Colors.darkGrey}
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry={!showPassword}
//               autoCapitalize="none"
//               onFocus={() => setPasswordFocused(true)}
//               onBlur={() => setPasswordFocused(false)}
//             />
//             <TouchableOpacity 
//               onPress={() => {
//                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                 setShowPassword(!showPassword);
//               }}
//             >
//               <Ionicons 
//                 name={showPassword ? "eye-outline" : "eye-off-outline"} 
//                 size={20} 
//                 color={Colors.inputText} 
//               />
//             </TouchableOpacity>
//           </View>

//           {/* Save Password Toggle: SF Pro Display Medium, 16, Line Height 24, Left Align */}
//           <View style={styles.toggleRow}>
//             <Text style={styles.toggleText}>Save Password</Text>
//             <Switch
//               value={savePassword}
//               onValueChange={(value) => {
//                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                 setSavePassword(value);
//               }}
//               trackColor={{ false: Colors.mediumGrey, true: Colors.lightOrange }}
//               thumbColor={Colors.white}
//               ios_backgroundColor={Colors.mediumGrey}
//             />
//           </View>

//           {/* OR Divider */}
//           <View style={styles.dividerContainer}>
//             <View style={styles.divider} />
//             <Text style={styles.dividerText}>OR</Text>
//             <View style={styles.divider} />
//           </View>

//           {/* Google Sign In Button */}
//           <TouchableOpacity 
//             style={styles.googleButton}
//             onPress={handleGoogleSignIn}
//             disabled={!request || loading}
//             activeOpacity={0.8}
//           >
//             <Ionicons name="logo-google" size={20} color={Colors.black} style={styles.buttonIcon} />
//             <Text style={styles.googleButtonText}>Sign in with Google</Text>
//           </TouchableOpacity>

//           {/* Spacer */}
//           <View style={{ flex: 1, minHeight: Spacing.xl }} />

//           {/* Create Account Button: 358x65, Corner Radius 32, Dark Orange */}
//           <TouchableOpacity 
//             style={[
//               styles.button,
//               loading && styles.buttonDisabled
//             ]}
//             onPress={handleCreateAccount}
//             disabled={loading}
//             activeOpacity={0.8}
//           >
//             <Text style={styles.buttonText}>
//               {loading ? 'Creating...' : 'Create account'}
//             </Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </OnboardingLayout>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   content: {
//     flexGrow: 1,
//     paddingTop: Spacing.lg,
//     paddingBottom: Spacing.xl,
//     alignItems: 'center', // Center all content
//   },
//   // Heading: Inter Tight Semi Bold, 28, Line Height 36, CENTERED
//   heading: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.heading,
//     lineHeight: 36,
//     fontWeight: FontWeights.semibold,
//     color: Colors.black,
//     marginBottom: Spacing.xl + Spacing.md, // 40pt spacing below heading
//     letterSpacing: 0,
//     textAlign: 'center', // Center the heading
//     width: '100%',
//   },
//   // Input Field: 358x64, Padding 20, Corner Radius 16
//   inputContainer: {
//     ...ComponentSizes.inputField,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: Colors.inputFill,
//     marginBottom: Spacing.md, // 16pt spacing between fields
//     borderWidth: 1,
//     borderColor: 'transparent',
//   },
//   inputFocused: {
//     borderColor: Colors.lightOrange,
//     backgroundColor: Colors.white,
//   },
//   // Form Input Field: SF Pro Display Regular, 16, Line Height 24
//   input: {
//     flex: 1,
//     fontFamily: 'SFProDisplay-Regular',
//     fontSize: FontSizes.input,
//     lineHeight: 24,
//     fontWeight: FontWeights.regular,
//     color: Colors.inputText,
//     letterSpacing: 0,
//   },
//   // Toggle Row: SF Pro Display Medium, 16, Line Height 24
//   toggleRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: ComponentSizes.inputField.width,
//     marginTop: Spacing.sm,
//     marginBottom: Spacing.lg,
//   },
//   toggleText: {
//     fontFamily: 'SFProDisplay-Medium',
//     fontSize: FontSizes.input,
//     lineHeight: 24,
//     fontWeight: FontWeights.medium,
//     color: Colors.black,
//     letterSpacing: 0,
//   },
//   // OR Divider
//   dividerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: ComponentSizes.inputField.width,
//     marginVertical: Spacing.lg,
//   },
//   divider: {
//     flex: 1,
//     height: 1,
//     backgroundColor: Colors.mediumGrey,
//   },
//   dividerText: {
//     fontFamily: 'InterTight-Medium',
//     fontSize: FontSizes.medium,
//     fontWeight: FontWeights.medium,
//     color: Colors.darkGrey,
//     marginHorizontal: Spacing.md,
//     letterSpacing: 0,
//   },
//   // Google Button: 358x65, Corner Radius 32, White with border
//   googleButton: {
//     ...ComponentSizes.buttonLarge,
//     backgroundColor: Colors.white,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: Colors.mediumGrey,
//     marginBottom: Spacing.md,
//   },
//   buttonIcon: {
//     marginRight: Spacing.sm,
//   },
//   googleButtonText: {
//     fontFamily: 'InterTight-SemiBold',
//     color: Colors.black,
//     fontSize: FontSizes.buttonLarge,
//     lineHeight: 28,
//     fontWeight: FontWeights.semibold,
//     letterSpacing: 0.45,
//     textAlign: 'center',
//   },
//   // Button CTA: 358x65, Corner Radius 32
//   button: {
//     ...ComponentSizes.buttonLarge,
//     backgroundColor: Colors.darkOrange,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   buttonText: {
//     fontFamily: 'InterTight-SemiBold',
//     color: Colors.white,
//     fontSize: FontSizes.buttonLarge,
//     lineHeight: 28,
//     fontWeight: FontWeights.semibold,
//     letterSpacing: 0.45, // 2.5%
//     textAlign: 'center',
//   },
// });
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Switch, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useAuth } from '@/context/auth_context';
import { useGoogleAuth, processGoogleSignIn, signInWithApple } from '@/services/auth_service';
import { Colors, Spacing, FontSizes, FontWeights, ComponentSizes, BorderRadius } from '../../theme/constants';

export default function AccountCreationScreen() {
  const router = useRouter();
  const { signUp, signIn, signOut, user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savePassword, setSavePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Google Sign In (for Android)
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
      router.push('/onboarding/privacy');
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
      router.push('/onboarding/privacy');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to sign in with Apple');
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

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    
    try {
      await signUp(email, password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/onboarding/privacy');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // const handleLogout = async () => {
  //   Alert.alert(
  //     'Logout',
  //     'Are you sure you want to logout?',
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Logout',
  //         style: 'destructive',
  //         onPress: async () => {
  //           await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  //           await signOut();
  //           await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  //         },
  //       },
  //     ]
  //   );
  // };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/privacy');
  };
  const handleLogout = async () => {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await signOut();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace('/onboarding/account-creation');
            },
          },
        ]
      );
    };

  // If user is already logged in, show forward arrow
  const showForwardArrow = !!user;

  return (
    <OnboardingLayout 
      progress={0.14} 
      showBackButton={true}
      showLogoutAvatar={true}
      // rightButton={
      //   !user ? (
      //     <TouchableOpacity onPress={handleSkip}>
      //       <Text style={styles.skipText}>Skip</Text>
      //     </TouchableOpacity>
      //   ) : undefined
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
          <Text style={styles.heading}>
            {user ? 'Welcome back!' : 'Create an account'}
          </Text>


          {user ? (
            // Just show continue button if logged in
            <View style={styles.loggedInContainer}>
    <View style={styles.userInfoCard}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.userName}>{user.name || user.email}</Text>
      <Text style={styles.userEmail}>{user.email}</Text>
    </View>

    <TouchableOpacity 
      style={styles.continueButton}
      onPress={handleSkip}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>Continue</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={styles.logoutButton}
      onPress={handleLogout}
    >
      <Ionicons name="log-out-outline" size={20} color={Colors.darkOrange} />
      <Text style={styles.logoutButtonText}>Logout</Text>
    </TouchableOpacity>
  </View>
          ) : (
            <>
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

              {/* Save Password Toggle */}
              <View style={styles.toggleRow}>
                <Text style={styles.toggleText}>Save Password</Text>
                <Switch
                  value={savePassword}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSavePassword(value);
                  }}
                  trackColor={{ false: Colors.mediumGrey, true: Colors.lightOrange }}
                  thumbColor={Colors.white}
                  ios_backgroundColor={Colors.mediumGrey}
                />
              </View>

              {/* OR Divider */}
              {/* <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View> */}

              {/* Platform-specific Auth Button */}
              {/* {Platform.OS === 'ios' ? (
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
              )} */}

              {/* Spacer */}
              <View style={{ flex: 1, minHeight: Spacing.xl }} />

              {/* Create Account Button */}
              <TouchableOpacity 
                style={[
                  styles.button,
                  loading && styles.buttonDisabled
                ]}
                onPress={handleCreateAccount}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Creating...' : 'Create account'}
                </Text>
              </TouchableOpacity>

              {/* Already have account */}
              <TouchableOpacity 
                style={styles.loginLink}
                onPress={() => router.push('/onboarding/login')}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account? <Text style={styles.loginLinkBold}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
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
  // Logged in state
  loggedInContainer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
  },
  userInfoCard: {
    backgroundColor: Colors.veryLightOrange,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    width: ComponentSizes.inputField.width,
    gap: Spacing.sm,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.darkOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: 24,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  userName: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  userEmail: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    color: Colors.inputText,
  },
  continueButton: {
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.darkOrange,
    backgroundColor: Colors.white,
  },
  logoutButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
  },
  // Input fields
  inputContainer: {
    ...ComponentSizes.inputField,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputFill,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
    
   
  },
  inputFocused: {
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
    paddingVertical: 0, // Add this to prevent clipping
    includeFontPadding: false, // Add this for Android
    
  },
  inputIcon: {
    width: 24,
    height: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: ComponentSizes.inputField.width,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  toggleText: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: FontSizes.input,
    lineHeight: 24,
    fontWeight: FontWeights.medium,
    color: Colors.black,
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
  loginLink: {
    marginTop: Spacing.md,
  },
  loginLinkText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    color: Colors.inputText,
    textAlign: 'center',
  },
  loginLinkBold: {
    fontFamily: 'SFProDisplay-Semibold',
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
  },
});