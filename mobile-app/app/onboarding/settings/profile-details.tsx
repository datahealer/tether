import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/auth_context';
import OnboardingLayout from '@/components/ui/onboarding/Onboarding_layout';
import EditableField from '@/components/ui/profile/EditableField';
import PhotoPickerModal from '@/components/ui/profile/PhotoPickerModal';
import DatePickerModal from '@/components/ui/onboarding/DatePickerModal';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.profilePicture || null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  
  // Profile data
  const [name, setName] = useState(user?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<string>('');

  // Request camera permissions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return false;
    }
    return true;
  };

  // Request gallery permissions
  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery permission is required to select photos');
      return false;
    }
    return true;
  };

  // Take photo
  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadStatus('uploading');
        // Simulate upload
        setTimeout(() => {
          setProfilePhoto(result.assets[0].uri);
          setUploadStatus('success');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => setUploadStatus('idle'), 2000);
        }, 1500);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
      setUploadStatus('idle');
    }
  };

  // Choose from gallery
  const handleChooseGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadStatus('uploading');
        // Simulate upload
        setTimeout(() => {
          setProfilePhoto(result.assets[0].uri);
          setUploadStatus('success');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => setUploadStatus('idle'), 2000);
        }, 1500);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
      setUploadStatus('idle');
    }
  };

  // Remove photo
  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setProfilePhoto(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  // Edit name
  const handleEditName = () => {
    // Navigate to name edit screen or show modal
    Alert.alert('Coming Soon', 'Name editing will be implemented');
  };

  // Edit date of birth
  const handleEditDateOfBirth = () => {
    setShowDatePicker(true);
  };

  // Save date of birth
  const handleSaveDateOfBirth = (date: Date) => {
    setDateOfBirth(date);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Edit gender
  const handleEditGender = () => {
    // Navigate to gender selection screen
    Alert.alert('Coming Soon', 'Gender selection will be implemented');
  };

  // Save changes
  const handleSaveChanges = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // TODO: Save to backend
    Alert.alert(
      'Success',
      'Your profile has been updated',
      [
        {
          text: 'OK',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          },
        },
      ]
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <OnboardingLayout showBackButton={true} showLogo={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.heading}>Profile Details</Text>
        <Text style={styles.subtitle}>Manage your personal information</Text>

        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={() => setShowPhotoModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.photoWrapper}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="person" size={48} color={Colors.darkOrange} />
                </View>
              )}
              
              {uploadStatus === 'uploading' && (
                <View style={styles.uploadingOverlay}>
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
              
              {uploadStatus === 'success' && (
                <View style={styles.successBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                </View>
              )}
            </View>

            <View style={styles.uploadBadge}>
              <Text style={styles.uploadBadgeText}>
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Photo'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Editable Fields */}
        <View style={styles.fieldsSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <EditableField
            label="Display Name"
            value={name}
            onPress={handleEditName}
            icon="pencil-outline"
            placeholder="Enter your name"
          />

          <EditableField
            label="Name's Date of Birth"
            value={formatDate(dateOfBirth)}
            onPress={handleEditDateOfBirth}
            icon="calendar-outline"
            placeholder="Select date of birth"
          />

          <EditableField
            label="Gender (optional)"
            value={gender}
            onPress={handleEditGender}
            icon="male-female-outline"
            placeholder="Select gender"
          />
        </View>

        {/* Account Info (Read-only) */}
        <View style={styles.fieldsSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <EditableField
            label="Email"
            value={user?.email || ''}
            onPress={() => {}}
            disabled
          />
        </View>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: Spacing.xl }} />

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveChanges}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Photo Picker Modal */}
      <PhotoPickerModal
        visible={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onTakePhoto={handleTakePhoto}
        onChooseGallery={handleChooseGallery}
        onRemovePhoto={profilePhoto ? handleRemovePhoto : undefined}
        hasPhoto={!!profilePhoto}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSave={handleSaveDateOfBirth}
        initialDate={dateOfBirth || new Date(1990, 0, 1)}
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
    paddingBottom: Spacing.xl * 2,
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
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    marginBottom: Spacing.xl,
    letterSpacing: 0,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl + Spacing.md,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.veryLightOrange,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.veryLightOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: FontSizes.medium,
    color: Colors.white,
    fontWeight: FontWeights.medium,
  },
  successBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 2,
  },
  uploadBadge: {
    backgroundColor: Colors.darkOrange,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  uploadBadgeText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  fieldsSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: Spacing.md,
  },
  saveButton: {
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
  saveButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
});