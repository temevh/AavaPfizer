import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
  category: 'health' | 'device' | 'external';
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [ageBracket, setAgeBracket] = useState('');

  const submitData = () => {
    const userData = {
        name,
        ageBracket,
        integrations: integrations.filter(i => i.enabled).map(i => i.id),
    };
    console.log("submitted data:", userData);
    //Send data to backend
    onComplete();
  }
  
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'steps',
      name: 'Steps & Exercise',
      description: 'Track daily movement and physical activity',
      iconName: 'walk',
      enabled: true,
      category: 'health',
    },
    {
      id: 'sleep',
      name: 'Sleep Quality',
      description: 'Monitor sleep duration and quality',
      iconName: 'moon',
      enabled: true,
      category: 'health',
    },
    {
      id: 'heart-rate',
      name: 'Heart Rate',
      description: 'Track heart rate from wearable devices',
      iconName: 'heart',
      enabled: true,
      category: 'health',
    },
    {
      id: 'screen-time',
      name: 'Screen Time',
      description: 'Monitor daily device usage',
      iconName: 'time',
      enabled: true,
      category: 'device',
    },
    {
      id: 'screen-brightness',
      name: 'Screen Brightness',
      description: 'Track screen brightness levels',
      iconName: 'eye',
      enabled: true,
      category: 'device',
    },
    {
      id: 'typing',
      name: 'Typing Behavior',
      description: 'Analyze typing patterns and errors',
      iconName: 'create',
      enabled: false,
      category: 'device',
    },
    {
      id: 'outdoor-brightness',
      name: 'Outdoor Brightness',
      description: 'Detect ambient light exposure',
      iconName: 'sunny',
      enabled: true,
      category: 'device',
    },
    {
      id: 'calendar',
      name: 'Calendar Integration',
      description: 'Connect Google Calendar, Outlook, etc.',
      iconName: 'calendar',
      enabled: false,
      category: 'external',
    },
    {
      id: 'weather',
      name: 'Weather Data',
      description: 'Track weather and barometric pressure',
      iconName: 'cloud',
      enabled: true,
      category: 'external',
    },
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === id
          ? { ...integration, enabled: !integration.enabled }
          : integration
      )
    );
  };

  const ageBrackets = [
    '18-24',
    '25-34',
    '35-44',
    '45-54',
    '55-64',
    '65+',
  ];

  const canProceedStep1 = name.trim() && ageBracket;
  const canProceedStep2 = integrations.some(i => i.enabled);

  const { width } = Dimensions.get('window');
  const maxWidth = Math.min(width, 448);

  // Welcome Step
  if (step === 1) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.step1Container} scrollEnabled={false}>
        <View style={[styles.step1Content, { maxWidth }]}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="pulse" size={40} color="#fff" />
            </View>
            <Text style={styles.title}>Welcome to PreGraine</Text>
            <Text style={styles.subtitle}>
              Your personal companion for migraine prevention and management
            </Text>
          </View>

          {/* Personal Info Form */}
          <View style={styles.formSection}>
            <View style={styles.formCard}>
              <Text style={styles.label}>What should I call you?</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            <View style={styles.formCard}>
              <Text style={styles.label}>Age bracket</Text>
              <View style={styles.ageBracketGrid}>
                {ageBrackets.map((bracket) => (
                  <Pressable
                    key={bracket}
                    onPress={() => setAgeBracket(bracket)}
                    style={[
                      styles.ageBracketButton,
                      ageBracket === bracket && styles.ageBracketButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ageBracketText,
                        ageBracket === bracket && styles.ageBracketTextSelected,
                      ]}
                    >
                      {bracket}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressDots}>
              <View style={[styles.progressDot, styles.progressDotActive]} />
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
            </View>
            <Text style={styles.progressText}>Step 1 of 3</Text>
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={() => setStep(2)}
            disabled={!canProceedStep1}
            style={({ pressed }) => [
              styles.continueButton,
              !canProceedStep1 && styles.continueButtonDisabled,
              pressed && styles.continueButtonPressed,
            ]}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // Integrations Step
  if (step === 2) {
    const healthIntegrations = integrations.filter(i => i.category === 'health');
    const deviceIntegrations = integrations.filter(i => i.category === 'device');
    const externalIntegrations = integrations.filter(i => i.category === 'external');

    return (
      <View style={styles.container}>
        {/* Header */}
          <View style={[styles.step2HeaderContent, { maxWidth }]}>
            <Text style={styles.step2Title}>Connect Your Data</Text>
            <Text style={styles.step2Subtitle}>Select integrations to track migraine triggers</Text>
          </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.step2Content}>
          <View style={[styles.step2InnerContent, { maxWidth }]}>
            {/* Health Data */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Health Data</Text>
              <View style={styles.integrationList}>
                {healthIntegrations.map((integration) => (
                  <Pressable
                    key={integration.id}
                    onPress={() => toggleIntegration(integration.id)}
                    style={({ pressed }) => [
                      styles.integrationCard,
                      integration.enabled && styles.integrationCardEnabledHealth,
                      pressed && styles.integrationCardPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.integrationIconContainer,
                        integration.enabled
                          ? styles.integrationIconContainerEnabledHealth
                          : styles.integrationIconContainerDisabled,
                      ]}
                    >
                      <Ionicons
                        name={integration.iconName}
                        size={20}
                        color={integration.enabled ? '#10b981' : '#64748b'}
                      />
                    </View>
                    <View style={styles.integrationTextContainer}>
                      <Text style={styles.integrationName}>{integration.name}</Text>
                      <Text style={styles.integrationDescription}>{integration.description}</Text>
                    </View>
                    {integration.enabled && (
                      <View style={styles.checkmarkContainer}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Device Sensors */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Device Sensors</Text>
              <View style={styles.integrationList}>
                {deviceIntegrations.map((integration) => (
                  <Pressable
                    key={integration.id}
                    onPress={() => toggleIntegration(integration.id)}
                    style={({ pressed }) => [
                      styles.integrationCard,
                      integration.enabled && styles.integrationCardEnabledDevice,
                      pressed && styles.integrationCardPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.integrationIconContainer,
                        integration.enabled
                          ? styles.integrationIconContainerEnabledDevice
                          : styles.integrationIconContainerDisabled,
                      ]}
                    >
                      <Ionicons
                        name={integration.iconName}
                        size={20}
                        color={integration.enabled ? '#2563eb' : '#64748b'}
                      />
                    </View>
                    <View style={styles.integrationTextContainer}>
                      <Text style={styles.integrationName}>{integration.name}</Text>
                      <Text style={styles.integrationDescription}>{integration.description}</Text>
                    </View>
                    {integration.enabled && (
                      <View style={[styles.checkmarkContainer, styles.checkmarkContainerBlue]}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* External Sources */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>External Sources</Text>
              <View style={styles.integrationList}>
                {externalIntegrations.map((integration) => (
                  <Pressable
                    key={integration.id}
                    onPress={() => toggleIntegration(integration.id)}
                    style={({ pressed }) => [
                      styles.integrationCard,
                      integration.enabled && styles.integrationCardEnabledExternal,
                      pressed && styles.integrationCardPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.integrationIconContainer,
                        integration.enabled
                          ? styles.integrationIconContainerEnabledExternal
                          : styles.integrationIconContainerDisabled,
                      ]}
                    >
                      <Ionicons
                        name={integration.iconName}
                        size={20}
                        color={integration.enabled ? '#9333ea' : '#64748b'}
                      />
                    </View>
                    <View style={styles.integrationTextContainer}>
                      <Text style={styles.integrationName}>{integration.name}</Text>
                      <Text style={styles.integrationDescription}>{integration.description}</Text>
                    </View>
                    {integration.enabled && (
                      <View style={[styles.checkmarkContainer, styles.checkmarkContainerPurple]}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Info box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                You can change these settings anytime in the app. More integrations mean better pattern detection.
              </Text>
            </View>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressDots}>
                <View style={styles.progressDot} />
                <View style={[styles.progressDot, styles.progressDotActive]} />
                <View style={styles.progressDot} />
              </View>
              <Text style={styles.progressText}>Step 2 of 3</Text>
            </View>

            {/* Continue Button */}
            <Pressable
              onPress={() => setStep(3)}
              disabled={!canProceedStep2}
              style={({ pressed }) => [
                styles.continueButton,
                !canProceedStep2 && styles.continueButtonDisabled,
                pressed && styles.continueButtonPressed,
              ]}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Completion Step
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.step3Container}>
      <View style={[styles.step3Content, { maxWidth }]}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>

        {/* Message */}
        <Text style={styles.step3Title}>You're All Set, {name}!</Text>
        <Text style={styles.step3Subtitle}>
          PreGraine is now configured and ready to help you track and prevent migraines.
        </Text>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Age</Text>
              <Text style={styles.summaryValue}>{ageBracket}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Data sources</Text>
              <Text style={styles.summaryValue}>
                {integrations.filter(i => i.enabled).length} active
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text style={[styles.summaryValue, styles.summaryValueReady]}>Ready</Text>
            </View>
          </View>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDots}>
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.progressDotActive, styles.progressDotActiveEmerald]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 3</Text>
        </View>

        {/* Get Started Button */}
        <Pressable
          onPress={submitData}
          style={({ pressed }) => [
            styles.getStartedButton,
            pressed && styles.getStartedButtonPressed,
          ]}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // Step 1 styles
  step1Container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  step1Content: {
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#9333ea',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    gap: 16,

  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  label: {
    fontSize: 22,
    color: '#334155',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 16,
    color: '#334155',
  },
  ageBracketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,

  },
  ageBracketButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    alignItems: 'center',

  },
  ageBracketButtonSelected: {
    borderColor: '#9333ea',
    backgroundColor: '#faf5ff',
  },
  ageBracketText: {
    fontSize: 20,
    color: '#64748b',
    textAlign: 'center',
    
  },
  ageBracketTextSelected: {
    color: '#7e22ce',
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  progressDotActive: {
    backgroundColor: '#9333ea',
  },
  progressDotActiveEmerald: {
    backgroundColor: '#9333ea',
  },
  progressText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 8,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#7e22ce',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#7e22ce',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonPressed: {
    opacity: 0.8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Step 2 styles
  step2HeaderContent: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  step2Title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  step2Subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
  },
  step2Content: {
    paddingBottom: 24,
  },
  step2InnerContent: {
    width: '100%',
    alignSelf: 'center',
    padding: 24,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  integrationList: {
    gap: 8,
  },
  integrationCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  integrationCardEnabledHealth: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  integrationCardEnabledDevice: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  integrationCardEnabledExternal: {
    borderColor: '#9333ea',
    backgroundColor: '#faf5ff',
  },
  integrationCardPressed: {
    opacity: 0.8,
  },
  integrationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  integrationIconContainerEnabledHealth: {
    backgroundColor: '#d1fae5',
  },
  integrationIconContainerEnabledDevice: {
    backgroundColor: '#dbeafe',
  },
  integrationIconContainerEnabledExternal: {
    backgroundColor: '#e9d5ff',
  },
  integrationIconContainerDisabled: {
    backgroundColor: '#f1f5f9',
  },
  integrationTextContainer: {
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4,
  },
  integrationDescription: {
    fontSize: 14,
    color: '#94a3b8',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainerBlue: {
    backgroundColor: '#2563eb',
  },
  checkmarkContainerPurple: {
    backgroundColor: '#9333ea',
  },
  infoBox: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#6b21a8',
    lineHeight: 20,
  },
  // Step 3 styles
  step3Container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#faf5ff',
  },
  step3Content: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  successIconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#9333ea',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  step3Title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  step3Subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  summaryValueReady: {
    color: '#9333ea',
  },
  getStartedButton: {
    width: '100%',
    backgroundColor: '#7e22ce',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7e22ce',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedButtonPressed: {
    opacity: 0.8,
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
