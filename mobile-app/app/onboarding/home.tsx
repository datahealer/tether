import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/auth_context';
import { useRouter } from 'expo-router';
import {Stack} from 'expo-router'

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/onboarding/account-creation');
  };

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <LinearGradient colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']} style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, {user?.name}! 👋</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Your Tether Journey</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎉 Onboarding Complete!</Text>
          <Text style={styles.cardText}>
            You've successfully set up your account. Your relationship-building journey starts here.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Your Stats</Text>
          <Text style={styles.cardText}>Current Streak: 0 days</Text>
          <Text style={styles.cardText}>Tethers Completed: 0</Text>
        </View>
      </ScrollView>
    </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  signOutText: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 8,
  },
});

