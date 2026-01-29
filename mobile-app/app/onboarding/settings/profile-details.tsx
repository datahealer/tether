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
import TextInputModal from '@/components/ui/profile/TextInputModal';
import GenderPickerModal from '@/components/ui/onboarding/GenderPickerModal';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import { uploadProfilePhoto } from '@/services/upload_service';
import { authenticatedFetch } from '@/services/auth_service';
import { formatDateToYMD, formatDateForDisplay } from '@/utils/dateUtils';
import Constants from 'expo-constants';

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const { user,signIn } = useAuth();

  // State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.avatar || null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  
  // Profile data - Initialize from user's onboardingData
  const [name, setName] = useState(user?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    user?.onboardingData?.dateOfBirth ? new Date(user.onboardingData.dateOfBirth) : null
  );
  const [gender, setGender] = useState<string>(user?.onboardingData?.gender || '');

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
        
        // Upload to server
        const photoUrl = await uploadProfilePhoto(result.assets[0].uri);
        
        // Update local state
        setProfilePhoto(photoUrl);
        setUploadStatus('success');
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => setUploadStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo');
      setUploadStatus('idle');
    }
  };
  // Choose from gallery
  const handleChooseGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

  if (!result.canceled && result.assets[0]) {
    const localUri = result.assets[0].uri;
    
    // Show local image immediately (optimistic update)
    setProfilePhoto(localUri);
    setUploadStatus('uploading');
    
    // Upload in background
    try {
      const photoUrl = await uploadProfilePhoto(localUri);
      setProfilePhoto(photoUrl); // Replace with CDN URL
      setUploadStatus('success');
    } catch (error) {
      setProfilePhoto(user?.avatar || null); // Revert on error
      Alert.alert('Error', 'Failed to upload image');
    }
  }
};
  // Remove photo
  const handleRemovePhoto = async () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistically update UI
              const previousPhoto = profilePhoto;
              setProfilePhoto(null);
              setUploadStatus('uploading');
              
              // Update backend
              const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
              const response = await authenticatedFetch(`${API_URL}/api/profile`, {
                method: 'PUT',
                body: JSON.stringify({
                  name, // Required field
                  profilePicture: null,
                }),
              });

              if (!response.ok) {
                // Revert on error
                setProfilePhoto(previousPhoto);
                throw new Error('Failed to remove photo');
              }

              const data = await response.json();
              
              // Update auth context
              await signIn({
                ...user!,
                avatar: undefined,
                onboardingData: {
                  ...user!.onboardingData,
                },
              });
              
              setUploadStatus('success');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setTimeout(() => setUploadStatus('idle'), 2000);
            } catch (error) {
              console.error('Error removing photo:', error);
              Alert.alert('Error', 'Failed to remove photo. Please try again.');
              setUploadStatus('idle');
            }
          },
        },
      ]
    );
  };

  // Edit name
  const handleEditName = () => {
    setShowNameModal(true);
  };

  // Save name
  const handleSaveName = (newName: string) => {
    setName(newName);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
    setShowGenderModal(true);
  };

  // Save gender
  const handleSaveGender = (newGender: string) => {
    setGender(newGender);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  


  // Save changes - UPDATED
  const handleSaveChanges = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
      
      console.log('💾 Saving profile changes...');
      
      // Update user profile
      const response = await authenticatedFetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          dateOfBirth: dateOfBirth ? formatDateToYMD(dateOfBirth) : undefined,
          gender,
          profilePicture: profilePhoto,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Update failed:', errorData);
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      
      console.log('✅ Profile updated:', data);
      
      // Update auth context with new user data
      await signIn({
        ...user!,
        id: data.user.id,
        name: data.user.name,
        avatar: data.user.avatar,
        email: data.user.email,
        provider: data.user.provider,
        token: user!.token,
        refreshToken: user!.refreshToken,
        onboarded: data.user.onboarded,
        subscribed: data.user.subscribed,
        onboardingData: data.user.onboardingData,
      });

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
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to save changes'
      );
    }
  };

  // ... rest of component ...

  const formatDate = (date: Date | null) => {
    return formatDateForDisplay(date);
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

      {/* Name Input Modal */}
      <TextInputModal
        visible={showNameModal}
        onClose={() => setShowNameModal(false)}
        onSave={handleSaveName}
        title="Edit Display Name"
        initialValue={name}
        placeholder="Enter your name"
        maxLength={50}
      />

      {/* Gender Picker Modal */}
      <GenderPickerModal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
        onSave={handleSaveGender}
        initialGender={gender}
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


