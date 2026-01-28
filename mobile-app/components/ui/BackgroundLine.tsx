// React Native version of BackgroundLine component
// Renders animated tether line as background layer
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface BackgroundLineProps {
  opacity?: number; // default 0.7 → tune between 0.2–1.0
  showOverlay?: boolean; // default false → dark overlay for readability
  autoPlay?: boolean; // default true → start animation immediately
  animationSource?: any; // Optional: custom animation JSON source
}

export const BackgroundLine: React.FC<BackgroundLineProps> = ({
  opacity = 0.7,
  showOverlay = false,
  autoPlay = true,
  animationSource,
}) => {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (autoPlay && lottieRef.current) {
      lottieRef.current.play();
    }
  }, [autoPlay]);

  // Use custom source or default to tether_line.json
  const source = animationSource || require('../../assets/tether_line.json');

  return (
    <>
      {/* Animation layer – full screen, behind content */}
      <View style={styles.animationContainer} pointerEvents="none">
        <LottieView
          ref={lottieRef}
          source={source}
          loop={true}
          autoPlay={autoPlay}
          style={[
            styles.lottie,
            {
              opacity,
            },
          ]}
          resizeMode="cover"
        />
      </View>

      {/* Optional dark overlay for better text contrast */}
      {showOverlay && (
        <View style={styles.overlay} pointerEvents="none" />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  lottie: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 1,
  },
});