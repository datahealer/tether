

// import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';
// import { useState, useEffect } from 'react';
// import { useOnboarding } from '@/context/onboarding_context';

// const goalOptions = [
//   { id: 'communication', label: 'Better communication', emoji: '💬' },
//   { id: 'fun', label: 'More fun together', emoji: '🎉' },
//   { id: 'connection', label: 'Deeper connection', emoji: '🧡' },
//   { id: 'trust', label: 'Strengthening trust', emoji: '🤝' },
//   { id: 'learning', label: 'Learning something new', emoji: '👀' },
//   { id: 'spark', label: 'Keeping the spark alive', emoji: '✨' },
//   { id: 'long-distance', label: 'Long distance support', emoji: '🌍' },
// ];

// export default function GoalsScreen() {
//   const router = useRouter();
//   const { onboardingData, updateField } = useOnboarding();
//   const [selected, setSelected] = useState<string[]>(onboardingData.goals || []);

//   useEffect(() => {
//     if (onboardingData.goals && onboardingData.goals.length > 0) {
//       setSelected(onboardingData.goals);
//     }
//   }, []);

//   const toggleGoal = (id: string) => {
//     const newSelected = selected.includes(id)
//       ? selected.filter((item) => item !== id)
//       : [...selected, id];
    
//     setSelected(newSelected);
//     updateField('goals', newSelected);
//   };

//   const handleContinue = () => {
//     if (selected.length > 0) {
//       router.push('/onboarding/tone');
//     }
//   };

//   return (
//     <LinearGradient
//       colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
//       style={styles.container}
//     >
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Text style={styles.backText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.progress}>3/8</Text>
//         <TouchableOpacity onPress={() => router.push('/onboarding/tone')}>
//           <Text style={styles.closeText}>✕</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
//         <Text style={styles.title}>What would you like to get out of this?</Text>
//         <Text style={styles.subtitle}>Pick one or two goals</Text>

//         <View style={styles.optionsContainer}>
//           {goalOptions.map((option) => (
//             <TouchableOpacity
//               key={option.id}
//               style={[
//                 styles.optionChip,
//                 selected.includes(option.id) && styles.optionChipSelected,
//               ]}
//               onPress={() => toggleGoal(option.id)}
//             >
//               <Text style={styles.optionEmoji}>{option.emoji}</Text>
//               <Text style={styles.optionLabel}>{option.label}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </ScrollView>

//       <View style={styles.bottomContainer}>
//         <TouchableOpacity
//           style={[styles.primaryButton, selected.length === 0 && styles.buttonDisabled]}
//           disabled={selected.length === 0}
//           onPress={handleContinue}
//         >
//           <Text style={styles.primaryButtonText}>Continue</Text>
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
//   },
//   contentContainer: {
//     paddingHorizontal: 24,
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
//     marginBottom: 24,
//   },
//   optionsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   optionChip: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 24,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   optionChipSelected: {
//     borderColor: '#FF9B7A',
//   },
//   optionEmoji: {
//     fontSize: 18,
//   },
//   optionLabel: {
//     fontSize: 14,
//     color: '#2C2C2C',
//     fontWeight: '500',
//   },
//   bottomContainer: {
//     paddingHorizontal: 24,
//     paddingBottom: 50,
//   },
//   primaryButton: {
//     backgroundColor: '#FF9B7A',
//     paddingVertical: 18,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   buttonDisabled: {
//     opacity: 0.5,
//   },
//   primaryButtonText: {
//     color: '#FFFFFF',
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
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useOnboarding } from '@/context/onboarding_context';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

const goalOptions = [
  { id: 'communication', label: 'Better Communication' },
  { id: 'connection', label: 'Deeper Connection' },
  { id: 'spark', label: 'Keeping the Spark Alive' },
  { id: 'fun', label: 'More Fun Together' },
  { id: 'adventures', label: 'Plan More Adventures' },
  { id: 'trust', label: 'Strengthening Trust' },
  { id: 'appreciation', label: 'Feeling More Appreciated' },
  { id: 'spice', label: 'Add Some Spice' },
  { id: 'healing', label: 'Healing & Rebuilding' },
  { id: 'long-distance', label: 'Long Distance Support' },
];

export default function GoalsScreen() {
  const router = useRouter();
  const { onboardingData, updateField } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(onboardingData.goals || []);

  const toggleGoal = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newSelected = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];
    
    setSelected(newSelected);
    updateField('goals', newSelected);
  };

  const handleContinue = async () => {
    if (selected.length === 0) {
      Alert.alert('Required', 'Please select at least one goal');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/onboarding/tone');
    } catch (error) {
      console.error('Error saving goals:', error);
      Alert.alert('Error', 'Failed to save information');
    }
  };

  return (
    <OnboardingLayout progress={0.75} showBackButton={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>
          What do you want Tether{'\n'}to help you strengthen?
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          You can choose more than one area
        </Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {goalOptions.map((option) => {
            const isSelected = selected.includes(option.id);
            
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => toggleGoal(option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={16} color={Colors.darkOrange} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: Spacing.xxl * 2 }} />

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            selected.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selected.length === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Set My Goals</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  subtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.medium,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    marginBottom: Spacing.xl,
    letterSpacing: 0,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionCard: {
    backgroundColor: Colors.veryLightOrange,
    borderRadius: BorderRadius.md,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: Colors.white,
    borderColor: Colors.darkOrange,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    lineHeight: 24,
    fontWeight: FontWeights.regular,
    color: Colors.black,
    letterSpacing: 0,
  },
  optionLabelSelected: {
    fontFamily: 'SFProDisplay-Semibold',
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.darkOrange,
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