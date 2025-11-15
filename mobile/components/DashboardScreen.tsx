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
import { NavigationBar } from './NavigationBar';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingScreen } from './OnboardingScreen';
import { useUser } from '../contexts/UserContext';

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width, 448);

interface MetricProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number; // value between 0 and 1
  unit?: string;
  editable?: boolean;
  darkMode?: boolean;
}

interface DashboardScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function StatusIndicator({ value, darkMode }: { value: number; darkMode?: boolean }) {
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
                backgroundColor: value >= threshold ? color : (darkMode ? '#334155' : '#e2e8f0'),
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.statusLabel, darkMode && styles.statusLabelDark]}>{getLabel()}</Text>
    </View>
  );
}

function MetricCard({ iconName, label, value, unit, editable = false, darkMode }: MetricProps) {
  return (
    <View style={[styles.metricCard, darkMode && styles.metricCardDark]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIconContainer, darkMode && styles.metricIconContainerDark]}>
          <Ionicons name={iconName} size={20} color={darkMode ? '#94a3b8' : '#475569'} />
        </View>
        <View style={styles.metricTextContainer}>
          <Text style={[styles.metricLabel, darkMode && styles.metricLabelDark]}>{label}</Text>
          {unit && <Text style={[styles.metricUnit, darkMode && styles.metricUnitDark]}>{unit}</Text>}
        </View>
      </View>
      <StatusIndicator value={value} darkMode={darkMode} />
    </View>
  );
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { userData } = useUser();
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [trackingType, setTrackingType] = useState<'meals' | 'hydration' | 'alcohol'>('meals');
  const [mealsCount, setMealsCount] = useState(3);
  const [waterCount, setWaterCount] = useState(6);
  const [alcoholCount, setAlcoholCount] = useState(0);
  const { darkMode } = useTheme();

  // Get user's selected integrations
  const selectedIntegrations = userData?.integrations || [];

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

  const allDeviceMetrics = [
    { id: 'steps', iconName: 'walk' as keyof typeof Ionicons.glyphMap, label: 'Steps', value: 0.4, unit: '5,240 steps' },
    { id: 'outdoor-brightness', iconName: 'sunny' as keyof typeof Ionicons.glyphMap, label: 'Outdoor Brightness', value: 0.6, unit: 'Moderate' },
    { id: 'sleep', iconName: 'moon' as keyof typeof Ionicons.glyphMap, label: 'Sleep Quality', value: 0.8, unit: '7.5 hours' },
    { id: 'usage-accuracy', iconName: 'phone-portrait' as keyof typeof Ionicons.glyphMap, label: 'Usage Accuracy', value: 0.8, unit: 'Low typos' },
    { id: 'screen-brightness', iconName: 'eye' as keyof typeof Ionicons.glyphMap, label: 'Screen Brightness', value: 0.4, unit: '75% avg' },
    { id: 'screen-time', iconName: 'time' as keyof typeof Ionicons.glyphMap, label: 'Screen Time', value: 0.2, unit: '8.5 hours' },
    { id: 'heart-rate', iconName: 'heart' as keyof typeof Ionicons.glyphMap, label: 'Heart Rate', value: 0.8, unit: '68 bpm avg' },
  ];

  const deviceMetrics = allDeviceMetrics.filter(metric => 
    selectedIntegrations.includes(metric.id)
  );

  const allExternalMetrics = [
    { id: 'calendar', iconName: 'calendar' as keyof typeof Ionicons.glyphMap, label: 'Calendar Stress', value: 0.4, unit: '8 meetings' },
    { id: 'weather', iconName: 'cloud' as keyof typeof Ionicons.glyphMap, label: 'Weather', value: 0.6, unit: 'Stable pressure' },
  ];

  const externalMetrics = allExternalMetrics.filter(metric => 
    selectedIntegrations.includes(metric.id)
  );

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <NavigationBar
        title="Dashboard"
        subtitle="Your health metrics"
        showBackButton={true}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.content, { maxWidth }]}>
          {/* Manual Inputs */}
          <View style={[styles.section, darkMode && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Manual Tracking</Text>
            <Text style={[styles.sectionSubtitle, darkMode && styles.sectionSubtitleDark]}>Tap a metric to log your data</Text>
            <View style={styles.metricsList}>
              {manualMetrics.map((metric, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleEditMetric(
                    metric.label === 'Meals' ? 'meals' : 
                    metric.label === 'Hydration' ? 'hydration' : 'alcohol'
                  )}
                >
                  <MetricCard {...metric} editable={true} darkMode={darkMode} />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Device Collected */}
          {deviceMetrics.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Device Data</Text>
              <Text style={styles.sectionSubtitle}>Data gathered by your device(s)</Text>
              <View style={styles.metricsList}>
                {deviceMetrics.map((metric, index) => (
                  <MetricCard key={index} {...metric} />
                ))}
              </View>
            </View>
          )}

          {/* External Sources */}
          {externalMetrics.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>External Sources</Text>
              <Text style={styles.sectionSubtitle}>Data from connected apps</Text>
              <View style={styles.metricsList}>
                {externalMetrics.map((metric, index) => (
                  <MetricCard key={index} {...metric} />
                ))}
              </View>
            </View>
          )}
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
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionDark: {
    // Remove bright background/border in dark mode
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  sectionTitleDark: {
    color: '#e2e8f0',
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 16,
  },
  sectionSubtitleDark: {
    color: '#94a3b8',
  },
  textDark: {
    color: '#e2e8f0',
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
  metricCardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
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
  metricIconContainerDark: {
    backgroundColor: '#334155',
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
  metricLabelDark: {
    color: '#e2e8f0',
  },
  metricUnit: {
    fontSize: 16,
    color: '#94a3b8',
  },
  metricUnitDark: {
    color: '#64748b',
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
  statusLabelDark: {
    color: '#94a3b8',
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
