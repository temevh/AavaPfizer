import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Ionicons } from '@expo/vector-icons';

type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

interface MainScreenProps {
  navigation: MainScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width - 48, 448);

export function MainScreen({ navigation }: MainScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.content, { maxWidth }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MigraGuard</Text>
          <Text style={styles.subtitle}>Your migraine companion</Text>
        </View>

        {/* Emergency Button */}
        <Pressable
          onPress={() => navigation.navigate('Emergency')}
          style={({ pressed }) => [
            styles.emergencyButton,
            pressed && styles.emergencyButtonPressed,
          ]}
        >
            <Ionicons name="alert-circle" size={64} color="#fff" style={styles.emergencyIcon} />
            <Text style={styles.emergencyText}>Emergency Help</Text>
            <Text style={styles.emergencySubtext}>Tap for immediate migraine relief tips</Text>
        </Pressable>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable
            onPress={() => navigation.navigate('Tracking')}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <View style={[styles.iconContainer, styles.purpleIcon]}>
              <Ionicons name="pulse" size={24} color="#9333ea" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Log Migraine</Text>
              <Text style={styles.actionSubtitle}>Track symptoms & intensity</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Diary')}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <View style={[styles.iconContainer, styles.blueIcon]}>
              <Ionicons name="book" size={24} color="#2563eb" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Diary Entry</Text>
              <Text style={styles.actionSubtitle}>Add personal notes</Text>
            </View>
          </Pressable>
        </View>

        {/* Navigation Cards */}
        <View style={styles.navCards}>
          <Pressable
            onPress={() => navigation.navigate('Dashboard')}
            style={({ pressed }) => [
              styles.navCard,
              pressed && styles.navCardPressed,
            ]}
          >
            <View style={[styles.navIconContainer, styles.emeraldIcon]}>
              <Ionicons name="bar-chart" size={20} color="#10b981" />
            </View>
            <Text style={styles.navCardText}>Dashboard</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Patterns')}
            style={({ pressed }) => [
              styles.navCard,
              pressed && styles.navCardPressed,
            ]}
          >
            <View style={[styles.navIconContainer, styles.amberIcon]}>
              <Ionicons name="trending-up" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.navCardText}>Patterns</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    fontSize: 24,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  emergencyButton: {
    width: '100%',
    borderRadius: 24,
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
  emergencyGradient: {
    padding: 32,
    alignItems: 'center',
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
  quickActions: {
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonPressed: {
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purpleIcon: {
    backgroundColor: '#f3e8ff',
  },
  blueIcon: {
    backgroundColor: '#dbeafe',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  navCards: {
    flexDirection: 'row',
    gap: 12,
  },
  navCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  navCardPressed: {
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  navIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emeraldIcon: {
    backgroundColor: '#d1fae5',
  },
  amberIcon: {
    backgroundColor: '#fef3c7',
  },
  navCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
});
