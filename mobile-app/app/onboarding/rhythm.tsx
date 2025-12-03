// import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';
// import { useState } from 'react';

// const rhythmOptions = [
//   { id: 'everyday', label: 'Every day' },
//   { id: 'few-times-week', label: 'A few times a week' },
//   { id: 'once-week', label: 'Once a week' },
//   { id: 'decide-as-go', label: "We'll decide as we go" },
// ];

// export default function RhythmScreen() {
//   const router = useRouter();
//   const [selected, setSelected] = useState('once-week');
//   const [reminders, setReminders] = useState(false);

//   return (
//     <LinearGradient
//       colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
//       style={styles.container}
//     >
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Text style={styles.backText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.progress}>5/8</Text>
//         <TouchableOpacity onPress={() => router.push('/onboarding/live-sample')}>
//           <Text style={styles.closeText}>✕</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
//         <Text style={styles.title}>How often do you want to check in?</Text>
//         <Text style={styles.subtitle}>Set a rhythm that fits your relationship.</Text>

//         <View style={styles.optionsContainer}>
//           {rhythmOptions.map((option) => (
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

//         <TouchableOpacity 
//           style={styles.reminderRow}
//           onPress={() => setReminders(!reminders)}
//         >
//           <Text style={styles.reminderText}>Send reminders</Text>
//           <View style={[styles.toggle, reminders && styles.toggleActive]}>
//             <View style={[styles.toggleCircle, reminders && styles.toggleCircleActive]} />
//           </View>
//         </TouchableOpacity>
//       </ScrollView>

//       <View style={styles.bottomContainer}>
//         <TouchableOpacity
//           style={styles.primaryButton}
//           onPress={() => router.push('/onboarding/live-sample')}
//         >
//           <Text style={styles.primaryButtonText}>Continue</Text>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => router.push('/onboarding/live-sample')}>
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
//     gap: 12,
//     marginBottom: 24,
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
//   reminderRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   reminderText: {
//     fontSize: 16,
//     color: '#2C2C2C',
//   },
//   toggle: {
//     width: 50,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#DDD',
//     padding: 2,
//     justifyContent: 'center',
//   },
//   toggleActive: {
//     backgroundColor: '#FF9B7A',
//   },
//   toggleCircle: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     backgroundColor: '#FFFFFF',
//   },
//   toggleCircleActive: {
//     alignSelf: 'flex-end',
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

const rhythmOptions = [
  { id: 'Every day', label: 'Every day' },
  { id: 'A few times a week', label: 'A few times a week' },
  { id: 'Once a week', label: 'Once a week' },
  { id: "We'll decide as we go", label: "We'll decide as we go" },
];
//'Every day', 'A few times a week', 'Once a week', "We'll decide as we go"],
export default function RhythmScreen() {
  const router = useRouter();
  const { onboardingData, updateField } = useOnboarding();
  const [selected, setSelected] = useState<string>(onboardingData.rhythm || 'once-week');
  const [reminders, setReminders] = useState(false);

  useEffect(() => {
    if (onboardingData.rhythm) {
      setSelected(onboardingData.rhythm);
    }
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    updateField('rhythm', id);
  };

  const handleContinue = () => {
    router.push('/onboarding/live-sample');
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
        <Text style={styles.progress}>5/8</Text>
        <TouchableOpacity onPress={() => router.push('/onboarding/live-sample')}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>How often do you want to check in?</Text>
        <Text style={styles.subtitle}>Set a rhythm that fits your relationship.</Text>

        <View style={styles.optionsContainer}>
          {rhythmOptions.map((option) => (
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

        <TouchableOpacity 
          style={styles.reminderRow}
          onPress={() => setReminders(!reminders)}
        >
          <Text style={styles.reminderText}>Send reminders</Text>
          <View style={[styles.toggle, reminders && styles.toggleActive]}>
            <View style={[styles.toggleCircle, reminders && styles.toggleCircleActive]} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/onboarding/live-sample')}>
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
    gap: 12,
    marginBottom: 24,
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
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reminderText: {
    fontSize: 16,
    color: '#2C2C2C',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DDD',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#FF9B7A',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
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