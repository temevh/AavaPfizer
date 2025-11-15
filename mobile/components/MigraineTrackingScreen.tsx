import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationBar } from './NavigationBar';
import { useTheme } from '@/contexts/ThemeContext';

interface MigraineTrackingScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (route: string) => void;
  };
}

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width, 448);

const durationOptions = [
  { label: 'Select duration', value: '' },
  { label: 'Less than 1 hour', value: '< 1 hour' },
  { label: '1-2 hours', value: '1-2 hours' },
  { label: '2-4 hours', value: '2-4 hours' },
  { label: '4-8 hours', value: '4-8 hours' },
  { label: '8-24 hours', value: '8-24 hours' },
  { label: 'More than 24 hours', value: '> 24 hours' },
];

export function MigraineTrackingScreen({ navigation }: MigraineTrackingScreenProps) {
  const [intensity, setIntensity] = useState(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [enableAIAnalysis, setEnableAIAnalysis] = useState(false);
  const { darkMode } = useTheme();
  
  const sliderRef = useRef<View>(null);
  const sliderLayout = useRef({ x: 0, width: 0 });
  const panX = useRef(new Animated.Value(0)).current;
  
  const updateIntensityFromPosition = useCallback((position: number) => {
    if (sliderLayout.current.width === 0) return;
    
    const percentage = Math.max(0, Math.min(1, position / sliderLayout.current.width));
    const value = Math.round(percentage * 4 + 1);
    setIntensity(Math.max(1, Math.min(5, value)));
  }, []);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const position = gestureState.x0 - sliderLayout.current.x;
        updateIntensityFromPosition(position);
      },
      onPanResponderMove: (evt, gestureState) => {
        const position = gestureState.moveX - sliderLayout.current.x;
        updateIntensityFromPosition(position);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const position = gestureState.moveX - sliderLayout.current.x;
        updateIntensityFromPosition(position);
      },
    })
  ).current;

  const symptoms = [
    'Aura',
    'Nausea',
    'Vomiting',
    'Light sensitivity',
    'Sound sensitivity',
    'Dizziness',
    'Visual disturbances',
    'Neck pain',
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    setShowSuccess(true);
    
    if (enableAIAnalysis) {
      const data = {
        intensity: intensity,
        symptoms: selectedSymptoms,
        duration: duration,
        notes: notes,
      }
      console.log('Migraine Log Submitted:', data);
      // Send data to backend/CNN for analysis
    }
    
    setTimeout(() => {
      navigation.navigate('Main');
    }, 1500);
  };

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successContent}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={40} color="#10b981" />
          </View>
          <Text style={styles.successTitle}>Migraine Logged</Text>
          <Text style={styles.successSubtitle}>Data saved successfully</Text>
        </View>
      </View>
    );
  }

  const selectedDurationLabel = durationOptions.find(opt => opt.value === duration)?.label || 'Select duration';

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <NavigationBar
        title="Log Migraine"
        subtitle="Logging your migraines helps our AI detect patterns and provide better insights"
        showBackButton={true}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.content, { maxWidth }]}>
          {/* Quick Intensity */}
          <View style={[styles.section, darkMode && styles.sectionDark]}>
            <View style={styles.sliderHeader}>
              <Text style={[styles.label, darkMode && styles.textDark]}>Pain Level</Text>
              <Text style={[styles.intensityValue, darkMode && styles.textDark]}>{intensity}</Text>
            </View>
            <View
              ref={sliderRef}
              style={styles.customSliderContainer}
              onLayout={(e) => {
                sliderLayout.current.width = e.nativeEvent.layout.width;
                sliderRef.current?.measureInWindow((x, y, width, height) => {
                  sliderLayout.current.x = x;
                });
              }}
              {...panResponder.panHandlers}
            >
              <View style={[styles.sliderTrackLine, darkMode && styles.sliderTrackLineDark]}>
                <View style={[
                  styles.sliderFillLine,
                  darkMode && styles.sliderFillLineDark,
                  { width: `${((intensity - 1) / 4) * 100}%` }
                ]} />
              </View>
              <View style={styles.sliderDots}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.sliderDot,
                      intensity >= level && styles.sliderDotActive,
                      darkMode && styles.sliderDotDark,
                      intensity >= level && darkMode && styles.sliderDotActiveDark,
                    ]}
                  />
                ))}
              </View>
              <View
                style={[
                  styles.sliderThumb,
                  darkMode && styles.sliderThumbDark,
                  { left: `${((intensity - 1) / 4) * 100}%` }
                ]}
              />
            </View>
            <View style={styles.sliderLabels}>
              {[1, 2, 3, 4, 5].map((level) => (
                <Text key={level} style={[styles.sliderLabelText, darkMode && styles.textDark]}>
                  {level}
                </Text>
              ))}
            </View>
          </View>

          {/* Symptoms */}
          <View style={[styles.section, darkMode && styles.sectionDark]}>
            <Text style={[styles.label, darkMode && styles.textDark]}>Symptoms (optional)</Text>
            <View style={styles.symptomsGrid}>
              {symptoms.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <Pressable
                    key={symptom}
                    onPress={() => toggleSymptom(symptom)}
                    style={[
                      styles.symptomButton,
                      isSelected && styles.symptomButtonSelected,
                      darkMode && styles.symptomButtonDark,
                      isSelected && darkMode && styles.symptomButtonSelectedDark,
                    ]}
                  >
                    <Text
                      style={[
                        styles.symptomText,
                        isSelected && styles.symptomTextSelected,
                        darkMode && styles.textDark,
                      ]}
                    >
                      {symptom}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Duration */}
          <View style={[styles.section, darkMode && styles.sectionDark]}>
            <Text style={[styles.label, darkMode && styles.textDark]}>Duration (optional)</Text>
            <Pressable
              onPress={() => setShowDurationModal(true)}
              style={[styles.durationButton, darkMode && styles.durationButtonDark]}
            >
              <Text style={[styles.durationText, !duration && styles.durationPlaceholder, darkMode && styles.textDark]}>
                {selectedDurationLabel}
              </Text>
              <Ionicons name="chevron-down" size={24} color={darkMode ? '#94a3b8' : '#64748b'} />
            </Pressable>
          </View>

          {/* Notes */}
          <View style={[styles.section, darkMode && styles.sectionDark]}>
            <Pressable
              onPress={() => setShowNotes(!showNotes)}
              style={styles.notesHeader}
            >
              <Text style={[styles.label, darkMode && styles.textDark]}>Notes (optional)</Text>

            </Pressable>
              <TextInput
                style={[styles.notesInput, darkMode && styles.notesInputDark]}
                placeholder="Any other details..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
              />
          </View>

          {/* AI Analysis Checkbox */}
          <Pressable
            onPress={() => setEnableAIAnalysis(!enableAIAnalysis)}
            style={[
              styles.checkboxContainer,
              darkMode && styles.sectionDark,
            ]}
          >
            <View style={[
              styles.checkbox,
              enableAIAnalysis && styles.checkboxChecked,
              darkMode && styles.checkboxDark,
              enableAIAnalysis && darkMode && styles.checkboxCheckedDark,
            ]}>
              {enableAIAnalysis && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </View>
            <Text style={[styles.checkboxLabel, darkMode && styles.textDark]}>
              Enable AI pattern analysis
            </Text>
          </Pressable>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
            ]}
          >
            <View style={styles.submitButtonContent}>
              <Ionicons name="checkmark-circle" size={28} color="#fff" />
              <Text style={styles.submitText}>Save Log</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Duration Modal */}
      <Modal
        visible={showDurationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDurationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Duration</Text>
              <Pressable onPress={() => setShowDurationModal(false)}>
                <Ionicons name="close" size={24} color="#475569" />
              </Pressable>
            </View>
            <ScrollView>
              {durationOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    setDuration(option.value);
                    setShowDurationModal(false);
                  }}
                  style={[
                    styles.modalOption,
                    duration === option.value && styles.modalOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      duration === option.value && styles.modalOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {duration === option.value && (
                    <Ionicons name="checkmark" size={20} color="#9333ea" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
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
    gap: 24,
  },
  section: {
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
  sectionDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  label: {
    fontSize: 24,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 16,
  },
  textDark: {
    color: '#e2e8f0',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  intensityValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#9333ea',
  },
  customSliderContainer: {
    height: 44,
    justifyContent: 'center',
    marginVertical: 8,
  },
  sliderTrackLine: {
    position: 'absolute',
    width: '100%',
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
  },
  sliderTrackLineDark: {
    backgroundColor: '#475569',
  },
  sliderFillLine: {
    height: '100%',
    backgroundColor: '#9333ea',
    borderRadius: 3,
  },
  sliderFillLineDark: {
    backgroundColor: '#7e22ce',
  },
  sliderDots: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  sliderDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    borderWidth: 2,
    borderColor: '#fff',
  },
  sliderDotDark: {
    backgroundColor: '#334155',
    borderColor: '#1e293b',
  },
  sliderDotActive: {
    backgroundColor: '#9333ea',
    borderColor: '#9333ea',
  },
  sliderDotActiveDark: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9333ea',
    marginLeft: -12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderThumbDark: {
    backgroundColor: '#a855f7',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginTop: 8,
  },
  sliderLabelText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#64748b',
    width: 18,
    textAlign: 'center',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomButton: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9bb9e0ff',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomButtonDark: {
    backgroundColor: '#0f172a',
    borderColor: '#475569',
  },
  symptomButtonSelected: {
    borderColor: '#9333ea',
    backgroundColor: '#faf5ff',
    fontWeight: '700',
  },
  symptomButtonSelectedDark: {
    borderColor: '#7e22ce',
    backgroundColor: '#7e22ce',
  },
  symptomText: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '500',
    color: '#000000ff',
  },
  symptomTextSelected: {
    color: '#7e22ce',
    fontWeight: '500',
  },
  durationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  durationButtonDark: {
    backgroundColor: '#0f172a',
    borderColor: '#475569',
  },
  durationText: {
    fontSize: 18,
    color: '#334155',
  },
  durationPlaceholder: {
    color: '#94a3b8',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    fontSize: 18,
    color: '#334155',
    minHeight: 120,
  },
  notesInputDark: {
    backgroundColor: '#0f172a',
    borderColor: '#475569',
    color: '#e2e8f0',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDark: {
    backgroundColor: '#0f172a',
    borderColor: '#475569',
  },
  checkboxChecked: {
    backgroundColor: '#7e22ce',
    borderColor: '#7e22ce',
  },
  checkboxCheckedDark: {
    backgroundColor: '#9333ea',
    borderColor: '#9333ea',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#7e22ce',
    shadowColor: '#7e22ce',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    minHeight: 64,
  },
  submitGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successContent: {
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#d1fae5',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#64748b',
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
    maxHeight: '80%',
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
    fontSize: 20,
    fontWeight: '500',
    color: '#1e293b',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionSelected: {
    backgroundColor: '#faf5ff',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#334155',
  },
  modalOptionTextSelected: {
    color: '#9333ea',
    fontWeight: '500',
  },
});
