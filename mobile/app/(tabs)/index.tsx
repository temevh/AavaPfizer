import { NavigationBar } from '@/components/NavigationBar';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { DashboardWarnings } from '@/components/DashboardWarnings';
import { PatternWarnings } from '@/components/PatternWarnings';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FloatingMenu from './menu';

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width - 48, 448);

export default function HomeScreen() {
  const { darkMode } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  
  const { userData } = useUser();
  console.log("User Data in HomeScreen:", userData);

  const handleViewWarnings = () => {
    router.push('/pattern-warnings');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Show onboarding screen if user hasn't completed setup
  if (!userData?.integrations) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  const handleViewPatterns = () => {
    router.push('/patterns');
  };

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
          onPress={() => router.push('/emergency')}
          style={({ pressed }) => [
            styles.emergencyButton,
            darkMode && styles.emergencyButtonDark,
            pressed && styles.emergencyButtonPressed,
          ]}
        >
          <Ionicons name="medical" size={40} color="#dc2626" style={styles.emergencyIcon} />
          <Text style={[styles.emergencyText, darkMode && styles.emergencyTextDark]}>Migraine Help</Text>
          <Text style={[styles.emergencySubtext, darkMode && styles.emergencySubtextDark]}>Press for immediate migraine relief tips</Text>
        </Pressable>

        {/* Dashboard Warnings */}
        <DashboardWarnings 
          onPress={handleViewWarnings}
          maxItems={2}
          style={styles.warningsContainer}
        />

        {/* Pattern Warnings */}
        <PatternWarnings 
          onPress={handleViewPatterns}
          maxItems={2}
          style={styles.warningsContainer}
        />

      </View>
    </ScrollView>
    
    <FloatingMenu />

    {/* Onboarding Modal for re-running setup */}
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
    paddingTop: 12,
  },
  content: {
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  titleDark: {
    color: '#e2e8f0',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  subtitleDark: {
    color: '#94a3b8',
  },
  emergencyButton: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#dc2626',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emergencyButtonDark: {
    backgroundColor: '#1e293b',
    borderColor: '#dc2626',
  },
  emergencyButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  emergencyIcon: {
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  emergencyTextDark: {
    color: '#ef4444',
  },
  emergencySubtext: {
    fontSize: 14,
    color: '#991b1b',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  emergencySubtextDark: {
    color: '#dc2626',
  },
  warningsContainer: {
    marginBottom: 16,
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
  testNotificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  testNotificationButtonDark: {
    backgroundColor: '#1e293b',
    borderColor: '#60a5fa',
  },
  testNotificationButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
  },
  testNotificationButtonTextDark: {
    color: '#60a5fa',
  },
});
