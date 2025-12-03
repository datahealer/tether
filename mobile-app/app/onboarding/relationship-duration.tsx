// import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';
// import { useState } from 'react';

// const durationOptions = [
//   { id: 'just-started', label: 'Just started' },
//   { id: '6-12-months', label: '6–12 months' },
//   { id: '1-3-years', label: '1–3 years' },
//   { id: '3-5-years', label: '3–5 years' },
//   { id: '5-10-years', label: '5–10 years' },
//   { id: '10-plus', label: '10+ years' },
// ];

// export default function RelationshipDurationScreen() {
//   const router = useRouter();
//   const [selected, setSelected] = useState('1-3-years');

//   return (
//     <LinearGradient
//       colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
//       style={styles.container}
//     >
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Text style={styles.backText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.progress}>2/8</Text>
//         <TouchableOpacity onPress={() => router.push('/onboarding/goals')}>
//           <Text style={styles.closeText}>✕</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
//         <Text style={styles.title}>How long have you been together?</Text>
//         <Text style={styles.subtitle}>It helps us choose the right mix of questions</Text>

//         <View style={styles.optionsContainer}>
//           {durationOptions.map((option) => (
//             <TouchableOpacity
//               key={option.id}
//               style={[
//                 styles.optionItem,
//                 selected === option.id && styles.optionItemSelected,
//               ]}
//               onPress={() => setSelected(option.id)}
//             >
//               <Text style={styles.optionLabel}>{option.label}</Text>
//               {selected === option.id && <Text style={styles.checkmark}>✓</Text>}
//             </TouchableOpacity>
//           ))}
//         </View>
//       </ScrollView>

//       <View style={styles.bottomContainer}>
//         <TouchableOpacity
//           style={styles.primaryButton}
//           onPress={() => router.push('/onboarding/goals')}
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
//     marginBottom: 32,
//   },
//   optionsContainer: {
//     gap: 12,
//   },
//   optionItem: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   optionItemSelected: {
//     borderColor: '#FF9B7A',
//   },
//   optionLabel: {
//     fontSize: 16,
//     color: '#2C2C2C',
//   },
//   checkmark: {
//     fontSize: 20,
//     color: '#FF9B7A',
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

const durationOptions = [
  { id: 'just-started', label: 'Just started' },
  { id: '6-12-months', label: '6–12 months' },
  { id: '1-3-years', label: '1–3 years' },
  { id: '3-5-years', label: '3–5 years' },
  { id: '5-10-years', label: '5–10 years' },
  { id: '10-plus', label: '10+ years' },
];

export default function RelationshipDurationScreen() {
  const router = useRouter();
  const { onboardingData, updateField } = useOnboarding();
  const [selected, setSelected] = useState<string>(onboardingData.relationshipDuration || '1-3-years');

  useEffect(() => {
    if (onboardingData.relationshipDuration) {
      setSelected(onboardingData.relationshipDuration);
    }
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    updateField('relationshipDuration', id);
  };

  const handleContinue = () => {
    router.push('/onboarding/goals');
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
        <Text style={styles.progress}>2/8</Text>
        <TouchableOpacity onPress={() => router.push('/onboarding/goals')}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>How long have you been together?</Text>
        <Text style={styles.subtitle}>It helps us choose the right mix of questions</Text>

        <View style={styles.optionsContainer}>
          {durationOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                selected === option.id && styles.optionItemSelected,
              ]}
              onPress={() => handleSelect(option.id)}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
              {selected === option.id && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
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
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    borderColor: '#FF9B7A',
  },
  optionLabel: {
    fontSize: 16,
    color: '#2C2C2C',
  },
  checkmark: {
    fontSize: 20,
    color: '#FF9B7A',
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});