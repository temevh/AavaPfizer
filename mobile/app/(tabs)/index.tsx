import { NavigationBar } from '@/components/NavigationBar';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FloatingMenu from './menu';

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width - 48, 448);

export default function HomeScreen() {
  const { darkMode } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  
  const { userData } = useUser();
  console.log("User Data in HomeScreen:", userData);

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <NavigationBar
        showBackButton={false}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.content, { maxWidth }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, darkMode && styles.titleDark]}>Hello {userData?.name ?? ""}!</Text>
            <Text style={[styles.subtitle, darkMode && styles.subtitleDark]}>How are we feeling today?</Text>
          </View>

          {/* Emergency Button */}
        <Pressable
          onLongPress={() => router.push('/emergency')}
          delayLongPress={500}
          style={({ pressed }) => [
            styles.emergencyButton,
            pressed && styles.emergencyButtonPressed,
          ]}
        >
          <Ionicons name="alert-circle" size={64} color="#fff" style={styles.emergencyIcon} />
          <Text style={styles.emergencyText}>Emergency Help</Text>
          <Text style={styles.emergencySubtext}>Press and hold for immediate migraine relief tips</Text>
        </Pressable>

        {/* Onboarding Button */}
        <Pressable
          onPress={() => setShowOnboarding(true)}
          style={({ pressed }) => [
            styles.onboardingButton,
            pressed && styles.onboardingButtonPressed,
          ]}
        >
          <Ionicons name="settings-outline" size={24} color="#9333ea" />
          <Text style={[styles.onboardingButtonText, darkMode && styles.onboardingButtonTextDark]}>Setup & Preferences</Text>
        </Pressable>
      </View>
    </ScrollView>
    
    <FloatingMenu />

    {/* Onboarding Modal */}
    <Modal
      visible={showOnboarding}
      animationType="slide"
      onRequestClose={() => setShowOnboarding(false)}
    >
      <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 32,
  },
  content: {
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  titleDark: {
    color: '#e2e8f0',
  },
  subtitle: {
    fontSize: 20,
    color: '#64748b',
  },
  subtitleDark: {
    color: '#94a3b8',
  },
  emergencyButton: {
    width: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  emergencyButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  emergencyIcon: {
    marginBottom: 12,
  },
  emergencyText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  emergencySubtext: {
    fontSize: 16,
    color: '#fecdd3',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  onboardingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#9333ea',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  onboardingButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  onboardingButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9333ea',
  },
  onboardingButtonTextDark: {
    color: '#a855f7',
  },
});
