import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Tracking: undefined;
  Main: undefined;
};

type MigraineTrackingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Tracking'>;

interface MigraineTrackingScreenProps {
  navigation: MigraineTrackingScreenNavigationProp;
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
  { label: 'Still ongoing', value: 'ongoing' },
];

export function MigraineTrackingScreen({ navigation }: MigraineTrackingScreenProps) {
  const [intensity, setIntensity] = useState(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, darkMode && styles.headerDark]}>
          <View style={[styles.headerContent, { maxWidth }]}>
            <View style={styles.headerTop}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={darkMode ? '#94a3b8' : '#475569'} />
                <Text style={[styles.backText, darkMode && styles.textDark]}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => setDarkMode(!darkMode)}
                style={styles.darkModeButton}
              >
                <Ionicons 
                  name={darkMode ? 'sunny' : 'moon'} 
                  size={24} 
                  color={darkMode ? '#fbbf24' : '#475569'} 
                />
                <Text style={[styles.darkModeText, darkMode && styles.textDark]}>
                  {darkMode ? 'Light' : 'Dark'}
                </Text>
              </Pressable>
            </View>
            <Text style={[styles.headerTitle, darkMode && styles.textDark]}>Log Migraine</Text>
            <Text style={[styles.headerSubtitle, darkMode && styles.textDark]}>Quick and simple</Text>
          </View> 
        </View>

        
        <View style={[styles.content, { maxWidth }]}>
          {/* Quick Intensity */}
          <View style={[styles.section, darkMode && styles.sectionDark]}>
            <Text style={[styles.label, darkMode && styles.textDark]}>Pain Level</Text>
            <View style={styles.intensityQuick}>
              {[1, 2, 3, 4, 5].map((level) => (
                <Pressable
                  key={level}
                  onPress={() => setIntensity(level)}
                  style={[
                    styles.intensityButton,
                    intensity === level && styles.intensityButtonSelected,
                    darkMode && styles.intensityButtonDark,
                    intensity === level && darkMode && styles.intensityButtonSelectedDark,
                  ]}
                >
                  <Text
                    style={[
                      styles.intensityButtonText,
                      intensity === level && styles.intensityButtonTextSelected,
                      darkMode && styles.textDark,
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
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
              <Ionicons 
                name={showNotes ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color={darkMode ? '#94a3b8' : '#64748b'} 
              />
            </Pressable>
            {showNotes && (
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
            )}
          </View>

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
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingTop: 8,
  },
  headerDark: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },
  headerContent: {
    width: '100%',
    alignSelf: 'center',
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
    minWidth: 70,
    minHeight: 40,
  },
  backText: {
    fontSize: 16,
    color: '#475569',
  },
  darkModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
    minHeight: 40,
  },
  darkModeText: {
    fontSize: 16,
    color: '#475569',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
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
  intensityQuick: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  intensityButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityButtonDark: {
    backgroundColor: '#0f172a',
    borderColor: '#475569',
  },
  intensityButtonSelected: {
    backgroundColor: '#9333ea',
    borderColor: '#9333ea',
  },
  intensityButtonSelectedDark: {
    backgroundColor: '#7e22ce',
    borderColor: '#7e22ce',
  },
  intensityButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
  },
  intensityButtonTextSelected: {
    color: '#fff',
  },
  intensityContainer: {
    gap: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  intensityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intensityLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  intensityDisplay: {
    width: 64,
    height: 64,
    backgroundColor: '#f3e8ff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityValue: {
    fontSize: 24,
    fontWeight: '500',
    color: '#9333ea',
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
  },
  symptomButtonSelectedDark: {
    borderColor: '#7e22ce',
    backgroundColor: '#7e22ce',
  },
  symptomText: {
    fontSize: 20,
    fontWeight: '400',
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
