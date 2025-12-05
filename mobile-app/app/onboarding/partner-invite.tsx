// import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';

// const { width } = Dimensions.get('window');

// export default function PartnerInviteScreen() {
//   const router = useRouter();

//   return (
//     <LinearGradient
//       colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
//       style={styles.container}
//     >
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Text style={styles.backText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.progress}>8/8</Text>
//         <TouchableOpacity onPress={() => router.push('/(tabs)')}>
//           <Text style={styles.closeText}>✕</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.content}>
//         <Text style={styles.title}>Invite your partner</Text>
//         <Text style={styles.subtitle}>Send them a link so you can start answering together</Text>

//         <View style={styles.imagesContainer}>
//           <View style={styles.imageWrapper}>
//             <Image
//               source={require('../../assets/images/woman.png')}
//               style={styles.partnerImage}
//               resizeMode="cover"
//             />
//           </View>
//           <View style={[styles.imageWrapper, styles.imageWrapperDashed]}>
//             <Image
//               source={require('../../assets/images/man.png')}
//               style={styles.partnerImage}
//               resizeMode="cover"
//             />
//           </View>
//         </View>

//         <View style={styles.linkContainer}>
//           <Text style={styles.linkLabel}>link</Text>
//           <Text style={styles.linkText}>https://120x120.abgvjdsbd...</Text>
//           <TouchableOpacity style={styles.copyButton}>
//             <Text style={styles.copyIcon}>📋</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <View style={styles.bottomContainer}>
//         <TouchableOpacity
//           style={styles.primaryButton}
//           onPress={() => router.push('/(tabs)')}
//         >
//           <Text style={styles.primaryButtonText}>Send Invite</Text>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => router.push('/(tabs)')}>
//           <Text style={styles.linkText}>Skip For Now</Text>
//         </TouchableOpacity>
//       </View>
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
//     paddingHorizontal: 24,
//     paddingTop: 20,
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
//     marginBottom: 40,
//   },
//   imagesContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 20,
//     marginBottom: 40,
//   },
//   imageWrapper: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     overflow: 'hidden',
//     borderWidth: 3,
//     borderColor: '#FF9B7A',
//   },
//   imageWrapperDashed: {
//     borderStyle: 'dashed',
//     borderColor: '#999',
//   },
//   partnerImage: {
//     width: '100%',
//     height: '100%',
//   },
//   linkContainer: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   linkLabel: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '600',
//   },
//   linkText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#2C2C2C',
//   },
//   copyButton: {
//     padding: 4,
//   },
//   copyIcon: {
//     fontSize: 20,
//   },
//   bottomContainer: {
//     paddingHorizontal: 24,
//     paddingBottom: 50,
//     gap: 16,
//   },
//   primaryButton: {
//     backgroundColor: '#FF9B7A',
//     paddingVertical: 18,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   primaryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   Share,
//   Clipboard,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';
// import { useState } from 'react';
// import { useOnboarding } from '@/context/onboarding_context';
// import {
//   generateCoupleInvite,
//   acceptCoupleInvite,
//   CoupleInvite,
// } from '@/services/onboarding_service';

// export default function PartnerInviteScreen() {
//   const router = useRouter();
//   const { submitOnboarding, isLoading: onboardingLoading } = useOnboarding();
//   const [mode, setMode] = useState<'generate' | 'accept'>('generate');
//   const [inviteCode, setInviteCode] = useState('');
//   const [generatedInvite, setGeneratedInvite] = useState<CoupleInvite | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleGenerateInvite = async () => {
//     try {
//       setLoading(true);
//       const invite = await generateCoupleInvite();
//       setGeneratedInvite(invite);
//       Alert.alert('Success', 'Invite code generated successfully!');
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to generate invite');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAcceptInvite = async () => {
//     if (!inviteCode.trim()) {
//       Alert.alert('Error', 'Please enter an invite code');
//       return;
//     }

//     try {
//       setLoading(true);
//       await acceptCoupleInvite(inviteCode.trim());
//       Alert.alert('Success', 'Successfully linked with your partner!', [
//         {
//           text: 'OK',
//           onPress: () => handleCompleteOnboarding(),
//         },
//       ]);
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to accept invite');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCompleteOnboarding = async () => {
//     try {
//       // Mark onboarding as complete in backend
//       await submitOnboarding();
//       router.replace('/onboarding/home');
//     } catch (error: any) {
//       console.error('Complete onboarding error:', error);
//       Alert.alert('Error', error.message || 'Failed to complete onboarding');
//     }
//   };

//   const handleSkip = () => {
//     Alert.alert(
//       'Skip Partner Linking?',
//       'You can link with your partner later from settings',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Skip', onPress: handleCompleteOnboarding },
//       ]
//     );
//   };

//   const copyToClipboard = (text: string) => {
//     Clipboard.setString(text);
//     Alert.alert('Copied!', 'Invite code copied to clipboard');
//   };

//   const shareInvite = async () => {
//     if (!generatedInvite) return;

//     try {
//       await Share.share({
//         message: `Join me on Tether! Use code: ${generatedInvite.code}\n\nOr tap this link: ${generatedInvite.link}`,
//       });
//     } catch (error: any) {
//       console.error('Share error:', error);
//     }
//   };

//   return (
//     <LinearGradient colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']} style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Text style={styles.backText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.progress}>10/10</Text>
//         <TouchableOpacity onPress={handleSkip}>
//           <Text style={styles.skipText}>Skip</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
//         <Text style={styles.title}>Invite your partner</Text>
//         <Text style={styles.subtitle}>
//           Link your accounts to share your Tether journey together
//         </Text>

//         <View style={styles.modeSelector}>
//           <TouchableOpacity
//             style={[styles.modeButton, mode === 'generate' && styles.modeButtonActive]}
//             onPress={() => setMode('generate')}
//           >
//             <Text style={[styles.modeButtonText, mode === 'generate' && styles.modeButtonTextActive]}>
//               Generate Code
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.modeButton, mode === 'accept' && styles.modeButtonActive]}
//             onPress={() => setMode('accept')}
//           >
//             <Text style={[styles.modeButtonText, mode === 'accept' && styles.modeButtonTextActive]}>
//               Enter Code
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {mode === 'generate' ? (
//           <View style={styles.generateSection}>
//             {!generatedInvite ? (
//               <>
//                 <Text style={styles.instructionText}>
//                   Generate a code for your partner to connect with you
//                 </Text>
//                 <TouchableOpacity
//                   style={[styles.primaryButton, loading && styles.buttonDisabled]}
//                   onPress={handleGenerateInvite}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <ActivityIndicator color="#FFF" />
//                   ) : (
//                     <Text style={styles.primaryButtonText}>Generate Invite Code</Text>
//                   )}
//                 </TouchableOpacity>
//               </>
//             ) : (
//               <View style={styles.inviteCard}>
//                 <Text style={styles.inviteLabel}>Your Invite Code</Text>
//                 <TouchableOpacity
//                   style={styles.codeContainer}
//                   onPress={() => copyToClipboard(generatedInvite.code)}
//                 >
//                   <Text style={styles.codeText}>{generatedInvite.code}</Text>
//                   <Text style={styles.copyHint}>Tap to copy</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.expiryText}>
//                   Expires: {new Date(generatedInvite.expiresAt).toLocaleDateString()}
//                 </Text>
//                 <TouchableOpacity style={styles.shareButton} onPress={shareInvite}>
//                   <Text style={styles.shareButtonText}>📤 Share with Partner</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>
//         ) : (
//           <View style={styles.acceptSection}>
//             <Text style={styles.instructionText}>
//               Enter the 6-digit code your partner shared with you
//             </Text>
//             <TextInput
//               style={styles.codeInput}
//               placeholder="000000"
//               placeholderTextColor="#999"
//               value={inviteCode}
//               onChangeText={setInviteCode}
//               keyboardType="number-pad"
//               maxLength={6}
//               editable={!loading}
//             />
//             <TouchableOpacity
//               style={[styles.primaryButton, (loading || !inviteCode.trim()) && styles.buttonDisabled]}
//               onPress={handleAcceptInvite}
//               disabled={loading || !inviteCode.trim()}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#FFF" />
//               ) : (
//                 <Text style={styles.primaryButtonText}>Connect</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>

//       {!loading && (
//         <View style={styles.footer}>
//           <TouchableOpacity
//             style={[styles.finishButton, onboardingLoading && styles.buttonDisabled]}
//             onPress={handleCompleteOnboarding}
//             disabled={onboardingLoading}
//           >
//             {onboardingLoading ? (
//               <ActivityIndicator color="#8B4513" />
//             ) : (
//               <Text style={styles.finishButtonText}>Finish & Start Using Tether</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       )}
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 20,
//   },
//   backText: {
//     fontSize: 28,
//     color: '#2C2C2C',
//   },
//   progress: {
//     fontSize: 16,
//     color: '#666',
//     fontWeight: '500',
//   },
//   skipText: {
//     fontSize: 16,
//     color: '#666',
//     fontWeight: '500',
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   contentContainer: {
//     paddingBottom: 140,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#2C2C2C',
//     marginBottom: 12,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 32,
//     lineHeight: 24,
//   },
//   modeSelector: {
//     flexDirection: 'row',
//     backgroundColor: 'rgba(255, 255, 255, 0.6)',
//     borderRadius: 12,
//     padding: 4,
//     marginBottom: 32,
//   },
//   modeButton: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   modeButtonActive: {
//     backgroundColor: '#FFF',
//   },
//   modeButtonText: {
//     fontSize: 16,
//     color: '#666',
//     fontWeight: '500',
//   },
//   modeButtonTextActive: {
//     color: '#8B4513',
//     fontWeight: '600',
//   },
//   generateSection: {
//     alignItems: 'center',
//   },
//   acceptSection: {
//     alignItems: 'center',
//   },
//   instructionText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 24,
//     lineHeight: 24,
//   },
//   primaryButton: {
//     backgroundColor: '#D97D54',
//     borderRadius: 25,
//     padding: 18,
//     width: '100%',
//     alignItems: 'center',
//   },
//   buttonDisabled: {
//     opacity: 0.5,
//   },
//   primaryButtonText: {
//     color: '#FFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   inviteCard: {
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: 20,
//     padding: 24,
//     width: '100%',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#D97D54',
//   },
//   inviteLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 12,
//   },
//   codeContainer: {
//     backgroundColor: '#F5E6D3',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 12,
//   },
//   codeText: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: '#8B4513',
//     letterSpacing: 8,
//     textAlign: 'center',
//   },
//   copyHint: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   expiryText: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 16,
//   },
//   shareButton: {
//     backgroundColor: '#D97D54',
//     borderRadius: 25,
//     padding: 14,
//     width: '100%',
//   },
//   shareButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   codeInput: {
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: 12,
//     padding: 20,
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#8B4513',
//     textAlign: 'center',
//     letterSpacing: 8,
//     marginBottom: 24,
//     width: '100%',
//     borderWidth: 2,
//     borderColor: '#D97D54',
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 20,
//     backgroundColor: 'transparent',
//   },
//   finishButton: {
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: 25,
//     padding: 18,
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#8B4513',
//   },
//   finishButtonText: {
//     color: '#8B4513',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
  Clipboard,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/context/onboarding_context';
import {
  generateCoupleInvite,
  acceptCoupleInvite,
  CoupleInvite,
} from '@/services/onboarding_service';

const { width } = Dimensions.get('window');

export default function PartnerInviteScreen() {
  const router = useRouter();
  const { submitOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const [mode, setMode] = useState<'generate' | 'accept'>('generate');
  const [inviteCode, setInviteCode] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState<CoupleInvite | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateInvite = async () => {
    try {
      setLoading(true);
      const invite = await generateCoupleInvite();
      setGeneratedInvite(invite);
      Alert.alert('Success', 'Invite code generated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate invite');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    try {
      setLoading(true);
      await acceptCoupleInvite(inviteCode.trim());
      Alert.alert('Success', 'Successfully linked with your partner!', [
        {
          text: 'OK',
          onPress: () => handleCompleteOnboarding(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept invite');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      await submitOnboarding();
      router.replace('/onboarding/home');
    } catch (error: any) {
      console.error('Complete onboarding error:', error);
      Alert.alert('Error', error.message || 'Failed to complete onboarding');
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/home');
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  const shareInvite = async () => {
    if (!generatedInvite) return;

    try {
      await Share.share({
        message: `Join me on Tether! Use code: ${generatedInvite.code}`,
      });
    } catch (error: any) {
      console.error('Share error:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>8/8</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Invite your partner</Text>
        <Text style={styles.subtitle}>
          Send them a link so you can start answering together
        </Text>

        {/* Profile Images */}
        <View style={styles.imagesContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={require('../../assets/images/woman.png')}
              style={styles.partnerImage}
              resizeMode="cover"
            />
          </View>
          <View style={[styles.imageWrapper, styles.imageWrapperDashed]}>
            <Image
              source={require('../../assets/images/man.png')}
              style={styles.partnerImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'generate' && styles.modeButtonActive]}
            onPress={() => setMode('generate')}
          >
            <Text style={[styles.modeButtonText, mode === 'generate' && styles.modeButtonTextActive]}>
              Generate Code
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'accept' && styles.modeButtonActive]}
            onPress={() => setMode('accept')}
          >
            <Text style={[styles.modeButtonText, mode === 'accept' && styles.modeButtonTextActive]}>
              Enter Code
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'generate' ? (
  <View style={styles.generateSection}>
    {!generatedInvite ? (
      <>
        <Text style={styles.instructionText}>
          Generate a code for your partner to connect with you
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, loading && styles.buttonDisabled]}
          onPress={handleGenerateInvite}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.actionButtonText}>Generate Code</Text>
          )}
        </TouchableOpacity>
      </>
    ) : (
      <View style={styles.linkContainer}>
        <Text style={styles.linkLabel}>link</Text>
        <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
          {generatedInvite.link || `https://tether.app/invite/${generatedInvite.code}`}
        </Text>
        <TouchableOpacity 
          style={styles.copyButton}
          onPress={() => copyToClipboard(generatedInvite.link || generatedInvite.code)}
        >
          <Text style={styles.copyIcon}>📋</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
) : (
  <View style={styles.acceptSection}>
    <Text style={styles.instructionText}>
      Enter the 6-digit code your partner shared with you
    </Text>
    <TextInput
      style={styles.codeInput}
      placeholder="000000"
      placeholderTextColor="#999"
      value={inviteCode}
      onChangeText={setInviteCode}
      keyboardType="number-pad"
      maxLength={6}
      editable={!loading}
    />
  </View>
        )}
      </ScrollView>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
  <TouchableOpacity
    style={[styles.primaryButton, loading && styles.buttonDisabled]}
    onPress={() => {
      if (mode === 'generate' && generatedInvite) {
        shareInvite();
      } else if (mode === 'accept' && inviteCode.trim()) {
        handleAcceptInvite();
      } else {
        handleCompleteOnboarding();
      }
    }}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator color="#FFF" />
    ) : (
      <Text style={styles.primaryButtonText}>
        {mode === 'generate' && generatedInvite 
          ? 'Share Invite' 
          : mode === 'accept' && inviteCode.trim()
          ? 'Connect'
          : 'Continue'}
      </Text>
    )}
  </TouchableOpacity>

  <TouchableOpacity onPress={handleSkip}>
    <Text style={styles.skipText}>Skip For Now</Text>
  </TouchableOpacity>
</View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backText: {
    fontSize: 28,
    color: '#2C2C2C',
  },
  progress: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  closeText: {
    fontSize: 24,
    color: '#2C2C2C',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 40,
    lineHeight: 20,
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FF9B7A',
  },
  imageWrapperDashed: {
    borderStyle: 'dashed',
    borderColor: '#999',
  },
  partnerImage: {
    width: '100%',
    height: '100%',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#FFF',
  },
  modeButtonText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: '#8B4513',
    fontWeight: '600',
  },
  generateSection: {
    alignItems: 'center',
  },
  acceptSection: {
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: '#D97D54',
    borderRadius: 25,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  linkContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  linkLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#2C2C2C',
  },
  copyButton: {
    padding: 4,
  },
  copyIcon: {
    fontSize: 20,
  },
  codeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 20,
    fontSize: 32,
    fontWeight: '700',
    color: '#8B4513',
    textAlign: 'center',
    letterSpacing: 8,
    width: '100%',
    borderWidth: 2,
    borderColor: '#D97D54',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FF9B7A',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  skipText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});