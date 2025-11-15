import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Modal,
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
const maxWidth = Math.min(width, 448);

interface MetricProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number; // value between 0 and 1
  unit?: string;
  editable?: boolean;
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

function MetricCard({ iconName, label, value, unit, editable = false }: MetricProps) {
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
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingType, setTrackingType] = useState<'meals' | 'hydration' | 'alcohol'>('meals');
  const [mealsCount, setMealsCount] = useState(3);
  const [waterCount, setWaterCount] = useState(6);
  const [alcoholCount, setAlcoholCount] = useState(0);

  const handleEditMetric = (type: 'meals' | 'hydration' | 'alcohol') => {
    setTrackingType(type);
    setShowTrackingModal(true);
  };

  const handleIncrement = () => {
    if (trackingType === 'meals') setMealsCount(prev => prev + 1);
    else if (trackingType === 'hydration') setWaterCount(prev => prev + 1);
    else setAlcoholCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (trackingType === 'meals') setMealsCount(prev => Math.max(0, prev - 1));
    else if (trackingType === 'hydration') setWaterCount(prev => Math.max(0, prev - 1));
    else setAlcoholCount(prev => Math.max(0, prev - 1));
  };

  const getCurrentCount = () => {
    if (trackingType === 'meals') return mealsCount;
    if (trackingType === 'hydration') return waterCount;
    return alcoholCount;
  };

  const getTrackingTitle = () => {
    if (trackingType === 'meals') return 'Log Meals';
    if (trackingType === 'hydration') return 'Log Water';
    return 'Log Alcohol';
  };

  const getTrackingUnit = () => {
    if (trackingType === 'meals') return 'meals';
    if (trackingType === 'hydration') return 'glasses';
    return 'units';
  };

  // Mock data - values from 0 to 1
  const manualMetrics: MetricProps[] = [
    { iconName: 'restaurant', label: 'Meals', value: mealsCount / 5, unit: `${mealsCount} meals today` },
    { iconName: 'water', label: 'Hydration', value: waterCount / 10, unit: `${waterCount} glasses` },
    { iconName: 'wine', label: 'Alcohol', value: alcoholCount === 0 ? 1.0 : Math.max(0, 1 - (alcoholCount / 5)), unit: alcoholCount === 0 ? 'None today' : `${alcoholCount} units` },
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
            <Text style={styles.sectionSubtitle}>Tap a metric to log your data</Text>
            <View style={styles.metricsList}>
              {manualMetrics.map((metric, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleEditMetric(
                    metric.label === 'Meals' ? 'meals' : 
                    metric.label === 'Hydration' ? 'hydration' : 'alcohol'
                  )}
                >
                  <MetricCard {...metric} editable={true} />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Device Collected */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Data</Text>
            <Text style={styles.sectionSubtitle}>Data gathered by your device(s)</Text>
            <View style={styles.metricsList}>
              {deviceMetrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </View>
          </View>

          {/* External Sources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>External Sources</Text>
            <Text style={styles.sectionSubtitle}>Data from connected apps</Text>
            <View style={styles.metricsList}>
              {externalMetrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Tracking Modal */}
      <Modal
        visible={showTrackingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTrackingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getTrackingTitle()}</Text>
              <Pressable onPress={() => setShowTrackingModal(false)}>
                <Ionicons name="close" size={36} color="#475569" />
              </Pressable>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Today&apos;s count</Text>
              <View style={styles.counterContainer}>
                <Pressable
                  onPress={handleDecrement}
                  style={styles.counterButton}
                >
                  <Ionicons name="remove-circle" size={80} color="#f43f5e" />
                </Pressable>
                
                <View style={styles.counterDisplay}>
                  <Text style={styles.counterValue}>{getCurrentCount()}</Text>
                  <Text style={styles.counterUnit}>{getTrackingUnit()}</Text>
                </View>
                
                <Pressable
                  onPress={handleIncrement}
                  style={styles.counterButton}
                >
                  <Ionicons name="add-circle" size={80} color="#10b981" />
                </Pressable>
              </View>
            </View>
            
            <Pressable
              onPress={() => setShowTrackingModal(false)}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    fontSize: 22,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 16,
  },
  metricsList: {
    gap: 6,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
    fontSize: 20,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 16,
    color: '#94a3b8',
  },
  statusContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
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
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#1e293b',
  },
  modalBody: {
    padding: 32,
    alignItems: 'center',
  },
  modalLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  counterButton: {
    padding: 8,
  },
  counterDisplay: {
    alignItems: 'center',
    minWidth: 100,
  },
  counterValue: {
    fontSize: 64,
    fontWeight: '600',
    color: '#1e293b',
  },
  counterUnit: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  modalSaveButton: {
    marginHorizontal: 20,
    backgroundColor: '#9333ea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
  },
});
