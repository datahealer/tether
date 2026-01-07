// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import * as Haptics from 'expo-haptics';
// import OnboardingLayout from '../../../components/ui/onboarding/Onboarding_layout';
// import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../../theme/constants';
// import {
//   identifyRevenueCatUser,
//   getRevenueCatUser,
//   processRevenueCatPurchase,
//   restoreRevenueCatPurchases,
//   getRevenueCatOffering,
// } from '../../../services/revenuecat';

// /**
//  * RevenueCat Test Screen
//  * For testing RevenueCat integration in development
//  * 
//  * To access: Navigate to /onboarding/settings/revenuecat-test
//  */
// export default function RevenueCatTestScreen() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [lastResult, setLastResult] = useState<string>('');

//   const showResult = (title: string, data: any) => {
//     const formatted = JSON.stringify(data, null, 2);
//     setLastResult(`${title}:\n${formatted}`);
//     Alert.alert(title, formatted.substring(0, 500) + (formatted.length > 500 ? '...' : ''));
//   };

//   const handleTest = async (testName: string, testFn: () => Promise<any>) => {
//     setLoading(true);
//     try {
//       await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//       const result = await testFn();
//       showResult(`✅ ${testName}`, result);
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//     } catch (error: any) {
//       console.error(`${testName} error:`, error);
//       showResult(`❌ ${testName} Failed`, { error: error.message });
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const tests = [
//     {
//       name: 'Identify User',
//       description: 'Register user in RevenueCat',
//       action: () => handleTest('Identify User', identifyRevenueCatUser),
//     },
//     {
//       name: 'Get User Data',
//       description: 'Fetch current user subscriptions',
//       action: () => handleTest('Get User Data', getRevenueCatUser),
//     },
//     {
//       name: 'Get Offering',
//       description: 'Fetch available products',
//       action: () => handleTest('Get Offering', () => getRevenueCatOffering()),
//     },
//     {
//       name: 'Test Purchase (Monthly)',
//       description: 'Simulate monthly purchase',
//       action: () => handleTest('Test Purchase', () =>
//         processRevenueCatPurchase(
//           'tether_monthly',
//           `test_${Date.now()}`,
//           'ios',
//           6.49,
//           'USD'
//         )
//       ),
//     },
//     {
//       name: 'Restore Purchases',
//       description: 'Restore previous purchases',
//       action: () => handleTest('Restore Purchases', restoreRevenueCatPurchases),
//     },
//   ];

//   return (
//     <OnboardingLayout showBackButton={true} showLogo={false}>
//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.content}
//         showsVerticalScrollIndicator={false}
//       >
//         <Text style={styles.heading}>RevenueCat Integration Test</Text>
//         <Text style={styles.subtitle}>
//           Test all RevenueCat backend endpoints
//         </Text>

//         {/* Warning Banner */}
//         <View style={styles.warningBanner}>
//           <Text style={styles.warningText}>
//             ⚠️ Development Only - Remove in Production
//           </Text>
//         </View>

//         {/* Test Buttons */}
//         <View style={styles.testsContainer}>
//           {tests.map((test, index) => (
//             <TouchableOpacity
//               key={index}
//               style={styles.testButton}
//               onPress={test.action}
//               disabled={loading}
//               activeOpacity={0.7}
//             >
//               <View style={styles.testButtonContent}>
//                 <Text style={styles.testButtonTitle}>{test.name}</Text>
//                 <Text style={styles.testButtonDescription}>{test.description}</Text>
//               </View>
//               {loading && <ActivityIndicator size="small" color={Colors.darkOrange} />}
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Last Result */}
//         {lastResult ? (
//           <View style={styles.resultContainer}>
//             <Text style={styles.resultTitle}>Last Result:</Text>
//             <ScrollView style={styles.resultScroll} nestedScrollEnabled>
//               <Text style={styles.resultText}>{lastResult}</Text>
//             </ScrollView>
//           </View>
//         ) : null}

//         {/* Instructions */}
//         <View style={styles.instructionsContainer}>
//           <Text style={styles.instructionsTitle}>Testing Instructions:</Text>
//           <Text style={styles.instructionsText}>
//             1. Ensure backend is running with RevenueCat configured{'\n'}
//             2. Start with "Identify User" to register in RevenueCat{'\n'}
//             3. Test other endpoints in any order{'\n'}
//             4. Check console logs for detailed responses{'\n'}
//             5. Verify in RevenueCat dashboard
//           </Text>
//         </View>
//       </ScrollView>
//     </OnboardingLayout>
//   );
// }

// const styles = StyleSheet.create({
//   scrollView: {
//     flex: 1,
//   },
//   content: {
//     paddingBottom: Spacing.xl * 2,
//   },
//   heading: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: FontSizes.heading,
//     fontWeight: FontWeights.bold,
//     color: Colors.black,
//     marginBottom: Spacing.sm,
//   },
//   subtitle: {
//     fontFamily: 'InterTight-Regular',
//     fontSize: FontSizes.medium,
//     color: Colors.inputText,
//     marginBottom: Spacing.lg,
//   },
//   warningBanner: {
//     backgroundColor: '#FFF3CD',
//     borderRadius: BorderRadius.md,
//     padding: Spacing.md,
//     marginBottom: Spacing.lg,
//     borderWidth: 1,
//     borderColor: '#FFC107',
//   },
//   warningText: {
//     fontFamily: 'InterTight-Medium',
//     fontSize: FontSizes.medium,
//     color: '#856404',
//     textAlign: 'center',
//   },
//   testsContainer: {
//     gap: Spacing.md,
//     marginBottom: Spacing.xl,
//   },
//   testButton: {
//     backgroundColor: Colors.white,
//     borderRadius: BorderRadius.lg,
//     padding: Spacing.lg,
//     borderWidth: 2,
//     borderColor: Colors.darkOrange,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   testButtonContent: {
//     flex: 1,
//   },
//   testButtonTitle: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.large,
//     fontWeight: FontWeights.semibold,
//     color: Colors.black,
//     marginBottom: Spacing.xs,
//   },
//   testButtonDescription: {
//     fontFamily: 'InterTight-Regular',
//     fontSize: FontSizes.small,
//     color: Colors.inputText,
//   },
//   resultContainer: {
//     backgroundColor: Colors.white,
//     borderRadius: BorderRadius.md,
//     padding: Spacing.md,
//     marginBottom: Spacing.lg,
//     borderWidth: 1,
//     borderColor: Colors.mediumGrey,
//   },
//   resultTitle: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.medium,
//     fontWeight: FontWeights.semibold,
//     color: Colors.black,
//     marginBottom: Spacing.sm,
//   },
//   resultScroll: {
//     maxHeight: 200,
//   },
//   resultText: {
//     fontFamily: 'Courier',
//     fontSize: FontSizes.small,
//     color: Colors.black,
//   },
//   instructionsContainer: {
//     backgroundColor: Colors.veryLightOrange,
//     borderRadius: BorderRadius.md,
//     padding: Spacing.md,
//   },
//   instructionsTitle: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.medium,
//     fontWeight: FontWeights.semibold,
//     color: Colors.black,
//     marginBottom: Spacing.sm,
//   },
//   instructionsText: {
//     fontFamily: 'InterTight-Regular',
//     fontSize: FontSizes.small,
//     color: Colors.black,
//     lineHeight: 20,
//   },
// });
