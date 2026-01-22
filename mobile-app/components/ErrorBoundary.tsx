import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, FontSizes, FontWeights } from '@/theme/constants';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree
 * Prevents app crashes from unhandled errors (like RevenueCat failures)
 * Shows a fallback UI instead of crashing the app
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('🚨 Error Boundary caught error:', error);
    console.error('Error info:', errorInfo);
    
    // Check if it's a RevenueCat error
    if (error.message?.includes('RevenueCat') || 
        error.message?.includes('purchase') ||
        error.message?.includes('subscription')) {
      console.warn('⚠️ RevenueCat-related error caught - app continues');
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😔</Text>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We've encountered an error. Don't worry, your data is safe.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.button}
              onPress={this.handleReset}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.heading,
    fontWeight: FontWeights.bold as any,
    color: Colors.black,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSizes.description,
    color: Colors.darkGrey,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  errorTitle: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold as any,
    color: '#c62828',
    marginBottom: Spacing.xs,
  },
  errorText: {
    fontSize: FontSizes.disclaimer,
    color: '#c62828',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: Colors.darkOrange,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    minWidth: 200,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.description,
    fontWeight: FontWeights.semibold as any,
    textAlign: 'center',
  },
});

