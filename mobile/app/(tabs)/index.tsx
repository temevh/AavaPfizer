import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FloatingMenu from './menu';
import { NavigationBar } from '@/components/NavigationBar';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width - 48, 448);

export default function HomeScreen() {
  const router = useRouter();
  const { darkMode } = useTheme();
  
  const user = {
    name: "Alex"
  }

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <NavigationBar
        showBackButton={false}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.content, { maxWidth }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, darkMode && styles.titleDark]}>Hello {user.name}</Text>
            <Text style={[styles.subtitle, darkMode && styles.subtitleDark]}>How are we feeling today?</Text>
          </View>

          {/* Emergency Button */}
        <Pressable
          onPress={() => Alert.alert('Emergency Help', 'Emergency tips will be shown here')}
          style={({ pressed }) => [
            styles.emergencyButton,
            pressed && styles.emergencyButtonPressed,
          ]}
        >
          <Ionicons name="alert-circle" size={64} color="#fff" style={styles.emergencyIcon} />
          <Text style={styles.emergencyText}>Emergency Help</Text>
          <Text style={styles.emergencySubtext}>Tap for immediate migraine relief tips</Text>
        </Pressable>
      </View>
    </ScrollView>
    
    <FloatingMenu />
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
    marginTop: 32,
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
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  emergencySubtext: {
    fontSize: 14,
    color: '#fecdd3',
  },
});
