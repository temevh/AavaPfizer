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
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Patterns: undefined;
};

type PatternDetectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Patterns'>;

interface PatternDetectionScreenProps {
  navigation: PatternDetectionScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width - 48, 448);

interface PatternProps {
  type: 'positive' | 'negative' | 'warning' | 'insight';
  title: string;
  description: string;
  confidence: number;
}

function PatternCard({ type, title, description, confidence }: PatternProps) {
  const getIcon = () => {
    switch (type) {
      case 'positive':
        return <Ionicons name="checkmark-circle" size={24} color="#10b981" />;
      case 'negative':
        return <Ionicons name="trending-down" size={24} color="#e11d48" />;
      case 'warning':
        return <Ionicons name="warning" size={24} color="#f59e0b" />;
      case 'insight':
        return <Ionicons name="flash" size={24} color="#9333ea" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'positive':
        return { bg: '#ecfdf5', border: '#d1fae5' };
      case 'negative':
        return { bg: '#fef2f2', border: '#fecdd3' };
      case 'warning':
        return { bg: '#fffbeb', border: '#fde68a' };
      case 'insight':
        return { bg: '#faf5ff', border: '#e9d5ff' };
    }
  };

  const colors = getBgColor();

  return (
    <View style={[styles.patternCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.patternContent}>
        <View style={styles.patternIconContainer}>
          {getIcon()}
        </View>
        <View style={styles.patternTextContainer}>
          <Text style={styles.patternTitle}>{title}</Text>
          <Text style={styles.patternDescription}>{description}</Text>
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceBarContainer}>
              <View
                style={[
                  styles.confidenceBar,
                  { width: `${confidence}%` },
                ]}
              />
            </View>
            <Text style={styles.confidenceText}>{confidence}% confidence</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function PatternDetectionScreen({ navigation }: PatternDetectionScreenProps) {
  const patterns: PatternProps[] = [
    {
      type: 'negative',
      title: 'High screen time correlation',
      description: '78% of your migraines occurred on days with >7 hours of screen time. Consider taking more frequent breaks.',
      confidence: 78,
    },
    {
      type: 'warning',
      title: 'Poor sleep pattern detected',
      description: 'You averaged 5.5 hours of sleep on nights before migraine days, compared to 7.5 hours on other nights.',
      confidence: 85,
    },
    {
      type: 'positive',
      title: 'Hydration helps',
      description: 'Days with 8+ glasses of water showed 65% fewer migraine episodes. Keep up the good work!',
      confidence: 65,
    },
    {
      type: 'insight',
      title: 'Weather sensitivity',
      description: 'Rapid barometric pressure changes (>3 hPa/hour) preceded 60% of your migraines in the past month.',
      confidence: 60,
    },
    {
      type: 'warning',
      title: 'Skipping meals trigger',
      description: 'Missing breakfast was associated with afternoon migraines in 70% of cases. Regular meals may help.',
      confidence: 70,
    },
    {
      type: 'insight',
      title: 'Weekly pattern',
      description: 'Migraines occur most frequently on Mondays and Tuesdays, possibly related to weekend schedule changes.',
      confidence: 55,
    },
    {
      type: 'negative',
      title: 'Calendar stress indicator',
      description: 'Days with 6+ scheduled meetings showed 3x higher migraine occurrence. Consider spacing out commitments.',
      confidence: 72,
    },
    {
      type: 'positive',
      title: 'Exercise benefit',
      description: 'Days with 8,000+ steps had 45% fewer migraines. Light to moderate activity appears protective.',
      confidence: 45,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.headerContent, { maxWidth }]}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color="#475569" />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <View style={styles.headerTitleRow}>
              <Ionicons name="trending-up" size={24} color="#f59e0b" />
              <Text style={styles.headerTitle}>Pattern Detection</Text>
            </View>
            <Text style={styles.headerSubtitle}>AI-detected correlations and insights</Text>
          </View>
        </View>

        <View style={[styles.content, { maxWidth }]}>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              These patterns are based on your tracked data over the past 30 days. Confidence levels indicate the strength of the correlation.
            </Text>
          </View>

          {/* Patterns List */}
          <View style={styles.patternsList}>
            {patterns.map((pattern, index) => (
              <PatternCard key={index} {...pattern} />
            ))}
          </View>

          {/* Footer Note */}
          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              Patterns are for informational purposes only. Consult your healthcare provider for medical advice.
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
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingTop: 8,
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
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: '#475569',
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
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    padding: 24,
  },
  infoBanner: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  patternsList: {
    gap: 16,
    marginBottom: 24,
  },
  patternCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  patternContent: {
    flexDirection: 'row',
    gap: 16,
  },
  patternIconContainer: {
    flexShrink: 0,
  },
  patternTextContainer: {
    flex: 1,
  },
  patternTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
  },
  patternDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBar: {
    height: '100%',
    backgroundColor: '#64748b',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#64748b',
  },
  footerNote: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
});
