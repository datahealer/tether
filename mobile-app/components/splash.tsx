import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
        style={styles.gradient}
      >
        {/* Decorative flower petals in background */}
        <View style={styles.flowerContainer}>
          <View style={[styles.petal, styles.petalTopLeft]} />
          <View style={[styles.petal, styles.petalBottomRight]} />
        </View>

        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.logoText}>Tether</Text>
          <Text style={styles.tagline}>Connect • Share • Grow</Text>
        </Animated.View>

        {/* Bottom indicator */}
        <Animated.View
          style={[
            styles.bottomIndicator,
            {
              opacity: fadeAnim,
            },
          ]}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flowerContainer: {
    position: 'absolute',
    width: width,
    height: height,
  },
  petal: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  petalTopLeft: {
    top: height * 0.15,
    left: -50,
  },
  petalBottomRight: {
    bottom: height * 0.1,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#2C2C2C',
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    letterSpacing: 2,
    fontWeight: '500',
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 60,
    width: 120,
    height: 4,
    backgroundColor: '#8B4513',
    borderRadius: 2,
  },
});