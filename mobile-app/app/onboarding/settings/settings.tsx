// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   DebouncedButton,
//   ScrollView,
//   Image,
//   Alert,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import { useAuth } from '@/context/auth_context';
// import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

// interface SettingsItemProps {
//   icon: string;
//   label: string;
//   value?: string;
//   onPress: () => void;
//   isExternal?: boolean;
// }

// const SettingsItem: React.FC<SettingsItemProps> = ({ icon, label, value, onPress, isExternal }) => (
//   <DebouncedButton style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
//     <View style={styles.settingsItemLeft}>
//       <Ionicons name={icon as any} size={20} color={Colors.darkOrange} />
//       <Text style={styles.settingsItemLabel}>{label}</Text>
//     </View>
//     <View style={styles.settingsItemRight}>
//       {value && <Text style={styles.settingsItemValue}>{value}</Text>}
//       <Ionicons 
//         name={isExternal ? "open-outline" : "chevron-forward"} 
//         size={20} 
//         color={Colors.darkGrey} 
//       />
//     </View>
//   </DebouncedButton>
// );

// export default function SettingsScreen() {
//   const router = useRouter();
//   const { user, signOut } = useAuth();

//   const handleLogout = async () => {
//     Alert.alert(
//       'Log Out',
//       'Are you sure you want to log out?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Log Out',
//           style: 'destructive',
//           onPress: async () => {
//             await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//             await signOut();
//             await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//             router.replace('/onboarding/account-creation');
//           },
//         },
//       ]
//     );
//   };

//   const handlePress = async (action: string) => {
//     await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
//     switch (action) {
//     case 'profile':
//       router.push('/onboarding/settings/profile-details');
//       break;
//       case 'notifications':
//         // Navigate to notifications settings
//         Alert.alert('Coming Soon', 'Notifications settings coming soon');
//         break;
//       case 'language':
//         // Navigate to language settings
//         Alert.alert('Coming Soon', 'Language settings coming soon');
//         break;
//       case 'premium':
//         // Navigate to premium
//         Alert.alert('Coming Soon', 'Premium subscription coming soon');
//         break;
//       case 'subscription':
//         // Navigate to subscription management
//         Alert.alert('Coming Soon', 'Subscription management coming soon');
//         break;
//       case 'restore':
//         // Restore purchases
//         Alert.alert('Coming Soon', 'Restore purchases coming soon');
//         break;
//       case 'privacy':
//         // Navigate to privacy
//         Alert.alert('Coming Soon', 'Privacy & Control coming soon');
//         break;
//       case 'feedback':
//         // Navigate to feedback
//         Alert.alert('Coming Soon', 'Feedback form coming soon');
//         break;
//       case 'message':
//         // Navigate to message
//         Alert.alert('Coming Soon', 'Message support coming soon');
//         break;
//       case 'invite':
//         // Share invite
//         Alert.alert('Coming Soon', 'Invite a friend coming soon');
//         break;
//       case 'instagram':
//         // Open Instagram
//         Alert.alert('Coming Soon', 'Instagram link coming soon');
//         break;
//       case 'tiktok':
//         // Open TikTok
//         Alert.alert('Coming Soon', 'TikTok link coming soon');
//         break;
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <DebouncedButton onPress={() => router.back()} style={styles.closeButton}>
//           <Ionicons name="close" size={24} color={Colors.black} />
//         </DebouncedButton>
//         <Text style={styles.headerTitle}>Settings</Text>
//         <View style={styles.placeholder} />
//       </View>

//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {/* Profile Card */}
//         <View style={styles.profileCard}>
//           <View style={styles.profileAvatar}>
//             {user?.profilePicture ? (
//               <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
//             ) : (
//               <Ionicons name="person" size={32} color={Colors.darkOrange} />
//             )}
//           </View>
//           <Text style={styles.profileName}>{user?.name || 'User'}</Text>
//         </View>

//         {/* Account Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Account</Text>
//           <View style={styles.sectionContent}>
//             <SettingsItem
//               icon="person-outline"
//               label="Profile Details"
//               onPress={() => handlePress('profile')}
//             />
//             <SettingsItem
//               icon="notifications-outline"
//               label="Notifications & Rhythm"
//               onPress={() => handlePress('notifications')}
//             />
//             <SettingsItem
//               icon="language-outline"
//               label="Language"
//               value="English"
//               onPress={() => handlePress('language')}
//             />
//           </View>
//         </View>

//         {/* Subscription Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Subscription</Text>
//           <View style={styles.sectionContent}>
//             <SettingsItem
//               icon="diamond-outline"
//               label="Try Premium"
//               onPress={() => handlePress('premium')}
//             />
//             <SettingsItem
//               icon="card-outline"
//               label="Manage Subscription"
//               onPress={() => handlePress('subscription')}
//             />
//             <SettingsItem
//               icon="refresh-outline"
//               label="Restore Purchases"
//               onPress={() => handlePress('restore')}
//             />
//           </View>
//         </View>

//         {/* Your Data Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Your Data</Text>
//           <View style={styles.sectionContent}>
//             <SettingsItem
//               icon="lock-closed-outline"
//               label="Privacy & Control"
//               onPress={() => handlePress('privacy')}
//             />
//           </View>
//         </View>

//         {/* Support Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Support</Text>
//           <View style={styles.sectionContent}>
//             <SettingsItem
//               icon="chatbubble-outline"
//               label="I have feedback"
//               onPress={() => handlePress('feedback')}
//             />
//             <SettingsItem
//               icon="mail-outline"
//               label="Send us a message"
//               onPress={() => handlePress('message')}
//             />
//           </View>
//         </View>

//         {/* Community Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Community</Text>
//           <View style={styles.sectionContent}>
//             <SettingsItem
//               icon="person-add-outline"
//               label="Invite a friend"
//               onPress={() => handlePress('invite')}
//             />
//             <SettingsItem
//               icon="logo-instagram"
//               label="Instagram"
//               onPress={() => handlePress('instagram')}
//               isExternal
//             />
//             <SettingsItem
//               icon="logo-tiktok"
//               label="TikTok"
//               onPress={() => handlePress('tiktok')}
//               isExternal
//             />
//           </View>
//         </View>

//         {/* Log Out Button */}
//         <DebouncedButton style={styles.logoutButton} onPress={handleLogout}>
//           <Text style={styles.logoutButtonText}>Log Out</Text>
//         </DebouncedButton>

//         <View style={{ height: Spacing.xxl }} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.cream,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: Spacing.md,
//     paddingTop: Spacing.xxl + Spacing.lg,
//     paddingBottom: Spacing.md,
//   },
//   closeButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'flex-start',
//   },
//   headerTitle: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.large + 4,
//     fontWeight: FontWeights.semibold,
//     color: Colors.black,
//   },
//   placeholder: {
//     width: 40,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   profileCard: {
//     backgroundColor: Colors.white,
//     marginHorizontal: Spacing.md,
//     marginTop: Spacing.md,
//     marginBottom: Spacing.lg,
//     borderRadius: BorderRadius.md,
//     padding: Spacing.lg,
//     alignItems: 'center',
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   profileAvatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: Colors.veryLightOrange,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: Spacing.sm,
//   },
//   avatarImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//   },
//   profileName: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.large,
//     fontWeight: FontWeights.semibold,
//     color: Colors.black,
//   },
//   section: {
//     marginBottom: Spacing.lg,
//   },
//   sectionTitle: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.medium,
//     fontWeight: FontWeights.semibold,
//     color: Colors.black,
//     paddingHorizontal: Spacing.md,
//     marginBottom: Spacing.sm,
//   },
//   sectionContent: {
//     backgroundColor: Colors.white,
//     marginHorizontal: Spacing.md,
//     borderRadius: BorderRadius.md,
//     overflow: 'hidden',
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 1,
//   },
//   settingsItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: Spacing.md,
//     paddingHorizontal: Spacing.md,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.mediumGrey,
//   },
//   settingsItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.md,
//     flex: 1,
//   },
//   settingsItemLabel: {
//     fontFamily: 'SFProDisplay-Regular',
//     fontSize: FontSizes.input,
//     fontWeight: FontWeights.regular,
//     color: Colors.black,
//   },
//   settingsItemRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//   },
//   settingsItemValue: {
//     fontFamily: 'SFProDisplay-Regular',
//     fontSize: FontSizes.medium,
//     color: Colors.darkGrey,
//   },
//   logoutButton: {
//     marginHorizontal: Spacing.md,
//     marginTop: Spacing.lg,
//     backgroundColor: Colors.white,
//     borderRadius: BorderRadius.xl,
//     paddingVertical: Spacing.md,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: Colors.darkOrange,
//   },
//   logoutButtonText: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.input,
//     fontWeight: FontWeights.semibold,
//     color: Colors.darkOrange,
//   },
// });


import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  
  Image,
  Alert,
  Share
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/auth_context';
import LanguageModal from '@/components/ui/profile/LanguageModal';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import { restoreSubscriptionPurchases } from '@/services/subscription';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';


interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  isExternal?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon, label, value, onPress, isExternal }) => (
  <DebouncedButton style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingsItemLeft}>
      <Ionicons name={icon as any} size={20} color={Colors.darkOrange} />
      <Text style={styles.settingsItemLabel}>{label}</Text>
    </View>
    <View style={styles.settingsItemRight}>
      {value && <Text style={styles.settingsItemValue}>{value}</Text>}
      <Ionicons 
        name={isExternal ? "open-outline" : "chevron-forward"} 
        size={20} 
        color={Colors.darkGrey} 
      />
    </View>
  </DebouncedButton>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut, signIn } = useAuth();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isRestoringPurchases, setIsRestoringPurchases] = useState(false);

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

  const handleInviteFriend = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const message = `Hey! I'm using Tether to strengthen my relationship. Join me on the app!\n\nDownload Tether: https://tether.app`;
      
      const result = await Share.share({
        message,
        title: 'Join me on Tether',
      });

      if (result.action === Share.sharedAction) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share invite');
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsRestoringPurchases(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      console.log('🔄 Restoring purchases...');
      
      const result = await restoreSubscriptionPurchases();
      
      if (result.isPremium) {
        // Update user context
        if (user) {
          await signIn({
            ...user,
            subscribed: true,
          });
        }
        
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        Alert.alert(
          'Purchases Restored! 🎉',
          'Your premium subscription has been restored.',
          [{ text: 'OK' }]
        );
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        
        Alert.alert(
          'No Purchases Found',
          'We couldn\'t find any purchases to restore. If you believe this is an error, please contact support.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Restore purchases error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'Restore Failed',
        error.message || 'Failed to restore purchases. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRestoringPurchases(false);
    }
  };

  const handlePress = async (action: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (action) {
      case 'profile':
        router.push('/onboarding/settings/profile-details');
        break;
      case 'notifications':
        router.push('/onboarding/settings/rhythm-settings');
        break;
      case 'language':
        setShowLanguageModal(true);
        break;
      case 'premium':
        router.push('/onboarding/settings/premium');
        break;
      case 'subscription':
        router.push('/onboarding/settings/manage-subscription');
        break;
      case 'restore':
        handleRestorePurchases();
        break;
      case 'privacy':
        router.push('/onboarding/settings/privacy-control');
        break;
      case 'feedback':
        router.push('/onboarding/settings/feedback');
        break;
      case 'message':
        router.push('/onboarding/settings/send-message');
        break;
      case 'invite':
        handleInviteFriend();
        break;
      case 'instagram':
        Alert.alert('Coming Soon', 'Instagram link coming soon');
        break;
      case 'tiktok':
        Alert.alert('Coming Soon', 'TikTok link coming soon');
        break;
    }
  };

  const handleSaveLanguage = (language: string) => {
    const languageMap: { [key: string]: string } = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
    };
    setSelectedLanguage(languageMap[language] || 'English');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <DebouncedButton onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.black} />
        </DebouncedButton>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={32} color={Colors.darkOrange} />
            )}
          </View>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon="person-outline"
              label="Profile Details"
              onPress={() => handlePress('profile')}
            />
            <SettingsItem
              icon="notifications-outline"
              label="Notifications & Rhythm"
              onPress={() => handlePress('notifications')}
            />
            <SettingsItem
              icon="language-outline"
              label="Language"
              value={selectedLanguage}
              onPress={() => handlePress('language')}
            />
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon="diamond-outline"
              label="Try Premium"
              onPress={() => handlePress('premium')}
            />
            <SettingsItem
              icon="card-outline"
              label="Manage Subscription"
              onPress={() => handlePress('subscription')}
            />
            <SettingsItem
              icon="refresh-outline"
              label="Restore Purchases"
              onPress={() => handlePress('restore')}
            />
          </View>
        </View>

        {/* Your Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon="lock-closed-outline"
              label="Privacy & Control"
              onPress={() => handlePress('privacy')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon="chatbubble-outline"
              label="I have feedback"
              onPress={() => handlePress('feedback')}
            />
            <SettingsItem
              icon="mail-outline"
              label="Send us a message"
              onPress={() => handlePress('message')}
            />
          </View>
        </View>

        {/* Community Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon="person-add-outline"
              label="Invite a friend"
              onPress={() => handlePress('invite')}
            />
            <SettingsItem
              icon="logo-instagram"
              label="Instagram"
              onPress={() => handlePress('instagram')}
              isExternal
            />
            <SettingsItem
              icon="logo-tiktok"
              label="TikTok"
              onPress={() => handlePress('tiktok')}
              isExternal
            />
          </View>
        </View>

        {/* Log Out Button */}
        <DebouncedButton style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </DebouncedButton>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Language Modal */}
      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onSave={handleSaveLanguage}
        currentLanguage="en"
      />
     

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xxl + Spacing.lg,
    paddingBottom: Spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.large + 4,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.veryLightOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileName: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGrey,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  settingsItemLabel: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.regular,
    color: Colors.black,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingsItemValue: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    color: Colors.darkGrey,
  },
  logoutButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.darkOrange,
  },
  logoutButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
  },
});