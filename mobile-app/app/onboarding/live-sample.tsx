import { View, Text, StyleSheet,  TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

export default function LiveSampleScreen() {
  const router = useRouter();
  const [answer, setAnswer] = useState('');

  return (
    <LinearGradient
      colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
      style={styles.container}
    >
      <View style={styles.header}>
        <DebouncedButton onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </DebouncedButton>
        <Text style={styles.progress}>6/8</Text>
        <DebouncedButton onPress={() => router.push('/onboarding/account-creation')}>
          <Text style={styles.closeText}>✕</Text>
        </DebouncedButton>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Here's what a moment together feels like</Text>
        <Text style={styles.subtitle}>Answer one sample question</Text>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            What's something small your partner does that makes you smile?
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Your answer ..."
          placeholderTextColor="#999"
          value={answer}
          onChangeText={setAnswer}
          multiline
        />
      </ScrollView>

      <View style={styles.bottomContainer}>
        <DebouncedButton
          style={styles.primaryButton}
          onPress={() => router.push('/onboarding/account-creation')}
        >
          <Text style={styles.primaryButtonText}>Looks Good, Let's Start</Text>
        </DebouncedButton>

        <DebouncedButton onPress={() => router.push('/onboarding/account-creation')}>
          <Text style={styles.linkText}>Skip For Now</Text>
        </DebouncedButton>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backText: {
    fontSize: 28,
    color: '#2C2C2C',
  },
  progress: {
    fontSize: 16,
    color: '#666',
  },
  closeText: {
    fontSize: 24,
    color: '#2C2C2C',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    color: '#2C2C2C',
    lineHeight: 26,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    fontSize: 16,
    color: '#2C2C2C',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FF9B7A',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    fontSize: 16,
    color: '#2C2C2C',
    textAlign: 'center',
    fontWeight: '500',
  },
});