import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

 
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require('../../assets/images/home-background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(44, 62, 80, 0.7)', 'rgba(52, 73, 94, 0.8)', 'rgba(44, 62, 80, 0.9)']}
          style={styles.overlay}
        >
          {/* Logo at top */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/vector.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Main content */}
          <View style={styles.content}>
            <Text style={styles.title}>A better way to stay{'\n'}connected</Text>
            <Text style={styles.subtitle}>
              Short daily questions that bring you closer
            </Text>

            {/* Let's Start Button */}
            <TouchableOpacity 
              style={styles.button} 
              activeOpacity={0.8}
              onPress={() => router.push('/onboarding/privacy')}
            >
              <Text style={styles.buttonText}>Let's Start</Text>
            </TouchableOpacity>

            {/* Privacy Policy Text */}
            <View style={styles.privacyContainer}>
              <Text style={styles.privacyText}>
                You're in control of what you share.{'\n'}
                By continuing, you agree to our{' '}
                <Text style={styles.privacyLink}>Privacy Policy</Text>.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoImage: {
    width: 120,
    height: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
    fontFamily: 'Smi',
  },
  subtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
    fontFamily: 'SpaceMono',
  },
  button: {
    backgroundColor: '#FF9B7A',
    paddingVertical: 18,
    paddingHorizontal: 80,
    borderRadius: 30,
    marginBottom: 24,
    width: width - 48,
    alignItems: 'center',
    shadowColor: '#FF9B7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'SF-Pro-Display',
  },
  privacyContainer: {
    marginBottom: 20,
  },
  privacyText: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.7,
    fontFamily: 'Inter',
  },
  privacyLink: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});