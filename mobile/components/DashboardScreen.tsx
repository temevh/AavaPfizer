import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Modal,
  ActivityIndicator,
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
  const { userData, updateDashboardData } = useUser();
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [trackingType, setTrackingType] = useState<'meals' | 'hydration' | 'alcohol'>('meals');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  
  // Initialize from stored data or defaults
  const [mealsCount, setMealsCount] = useState(() => {
    if (userData?.dashboardData?.meals?.unit) {
      const match = userData.dashboardData.meals.unit.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 3;
    }
    return 0;
  });
  
  const [waterCount, setWaterCount] = useState(() => {
    if (userData?.dashboardData?.hydration?.unit) {
      const match = userData.dashboardData.hydration.unit.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 6;
    }
    return 0;
  });
  
  const [alcoholCount, setAlcoholCount] = useState(() => {
    if (userData?.dashboardData?.alcohol?.unit) {
      if (userData.dashboardData.alcohol.unit === 'None today') return 0;
      const match = userData.dashboardData.alcohol.unit.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }
    return 0;
  });
  
  const { darkMode } = useTheme();

  // Load AI insights when dashboard loads
  useEffect(() => {
    loadDailyInsight();
  }, [userData?.dashboardData]);

  const loadDailyInsight = async () => {
    if (!userData?.dashboardData) return;

    setLoadingInsight(true);
    try {
      const { generateDashboardInsights } = await import('@/services/geminiService');
      const insights = await generateDashboardInsights(userData.dashboardData);
      setAiInsight(insights);
    } catch (error) {
      console.error('Failed to load AI insight:', error);
      setAiInsight('');
    } finally {
      setLoadingInsight(false);
    }
  };

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

  const handleSaveTracking = () => {
    // Update the dashboard data in UserContext
    updateDashboardData(mealsCount, waterCount, alcoholCount);
    setShowTrackingModal(false);
  };


  // Mock data - use stored values or calculate from current counts
  const manualMetrics: MetricProps[] = [
    { 
      iconName: 'restaurant', 
      label: 'Meals', 
      value: userData?.dashboardData?.meals?.value ?? 0, 
      unit: userData?.dashboardData?.meals?.unit ?? '0 meals today' 
    },
    { 
      iconName: 'water', 
      label: 'Hydration', 
      value: userData?.dashboardData?.hydration?.value ?? 0, 
      unit: userData?.dashboardData?.hydration?.unit ?? '0 glasses' 
    },
    { 
      iconName: 'wine', 
      label: 'Alcohol', 
      value: userData?.dashboardData?.alcohol?.value ?? 1.0, 
      unit: userData?.dashboardData?.alcohol?.unit ?? 'None today' 
    },
  ];

  const allDeviceMetrics = [
    { 
      id: 'steps', 
      iconName: 'walk' as keyof typeof Ionicons.glyphMap, 
      label: 'Steps', 
      value: userData?.dashboardData?.steps?.value ?? 0, 
      unit: userData?.dashboardData?.steps?.unit ?? '0 steps' 
    },
    { 
      id: 'outdoor-brightness', 
      iconName: 'sunny' as keyof typeof Ionicons.glyphMap, 
      label: 'Outdoor Brightness', 
      value: userData?.dashboardData?.outdoorBrightness?.value ?? 0, 
      unit: userData?.dashboardData?.outdoorBrightness?.unit ?? 'No data' 
    },
    { 
      id: 'sleep', 
      iconName: 'moon' as keyof typeof Ionicons.glyphMap, 
      label: 'Sleep Quality', 
      value: userData?.dashboardData?.sleep?.value ?? 0, 
      unit: userData?.dashboardData?.sleep?.unit ?? '0 hours' 
    },
    { 
      id: 'usage-accuracy', 
      iconName: 'phone-portrait' as keyof typeof Ionicons.glyphMap, 
      label: 'Usage Accuracy', 
      value: userData?.dashboardData?.usageAccuracy?.value ?? 0, 
      unit: userData?.dashboardData?.usageAccuracy?.unit ?? 'No data' 
    },
    { 
      id: 'screen-brightness', 
      iconName: 'eye' as keyof typeof Ionicons.glyphMap, 
      label: 'Screen Brightness', 
      value: userData?.dashboardData?.screenBrightness?.value ?? 0, 
      unit: userData?.dashboardData?.screenBrightness?.unit ?? 'No data' 
    },
    { 
      id: 'screen-time', 
      iconName: 'time' as keyof typeof Ionicons.glyphMap, 
      label: 'Screen Time', 
      value: userData?.dashboardData?.screenTime?.value ?? 0, 
      unit: userData?.dashboardData?.screenTime?.unit ?? '0 hours' 
    },
    { 
      id: 'heart-rate', 
      iconName: 'heart' as keyof typeof Ionicons.glyphMap, 
      label: 'Heart Rate', 
      value: userData?.dashboardData?.heartRate?.value ?? 0, 
      unit: userData?.dashboardData?.heartRate?.unit ?? '0 bpm avg' 
    },
  ];

  const deviceMetrics = allDeviceMetrics.filter(metric => 
    selectedIntegrations.includes(metric.id)
  );

  const allExternalMetrics = [
    { 
      id: 'calendar', 
      iconName: 'calendar' as keyof typeof Ionicons.glyphMap, 
      label: 'Calendar Stress', 
      value: userData?.dashboardData?.calendar?.value ?? 0, 
      unit: userData?.dashboardData?.calendar?.unit ?? 'No data' 
    },
    { 
      id: 'weather', 
      iconName: 'cloud' as keyof typeof Ionicons.glyphMap, 
      label: 'Weather', 
      value: userData?.dashboardData?.weather?.value ?? 0, 
      unit: userData?.dashboardData?.weather?.unit ?? 'No data' 
    },
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
          {/* AI Insight Card */}
          {(aiInsight || loadingInsight) && (
            <View style={[styles.insightCard, darkMode && styles.insightCardDark]}>
              <View style={styles.insightHeader}>
                <View style={styles.insightHeaderLeft}>
                  <View style={styles.aiIconContainer}>
                    <Ionicons name="sparkles" size={18} color="#9333ea" />
                  </View>
                  <Text style={[styles.insightTitle, darkMode && styles.textDark]}>
                    AI Daily Insight
                  </Text>
                </View>
                {aiInsight && !loadingInsight && (
                  <Pressable onPress={loadDailyInsight}>
                    <Ionicons
                      name="refresh"
                      size={20}
                      color={darkMode ? '#94a3b8' : '#64748b'}
                    />
                  </Pressable>
                )}
              </View>

              {loadingInsight ? (
                <View style={styles.insightLoadingContainer}>
                  <ActivityIndicator size="small" color="#9333ea" />
                  <Text style={[styles.insightLoadingText, darkMode && styles.textDark]}>
                    Analyzing your health data...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.insightText, darkMode && styles.textDark]}>
                  {aiInsight}
                </Text>
              )}
            </View>
          )}

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
            <View style={[styles.section, darkMode && styles.sectionDark]}>
              <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Device Data</Text>
              <Text style={[styles.sectionSubtitle, darkMode && styles.sectionSubtitleDark]}>Data gathered by your device(s)</Text>
              <View style={styles.metricsList}>
                {deviceMetrics.map((metric, index) => (
                  <MetricCard key={index} {...metric} darkMode={darkMode} />
                ))}
              </View>
            </View>
          )}

          {/* External Sources */}
          {externalMetrics.length > 0 && (
            <View style={[styles.section, darkMode && styles.sectionDark]}>
              <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>External Sources</Text>
              <Text style={[styles.sectionSubtitle, darkMode && styles.sectionSubtitleDark]}>Data from connected apps</Text>
              <View style={styles.metricsList}>
                {externalMetrics.map((metric, index) => (
                  <MetricCard key={index} {...metric} darkMode={darkMode} />
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
          <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
            <View style={[styles.modalHeader, darkMode && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>{getTrackingTitle()}</Text>
              <Pressable onPress={() => setShowTrackingModal(false)}>
                <Ionicons name="close" size={36} color={darkMode ? '#94a3b8' : '#475569'} />
              </Pressable>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, darkMode && styles.modalLabelDark]}>Today&apos;s count</Text>
              <View style={styles.counterContainer}>
                <Pressable
                  onPress={handleDecrement}
                  style={styles.counterButton}
                >
                  <Ionicons name="remove-circle" size={80} color="#f43f5e" />
                </Pressable>
                
                <View style={styles.counterDisplay}>
                  <Text style={[styles.counterValue, darkMode && styles.counterValueDark]}>{getCurrentCount()}</Text>
                  <Text style={[styles.counterUnit, darkMode && styles.counterUnitDark]}>{getTrackingUnit()}</Text>
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
              onPress={handleSaveTracking}
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
  insightCard: {
    backgroundColor: '#faf5ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightCardDark: {
    backgroundColor: '#1e1b4b',
    borderColor: '#4c1d95',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  insightLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  insightLoadingText: {
    fontSize: 14,
    color: '#64748b',
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
  modalContentDark: {
    backgroundColor: '#1e293b',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalHeaderDark: {
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#1e293b',
  },
  modalTitleDark: {
    color: '#e2e8f0',
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
  modalLabelDark: {
    color: '#94a3b8',
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
  counterValueDark: {
    color: '#e2e8f0',
  },
  counterUnit: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  counterUnitDark: {
    color: '#94a3b8',
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
