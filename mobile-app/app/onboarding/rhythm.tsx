// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   DebouncedButton,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
// import { useOnboarding } from '@/context/onboarding_context';
// import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

// type RhythmOption = 'Every day' | 'A few times a week' | 'Once a week' | "We'll decide as we go";

// export default function RhythmScreen() {
//   const router = useRouter();
//   const { updateField, onboardingData } = useOnboarding();
//   const [selectedRhythm, setSelectedRhythm] = useState<RhythmOption | null>(null);

//   const rhythms: RhythmOption[] = [
//     'Every day',
//     'A few times a week',
//     'Once a week',
//     "We'll decide as we go",
//   ];

//   const handleSelect = (rhythm: RhythmOption) => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     setSelectedRhythm(rhythm);
//   };

//   const handleContinue = async () => {
//     if (!selectedRhythm) {
//       Alert.alert('Required', 'Please select a rhythm');
//       return;
//     }

//     await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

//     try {
//       updateField('rhythm', selectedRhythm);
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
//       // Show notification permission modal
//       router.push('/onboarding/notification-permission');
//     } catch (error) {
//       console.error('Error saving rhythm:', error);
//       Alert.alert('Error', 'Failed to save rhythm');
//     }
//   };

//   return (
//     <OnboardingLayout progress={0.77} showBackButton={true} showLogoutAvatar={true}>
//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.content}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Heading */}
//         <Text style={styles.heading}>
//           Choose how often you{'\n'}would like to be Tethered
//         </Text>

//         {/* Subtitle */}
//         <Text style={styles.subtitle}>
//           Set a rhythm that fits your relationship.
//         </Text>

//         {/* Options */}
//         <View style={styles.optionsContainer}>
//           {rhythms.map((rhythm) => {
//             const isSelected = selectedRhythm === rhythm;
            
//             return (
//               <DebouncedButton
//                 key={rhythm}
//                 style={[
//                   styles.optionButton,
//                   isSelected && styles.optionButtonSelected,
//                 ]}
//                 onPress={() => handleSelect(rhythm)}
//                 activeOpacity={0.7}
//               >
//                 <Text
//                   style={[
//                     styles.optionText,
//                     isSelected && styles.optionTextSelected,
//                   ]}
//                 >
//                   {rhythm}
//                 </Text>
//                 {isSelected && (
//                   <Ionicons name="checkmark" size={24} color={Colors.darkOrange} />
//                 )}
//               </DebouncedButton>
//             );
//           })}
//         </View>

//         {/* Spacer */}
//         <View style={{ flex: 1, minHeight: Spacing.xxl }} />

//         {/* Continue Button */}
//         <DebouncedButton
//           style={[
//             styles.continueButton,
//             !selectedRhythm && styles.continueButtonDisabled,
//           ]}
//           onPress={handleContinue}
//           disabled={!selectedRhythm}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.buttonText}>Set Our Rhythm</Text>
//         </DebouncedButton>
//       </ScrollView>
//     </OnboardingLayout>
//   );
// }

// const styles = StyleSheet.create({
//   scrollView: {
//     flex: 1,
//   },
//   content: {
//     flexGrow: 1,
//     paddingBottom: Spacing.xl,
//   },
//   heading: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.heading,
//     lineHeight: 36,
//     fontWeight: FontWeights.semibold,
//     color: Colors.black,
//     marginBottom: Spacing.sm,
//     letterSpacing: 0,
//   },
//   subtitle: {
//     fontFamily: 'InterTight-Regular',
//     fontSize: FontSizes.medium,
//     lineHeight: 20,
//     fontWeight: FontWeights.regular,
//     color: Colors.inputText,
//     marginBottom: Spacing.xl,
//     letterSpacing: 0,
//   },
//   optionsContainer: {
//     gap: Spacing.md,
//   },
//   optionButton: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: Colors.veryLightOrange,
//     paddingVertical: 20,
//     paddingHorizontal: 24,
//     borderRadius: BorderRadius.md,
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   optionButtonSelected: {
//     backgroundColor: Colors.white,
//     borderColor: Colors.darkOrange,
//   },
//   optionText: {
//     fontFamily: 'SFProDisplay-Regular',
//     fontSize: FontSizes.input,
//     lineHeight: 24,
//     fontWeight: FontWeights.regular,
//     color: Colors.black,
//     letterSpacing: 0,
//   },
//   optionTextSelected: {
//     fontFamily: 'SFProDisplay-Semibold',
//     fontWeight: FontWeights.semibold,
//     color: Colors.darkOrange,
//   },
//   continueButton: {
//     backgroundColor: Colors.darkOrange,
//     borderRadius: BorderRadius.xl,
//     paddingVertical: 18,
//     alignItems: 'center',
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//     marginTop: Spacing.lg,
//   },
//   continueButtonDisabled: {
//     opacity: 0.5,
//   },
//   buttonText: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.buttonLarge,
//     lineHeight: 28,
//     fontWeight: FontWeights.semibold,
//     color: Colors.white,
//     letterSpacing: 0.45,
//   },
// });

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import NotificationPermissionModal from '../../components/ui/onboarding/NotificationModal';
import { useOnboarding } from '@/context/onboarding_context';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';
import { center } from '@shopify/react-native-skia';

type RhythmOption = 'Every day' | 'A few times a week' | 'Once a week' | "We'll decide as we go";

export default function RhythmScreen() {
  const router = useRouter();
  const { updateField, onboardingData } = useOnboarding();
  const [selectedRhythm, setSelectedRhythm] = useState<RhythmOption | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const rhythms: RhythmOption[] = [
    'Every day',
    'A few times a week',
    'Once a week',
    "We'll decide as we go",
  ];

  const handleSelect = (rhythm: RhythmOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRhythm(rhythm);
  };

  const handleContinue = async () => {
    if (!selectedRhythm) {
      Alert.alert('Required', 'Please select a rhythm');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      updateField('rhythm', selectedRhythm);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show notification permission modal
      setShowNotificationModal(true);
    } catch (error) {
      console.error('Error saving rhythm:', error);
      Alert.alert('Error', 'Failed to save rhythm');
    }
  };

  const handleNotificationModalContinue = () => {
    setShowNotificationModal(false);
    router.push('/onboarding/connect-tether-screen');
  };

  const partnerName = onboardingData.partnerFirstName || 'Partner';

  return (
    <OnboardingLayout progress={0.49} showBackButton={true} showLogoutAvatar={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>
          Choose how often you{'\n'}would like to be Tethered
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Set a rhythm that fits your relationship.
        </Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {rhythms.map((rhythm) => {
            const isSelected = selectedRhythm === rhythm;
            
            return (
              <DebouncedButton
                key={rhythm}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => handleSelect(rhythm)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {rhythm}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={24} color={Colors.darkOrange} />
                )}
              </DebouncedButton>
            );
          })}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: Spacing.xxl }} />

        {/* Continue Button */}
        <DebouncedButton
          style={[
            styles.continueButton,
            !selectedRhythm && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRhythm}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Set Our Rhythm</Text>
        </DebouncedButton>
      </ScrollView>

      {/* Notification Permission Modal */}
      <NotificationPermissionModal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onContinue={handleNotificationModalContinue}
        partnerName={partnerName}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
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
  },
  subtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.medium,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    marginBottom: Spacing.xl,
    letterSpacing: 0,
     textAlign: 'center',
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.veryLightOrange,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: Colors.white,
    borderColor: Colors.darkOrange,
  },
  optionText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    lineHeight: 24,
    fontWeight: FontWeights.regular,
    color: Colors.black,
    letterSpacing: 0,
  },
  optionTextSelected: {
    fontFamily: 'SFProDisplay-Semibold',
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
  },
  continueButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginTop: Spacing.lg,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
});