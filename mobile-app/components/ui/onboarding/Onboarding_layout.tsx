import React from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  showLogo?: boolean; // New prop to control logo visibility
  progress?: number; // 0 to 1
}

export default function OnboardingLayout({ 
  children, 
  showBackButton = true,
  showLogo = true, // Default to true
  progress 
}: OnboardingLayoutProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
        )}
        {showLogo && (
          <Image
            source={require('../../../assets/images/vector.png')}
            style={styles.tetherLogo}
            resizeMode="contain"
          />
        )}
        {!showLogo && <View style={styles.logoPlaceholder} />}
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Decorative Background Elements */}
      <View style={styles.backgroundDecoration} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  progressContainer: {
    height: 4,
    backgroundColor: '#E0D0B8',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D97E5A',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: -1,
  },
});