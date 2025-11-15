import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationBar } from '@/components/NavigationBar';
import { useTheme } from '@/contexts/ThemeContext';
import { useDashboardStatus } from '@/hooks/useDashboardStatus';

interface WarningItemProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  status: 'Critical' | 'Poor';
  unit: string;
  darkMode?: boolean;
}

function WarningItem({ iconName, title, status, unit, darkMode }: WarningItemProps) {
  const statusColor = status === 'Critical' ? '#ef4444' : '#f97316';
  
  return (
    <View style={[styles.warningItem, darkMode && styles.warningItemDark]}>
      <View style={styles.warningHeader}>
        <View style={[styles.warningIconContainer, darkMode && styles.warningIconContainerDark]}>
          <Ionicons name={iconName} size={20} color={statusColor} />
        </View>
        <View style={styles.warningTextContainer}>
          <Text style={[styles.warningTitle, darkMode && styles.warningTitleDark]}>{title}</Text>
          <Text style={[styles.warningUnit, darkMode && styles.warningUnitDark]}>{unit}</Text>
        </View>
      </View>
      <View style={styles.statusContainer}>
        <Text style={[styles.statusLabel, { color: statusColor }]}>{status}</Text>
      </View>
    </View>
  );
}

export default function PatternWarningsScreen() {
  const { darkMode } = useTheme();
  const dashboardStatus = useDashboardStatus();

  // Collect all critical/poor items
  const warnings = [];
  
  if (dashboardStatus.meals && (dashboardStatus.meals.status === 'Critical' || dashboardStatus.meals.status === 'Poor')) {
    warnings.push({
      iconName: 'restaurant' as keyof typeof Ionicons.glyphMap,
      title: 'Meals',
      status: dashboardStatus.meals.status,
      unit: dashboardStatus.meals.unit
    });
  }

  if (dashboardStatus.hydration && (dashboardStatus.hydration.status === 'Critical' || dashboardStatus.hydration.status === 'Poor')) {
    warnings.push({
      iconName: 'water' as keyof typeof Ionicons.glyphMap,
      title: 'Hydration',
      status: dashboardStatus.hydration.status,
      unit: dashboardStatus.hydration.unit
    });
  }

  if (dashboardStatus.alcohol && (dashboardStatus.alcohol.status === 'Critical' || dashboardStatus.alcohol.status === 'Poor')) {
    warnings.push({
      iconName: 'wine' as keyof typeof Ionicons.glyphMap,
      title: 'Alcohol Consumption',
      status: dashboardStatus.alcohol.status,
      unit: dashboardStatus.alcohol.unit
    });
  }

  // Sort warnings by priority: Critical first, then Poor
  const sortedWarnings = warnings.sort((a, b) => {
    if (a.status === 'Critical' && b.status === 'Poor') return -1;
    if (a.status === 'Poor' && b.status === 'Critical') return 1;
    return 0;
  });

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <NavigationBar
        title="Pattern Warnings"
        subtitle="Health metrics that need attention"
        showBackButton={true}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {sortedWarnings.length > 0 ? (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Warning Metrics</Text>
                <Text style={[styles.sectionSubtitle, darkMode && styles.sectionSubtitleDark]}>
                  These metrics may be contributing to your migraines
                </Text>
                <View style={styles.warningsList}>
                  {sortedWarnings.map((warning, index) => (
                    <WarningItem
                      key={index}
                      iconName={warning.iconName}
                      title={warning.title}
                      status={warning.status}
                      unit={warning.unit}
                      darkMode={darkMode}
                    />
                  ))}
                </View>
              </View>
              <View style={[styles.tipContainer, darkMode && styles.tipContainerDark]}>
                <View style={styles.tipHeader}>
                  <Ionicons 
                    name="bulb" 
                    size={16} 
                    color={darkMode ? '#fbbf24' : '#f59e0b'} 
                    style={styles.tipIcon}
                  />
                  <Text style={[styles.tipTitle, darkMode && styles.tipTitleDark]}>
                    Recommendation
                  </Text>
                </View>
                <Text style={[styles.tipText, darkMode && styles.tipTextDark]}>
                  Consider adjusting these habits to help reduce migraine frequency and severity.
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.noWarningsContainer}>
              <Ionicons 
                name="checkmark-circle" 
                size={64} 
                color={darkMode ? '#10b981' : '#059669'} 
                style={styles.noWarningsIcon}
              />
              <Text style={[styles.noWarningsTitle, darkMode && styles.noWarningsTitleDark]}>
                All Good!
              </Text>
              <Text style={[styles.noWarningsText, darkMode && styles.noWarningsTextDark]}>
                {dashboardStatus.overallStatus === 'No Data' 
                  ? 'No dashboard data available yet. Start tracking your daily metrics to see personalized warnings.'
                  : 'Your tracked metrics are all within healthy ranges. Keep up the great work!'
                }
              </Text>
            </View>
          )}
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
  contentContainer: {
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
  description: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 24,
  },
  descriptionDark: {
    color: '#94a3b8',
  },
  warningsList: {
    gap: 6,
    marginBottom: 24,
  },
  warningItem: {
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
  warningItemDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  warningIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIconContainerDark: {
    backgroundColor: '#334155',
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4,
  },
  warningTitleDark: {
    color: '#e2e8f0',
  },
  warningUnit: {
    fontSize: 16,
    color: '#94a3b8',
  },
  warningUnitDark: {
    color: '#64748b',
  },
  statusContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
  tipContainer: {
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
  tipContainerDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIcon: {
    marginRight: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  tipTitleDark: {
    color: '#e2e8f0',
  },
  tipText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  tipTextDark: {
    color: '#94a3b8',
  },
  noWarningsContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noWarningsIcon: {
    marginBottom: 16,
  },
  noWarningsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  noWarningsTitleDark: {
    color: '#e2e8f0',
  },
  noWarningsText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  noWarningsTextDark: {
    color: '#94a3b8',
  },
});
