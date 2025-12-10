
// import React from 'react';
// import { View, StyleSheet, TouchableOpacity, SafeAreaView, Image, ImageBackground } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { Colors, Spacing } from '../../../theme/constants';

// interface OnboardingLayoutProps {
//   children: React.ReactNode;
//   showBackButton?: boolean;
//   showLogo?: boolean;
//   progress?: number; // 0 to 1
// }

// export default function OnboardingLayout({ 
//   children, 
//   showBackButton = true,
//   showLogo = true,
//   progress 
// }: OnboardingLayoutProps) {
//   const router = useRouter();

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       {/* Background with Eclipse layers */}
//       <View style={styles.container}>
//         {/* Eclipse Layer A */}
//         <View style={styles.eclipseA} />
        
//         {/* Eclipse Layer B */}
//         <View style={styles.eclipseB} />
        
//         {/* Noise Texture Overlay */}
//         {/* Asset needed: /assets/images/noise-texture.png */}
//         <ImageBackground
//           source={require('../../../assets/images/noise-texture.png')}
//           style={styles.noiseTexture}
//           imageStyle={{ opacity: 0.03 }}
//         />

//         {/* Header */}
//         <View style={styles.header}>
//           {showBackButton ? (
//             <TouchableOpacity 
//               style={styles.backButton}
//               onPress={() => router.back()}
//             >
//               <Ionicons name="chevron-back" size={24} color={Colors.black} />
//             </TouchableOpacity>
//           ) : (
//             <View style={styles.backButton} />
//           )}
          
//           {showLogo ? (
//             <Image
//               // Asset needed: /assets/images/tether-wordmark-black.png (81x25)
//               source={require('../../../assets/images/tether-wordmark-black-large.png')}
//               style={styles.tetherLogo}
//               resizeMode="contain"
//             />
//           ) : (
//             <View style={styles.logoPlaceholder} />
//           )}
          
//           <View style={styles.placeholder} />
//         </View>

//         {/* Progress Bar */}
//         {progress !== undefined && (
//           <View style={styles.progressSection}>
//             <View style={styles.progressContainer}>
//               <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
//             </View>
//           </View>
//         )}

//         {/* Content */}
//         <View style={styles.content}>
//           {children}
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: Colors.cream,
//   },
//   container: {
//     flex: 1,
//     position: 'relative',
//   },
//   // Eclipse background layers with blur effect
//   eclipseA: {
//     position: 'absolute',
//     top: -100,
//     right: -100,
//     width: 300,
//     height: 300,
//     borderRadius: 150,
//     backgroundColor: Colors.eclipseA,
//     opacity: 0.15,
//     // Note: React Native doesn't support blur on View directly
//     // Use react-native-blur or expo-blur if needed
//   },
//   eclipseB: {
//     position: 'absolute',
//     bottom: -150,
//     left: -100,
//     width: 400,
//     height: 400,
//     borderRadius: 200,
//     backgroundColor: Colors.eclipseB,
//     opacity: 0.1,
//   },
//   noiseTexture: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: Spacing.md,
//     paddingTop: Spacing.md,
//     paddingBottom: Spacing.sm,
//     marginTop: Spacing.xxl, // Status bar safe area
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'flex-start',
//   },
//   tetherLogo: {
//     width: 81,
//     height: 25,
//   },
//   logoPlaceholder: {
//     width: 81,
//     height: 25,
//   },
//   placeholder: {
//     width: 40,
//   },
//   progressSection: {
//     paddingHorizontal: Spacing.md,
//     paddingTop: Spacing.sm,
//   },
//   progressContainer: {
//     height: 4,
//     backgroundColor: Colors.mediumGrey,
//     borderRadius: 2,
//     overflow: 'hidden',
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: Colors.darkOrange,
//     borderRadius: 2,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: Spacing.md,
//     paddingTop: Spacing.lg,
//   },
// });
// BackgroundLayout.tsx
// BackgroundLayout.tsx
import React from 'react';
import { View, StyleSheet, SafeAreaView, ImageBackground, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth_context';
import { Colors, Spacing } from '../../../theme/constants';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  showLogo?: boolean;
  rightButton?: React.ReactNode;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  progress?: number;
  showSettingsIcon?: boolean; // New prop
}

export default function OnboardingLayout({ 
  children, 
  showBackButton = true,
  showLogo = true,
  progress,
  rightButton,
  rightAction,
  showSettingsIcon = false
}: OnboardingLayoutProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Show settings icon if user is logged in and showSettingsIcon is true
  const shouldShowSettings = user && showSettingsIcon;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Blob / eclipse background layers */}
        <View style={styles.blobTopRight} />
        <View style={styles.blobBottomLeft} />

        {/* Blur overlay */}
        <BlurView intensity={Platform.OS === 'ios' ? 50 : 30} tint="light" style={StyleSheet.absoluteFill} />

        {/* Noise texture overlay */}
        <ImageBackground
          source={require('../../../assets/images/noise-texture.png')}
          style={StyleSheet.absoluteFill}
          imageStyle={{ opacity: 0.03 }}
        />

        {/* Header */}
        <View style={styles.header}>
          {showBackButton ? (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={Colors.black} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}

          {showLogo ? (
            <Image
              source={require('../../../assets/images/tether-wordmark-black-large.png')}
              style={styles.tetherLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoPlaceholder} />
          )}

          {shouldShowSettings ? (
            <TouchableOpacity 
              style={styles.rightButton} 
              onPress={() => router.push('/onboarding/settings/settings')}
            >
              <Ionicons name="settings-outline" size={24} color={Colors.black} />
            </TouchableOpacity>
          ) : rightButton ? (
            <View style={styles.rightButton}>{rightButton}</View>
          ) : rightAction ? (
            <TouchableOpacity style={styles.rightButton} onPress={rightAction.onPress}>
              <Ionicons name={rightAction.icon as any} size={24} color={Colors.black} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Progress Bar */}
        {typeof progress === 'number' && (
          <View style={styles.progressSection}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  blobTopRight: {
    position: 'absolute',
    top: -200,
    right: -150,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: Colors.eclipseA,
    opacity: 0.15,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -250,
    left: -150,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: Colors.eclipseB,
    opacity: 0.08,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    marginTop: Spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  tetherLogo: {
    width: 81,
    height: 25,
  },
  logoPlaceholder: {
    width: 81,
    height: 25,
  },
  placeholder: {
    width: 40,
  },
  progressSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.mediumGrey,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.darkOrange,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  rightButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
