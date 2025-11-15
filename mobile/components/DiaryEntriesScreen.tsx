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
  Diary: undefined;
};

type DiaryEntriesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Diary'>;

interface DiaryEntriesScreenProps {
  navigation: DiaryEntriesScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width, 448);

interface DiaryEntry {
  id: string;
  date: Date;
  content: string;
}

export function DiaryEntriesScreen({ navigation }: DiaryEntriesScreenProps) {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntryContent, setNewEntryContent] = useState('');
  const [entries, setEntries] = useState<DiaryEntry[]>([
    {
      id: '3',
      date: new Date('2025-11-14'),
      content: 'Had a good day today. Remembered to drink water throughout the day and took breaks from screen time. Felt more energized.',
    },
    {
      id: '2',
      date: new Date('2025-11-12'),
      content: 'Woke up with a mild headache. Think it might be related to the late-night work session yesterday. Need to be more careful with sleep schedule.',
    },
    {
      id: '1',
      date: new Date('2025-11-09'),
      content: 'Started using this app. Excited to track patterns and hopefully reduce migraine frequency.',
    },
  ]);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const handleAddEntry = () => {
    if (newEntryContent.trim()) {
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        date: new Date(),
        content: newEntryContent.trim(),
      };
      setEntries([newEntry, ...entries]);
      setNewEntryContent('');
      setShowAddEntry(false);
    }
  };

  if (showAddEntry) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.headerContent, { maxWidth }]}>
            <Pressable
              onPress={() => setShowAddEntry(false)}
              style={styles.backButton}
            >
              <Ionicons name="close" size={20} color="#475569" />
              <Text style={styles.backText}>Cancel</Text>
            </Pressable>
            <Text style={styles.headerTitle}>New Diary Entry</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </View>

        <View style={[styles.content, { maxWidth }]}>
          <TextInput
            value={newEntryContent}
            onChangeText={setNewEntryContent}
            placeholder="How are you feeling today? Any observations or notes..."
            placeholderTextColor="#94a3b8"
            style={styles.textArea}
            multiline
            numberOfLines={12}
            textAlignVertical="top"
            autoFocus
          />

          <Pressable
            onPress={handleAddEntry}
            disabled={!newEntryContent.trim()}
            style={[
              styles.saveButton,
              !newEntryContent.trim() && styles.saveButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.saveButtonText,
                !newEntryContent.trim() && styles.saveButtonTextDisabled,
              ]}
            >
              Save Entry
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.headerContent, { maxWidth }]}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color="#475569" />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Diary</Text>
            <Text style={styles.headerSubtitle}>Your personal journal</Text>
          </View>
        </View>

        <View style={[styles.content, { maxWidth }]}>
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No diary entries yet</Text>
              <Pressable
                onPress={() => setShowAddEntry(true)}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>Add your first entry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.entriesList}>
              {entries.map((entry) => (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                    <Text style={styles.entryTime}>
                      {entry.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.entryContent}>{entry.content}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <View style={styles.fabContainer}>
        <Pressable
          onPress={() => setShowAddEntry(true)}
          style={styles.fab}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </Pressable>
      </View>
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
  },
  textArea: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#334155',
    minHeight: 300,
    marginBottom: 16,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  saveButtonTextDisabled: {
    color: '#94a3b8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 16,
  },
  emptyButton: {
    paddingVertical: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
  },
  entriesList: {
    gap: 16,
  },
  entryCard: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2563eb',
  },
  entryTime: {
    fontSize: 14,
    color: '#94a3b8',
  },
  entryContent: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 3,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
