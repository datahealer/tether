



import React from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity, Image, Platform, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth_context';
import { Colors, Spacing, FontWeights } from '../../../theme/constants';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  showSettingsIcon?: boolean;
  showLogoutAvatar?: boolean;
  showHeartLogo?: boolean;
  showChatIcon?: boolean;
  chatCount?: number;
  onChatPress?: () => void;
}

export default function OnboardingLayout({ 
  children, 
  showBackButton = true,
  showLogo = true,
  progress,
  rightButton,
  rightAction,
  showSettingsIcon = false,
  showLogoutAvatar = false,
  showHeartLogo = false,
  showChatIcon = false,
  chatCount = 0,
  onChatPress,
}: OnboardingLayoutProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/onboarding/account-creation');
          },
        },
      ]
    );
  };

  const getLeftComponent = () => {
    if (showHeartLogo) {
      return (
        <View style={styles.heartLogoContainer}>
          <Image
            source={require('../../../assets/images/heart-symbol-black.png')}
            style={styles.heartLogo}
            resizeMode="contain"
          />
        </View>
      );
    }

    if (showBackButton) {
    return (
      <TouchableOpacity style={styles.backButton} onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          // Fallback route - adjust to your app's home/default screen
          router.replace('/onboarding/welcome');
        }
      }}>
        <Image
          source={require('../../../assets/images/back-arrow.png')}
          style={styles.backArrowImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  }

  return <View style={styles.backButton} />;
};

  const getRightComponent = () => {
    if (showLogoutAvatar && user) {
      return (
        <TouchableOpacity 
          style={styles.avatarButton} 
          onPress={handleLogout}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (showChatIcon || showSettingsIcon) {
      return (
        <View style={styles.rightButtonGroup}>
          {showChatIcon && (
            <TouchableOpacity 
              style={styles.chatIconButton} 
              onPress={onChatPress || (() => router.push('/home/both-expired'))}
            >
              <Image
                source={require('../../../assets/images/Chat.png')}
                style={styles.chatImage}
                resizeMode="contain"
              />
              {chatCount > 0 && (
                <View style={styles.chatCountBadge}>
                  <Text style={styles.chatCountText}>{chatCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          
          {showSettingsIcon && user && (
            <TouchableOpacity 
              style={styles.settingsIconButton} 
              onPress={() => router.push('/onboarding/settings/settings')}
            >
              <Image
                source={require('../../../assets/images/settings-icon.png')}
                style={styles.settingsImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (rightButton) {
      return <View style={styles.rightButton}>{rightButton}</View>;
    }

    if (rightAction) {
      return (
        <TouchableOpacity style={styles.rightButton} onPress={rightAction.onPress}>
          <Ionicons name={rightAction.icon as any} size={24} color={Colors.black} />
        </TouchableOpacity>
      );
    }

    return <View style={styles.placeholder} />;
  };

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
          {getLeftComponent()}

          {showLogo ? (
            <Image
              source={require('../../../assets/images/tether-wordmark-black-large.png')}
              style={styles.tetherLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoPlaceholder} />
          )}

          {getRightComponent()}
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
  heartLogoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  heartLogo: {
    width: 32,
    height: 32,
  },
  backArrowImage: {
    width: 24,
    height: 24,
  },
  tetherLogo: {
    width: 81,
    height: 25,
    position: 'absolute',
    left: '50%',
    marginLeft: -40.5,
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
  rightButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chatIconButton: {
    width: 56,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 0.87,
    borderColor: Colors.darkOrange,
    // paddingLeft: 4
  },
chatImage: {
    width: 19.5,
    height: 19.5,
    marginLeft: -10
    // tintColor: Colors.darkOrange,
  },
  chatCountBadge: {
    position: 'absolute',
    top: 7,
    right: 4,
    // backgroundColor: Colors.darkOrange,
    // borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    // borderWidth: 2,
    // borderColor: Colors.cream,
  },
  chatCountText: {
    fontFamily: 'InterTight-Semibold',
    fontSize: 13.5,
    fontWeight: FontWeights.bold,
    color: Colors.black,
  },
  settingsIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsImage: {
    width: 32,
    height: 32,
  },
  avatarButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.darkOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: 14,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
});

// import React from 'react';
// import { View, StyleSheet, ImageBackground, TouchableOpacity, Image, Platform, Alert, Text } from 'react-native';
// import { useRouter } from 'expo-router';
// import { BlurView } from 'expo-blur';
// import { Ionicons } from '@expo/vector-icons';
// import { useAuth } from '@/context/auth_context';
// import { Colors, Spacing, FontWeights } from '../../../theme/constants';
// import { SafeAreaView } from 'react-native-safe-area-context';

// interface OnboardingLayoutProps {
//   children: React.ReactNode;
//   showBackButton?: boolean;
//   showLogo?: boolean;
//   rightButton?: React.ReactNode;
//   rightAction?: {
//     icon: string;
//     onPress: () => void;
//   };
//   progress?: number;
//   showSettingsIcon?: boolean;
//   showLogoutAvatar?: boolean;
//   showHeartLogo?: boolean; // New prop
// }

// export default function OnboardingLayout({ 
//   children, 
//   showBackButton = true,
//   showLogo = true,
//   progress,
//   rightButton,
//   rightAction,
//   showSettingsIcon = false,
//   showLogoutAvatar = false,
//   showHeartLogo = false, // New prop
// }: OnboardingLayoutProps) {
//   const router = useRouter();
//   const { user, signOut } = useAuth();

//   const handleLogout = () => {
//     Alert.alert(
//       'Logout',
//       'Are you sure you want to logout?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Logout',
//           style: 'destructive',
//           onPress: async () => {
//             await signOut();
//             router.replace('/onboarding/account-creation');
//           },
//         },
//       ]
//     );
//   };

//   const getLeftComponent = () => {
//     if (showHeartLogo) {
//       return (
//         <View style={styles.heartLogoContainer}>
//           <Image
//             source={require('../../../assets/images/heart-symbol-black.png')}
//             style={styles.heartLogo}
//             resizeMode="contain"
//           />
//         </View>
//       );
//     }

//     if (showBackButton) {
//       return (
//         <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//           <Ionicons name="chevron-back" size={24} color={Colors.black} />
//         </TouchableOpacity>
//       );
//     }

//     return <View style={styles.backButton} />;
//   };

//   const getRightComponent = () => {
//     if (showLogoutAvatar && user) {
//       return (
//         <TouchableOpacity 
//           style={styles.avatarButton} 
//           onPress={handleLogout}
//         >
//           <View style={styles.avatarCircle}>
//             <Text style={styles.avatarText}>
//               {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
//             </Text>
//           </View>
//         </TouchableOpacity>
//       );
//     }

//     if (showSettingsIcon && user) {
//       return (
//         <TouchableOpacity 
//           style={styles.rightButton} 
//           onPress={() => router.push('/onboarding/settings/settings')}
//         >
//           <Ionicons name="settings-outline" size={24} color={Colors.black} />
//         </TouchableOpacity>
//       );
//     }

//     if (rightButton) {
//       return <View style={styles.rightButton}>{rightButton}</View>;
//     }

//     if (rightAction) {
//       return (
//         <TouchableOpacity style={styles.rightButton} onPress={rightAction.onPress}>
//           <Ionicons name={rightAction.icon as any} size={24} color={Colors.black} />
//         </TouchableOpacity>
//       );
//     }

//     return <View style={styles.placeholder} />;
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         {/* Blob / eclipse background layers */}
//         <View style={styles.blobTopRight} />
//         <View style={styles.blobBottomLeft} />

//         {/* Blur overlay */}
//         <BlurView intensity={Platform.OS === 'ios' ? 50 : 30} tint="light" style={StyleSheet.absoluteFill} />

//         {/* Noise texture overlay */}
//         <ImageBackground
//           source={require('../../../assets/images/noise-texture.png')}
//           style={StyleSheet.absoluteFill}
//           imageStyle={{ opacity: 0.03 }}
//         />

//         {/* Header */}
//         <View style={styles.header}>
//           {getLeftComponent()}

//           {showLogo ? (
//             <Image
//               source={require('../../../assets/images/tether-wordmark-black-large.png')}
//               style={styles.tetherLogo}
//               resizeMode="contain"
//             />
//           ) : (
//             <View style={styles.logoPlaceholder} />
//           )}

//           {getRightComponent()}
//         </View>

//         {/* Progress Bar */}
//         {typeof progress === 'number' && (
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
//     overflow: 'hidden',
//   },
//   blobTopRight: {
//     position: 'absolute',
//     top: -200,
//     right: -150,
//     width: 500,
//     height: 500,
//     borderRadius: 250,
//     backgroundColor: Colors.eclipseA,
//     opacity: 0.15,
//   },
//   blobBottomLeft: {
//     position: 'absolute',
//     bottom: -250,
//     left: -150,
//     width: 600,
//     height: 600,
//     borderRadius: 300,
//     backgroundColor: Colors.eclipseB,
//     opacity: 0.08,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: Spacing.md,
//     paddingTop: Spacing.md,
//     paddingBottom: Spacing.sm,
//     marginTop: Spacing.xxl,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'flex-start',
//   },
//   heartLogoContainer: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'flex-start',
//   },
//   heartLogo: {
//     width: 32,
//     height: 32,
//   },
//   tetherLogo: {
//     width: 81,
//     height: 25,
//     position: 'absolute',
//     left: '50%',
//     marginLeft: -40.5,
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
//   rightButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'flex-end',
//   },
//   avatarButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarCircle: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: Colors.darkOrange,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarText: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: 14,
//     fontWeight: FontWeights.semibold,
//     color: Colors.white,
//   },
// });