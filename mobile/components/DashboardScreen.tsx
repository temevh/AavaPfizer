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

type RootStackParamList = {
  Dashboard: undefined;
  // add other routes here if needed, e.g.:
  // OtherScreen?: { id: string };
};

import { Ionicons } from '@expo/vector-icons';

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width - 48, 448);

interface MetricProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number; // 0 to 1
  unit?: string;
}

function StatusIndicator({ value }: { value: number }) {
  const getColor = () => {
    if (value >= 0.8) return '#10b981';
    if (value >= 0.6) return '#84cc16';
    if (value >= 0.4) return '#eab308';
    if (value >= 0.2) return '#f97316';
    return '#f43f5e';
  };

  const getLabel = () => {
    if (value >= 0.8) return 'Excellent';
    if (value >= 0.6) return 'Good';
    if (value >= 0.4) return 'Fair';
    if (value >= 0.2) return 'Poor';
    return 'Critical';
  };

  const color = getColor();

  return (
    <View style={styles.statusContainer}>
      <View style={styles.statusBars}>
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold) => (
          <View
            key={threshold}
            style={[
              styles.statusBar,
              {
                backgroundColor: value >= threshold ? color : '#e2e8f0',
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.statusLabel}>{getLabel()}</Text>
    </View>
  );
}

function MetricCard({ iconName, label, value, unit }: MetricProps) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={styles.metricIconContainer}>
          <Ionicons name={iconName} size={20} color="#475569" />
        </View>
        <View style={styles.metricTextContainer}>
          <Text style={styles.metricLabel}>{label}</Text>
          {unit && <Text style={styles.metricUnit}>{unit}</Text>}
        </View>
      </View>
      <StatusIndicator value={value} />
    </View>
  );
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  // Mock data - values from 0 to 1
  const manualMetrics: MetricProps[] = [
    { iconName: 'restaurant', label: 'Meals', value: 0.8, unit: '3 meals today' },
    { iconName: 'water', label: 'Hydration', value: 0.6, unit: '6 glasses' },
    { iconName: 'wine', label: 'Alcohol', value: 1.0, unit: 'None today' },
  ];

  const deviceMetrics: MetricProps[] = [
    { iconName: 'walk', label: 'Steps', value: 0.4, unit: '5,240 steps' },
    { iconName: 'sunny', label: 'Outdoor Brightness', value: 0.6, unit: 'Moderate' },
    { iconName: 'moon', label: 'Sleep Quality', value: 0.8, unit: '7.5 hours' },
    { iconName: 'phone-portrait', label: 'Usage Accuracy', value: 0.8, unit: 'Low typos' },
    { iconName: 'eye', label: 'Screen Brightness', value: 0.4, unit: '75% avg' },
    { iconName: 'time', label: 'Screen Time', value: 0.2, unit: '8.5 hours' },
    { iconName: 'heart', label: 'Heart Rate', value: 0.8, unit: '68 bpm avg' },
  ];

  const externalMetrics: MetricProps[] = [
    { iconName: 'calendar', label: 'Calendar Stress', value: 0.4, unit: '8 meetings' },
    { iconName: 'cloud', label: 'Weather', value: 0.6, unit: 'Stable pressure' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerContent, { maxWidth }]}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color="#475569" />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}> health metrics</Text>
          </View>
        </View>

        <View style={[styles.content, { maxWidth }]}>
          {/* Manual Inputs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manual Tracking</Text>
            <View style={styles.metricsList}>
              {manualMetrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </View>
          </View>

          {/* Device Collected */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Data</Text>
            <View style={styles.metricsList}>
              {deviceMetrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </View>
          </View>

          {/* External Sources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>External Sources</Text>
            <View style={styles.metricsList}>
              {externalMetrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 12,
  },
  metricsList: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTextContainer: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBars: {
    flexDirection: 'row',
    gap: 4,
  },
  statusBar: {
    width: 8,
    height: 24,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#475569',
  },
});
