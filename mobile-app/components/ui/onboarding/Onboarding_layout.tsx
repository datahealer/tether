



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
//   showHeartLogo?: boolean;
//   showChatIcon?: boolean;
//   chatCount?: number;
//   onChatPress?: () => void;
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
//   showHeartLogo = false,
//   showChatIcon = false,
//   chatCount = 0,
//   onChatPress,
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
//     return (
//       <TouchableOpacity style={styles.backButton} onPress={() => {
//         if (router.canGoBack()) {
//           router.back();
//         } else {
//           // Fallback route - adjust to your app's home/default screen
//           router.replace('/onboarding/welcome');
//         }
//       }}>
//         <Image
//           source={require('../../../assets/images/back-arrow.png')}
//           style={styles.backArrowImage}
//           resizeMode="contain"
//         />
//       </TouchableOpacity>
//     );
//   }

//   return <View style={styles.backButton} />;
// };

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

//     if (showChatIcon || showSettingsIcon) {
//       return (
//         <View style={styles.rightButtonGroup}>
//           {showChatIcon && (
//             <TouchableOpacity 
//               style={styles.chatIconButton} 
//               onPress={onChatPress || (() => router.push('/home/both-expired'))}
//             >
//               <Image
//                 source={require('../../../assets/images/Chat.png')}
//                 style={styles.chatImage}
//                 resizeMode="contain"
//               />
//               {chatCount > 0 && (
//                 <View style={styles.chatCountBadge}>
//                   <Text style={styles.chatCountText}>{chatCount}</Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           )}
          
//           {showSettingsIcon && user && (
//             <TouchableOpacity 
//               style={styles.settingsIconButton} 
//               onPress={() => router.push('/onboarding/settings/settings')}
//             >
//               <Image
//                 source={require('../../../assets/images/settings-icon.png')}
//                 style={styles.settingsImage}
//                 resizeMode="contain"
//               />
//             </TouchableOpacity>
//           )}
//         </View>
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
//   backArrowImage: {
//     width: 24,
//     height: 24,
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
//   rightButtonGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//   },
//   chatIconButton: {
//     width: 56,
//     height: 36,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     borderWidth: 0.87,
//     borderColor: Colors.darkOrange,
//     // paddingLeft: 4
//   },
// chatImage: {
//     width: 19.5,
//     height: 19.5,
//     marginLeft: -10
//     // tintColor: Colors.darkOrange,
//   },
//   chatCountBadge: {
//     position: 'absolute',
//     top: 7,
//     right: 4,
//     // backgroundColor: Colors.darkOrange,
//     // borderRadius: 10,
//     minWidth: 20,
//     height: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 5,
//     // borderWidth: 2,
//     // borderColor: Colors.cream,
//   },
//   chatCountText: {
//     fontFamily: 'InterTight-Semibold',
//     fontSize: 13.5,
//     fontWeight: FontWeights.bold,
//     color: Colors.black,
//   },
//   settingsIconButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   settingsImage: {
//     width: 32,
//     height: 32,
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

//gif floew
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
//   showHeartLogo?: boolean;
//   showChatIcon?: boolean;
//   chatCount?: number;
//   onChatPress?: () => void;
//   // NEW: Optional prop to control tether line visibility
//   showTetherLine?: boolean; // Default: true (always show)
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
//   showHeartLogo = false,
//   showChatIcon = false,
//   chatCount = 0,
//   onChatPress,
//   showTetherLine = false, // Default to always showing
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
//     return (
//       <TouchableOpacity style={styles.backButton} onPress={() => {
//         if (router.canGoBack()) {
//           router.back();
//         } else {
//           router.replace('/onboarding/welcome');
//         }
//       }}>
//         <Image
//           source={require('../../../assets/images/back-arrow.png')}
//           style={styles.backArrowImage}
//           resizeMode="contain"
//         />
//       </TouchableOpacity>
//     );
//   }

//   return <View style={styles.backButton} />;
// };

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

//     if (showChatIcon || showSettingsIcon) {
//       return (
//         <View style={styles.rightButtonGroup}>
//           {showChatIcon && (
//             <TouchableOpacity 
//               style={styles.chatIconButton} 
//               onPress={onChatPress || (() => router.push('/home/both-expired'))}
//             >
//               <Image
//                 source={require('../../../assets/images/Chat.png')}
//                 style={styles.chatImage}
//                 resizeMode="contain"
//               />
//               {chatCount > 0 && (
//                 <View style={styles.chatCountBadge}>
//                   <Text style={styles.chatCountText}>{chatCount}</Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           )}
          
//           {showSettingsIcon && user && (
//             <TouchableOpacity 
//               style={styles.settingsIconButton} 
//               onPress={() => router.push('/onboarding/settings/settings')}
//             >
//               <Image
//                 source={require('../../../assets/images/settings-icon.png')}
//                 style={styles.settingsImage}
//                 resizeMode="contain"
//               />
//             </TouchableOpacity>
//           )}
//         </View>
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
//         {/* Blob / eclipse background layers - zIndex: 1 */}
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

//         {/* TETHER LINE ANIMATION (GIF) - zIndex: 2
//             Sits ABOVE texture/blobs but BELOW all content */}
//         {showTetherLine && (
//           <Image
//             source={require('../../../assets/animations/animation.gif')}
//             style={styles.tetherLineAnimation}
//             resizeMode="cover"
//           />
//         )}

//         {/* Header - zIndex: 10 */}
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

//         {/* Progress Bar - zIndex: 10 */}
//         {typeof progress === 'number' && (
//           <View style={styles.progressSection}>
//             <View style={styles.progressContainer}>
//               <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
//             </View>
//           </View>
//         )}

//         {/* Content (Cards, CTAs, etc.) - zIndex: 10 */}
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
//     zIndex: 1,
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
//     zIndex: 1,
//   },
//   tetherLineAnimation: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     width: '100%',
//     height: '100%',
//     zIndex: 2, // Above texture, below content
//     opacity: 0.7, // Adjust for desired visibility (0.4-0.9 recommended)
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: Spacing.md,
//     paddingTop: Spacing.md,
//     paddingBottom: Spacing.sm,
//     marginTop: Spacing.xxl,
//     zIndex: 10,
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
//   backArrowImage: {
//     width: 24,
//     height: 24,
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
//     zIndex: 10,
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
//     zIndex: 10,
//   },
//   rightButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'flex-end',
//   },
//   rightButtonGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//   },
//   chatIconButton: {
//     width: 56,
//     height: 36,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     borderWidth: 0.87,
//     borderColor: Colors.darkOrange,
//   },
//   chatImage: {
//     width: 19.5,
//     height: 19.5,
//     marginLeft: -10
//   },
//   chatCountBadge: {
//     position: 'absolute',
//     top: 7,
//     right: 4,
//     minWidth: 20,
//     height: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 5,
//   },
//   chatCountText: {
//     fontFamily: 'InterTight-Semibold',
//     fontSize: 13.5,
//     fontWeight: FontWeights.bold,
//     color: Colors.black,
//   },
//   settingsIconButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   settingsImage: {
//     width: 32,
//     height: 32,
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

//.webp
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity, Image, Platform, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth_context';
import { Colors, Spacing, FontWeights } from '../../../theme/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationDebounce } from '@/hooks/useNavigationDebounce';

// Preload all 81 static .webp frames
// Files are located in assets/loops/ and named:
// Looping tether line for app_final_left side pull_000.webp
// Looping tether line for app_final_left side pull_001.webp
// ...
// Looping tether line for app_final_left side pull_081.webp

const frames = [
  require('../../../assets/loops/loop_000t.png'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_001.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_002.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_003.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_004.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_005.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_006.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_007.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_008.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_009.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_010.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_011.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_012.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_013.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_014.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_015.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_016.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_017.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_018.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_019.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_020.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_021.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_022.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_023.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_024.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_025.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_026.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_027.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_028.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_029.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_030.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_031.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_032.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_033.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_034.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_035.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_036.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_037.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_038.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_039.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_040.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_041.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_042.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_043.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_044.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_045.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_046.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_047.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_048.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_049.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_050.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_051.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_052.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_053.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_054.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_055.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_056.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_057.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_058.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_059.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_060.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_061.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_062.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_063.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_064.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_065.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_066.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_067.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_068.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_069.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_070.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_071.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_072.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_073.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_074.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_075.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_076.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_077.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_078.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_079.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_080.webp'),
  // require('../../../assets/loops/Looping tether line for app_final_left side pull_081.webp'),
];

interface OnboardingLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  showLogo?: boolean;
  showSettingsIcon?: boolean;
  showLogoutAvatar?: boolean;
  showHeartLogo?: boolean;
  showChatIcon?: boolean;
  chatCount?: number;
  chatIconActive?: boolean; // New: indicates unseen activity (orange state)
  onChatPress?: () => void;
  showTetherLine?: boolean;
  showProgress?: boolean;
  progress?: number;
  rightButton?: React.ReactNode;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
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
  chatIconActive = false,
  onChatPress,
  showTetherLine = true,
}: OnboardingLayoutProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { push: debouncedPush, isNavigating } = useNavigationDebounce();
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    if (!showTetherLine) return;

    const fps = 30; // Adjust if needed to match your animation timing
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [showTetherLine]);

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
        <TouchableOpacity style={styles.avatarButton} onPress={handleLogout}>
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
              style={[
                styles.chatIconButton,
                chatIconActive && styles.chatIconButtonActive,
              ]}
              onPress={onChatPress || (() => debouncedPush('/home/tether-history'))}
              disabled={isNavigating}
            >
              <Image
                source={require('../../../assets/images/Chat.png')}
                style={[
                  styles.chatImage,
                  chatIconActive && styles.chatImageActive,
                  isNavigating && { opacity: 0.5 }
                ]}
                resizeMode="contain"
              />
              {chatCount > 0 && (
                <View style={styles.chatCountBadge}>
                  <Text style={[
                    styles.chatCountText,
                    chatIconActive && styles.chatCountTextActive,
                  ]}>{chatCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {showSettingsIcon && user && (
            <TouchableOpacity
              style={styles.settingsIconButton}
              onPress={() => debouncedPush('/onboarding/settings/settings')}
              disabled={isNavigating}
            >
              <Image
                source={require('../../../assets/images/settings-icon.png')}
                style={[
                  styles.settingsImage,
                  isNavigating && { opacity: 0.5 }
                ]}
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
    <View style={styles.fullScreen}>
      <View style={styles.container}>
        <View style={styles.blobTopRight} />
        <View style={styles.blobBottomLeft} />

        <BlurView intensity={Platform.OS === 'ios' ? 50 : 30} tint="light" style={StyleSheet.absoluteFill} />

        <ImageBackground
          source={require('../../../assets/images/noise-texture.png')}
          style={StyleSheet.absoluteFill}
          imageStyle={{ opacity: 0.03 }}
        />

        {showTetherLine && (
          <Image
            source={frames[currentFrame]}
            style={styles.tetherLineAnimation}
            resizeMode="cover"
          />
        )}
      </View>

      <SafeAreaView style={styles.safeArea}>
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

        {typeof progress === 'number' && (
          <View style={styles.progressSection}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        )}

        <View style={styles.content}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  safeArea: {
    flex: 1,
    zIndex: 10,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    zIndex: 1,
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
    zIndex: 1,
  },
  tetherLineAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 2,
    opacity: 0.7,
    pointerEvents: 'none',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    marginTop: Spacing.xxl,
    zIndex: 10,
    position: 'relative',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'absolute',
    left: Spacing.md,
    zIndex: 15,
  },
  heartLogoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'absolute',
    left: Spacing.md,
    zIndex: 15,
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
  },
  logoPlaceholder: {
    width: 81,
    height: 25,
  },
  placeholder: {
    width: 40,
    position: 'absolute',
    right: Spacing.md,
  },
  progressSection: {
    paddingTop: Spacing.sm,
    zIndex: 10,
  },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.mediumGrey,
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
    zIndex: 20,
  },
  rightButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
    position: 'absolute',
    right: Spacing.md,
    zIndex: 15,
  },
  rightButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    position: 'absolute',
    right: Spacing.md,
    zIndex: 15,
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
  },
  chatIconButtonActive: {
    backgroundColor: Colors.darkOrange, // Solid dark orange when active
    borderColor: Colors.darkOrange,
  },
  chatImage: {
    width: 19.5,
    height: 19.5,
    marginLeft: -10,
    tintColor: Colors.darkOrange, // Dark orange icon in normal state
  },
  chatImageActive: {
    tintColor: Colors.white, // White icon when active
  },
  chatCountBadge: {
    position: 'absolute',
    top: 7,
    right: 4,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  chatCountText: {
    fontFamily: 'InterTight-Semibold',
    fontSize: 13.5,
    fontWeight: FontWeights.bold,
    color: Colors.black, // Black in normal state
  },
  chatCountTextActive: {
    color: Colors.white, // White when active
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
    position: 'absolute',
    right: Spacing.md,
    zIndex: 15,
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