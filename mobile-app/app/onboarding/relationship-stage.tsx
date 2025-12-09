// import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';
// import { useState } from 'react';

// const relationshipOptions = [
//   { id: 'dating', label: 'Dating', emoji: '💕' },
//   { id: 'engaged', label: 'Engaged', emoji: '💍' },
//   { id: 'married', label: 'Married', emoji: '💑' },
//   { id: 'something-else', label: 'Something Else', emoji: '' },
// ];

// export default function RelationshipStatusScreen() {
//   const router = useRouter();
//   const [selected, setSelected] = useState('');

//   return (
//     <LinearGradient
//       colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
//       style={styles.container}
//     >
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Text style={styles.backText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.progress}>1/8</Text>
//         <TouchableOpacity onPress={() => router.push('/onboarding/relationship-duration')}>
//           <Text style={styles.closeText}>✕</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
//         <Text style={styles.title}>What best describes your relationship right now?</Text>
//         <Text style={styles.subtitle}>This helps us tailor your questions</Text>

//         <View style={styles.optionsContainer}>
//           {relationshipOptions.map((option) => (
//             <TouchableOpacity
//               key={option.id}
//               style={[
//                 styles.optionCard,
//                 selected === option.id && styles.optionCardSelected,
//               ]}
//               onPress={() => setSelected(option.id)}
//             >
//               {option.emoji && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
//               <Text style={styles.optionLabel}>{option.label}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </ScrollView>

//       <View style={styles.bottomContainer}>
//         <TouchableOpacity
//           style={[styles.primaryButton, !selected && styles.buttonDisabled]}
//           disabled={!selected}
//           onPress={() => router.push('/onboarding/relationship-duration')}
//         >
//           <Text style={styles.primaryButtonText}>Continue</Text>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => router.push('/onboarding/relationship-duration')}>
//           <Text style={styles.linkText}>Skip For Now</Text>
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
//     gap: 16,
//   },
//   optionCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 24,
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   optionCardSelected: {
//     borderColor: '#FF9B7A',
//   },
//   optionEmoji: {
//     fontSize: 40,
//     marginBottom: 8,
//   },
//   optionLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#2C2C2C',
//   },
//   bottomContainer: {
//     paddingHorizontal: 24,
//     paddingBottom: 50,
//     gap: 16,
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
//   linkText: {
//     fontSize: 16,
//     color: '#2C2C2C',
//     textAlign: 'center',
//     fontWeight: '500',
//   },
// });











import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useOnboarding } from '@/context/onboarding_context';

const relationshipOptions = [
  { id: 'dating', label: 'Dating', emoji: '💕' },
  { id: 'engaged', label: 'Engaged', emoji: '💍' },
  { id: 'married', label: 'Married', emoji: '💑' },
  { id: 'something-else', label: 'Something Else', emoji: '' },
];

export default function RelationshipStatusScreen() {
  const router = useRouter();
  const { onboardingData, updateField } = useOnboarding();
  const [selected, setSelected] = useState<string | undefined>(onboardingData.relationshipStatus);

  useEffect(() => {
    if (onboardingData.relationshipStatus) {
      setSelected(onboardingData.relationshipStatus);
    }
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    updateField('relationshipStatus', id);
  };

  const handleContinue = () => {
    if (selected) {
      router.push('/onboarding/relationship-length');
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
        <Text style={styles.progress}>1/8</Text>
        <TouchableOpacity onPress={() => router.push('/onboarding/relationship-length')}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>What best describes your relationship right now?</Text>
        <Text style={styles.subtitle}>This helps us tailor your questions</Text>

        <View style={styles.optionsContainer}>
          {relationshipOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selected === option.id && styles.optionCardSelected,
              ]}
              onPress={() => handleSelect(option.id)}
            >
              {option.emoji && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, !selected && styles.buttonDisabled]}
          disabled={!selected}
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/onboarding/relationship-length')}>
          <Text style={styles.linkText}>Skip For Now</Text>
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
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#FF9B7A',
  },
  optionEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
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
  buttonDisabled: {
    opacity: 0.5,
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