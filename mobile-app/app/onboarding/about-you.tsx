import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import DatePickerModal from '../../components/ui/onboarding/DatePickerModal';
import GenderPickerModal from '../../components/ui/onboarding/GenderPickerModal';
import { useOnboarding } from '@/context/onboarding_context';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import { formatDateToYMD } from '@/utils/dateUtils';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

export default function AboutYouScreen() {
  const router = useRouter();
  const { updateField, onboardingData } = useOnboarding();
  
  const [firstName, setFirstName] = useState('');
  const [partnerFirstName, setPartnerFirstName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [partnerNameFocused, setPartnerNameFocused] = useState(false);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

const handleContinue = async () => {
  if (!firstName.trim()) {
    Alert.alert('Required', 'Please enter your first name');
    return;
  }

  if (!partnerFirstName.trim()) {
    Alert.alert('Required', 'Please enter your partner\'s first name');
    return;
  }

  if (!dateOfBirth) {
    Alert.alert('Required', 'Please select your date of birth');
    return;
  }

  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  try {
    // Update individual fields - save date as YYYY-MM-DD to avoid timezone issues
    updateField('firstName', firstName.trim());
    updateField('partnerFirstName', partnerFirstName.trim());
    updateField('dateOfBirth', formatDateToYMD(dateOfBirth));
    if (gender) {
      updateField('gender', gender);
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/onboarding/understanding');
  } catch (error) {
    console.error('Error saving personal info:', error);
    Alert.alert('Error', 'Failed to save information');
  }
};

  return (
    <OnboardingLayout progress={0.07} showBackButton={true} showLogoutAvatar={true}>
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
          <Text style={styles.heading}>Tell us a little bit about you</Text>

          {/* First Name Input */}
          <View style={[
            styles.inputContainer,
            firstNameFocused && styles.inputFocused
          ]}>
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor={Colors.darkGrey}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              onFocus={() => setFirstNameFocused(true)}
              onBlur={() => setFirstNameFocused(false)}
            />
            <Ionicons name="create-outline" size={20} color={Colors.inputText} />
          </View>

          {/* Partner's First Name Input */}
          <View style={[
            styles.inputContainer,
            partnerNameFocused && styles.inputFocused
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Partner's first name"
              placeholderTextColor={Colors.darkGrey}
              value={partnerFirstName}
              onChangeText={setPartnerFirstName}
              autoCapitalize="words"
              onFocus={() => setPartnerNameFocused(true)}
              onBlur={() => setPartnerNameFocused(false)}
            />
            <Ionicons name="create-outline" size={20} color={Colors.inputText} />
          </View>

          {/* Date of Birth Selector */}
          <DebouncedButton
            style={styles.selectorContainer}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowDatePicker(true);
            }}
          >
            <Text style={[
              styles.selectorText,
              dateOfBirth && styles.selectorTextFilled
            ]}>
              {dateOfBirth ? formatDate(dateOfBirth) : 'Date of Birth'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={Colors.inputText} />
          </DebouncedButton>

          {/* Gender Selector (Optional) */}
          <DebouncedButton
            style={styles.selectorContainer}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowGenderPicker(true);
            }}
          >
            <Text style={[
              styles.selectorText,
              gender && styles.selectorTextFilled
            ]}>
              {gender || 'Gender (optional)'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.inputText} />
          </DebouncedButton>

          {/* Spacer */}
          <View style={{ flex: 1, minHeight: Spacing.xxl }} />

          {/* Continue Button */}
          <DebouncedButton
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </DebouncedButton>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSave={(date) => setDateOfBirth(date)}
        initialDate={dateOfBirth || undefined}
      />

      {/* Gender Picker Modal */}
      <GenderPickerModal
        visible={showGenderPicker}
        onClose={() => setShowGenderPicker(false)}
        onSave={(selectedGender) => setGender(selectedGender)}
        initialGender={gender}
      />
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
    paddingBottom: Spacing.xl,
  },
  heading: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.heading,
    lineHeight: 36,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: Spacing.xl,
    letterSpacing: 0,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputFill,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 20 : 16,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 60,
  },
  inputFocused: {
    borderColor: Colors.lightOrange,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    letterSpacing: 0,
    paddingVertical: 0,
    ...(Platform.OS === 'android' && {
      textAlignVertical: 'center',
    }),
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.inputFill,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 20 : 16,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    minHeight: 60,
  },
  selectorText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.regular,
    color: Colors.darkGrey,
    letterSpacing: 0,
  },
  selectorTextFilled: {
    color: Colors.inputText,
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
  buttonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
});