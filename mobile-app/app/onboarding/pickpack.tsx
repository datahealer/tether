import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const packs = [
  {
    id: 'deep',
    title: 'Deep Questions',
    description: 'Questions that hit deep',
    emoji: '💭',
    color: '#E8D4C0',
  },
  {
    id: 'couple',
    title: 'Couple Questions',
    description: 'Strengthen your bond',
    emoji: '💑',
    color: '#F5D9D9',
  },
  {
    id: 'gossip',
    title: 'Gossip Questions',
    description: 'Fun and playful',
    emoji: '☕',
    color: '#D9E8F5',
  },
];

export default function PickPackScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('Deep');
  const [showSettings, setShowSettings] = useState(false);
  const settingsScale = useSharedValue(0);

  const tabs = ['Deep', 'Couple', 'Gossip'];

  const openSettings = () => {
    setShowSettings(true);
    settingsScale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  const closeSettings = () => {
    settingsScale.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
    setTimeout(() => setShowSettings(false), 200);
  };

  const settingsAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: settingsScale.value },
        {
          translateY: interpolate(
            settingsScale.value,
            [0, 1],
            [100, 0]
          ),
        },
      ],
      opacity: settingsScale.value,
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(settingsScale.value, [0, 1], [0, 1]),
    };
  });

  return (
    <LinearGradient
      colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pick a pack</Text>
        <TouchableOpacity onPress={openSettings} style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cards */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 40}
      >
        {packs.map((pack, index) => (
          <Animated.View
            key={pack.id}
            entering={FadeInRight.delay(index * 100).springify()}
          >
            <TouchableOpacity
              style={[styles.card, { backgroundColor: pack.color }]}
              activeOpacity={0.9}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardStack}>
                  <View style={[styles.stackCard, styles.stackCard1]} />
                  <View style={[styles.stackCard, styles.stackCard2]} />
                  <View style={[styles.stackCard, styles.stackCard3]} />
                </View>
                
                <View style={styles.cardInfo}>
                  <View style={styles.emojiContainer}>
                    <Text style={styles.emoji}>{pack.emoji}</Text>
                  </View>
                  <Text style={styles.packTitle}>{pack.title}</Text>
                  <Text style={styles.packDescription}>{pack.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Settings Overlay */}
      {showSettings && (
        <>
          <Animated.View
            style={[styles.overlay, overlayAnimatedStyle]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={closeSettings}
            />
          </Animated.View>

          <Animated.View style={[styles.settingsModal, settingsAnimatedStyle]}>
            <View style={styles.settingsHandle} />
            
            <ScrollView style={styles.settingsContent}>
              <Text style={styles.settingsTitle}>Settings</Text>

              {/* Notification Settings */}
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                
                <TouchableOpacity style={styles.settingItem}>
                  <View>
                    <Text style={styles.settingLabel}>Gentle Reminders</Text>
                    <Text style={styles.settingSubtitle}>Get reminded to check in</Text>
                  </View>
                  <View style={[styles.toggle, styles.toggleActive]}>
                    <View style={[styles.toggleCircle, styles.toggleCircleActive]} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <View>
                    <Text style={styles.settingLabel}>Milestone Alerts</Text>
                    <Text style={styles.settingSubtitle}>Celebrate your progress</Text>
                  </View>
                  <View style={styles.toggle}>
                    <View style={styles.toggleCircle} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <View>
                    <Text style={styles.settingLabel}>New Tether Alerts</Text>
                    <Text style={styles.settingSubtitle}>When new questions arrive</Text>
                  </View>
                  <View style={[styles.toggle, styles.toggleActive]}>
                    <View style={[styles.toggleCircle, styles.toggleCircleActive]} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Account Settings */}
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Account</Text>
                
                <TouchableOpacity style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Edit Profile</Text>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Privacy</Text>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Partner Settings</Text>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Support */}
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Support</Text>
                
                <TouchableOpacity style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Help Center</Text>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Send Feedback</Text>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Terms of Service</Text>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Logout */}
              <TouchableOpacity style={styles.logoutButton}>
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>

              <View style={styles.bottomSpacer} />
            </ScrollView>
          </Animated.View>
        </>
      )}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 22,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2C2C2C',
    fontWeight: '600',
  },
  cardsContainer: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
    gap: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardStack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  stackCard: {
    position: 'absolute',
    width: '80%',
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
  },
  stackCard1: {
    transform: [{ rotate: '-5deg' }, { translateX: -10 }],
  },
  stackCard2: {
    transform: [{ rotate: '3deg' }, { translateX: 5 }],
  },
  stackCard3: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  cardInfo: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
  },
  packTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  packDescription: {
    fontSize: 14,
    color: '#FF9B7A',
    fontWeight: '500',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  settingsModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 20,
  },
  settingsHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 24,
  },
  settingsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#2C2C2C',
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
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
  chevron: {
    fontSize: 24,
    color: '#CCC',
    fontWeight: '300',
  },
  logoutButton: {
    backgroundColor: '#FFF0F0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});