import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type EmergencyTipsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Emergency'>;

interface EmergencyTipsScreenProps {
  navigation: EmergencyTipsScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width - 48, 448);

interface TipProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

function TipCard({ iconName, title, description, bgColor, iconColor }: TipProps) {
  return (
    <View style={styles.tipCard}>
      <View style={styles.tipContent}>
        <View style={[styles.tipIconContainer, { backgroundColor: bgColor }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.tipTextContainer}>
          <Text style={styles.tipTitle}>{title}</Text>
          <Text style={styles.tipDescription}>{description}</Text>
        </View>
      </View>
    </View>
  );
}

export function EmergencyTipsScreen({ navigation }: EmergencyTipsScreenProps) {
  const tips: TipProps[] = [
    {
      iconName: 'moon',
      title: 'Find a dark, quiet room',
      description: 'Reduce sensory stimulation by lying down in a dark, quiet space. Light and sound can intensify migraine pain.',
      bgColor: '#e0e7ff',
      iconColor: '#4f46e5',
    },
    {
      iconName: 'leaf',
      title: 'Practice deep breathing',
      description: 'Try 4-7-8 breathing: inhale for 4 counts, hold for 7, exhale for 8. Repeat 4 times to help relax.',
      bgColor: '#e0f2fe',
      iconColor: '#0284c7',
    },
    {
      iconName: 'water',
      title: 'Stay hydrated',
      description: 'Dehydration can trigger migraines. Sip water slowly and steadily. Aim for cool, not ice-cold water.',
      bgColor: '#dbeafe',
      iconColor: '#2563eb',
    },
    {
      iconName: 'snow',
      title: 'Apply cold or warm compress',
      description: 'Place a cold pack on your forehead or warm compress on neck. Alternate to find what works best for you.',
      bgColor: '#f3e8ff',
      iconColor: '#9333ea',
    },
    {
      iconName: 'medical',
      title: 'Take your medication',
      description: 'If prescribed, take migraine medication as directed. Early intervention is often more effective.',
      bgColor: '#fce7f3',
      iconColor: '#e11d48',
    },
    {
      iconName: 'cafe',
      title: 'Try caffeine (carefully)',
      description: 'A small amount of caffeine early in an attack may help. Avoid if you\'re sensitive or it\'s late in the day.',
      bgColor: '#fef3c7',
      iconColor: '#f59e0b',
    },
    {
      iconName: 'musical-notes',
      title: 'Use guided meditation',
      description: 'Listen to calming meditation or progressive muscle relaxation to reduce tension and pain.',
      bgColor: '#ccfbf1',
      iconColor: '#0d9488',
    },
    {
      iconName: 'call',
      title: 'When to seek help',
      description: 'Call emergency services if you experience sudden severe headache, fever, confusion, vision loss, or difficulty speaking.',
      bgColor: '#fee2e2',
      iconColor: '#dc2626',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient
          colors={['#f43f5e', '#e11d48']}
          style={styles.headerGradient}
        >
          <View style={[styles.headerContent, { maxWidth }]}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color="#fecdd3" />
              <Text style={styles.backText}>Back to safety</Text>
            </Pressable>
            <View style={styles.headerTitleRow}>
              <Ionicons name="alert-circle" size={32} color="#fff" />
              <Text style={styles.headerTitle}>Emergency Relief</Text>
            </View>
            <Text style={styles.headerSubtitle}>Quick tips to help ease your migraine</Text>
          </View>
        </LinearGradient>

        <View style={[styles.content, { maxWidth }]}>
          {tips.map((tip, index) => (
            <TipCard key={index} {...tip} />
          ))}

          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              These tips are for general guidance only. Always follow your doctor's advice and treatment plan.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerGradient: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerContent: {
    width: '100%',
    alignSelf: 'center',
    padding: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#fecdd3',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fecdd3',
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    padding: 24,
    gap: 16,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tipContent: {
    flexDirection: 'row',
    gap: 16,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  footerNote: {
    marginTop: 32,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
});
