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
import { RootStackParamList } from '../App';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';

type MigraineTrackingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Tracking'>;

interface MigraineTrackingScreenProps {
  navigation: MigraineTrackingScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width - 48, 448);

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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerContent, { maxWidth }]}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color="#475569" />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Log Migraine</Text>
            <Text style={styles.headerSubtitle}>Track your migraine episode</Text>
          </View>
        </View>

        <View style={[styles.content, { maxWidth }]}>
          {/* Pain Intensity */}
          <View style={styles.section}>
            <Text style={styles.label}>Pain Intensity</Text>
            <View style={styles.intensityContainer}>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={intensity}
                onValueChange={setIntensity}
                minimumTrackTintColor="#9333ea"
                maximumTrackTintColor="#e2e8f0"
                thumbTintColor="#9333ea"
              />
              <View style={styles.intensityLabels}>
                <Text style={styles.intensityLabel}>Mild</Text>
                <View style={styles.intensityDisplay}>
                  <Text style={styles.intensityValue}>{intensity}</Text>
                </View>
                <Text style={styles.intensityLabel}>Severe</Text>
              </View>
            </View>
          </View>

          {/* Symptoms */}
          <View style={styles.section}>
            <Text style={styles.label}>Symptoms</Text>
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
                    ]}
                  >
                    <Text
                      style={[
                        styles.symptomText,
                        isSelected && styles.symptomTextSelected,
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
          <View style={styles.section}>
            <Text style={styles.label}>Duration</Text>
            <Pressable
              onPress={() => setShowDurationModal(true)}
              style={styles.durationButton}
            >
              <Text style={[styles.durationText, !duration && styles.durationPlaceholder]}>
                {selectedDurationLabel}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </Pressable>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Any other details..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            <LinearGradient
              colors={['#9333ea', '#7e22ce']}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.submitText}>Save Migraine Log</Text>
            </LinearGradient>
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
  headerContent: {
    width: '100%',
    alignSelf: 'center',
    padding: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: '#475569',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 16,
  },
  intensityContainer: {
    gap: 16,
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
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  symptomButtonSelected: {
    borderColor: '#9333ea',
    backgroundColor: '#faf5ff',
  },
  symptomText: {
    fontSize: 14,
    color: '#475569',
  },
  symptomTextSelected: {
    color: '#7e22ce',
    fontWeight: '500',
  },
  durationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  durationText: {
    fontSize: 16,
    color: '#334155',
  },
  durationPlaceholder: {
    color: '#94a3b8',
  },
  notesInput: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#334155',
    minHeight: 100,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  submitGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
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
