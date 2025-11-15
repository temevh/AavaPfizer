import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useDashboardStatus } from '@/hooks/useDashboardStatus';

interface DashboardWarningsProps {
  onPress?: () => void;
  maxItems?: number;
  style?: any;
}

export function DashboardWarnings({ onPress, maxItems = 3, style }: DashboardWarningsProps) {
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
      title: 'Alcohol',
      status: dashboardStatus.alcohol.status,
      unit: dashboardStatus.alcohol.unit
    });
  }

  // Don't render if no warnings
  if (warnings.length === 0) {
    return null;
  }

  // Sort warnings by priority: Critical first, then Poor
  const sortedWarnings = warnings.sort((a, b) => {
    if (a.status === 'Critical' && b.status === 'Poor') return -1;
    if (a.status === 'Poor' && b.status === 'Critical') return 1;
    return 0;
  });

  // Limit to maxItems
  const displayWarnings = sortedWarnings.slice(0, maxItems);
  const hasMoreWarnings = sortedWarnings.length > maxItems;

  const content = (
    <View style={[styles.container, darkMode && styles.containerDark, style]}>
      <View style={styles.header}>
        <Ionicons 
          name="alert-circle" 
          size={20} 
          color={darkMode ? '#f97316' : '#ef4444'} 
          style={styles.headerIcon}
        />
        <Text style={[styles.title, darkMode && styles.titleDark]}>
          Keep an eye on these
        </Text>
      </View>
      
      {displayWarnings.map((warning, index) => {
        const statusColor = warning.status === 'Critical' ? '#ef4444' : '#f97316';
        
        return (
          <View key={index} style={styles.warningItem}>
            <View style={styles.warningHeader}>
              <View style={[styles.warningIconContainer, darkMode && styles.warningIconContainerDark]}>
                <Ionicons name={warning.iconName} size={16} color={statusColor} />
              </View>
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, darkMode && styles.warningTitleDark]}>
                  {warning.title}
                </Text>
                <Text style={[styles.warningUnit, darkMode && styles.warningUnitDark]}>
                  {warning.unit}
                </Text>
              </View>
            </View>
            <Text style={[styles.warningStatus, { color: statusColor }]}>
              {warning.status}
            </Text>
          </View>
        );
      })}
      
      {hasMoreWarnings && (
        <Text style={[styles.moreText, darkMode && styles.moreTextDark]}>
          +{sortedWarnings.length - maxItems} more warning{sortedWarnings.length - maxItems > 1 ? 's' : ''}
        </Text>
      )}
      
      {onPress && (
        <View style={styles.viewAllContainer}>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={darkMode ? '#a855f7' : '#9333ea'} 
          />
          <Text style={[styles.viewAllText, darkMode && styles.viewAllTextDark]}>
            View all warnings
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
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
  containerDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  titleDark: {
    color: '#e2e8f0',
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  warningIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  warningIconContainerDark: {
    backgroundColor: '#334155',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 2,
  },
  warningTitleDark: {
    color: '#e2e8f0',
  },
  warningUnit: {
    fontSize: 12,
    color: '#94a3b8',
  },
  warningUnitDark: {
    color: '#64748b',
  },
  warningStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  },
  moreTextDark: {
    color: '#94a3b8',
  },
  viewAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9333ea',
    marginLeft: 4,
  },
  viewAllTextDark: {
    color: '#a855f7',
  },
});
