import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationBar } from '@/components/NavigationBar';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

const { width } = Dimensions.get('window');
const chartWidth = width - 40;
const chartHeight = 220;

interface LineChartProps {
  title: string;
  data: { date: string; value: number; severity?: string; note?: string }[];
  color: string;
  unit: string;
  darkMode?: boolean;
  yAxisLabels: string[];
  maxValue?: number;
}

interface MigraineDayData {
  date: string;
  hasMigraine: boolean;
  severity: number; // 0-4 scale (0: none, 1: mild, 2: moderate, 3: severe, 4: extreme)
  duration: number; // hours
  triggers: string[];
  note: string;
  symptoms: string[];
  medication: string[];
}

interface HealthMetricForDay {
  date: string;
  sleep: number;
  stress: number;
  hydration: number;
  screenTime: number;
  weather: string;
  note: string;
}

function generateMockMigraineDays(days: number = 30): MigraineDayData[] {
  const data: MigraineDayData[] = [];
  const today = new Date();
  
  const possibleTriggers = [
    'stress', 'lack of sleep', 'bright lights', 'loud noises', 'certain foods', 
    'weather changes', 'hormonal changes', 'skipped meals', 'dehydration', 'screen time'
  ];
  
  const possibleSymptoms = [
    'throbbing pain', 'nausea', 'light sensitivity', 'sound sensitivity', 
    'visual disturbances', 'dizziness', 'fatigue', 'concentration issues'
  ];
  
  const mockNotes = [
    'Woke up with mild headache, got worse during work meeting',
    'Stressful day at work, headache started around lunch',
    'Weather was changing, felt pressure building behind eyes',
    'Skipped breakfast, headache started mid-morning',
    'Long screen time session, eyes felt strained',
    'Good day, stayed hydrated and got enough sleep',
    'Exercise helped prevent headache today',
    'Meditation session in the morning felt helpful'
  ];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // 30% chance of having a migraine day
    const hasMigraine = Math.random() < 0.3;
    
    let severity = 0;
    let duration = 0;
    let triggers: string[] = [];
    let symptoms: string[] = [];
    let medication: string[] = [];
    
    if (hasMigraine) {
      severity = Math.floor(Math.random() * 4) + 1; // 1-4
      duration = Math.floor(Math.random() * 12) + 1; // 1-12 hours
      triggers = possibleTriggers.slice(0, Math.floor(Math.random() * 3) + 1);
      symptoms = possibleSymptoms.slice(0, Math.floor(Math.random() * 4) + 2);
      if (severity > 2) {
        medication = ['ibuprofen', 'prescription medication'][Math.floor(Math.random() * 2)] 
          ? [['ibuprofen', 'prescription medication'][Math.floor(Math.random() * 2)]] : [];
      }
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      hasMigraine,
      severity,
      duration,
      triggers,
      note: mockNotes[Math.floor(Math.random() * mockNotes.length)],
      symptoms,
      medication
    });
  }
  
  return data;
}

function generateMockHealthMetrics(days: number = 30): HealthMetricForDay[] {
  const data: HealthMetricForDay[] = [];
  const today = new Date();
  
  const weatherTypes = ['sunny', 'cloudy', 'rainy', 'stormy', 'clear'];
  const healthNotes = [
    'Felt energetic and well-rested',
    'Stressed from work deadlines',
    'Good exercise session today',
    'Ate healthy meals, stayed hydrated',
    'Poor sleep due to noise',
    'Relaxing weekend day'
  ];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      sleep: Math.random() * 10, // 0-10 scale
      stress: Math.random() * 10, // 0-10 scale
      hydration: Math.random() * 10, // 0-10 scale
      screenTime: Math.random() * 12 + 2, // 2-14 hours
      weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
      note: healthNotes[Math.floor(Math.random() * healthNotes.length)]
    });
  }
  
  return data;
}

function LineChart({ title, data, color, unit, darkMode, yAxisLabels, maxValue = 10 }: LineChartProps) {
  if (data.length === 0) return null;

  const chartPadding = 40;
  const chartInnerWidth = chartWidth - chartPadding * 2;
  const chartInnerHeight = chartHeight - 80;

  return (
    <View style={[styles.chartContainer, darkMode && styles.chartContainerDark]}>
      <Text style={[styles.chartTitle, darkMode && styles.chartTitleDark]}>{title}</Text>
      
      <View style={styles.chartArea}>
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          {yAxisLabels.map((label, index) => (
            <Text 
              key={index}
              style={[
                styles.yAxisLabel,
                { top: (index * chartInnerHeight) / (yAxisLabels.length - 1) },
                darkMode && styles.yAxisLabelDark
              ]}
            >
              {label}
            </Text>
          ))}
        </View>

        {/* Grid lines */}
        <View style={[styles.gridContainer, { left: chartPadding }]}>
          {yAxisLabels.map((_, index) => (
            <View 
              key={index}
              style={[
                styles.gridLine,
                { top: (index * chartInnerHeight) / (yAxisLabels.length - 1) },
                darkMode && styles.gridLineDark
              ]}
            />
          ))}
        </View>

        {/* Line chart */}
        <View style={[styles.lineContainer, { left: chartPadding, width: chartInnerWidth, height: chartInnerHeight }]}>
          {data.map((point, index) => {
            if (index === 0) return null;
            
            const prevPoint = data[index - 1];
            const x1 = ((index - 1) / (data.length - 1)) * chartInnerWidth;
            const y1 = chartInnerHeight - (prevPoint.value / maxValue) * chartInnerHeight;
            const x2 = (index / (data.length - 1)) * chartInnerWidth;
            const y2 = chartInnerHeight - (point.value / maxValue) * chartInnerHeight;
            
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            
            return (
              <View
                key={index}
                style={[
                  styles.lineSeg,
                  {
                    left: x1,
                    top: y1,
                    width: length,
                    height: 3,
                    backgroundColor: color,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: 'left center',
                  }
                ]}
              />
            );
          })}
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * chartInnerWidth;
            const y = chartInnerHeight - (point.value / maxValue) * chartInnerHeight;
            
            return (
              <View
                key={`point-${index}`}
                style={[
                  styles.dataPoint,
                  {
                    left: x - 4,
                    top: y - 4,
                    backgroundColor: point.severity ? 
                      (point.severity === 'none' ? '#10b981' : 
                       point.severity === 'mild' ? '#eab308' :
                       point.severity === 'moderate' ? '#f97316' :
                       point.severity === 'severe' ? '#ef4444' : '#dc2626') : color,
                    borderColor: darkMode ? '#1e293b' : '#fff',
                  }
                ]}
              />
            );
          })}
        </View>

        {/* X-axis */}
        <View style={styles.xAxisContainer}>
          <Text style={[styles.axisLabel, darkMode && styles.axisLabelDark]}>
            {data.length > 0 ? new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
          </Text>
          <Text style={[styles.axisLabel, darkMode && styles.axisLabelDark]}>Today</Text>
        </View>
      </View>
    </View>
  );
}

function AIInsightsPanel({ migraineDays, healthMetrics, darkMode }: { 
  migraineDays: MigraineDayData[], 
  healthMetrics: HealthMetricForDay[], 
  darkMode?: boolean 
}) {
  // AI Analysis based on patterns
  const migraineDaysCount = migraineDays.filter(d => d.hasMigraine).length;
  const migraineFreeStreak = migraineDays.reverse().findIndex(d => d.hasMigraine);
  const commonTriggers = migraineDays
    .filter(d => d.hasMigraine)
    .flatMap(d => d.triggers)
    .reduce((acc, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const topTriggers = Object.entries(commonTriggers)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([trigger]) => trigger);

  const averageSeverity = migraineDays
    .filter(d => d.hasMigraine)
    .reduce((sum, d) => sum + d.severity, 0) / migraineDaysCount || 0;

  // Correlation analysis
  const stressfulDays = healthMetrics.filter(d => d.stress > 7).length;
  const lowSleepDays = healthMetrics.filter(d => d.sleep < 6).length;
  const highScreenDays = healthMetrics.filter(d => d.screenTime > 10).length;

  const generateInsight = () => {
    let insights = [];
    
    if (migraineDaysCount === 0) {
      insights.push("🎉 Excellent! No migraines recorded in the past 30 days. Your current routine seems to be working well.");
    } else {
      insights.push(`📊 You experienced ${migraineDaysCount} migraine days out of 30 (${Math.round(migraineDaysCount/30*100)}% of days).`);
      
      if (migraineFreeStreak > 0) {
        insights.push(`✅ Current migraine-free streak: ${migraineFreeStreak} days.`);
      }
      
      if (averageSeverity < 2) {
        insights.push("💚 Most migraines were mild, which is encouraging.");
      } else if (averageSeverity > 3) {
        insights.push("🔴 Average migraine severity is high - consider discussing treatment options with your doctor.");
      }
    }

    if (topTriggers.length > 0) {
      insights.push(`⚠️ Most common triggers: ${topTriggers.join(', ')}.`);
    }

    // Pattern analysis
    if (stressfulDays > 10) {
      insights.push("😰 High stress levels detected frequently. Consider stress management techniques.");
    }
    
    if (lowSleepDays > 7) {
      insights.push("😴 Poor sleep patterns observed. Sleep quality may be affecting migraine frequency.");
    }
    
    if (highScreenDays > 15) {
      insights.push("📱 High screen time detected regularly. Consider taking breaks to reduce eye strain.");
    }

    return insights.join('\n\n');
  };

  return (
    <View style={[styles.aiPanel, darkMode && styles.aiPanelDark]}>
      <View style={styles.aiHeader}>
        <Ionicons name="sparkles" size={24} color={darkMode ? '#a855f7' : '#9333ea'} />
        <Text style={[styles.aiTitle, darkMode && styles.aiTitleDark]}>AI Insights</Text>
      </View>
      <Text style={[styles.aiText, darkMode && styles.aiTextDark]}>
        {generateInsight()}
      </Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, darkMode && styles.statNumberDark]}>{migraineDaysCount}</Text>
          <Text style={[styles.statLabel, darkMode && styles.statLabelDark]}>Migraine Days</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, darkMode && styles.statNumberDark]}>
            {averageSeverity.toFixed(1)}/4
          </Text>
          <Text style={[styles.statLabel, darkMode && styles.statLabelDark]}>Avg Severity</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, darkMode && styles.statNumberDark]}>
            {migraineFreeStreak >= 0 ? migraineFreeStreak : 0}
          </Text>
          <Text style={[styles.statLabel, darkMode && styles.statLabelDark]}>Days Migraine-Free</Text>
        </View>
      </View>
    </View>
  );
}

export default function MigraneTrackingScreen() {
  const { darkMode } = useTheme();
  const { userData } = useUser();

  // Generate mock data
  const migraineDays = generateMockMigraineDays(30);
  const healthMetrics = generateMockHealthMetrics(30);

  // Prepare data for charts
  const migraineFrequencyData = migraineDays.map(day => ({
    date: day.date,
    value: day.hasMigraine ? day.severity : 0,
    severity: day.hasMigraine ? 
      (day.severity === 1 ? 'mild' : 
       day.severity === 2 ? 'moderate' : 
       day.severity === 3 ? 'severe' : 'extreme') : 'none'
  }));

  const sleepQualityData = healthMetrics.map(day => ({
    date: day.date,
    value: day.sleep,
    note: day.note
  }));

  const stressLevelsData = healthMetrics.map(day => ({
    date: day.date,
    value: day.stress,
    note: day.note
  }));

  const shareReport = async () => {
    try {
      const today = new Date().toLocaleDateString();
      const migraineDaysCount = migraineDays.filter(d => d.hasMigraine).length;
      
      let report = `Migraine Tracking Report - ${today}\n`;
      report += `Generated by Migraine Tracker\n\n`;
      report += `User: ${userData?.name || 'Anonymous'}\n`;
      report += `30-Day Migraine Analysis\n\n`;
      
      report += `📊 Summary:\n`;
      report += `• Migraine Days: ${migraineDaysCount}/30\n`;
      report += `• Migraine Frequency: ${Math.round(migraineDaysCount/30*100)}%\n\n`;
      
      // Add recent migraine days
      const recentMigraines = migraineDays.filter(d => d.hasMigraine).slice(-5);
      if (recentMigraines.length > 0) {
        report += `Recent Migraine Episodes:\n`;
        recentMigraines.forEach(day => {
          report += `${new Date(day.date).toLocaleDateString()}: Severity ${day.severity}/4, ${day.duration}hrs\n`;
          if (day.triggers.length > 0) {
            report += `  Triggers: ${day.triggers.join(', ')}\n`;
          }
        });
      }
      
      report += `\nThis report includes detailed 30-day trend analysis with AI insights.`;

      await Share.share({
        message: report,
        title: 'Migraine Tracking Report',
      });
    } catch (error) {
      console.error('Failed to share report:', error);
    }
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <NavigationBar
        title="Migraine Tracking"
        subtitle="30-day patterns & AI insights"
        showBackButton={true}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
            Migraine Pattern Analysis
          </Text>
          <Text style={[styles.sectionDescription, darkMode && styles.sectionDescriptionDark]}>
            Track your migraine patterns with AI-powered insights and health correlations.
          </Text>
        </View>

        {/* AI Insights Panel */}
        <AIInsightsPanel 
          migraineDays={migraineDays} 
          healthMetrics={healthMetrics}
          darkMode={darkMode}
        />

        {/* Charts */}
        <View style={styles.chartsSection}>
          <LineChart
            title="Migraine Frequency & Severity"
            data={migraineFrequencyData}
            color="#9333ea"
            unit="severity"
            darkMode={darkMode}
            yAxisLabels={['None', 'Mild', 'Moderate', 'Severe', 'Extreme']}
            maxValue={4}
          />
          
          <LineChart
            title="Sleep Quality Correlation"
            data={sleepQualityData}
            color="#3b82f6"
            unit="quality"
            darkMode={darkMode}
            yAxisLabels={['Poor', 'Fair', 'Good', 'Great', 'Excellent']}
            maxValue={10}
          />
          
          <LineChart
            title="Stress Levels"
            data={stressLevelsData}
            color="#ef4444"
            unit="stress"
            darkMode={darkMode}
            yAxisLabels={['Low', 'Mild', 'Moderate', 'High', 'Extreme']}
            maxValue={10}
          />
        </View>

        {/* Share Button */}
        <Pressable
          onPress={shareReport}
          style={({ pressed }) => [
            styles.shareButton,
            darkMode && styles.shareButtonDark,
            pressed && styles.shareButtonPressed,
          ]}
        >
          <Ionicons name="share" size={24} color="#fff" style={styles.shareIcon} />
          <Text style={styles.shareButtonText}>Share Migraine Report</Text>
        </Pressable>

        {/* Instructions for doctors */}
        <View style={[styles.instructionsContainer, darkMode && styles.instructionsContainerDark]}>
          <Text style={[styles.instructionsTitle, darkMode && styles.instructionsTitleDark]}>
            For Healthcare Professionals
          </Text>
          <Text style={[styles.instructionsText, darkMode && styles.instructionsTextDark]}>
            • Line graphs show 30-day migraine patterns and correlations{'\n'}
            • Color-coded severity: Green (none) → Yellow (mild) → Orange (moderate) → Red (severe/extreme){'\n'}
            • AI analysis identifies triggers and patterns from diary entries{'\n'}
            • Sleep and stress correlations help identify lifestyle factors
          </Text>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionTitleDark: {
    color: '#f1f5f9',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  sectionDescriptionDark: {
    color: '#94a3b8',
  },
  aiPanel: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  aiPanelDark: {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  aiTitleDark: {
    color: '#f1f5f9',
  },
  aiText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 16,
  },
  aiTextDark: {
    color: '#d1d5db',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9333ea',
  },
  statNumberDark: {
    color: '#a855f7',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  statLabelDark: {
    color: '#94a3b8',
  },
  chartsSection: {
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  chartContainerDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  chartTitleDark: {
    color: '#f1f5f9',
  },
  chartArea: {
    position: 'relative',
    height: chartHeight,
  },
  yAxisContainer: {
    position: 'absolute',
    left: 0,
    top: 20,
    width: 35,
    height: chartHeight - 80,
  },
  yAxisLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
    width: 35,
    marginTop: -6,
  },
  yAxisLabelDark: {
    color: '#94a3b8',
  },
  gridContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    bottom: 40,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  gridLineDark: {
    backgroundColor: '#334155',
  },
  lineContainer: {
    position: 'absolute',
    top: 20,
  },
  lineSeg: {
    position: 'absolute',
    borderRadius: 1.5,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  xAxisContainer: {
    position: 'absolute',
    bottom: 10,
    left: 40,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  axisLabelDark: {
    color: '#94a3b8',
  },
  shareButton: {
    backgroundColor: '#9333ea',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButtonDark: {
    backgroundColor: '#a855f7',
    shadowColor: '#a855f7',
  },
  shareButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.8,
  },
  shareIcon: {
    marginRight: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  instructionsContainerDark: {
    backgroundColor: '#14532d',
    borderColor: '#166534',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 8,
  },
  instructionsTitleDark: {
    color: '#86efac',
  },
  instructionsText: {
    fontSize: 14,
    color: '#15803d',
    lineHeight: 20,
  },
  instructionsTextDark: {
    color: '#bbf7d0',
  },
});
