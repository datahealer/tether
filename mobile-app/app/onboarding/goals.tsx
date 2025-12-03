// import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';
// import { useState } from 'react';

// const goalOptions = [
//   { id: 'communication', label: 'Better communication', emoji: '💬' },
//   { id: 'fun', label: 'More fun together', emoji: '🎉' },
//   { id: 'connection', label: 'Deeper connection', emoji: '🧡' },
//   { id: 'trust', label: 'Strengthening trust', emoji: '🤝' },
//   { id: 'learning', label: 'Learning something new', emoji: '👀' },
//   { id: 'spark', label: 'Keeping the spark alive', emoji: '✨' },
//   { id: 'long-distance', label: 'Long distance support', emoji: '🌍' },
// ];

// export default function GoalsScreen() {
//   const router = useRouter();
//   const [selected, setSelected] = useState<string[]>([]);

//   const toggleGoal = (id: string) => {
//     if (selected.includes(id)) {
//       setSelected(selected.filter((item) => item !== id));
//     } else {
//       setSelected([...selected, id]);
//     }
//   };

//   return (
//     <LinearGradient
//       colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
//       style={styles.container}
//     >
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Text style={styles.backText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.progress}>3/8</Text>
//         <TouchableOpacity onPress={() => router.push('/onboarding/tone')}>
//           <Text style={styles.closeText}>✕</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
//         <Text style={styles.title}>What would you like to get out of this?</Text>
//         <Text style={styles.subtitle}>Pick one or two goals</Text>

//         <View style={styles.optionsContainer}>
//           {goalOptions.map((option) => (
//             <TouchableOpacity
//               key={option.id}
//               style={[
//                 styles.optionChip,
//                 selected.includes(option.id) && styles.optionChipSelected,
//               ]}
//               onPress={() => toggleGoal(option.id)}
//             >
//               <Text style={styles.optionEmoji}>{option.emoji}</Text>
//               <Text style={styles.optionLabel}>{option.label}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </ScrollView>

//       <View style={styles.bottomContainer}>
//         <TouchableOpacity
//           style={[styles.primaryButton, selected.length === 0 && styles.buttonDisabled]}
//           disabled={selected.length === 0}
//           onPress={() => router.push('/onboarding/tone')}
//         >
//           <Text style={styles.primaryButtonText}>Continue</Text>
//         </TouchableOpacity>
//       </View>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 60,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingBottom: 16,
//   },
//   backText: {
//     fontSize: 28,
//     color: '#2C2C2C',
//   },
//   progress: {
//     fontSize: 16,
//     color: '#666',
//   },
//   closeText: {
//     fontSize: 24,
//     color: '#2C2C2C',
//   },
//   content: {
//     flex: 1,
//   },
//   contentContainer: {
//     paddingHorizontal: 24,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#2C2C2C',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 24,
//   },
//   optionsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   optionChip: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 24,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   optionChipSelected: {
//     borderColor: '#FF9B7A',
//   },
//   optionEmoji: {
//     fontSize: 18,
//   },
//   optionLabel: {
//     fontSize: 14,
//     color: '#2C2C2C',
//     fontWeight: '500',
//   },
//   bottomContainer: {
//     paddingHorizontal: 24,
//     paddingBottom: 50,
//   },
//   primaryButton: {
//     backgroundColor: '#FF9B7A',
//     paddingVertical: 18,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   buttonDisabled: {
//     opacity: 0.5,
//   },
//   primaryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useOnboarding } from '@/context/onboarding_context';

const goalOptions = [
  { id: 'communication', label: 'Better communication', emoji: '💬' },
  { id: 'fun', label: 'More fun together', emoji: '🎉' },
  { id: 'connection', label: 'Deeper connection', emoji: '🧡' },
  { id: 'trust', label: 'Strengthening trust', emoji: '🤝' },
  { id: 'learning', label: 'Learning something new', emoji: '👀' },
  { id: 'spark', label: 'Keeping the spark alive', emoji: '✨' },
  { id: 'long-distance', label: 'Long distance support', emoji: '🌍' },
];

export default function GoalsScreen() {
  const router = useRouter();
  const { onboardingData, updateField } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(onboardingData.goals || []);

  useEffect(() => {
    if (onboardingData.goals && onboardingData.goals.length > 0) {
      setSelected(onboardingData.goals);
    }
  }, []);

  const toggleGoal = (id: string) => {
    const newSelected = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];
    
    setSelected(newSelected);
    updateField('goals', newSelected);
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      router.push('/onboarding/tone');
    }
  };

  return (
    <LinearGradient
      colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>3/8</Text>
        <TouchableOpacity onPress={() => router.push('/onboarding/tone')}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>What would you like to get out of this?</Text>
        <Text style={styles.subtitle}>Pick one or two goals</Text>

        <View style={styles.optionsContainer}>
          {goalOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionChip,
                selected.includes(option.id) && styles.optionChipSelected,
              ]}
              onPress={() => toggleGoal(option.id)}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, selected.length === 0 && styles.buttonDisabled]}
          disabled={selected.length === 0}
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionChipSelected: {
    borderColor: '#FF9B7A',
  },
  optionEmoji: {
    fontSize: 18,
  },
  optionLabel: {
    fontSize: 14,
    color: '#2C2C2C',
    fontWeight: '500',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  primaryButton: {
    backgroundColor: '#FF9B7A',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});