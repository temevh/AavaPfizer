import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface PatternWarningsProps {
  onPress?: () => void;
  maxItems?: number;
  style?: any;
}

interface Pattern {
  type: 'positive' | 'negative' | 'warning' | 'insight';
  title: string;
  description: string;
  confidence: number;
}

const HIGH_CONFIDENCE_THRESHOLD = 80;

// Mock patterns - in real app, these would come from your data/API
const mockPatterns: Pattern[] = [
  {
    type: 'negative',
    title: 'High screen time correlation',
    description: '78% of your migraines occurred on days with >7 hours of screen time.',
    confidence: 78,
  },
  {
    type: 'warning',
    title: 'Poor sleep pattern detected',
    description: 'You averaged 5.5 hours of sleep on nights before migraine days.',
    confidence: 85,
  },
  {
    type: 'positive',
    title: 'Hydration helps',
    description: 'Days with 8+ glasses of water showed 65% fewer migraine episodes.',
    confidence: 65,
  },
  {
    type: 'insight',
    title: 'Weather sensitivity',
    description: 'Rapid barometric pressure changes preceded 60% of your migraines.',
    confidence: 60,
  },
  {
    type: 'warning',
    title: 'Skipping meals trigger',
    description: 'Missing breakfast was associated with afternoon migraines in 70% of cases.',
    confidence: 70,
  },
  {
    type: 'insight',
    title: 'Weekly pattern',
    description: 'Migraines occur most frequently on Mondays and Tuesdays.',
    confidence: 55,
  },
  {
    type: 'negative',
    title: 'Calendar stress indicator',
    description: 'Days with 6+ scheduled meetings showed 3x higher migraine occurrence.',
    confidence: 72,
  },
  {
    type: 'positive',
    title: 'Exercise benefit',
    description: 'Days with 8,000+ steps had 45% fewer migraines.',
    confidence: 45,
  },
];

export function PatternWarnings({ onPress, maxItems = 2, style }: PatternWarningsProps) {
  const { darkMode } = useTheme();

  // Filter high confidence patterns and sort by confidence
  const highConfidencePatterns = mockPatterns
    .filter(pattern => pattern.confidence >= HIGH_CONFIDENCE_THRESHOLD)
    .sort((a, b) => b.confidence - a.confidence);

  // Don't render if no high confidence patterns
  if (highConfidencePatterns.length === 0) {
    return null;
  }

  // Limit to maxItems
  const displayPatterns = highConfidencePatterns.slice(0, maxItems);
  const hasMorePatterns = highConfidencePatterns.length > maxItems;

  const getPatternIcon = (type: Pattern['type']) => {
    switch (type) {
      case 'positive':
        return 'checkmark-circle' as keyof typeof Ionicons.glyphMap;
      case 'negative':
        return 'trending-down' as keyof typeof Ionicons.glyphMap;
      case 'warning':
        return 'warning' as keyof typeof Ionicons.glyphMap;
      case 'insight':
        return 'flash' as keyof typeof Ionicons.glyphMap;
    }
  };

  const getPatternColor = (type: Pattern['type']) => {
    switch (type) {
      case 'positive':
        return '#10b981';
      case 'negative':
        return '#e11d48';
      case 'warning':
        return '#f59e0b';
      case 'insight':
        return '#9333ea';
    }
  };

  const content = (
    <View style={[styles.container, darkMode && styles.containerDark, style]}>
      <View style={styles.header}>
        <Ionicons 
          name="analytics" 
          size={20} 
          color={darkMode ? '#a855f7' : '#9333ea'} 
          style={styles.headerIcon}
        />
        <Text style={[styles.title, darkMode && styles.titleDark]}>
          High confidence patterns
        </Text>
      </View>
      
      {displayPatterns.map((pattern, index) => {
        const iconName = getPatternIcon(pattern.type);
        const iconColor = getPatternColor(pattern.type);
        
        return (
          <View key={index} style={styles.patternItem}>
            <View style={styles.patternHeader}>
              <View style={[styles.patternIconContainer, darkMode && styles.patternIconContainerDark]}>
                <Ionicons name={iconName} size={16} color={iconColor} />
              </View>
              <View style={styles.patternContent}>
                <Text style={[styles.patternTitle, darkMode && styles.patternTitleDark]}>
                  {pattern.title}
                </Text>
                <Text style={[styles.patternDescription, darkMode && styles.patternDescriptionDark]}>
                  {pattern.description}
                </Text>
              </View>
            </View>
            <Text style={[styles.patternConfidence, { color: iconColor }]}>
              {pattern.confidence}%
            </Text>
          </View>
        );
      })}
      
      {hasMorePatterns && (
        <Text style={[styles.moreText, darkMode && styles.moreTextDark]}>
          +{highConfidencePatterns.length - maxItems} more pattern{highConfidencePatterns.length - maxItems > 1 ? 's' : ''}
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
            View all patterns
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
    padding: 12,
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
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  titleDark: {
    color: '#e2e8f0',
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  patternIconContainer: {
    width: 28,
    height: 28,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  patternIconContainerDark: {
    backgroundColor: '#334155',
  },
  patternContent: {
    flex: 1,
  },
  patternTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 2,
  },
  patternTitleDark: {
    color: '#e2e8f0',
  },
  patternDescription: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
  },
  patternDescriptionDark: {
    color: '#64748b',
  },
  patternConfidence: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    flexShrink: 0,
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
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9333ea',
    marginLeft: 4,
  },
  viewAllTextDark: {
    color: '#a855f7',
  },
});
