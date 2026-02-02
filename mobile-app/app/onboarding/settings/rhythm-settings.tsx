import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '@/components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

interface RhythmOption {
  id: string;
  label: string;
  enabled: boolean;
}

export default function RhythmSettingsScreen() {
  const router = useRouter();

  const [rhythmOptions, setRhythmOptions] = useState<RhythmOption[]>([
    { id: 'everyday', label: 'Everyday', enabled: false },
    { id: 'few-times-week', label: 'A few times a week', enabled: false },
    { id: 'once-week', label: 'Once a week', enabled: true },
  ]);

  const [notificationOptions, setNotificationOptions] = useState([
    { id: 'new-question', label: 'New Question Available', enabled: false },
    { id: 'partner-answered', label: 'Partner Answered', enabled: false },
    { id: 'question-expiring', label: 'Question Expiring Soon', enabled: false },
    { id: 'all-off', label: 'All Notifications Off', enabled: true },
  ]);

  const toggleRhythm = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRhythmOptions(prev =>
      prev.map(option => ({
        ...option,
        enabled: option.id === id,
      }))
    );
  };

  const toggleNotification = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (id === 'all-off') {
      setNotificationOptions(prev =>
        prev.map(option => ({
          ...option,
          enabled: option.id === 'all-off',
        }))
      );
    } else {
      setNotificationOptions(prev =>
        prev.map(option => ({
          ...option,
          enabled: option.id === id ? !option.enabled : option.id === 'all-off' ? false : option.enabled,
        }))
      );
    }
  };

  return (
    <OnboardingLayout showBackButton={true} showLogo={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.heading}>Tether Rhythm</Text>

        {/* Rhythm Section */}
        <View style={styles.section}>
          {rhythmOptions.map((option, index) => (
            <View
              key={option.id}
              style={[
                styles.optionItem,
                index === rhythmOptions.length - 1 && styles.optionItemLast,
              ]}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Switch
                value={option.enabled}
                onValueChange={() => toggleRhythm(option.id)}
                trackColor={{ false: Colors.mediumGrey, true: Colors.darkOrange }}
                thumbColor={Colors.white}
                ios_backgroundColor={Colors.mediumGrey}
              />
            </View>
          ))}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications (Based on Rhythm)</Text>
          
          {notificationOptions.map((option, index) => (
            <View
              key={option.id}
              style={[
                styles.optionItem,
                index === notificationOptions.length - 1 && styles.optionItemLast,
              ]}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Switch
                value={option.enabled}
                onValueChange={() => toggleNotification(option.id)}
                trackColor={{ false: Colors.mediumGrey, true: Colors.darkOrange }}
                thumbColor={Colors.white}
                ios_backgroundColor={Colors.mediumGrey}
              />
            </View>
          ))}
        </View>
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
    paddingBottom: Spacing.xl * 2,
  },
  heading: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.large + 2,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: Spacing.xl,
    letterSpacing: 0,
    textAlign:'center'
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGrey,
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionLabel: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.regular,
    color: Colors.black,
    flex: 1,
  },
});