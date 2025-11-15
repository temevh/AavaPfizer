import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationBar } from './NavigationBar';
import { useTheme } from '@/contexts/ThemeContext';

interface EmergencyTipsScreenProps {
  navigation: {
    goBack: () => void;
    navigate?: (route: string) => void;
  };
}

interface TipProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
  bgColor: string;
  darkMode: boolean;
}

function TipCard({ iconName, iconColor, title, description, bgColor, darkMode }: TipProps) {
  return (
    <View style={[styles.tipCard, darkMode && styles.tipCardDark]}>
      <View style={styles.tipCardContent}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.tipTextContainer}>
          <Text style={[styles.tipTitle, darkMode && styles.tipTitleDark]}>{title}</Text>
          <Text style={[styles.tipDescription, darkMode && styles.tipDescriptionDark]}>{description}</Text>
        </View>
      </View>
    </View>
  );
}

export function EmergencyTipsScreen({ navigation }: EmergencyTipsScreenProps) {
  const [activeTab, setActiveTab] = useState<'personalized' | 'peer' | 'general'>('personalized');

  const personalizedTips = [
    {
      iconName: 'water' as keyof typeof Ionicons.glyphMap,
      iconColor: '#2563eb',
      title: 'Hydrate immediately',
      description: 'Your data shows 72% of your migraines coincide with low water intake. Drink 2 glasses of water slowly over the next 20 minutes.',
      bgColor: '#dbeafe',
    },
    {
      iconName: 'eye' as keyof typeof Ionicons.glyphMap,
      iconColor: '#4f46e5',
      title: 'Screen break needed',
      description: 'You\'ve been on your device for 4.5 hours today. Your pattern shows screen time over 4 hours triggers migraines. Take a 30-minute break.',
      bgColor: '#e0e7ff',
    },
    {
      iconName: 'moon' as keyof typeof Ionicons.glyphMap,
      iconColor: '#9333ea',
      title: 'Rest in darkness',
      description: 'Based on your light sensitivity history, find a completely dark room. 85% of your past migraines improved with this approach.',
      bgColor: '#f3e8ff',
    },
    {
      iconName: 'cafe' as keyof typeof Ionicons.glyphMap,
      iconColor: '#d97706',
      title: 'Try small caffeine dose',
      description: 'Your logs show caffeine helped in 9 out of 12 recent episodes. Try a small coffee or tea if it\'s before 2 PM.',
      bgColor: '#fef3c7',
    },
    {
      iconName: 'flash' as keyof typeof Ionicons.glyphMap,
      iconColor: '#e11d48',
      title: 'Cold compress on forehead',
      description: 'You\'ve marked cold compresses as effective in 78% of logged episodes. Apply for 15-minute intervals.',
      bgColor: '#fce7f3',
    },
  ];

  const peerGroupTips = [
    {
      iconName: 'people' as keyof typeof Ionicons.glyphMap,
      iconColor: '#059669',
      title: 'Pressure point technique',
      description: 'Users in your age bracket (25-34) report 68% effectiveness with pressure on the hand between thumb and index finger for 5 minutes.',
      bgColor: '#d1fae5',
    },
    {
      iconName: 'leaf' as keyof typeof Ionicons.glyphMap,
      iconColor: '#0284c7',
      title: 'Box breathing (4-4-4-4)',
      description: 'People with similar symptoms found box breathing most effective: inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 5 times.',
      bgColor: '#e0f2fe',
    },
    {
      iconName: 'moon' as keyof typeof Ionicons.glyphMap,
      iconColor: '#4f46e5',
      title: 'Nap for 20-30 minutes',
      description: '74% of your peer group found short naps helpful during early migraine stages. Set an alarm to avoid oversleeping.',
      bgColor: '#e0e7ff',
    },
    {
      iconName: 'water' as keyof typeof Ionicons.glyphMap,
      iconColor: '#0891b2',
      title: 'Electrolyte drink',
      description: 'Users with similar migraine patterns report better results with electrolyte drinks vs. plain water during active episodes.',
      bgColor: '#cffafe',
    },
    {
      iconName: 'cafe' as keyof typeof Ionicons.glyphMap,
      iconColor: '#ea580c',
      title: 'Ginger tea',
      description: 'Your age group rates ginger tea highly (72% helpful) for nausea and pain. Steep fresh ginger for 10 minutes.',
      bgColor: '#ffedd5',
    },
    {
      iconName: 'flash' as keyof typeof Ionicons.glyphMap,
      iconColor: '#9333ea',
      title: 'Gentle neck stretches',
      description: 'Users with screen-time triggers like yours find neck stretches reduce pain intensity by 40% on average.',
      bgColor: '#f3e8ff',
    },
  ];

  const generalTips = [
    {
      iconName: 'moon' as keyof typeof Ionicons.glyphMap,
      iconColor: '#4f46e5',
      title: 'Find a dark, quiet room',
      description: 'Reduce sensory stimulation by lying down in a dark, quiet space. Light and sound can intensify migraine pain.',
      bgColor: '#e0e7ff',
    },
    {
      iconName: 'leaf' as keyof typeof Ionicons.glyphMap,
      iconColor: '#0284c7',
      title: 'Practice deep breathing',
      description: 'Try 4-7-8 breathing: inhale for 4 counts, hold for 7, exhale for 8. Repeat 4 times to help relax.',
      bgColor: '#e0f2fe',
    },
    {
      iconName: 'water' as keyof typeof Ionicons.glyphMap,
      iconColor: '#2563eb',
      title: 'Stay hydrated',
      description: 'Dehydration can trigger migraines. Sip water slowly and steadily. Aim for cool, not ice-cold water.',
      bgColor: '#dbeafe',
    },
    {
      iconName: 'flash' as keyof typeof Ionicons.glyphMap,
      iconColor: '#9333ea',
      title: 'Apply cold or warm compress',
      description: 'Place a cold pack on your forehead or warm compress on neck. Alternate to find what works best for you.',
      bgColor: '#f3e8ff',
    },
    {
      iconName: 'medical' as keyof typeof Ionicons.glyphMap,
      iconColor: '#e11d48',
      title: 'Take your medication',
      description: 'If prescribed, take migraine medication as directed. Early intervention is often more effective.',
      bgColor: '#fce7f3',
    },
    {
      iconName: 'cafe' as keyof typeof Ionicons.glyphMap,
      iconColor: '#d97706',
      title: 'Try caffeine (carefully)',
      description: 'A small amount of caffeine early in an attack may help. Avoid if you\'re sensitive or it\'s late in the day.',
      bgColor: '#fef3c7',
    },
    {
      iconName: 'volume-high' as keyof typeof Ionicons.glyphMap,
      iconColor: '#0d9488',
      title: 'Use guided meditation',
      description: 'Listen to calming meditation or progressive muscle relaxation to reduce tension and pain.',
      bgColor: '#ccfbf1',
    },
    {
      iconName: 'call' as keyof typeof Ionicons.glyphMap,
      iconColor: '#dc2626',
      title: 'When to seek help',
      description: 'Call emergency services if you experience sudden severe headache, fever, confusion, vision loss, or difficulty speaking.',
      bgColor: '#fee2e2',
    },
  ];

  const getCurrentTips = () => {
    switch (activeTab) {
      case 'personalized':
        return personalizedTips;
      case 'peer':
        return peerGroupTips;
      case 'general':
        return generalTips;
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'personalized':
        return 'Based on your tracked data and patterns';
      case 'peer':
        return 'From users in your age bracket with similar symptoms';
      case 'general':
        return 'Evidence-based tips for everyone';
    }
  };

  const { width } = Dimensions.get('window');
  const maxWidth = Math.min(width, 448);
  const { darkMode } = useTheme();

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <NavigationBar
        title="Emergency Relief"
        showBackButton={true}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tabs */}
        <View style={[styles.tabsContainer, { maxWidth }]}>
          <Pressable
            onPress={() => setActiveTab('personalized')}
            style={({ pressed }) => [
              styles.tab,
              darkMode && styles.tabDark,
              activeTab === 'personalized' && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
          >
            <Ionicons 
              name="person" 
              size={16} 
              color={activeTab === 'personalized' ? '#fff' : (darkMode ? '#94a3b8' : '#64748b')} 
            />
            <Text style={[
              styles.tabText,
              darkMode && styles.tabTextDark,
              activeTab === 'personalized' && styles.tabTextActive
            ]}>
              For You
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('peer')}
            style={({ pressed }) => [
              styles.tab,
              darkMode && styles.tabDark,
              activeTab === 'peer' && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
          >
            <Ionicons 
              name="people" 
              size={16} 
              color={activeTab === 'peer' ? '#fff' : (darkMode ? '#94a3b8' : '#64748b')} 
            />
            <Text style={[
              styles.tabText,
              darkMode && styles.tabTextDark,
              activeTab === 'peer' && styles.tabTextActive
            ]}>
              Peer Group
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('general')}
            style={({ pressed }) => [
              styles.tab,
              darkMode && styles.tabDark,
              activeTab === 'general' && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
          >
            <Ionicons 
              name="globe" 
              size={16} 
              color={activeTab === 'general' ? '#fff' : (darkMode ? '#94a3b8' : '#64748b')} 
            />
            <Text style={[
              styles.tabText,
              darkMode && styles.tabTextDark,
              activeTab === 'general' && styles.tabTextActive
            ]}>
              General
            </Text>
          </Pressable>
        </View>

        <View style={[styles.content, { maxWidth }]}>
          {/* AI Banner for Personalized Tab */}
          {activeTab === 'personalized' && (
            <View style={[styles.aiBanner, darkMode && styles.aiBannerDark]}>
              <Ionicons name="sparkles" size={16} color={darkMode ? '#a78bfa' : '#7c3aed'} />
              <Text style={[styles.aiBannerText, darkMode && styles.aiBannerTextDark]}>
                AI-analyzed recommendations based on your unique patterns
              </Text>
            </View>
          )}

          {/* Tab Description */}
          <View style={styles.tabDescriptionContainer}>
            <Text style={[styles.tabDescription, darkMode && styles.tabDescriptionDark]}>{getTabDescription()}</Text>
          </View>

          {/* Tips List */}
          <View style={styles.tipsList}>
            {getCurrentTips().map((tip, index) => (
              <TipCard 
                key={index} 
                iconName={tip.iconName}
                iconColor={tip.iconColor}
                title={tip.title}
                description={tip.description}
                bgColor={tip.bgColor}
                darkMode={darkMode}
              />
            ))}
          </View>

          <View style={[styles.disclaimer, darkMode && styles.disclaimerDark]}>
            <Text style={[styles.disclaimerText, darkMode && styles.disclaimerTextDark]}>
              These tips are for general guidance only. Always follow your doctor&apos;s advice and treatment plan.
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
  containerDark: {
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  tabsContainer: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  tabDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  tabActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  tabPressed: {
    opacity: 0.8,
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  tabTextDark: {
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  aiBannerDark: {
    backgroundColor: '#1e1b4b',
    borderColor: '#4c1d95',
  },
  aiBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#7c3aed',
    lineHeight: 18,
  },
  aiBannerTextDark: {
    color: '#a78bfa',
  },
  tabDescriptionContainer: {
    marginBottom: 16,
  },
  tabDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  tabDescriptionDark: {
    color: '#94a3b8',
  },
  tipsList: {
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
  tipCardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  tipCardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  tipTitleDark: {
    color: '#e2e8f0',
  },
  tipDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  tipDescriptionDark: {
    color: '#94a3b8',
  },
  disclaimer: {
    marginTop: 32,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  disclaimerDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  disclaimerTextDark: {
    color: '#94a3b8',
  },
});