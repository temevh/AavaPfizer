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
import { Ionicons } from '@expo/vector-icons';
import { NavigationBar } from './NavigationBar';
import { useTheme } from '@/contexts/ThemeContext';

interface DiaryEntriesScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width - 12, 448);

interface DiaryEntry {
  id: string;
  date: Date;
  content: string;
}

export function DiaryEntriesScreen({ navigation }: DiaryEntriesScreenProps) {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntryContent, setNewEntryContent] = useState('');
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { darkMode } = useTheme();
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
      if (editingEntry) {
        // Update existing entry
        setEntries(entries.map(entry => 
          entry.id === editingEntry.id 
            ? { ...entry, content: newEntryContent.trim() }
            : entry
        ));
        setEditingEntry(null);
      } else {
        // Add new entry
        const newEntry: DiaryEntry = {
          id: Date.now().toString(),
          date: new Date(),
          content: newEntryContent.trim(),
        };
        setEntries([newEntry, ...entries]);
      }
      setNewEntryContent('');
      setShowAddEntry(false);
    }
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setNewEntryContent(entry.content);
    setShowAddEntry(true);
  };

  const handleCancel = () => {
    setShowAddEntry(false);
    setEditingEntry(null);
    setNewEntryContent('');
  };

  const handleDeleteEntry = () => {
    if (editingEntry) {
      setEntries(entries.filter(entry => entry.id !== editingEntry.id));
      setShowDeleteConfirm(false);
      setShowAddEntry(false);
      setEditingEntry(null);
      setNewEntryContent('');
    }
  };

  if (showAddEntry) {
    return (
      <View style={[styles.container, darkMode && styles.containerDark]}>
        <NavigationBar
          title={editingEntry ? "Edit Diary Entry" : "New Diary Entry"}
          subtitle={editingEntry 
            ? editingEntry.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          }
          showBackButton={false}
        />
        <View style={styles.addHeader}>
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => [
              styles.cancelButton,
              darkMode && styles.cancelButtonDark,
              pressed && styles.cancelButtonPressed,
            ]}
          >
            <Ionicons name="close" size={20} color={darkMode ? '#e2e8f0' : '#1e293b'} />
            <Text style={[styles.backText, darkMode && styles.backTextDark]}>Cancel</Text>
          </Pressable>
        </View>

        <View style={[styles.content, { maxWidth }]}>
          <TextInput
            value={newEntryContent}
            onChangeText={setNewEntryContent}
            placeholder="How are you feeling today? Any observations or notes..."
            placeholderTextColor="#94a3b8"
            style={[styles.textArea, darkMode && styles.textAreaDark]}
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
              {editingEntry ? "Update Entry" : "Save Entry"}
            </Text>
          </Pressable>

          {editingEntry && (
            <Pressable
              onPress={() => setShowDeleteConfirm(true)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash" size={20} color="#dc2626" />
              <Text style={styles.deleteButtonText}>Delete Entry</Text>
            </Pressable>
          )}
        </View>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteConfirm(false)}
        >
          <View style={styles.confirmOverlay}>
            <View style={[styles.confirmDialog, darkMode && styles.confirmDialogDark]}>
              <Ionicons name="warning" size={48} color="#dc2626" style={styles.confirmIcon} />
              <Text style={[styles.confirmTitle, darkMode && styles.confirmTitleDark]}>Delete Entry?</Text>
              <Text style={[styles.confirmMessage, darkMode && styles.confirmMessageDark]}>
                This action cannot be undone. Are you sure you want to delete this diary entry?
              </Text>
              
              <View style={styles.confirmButtons}>
                <Pressable
                  onPress={() => setShowDeleteConfirm(false)}
                  style={[styles.confirmButton, styles.cancelConfirmButton]}
                >
                  <Text style={styles.cancelConfirmText}>Cancel</Text>
                </Pressable>
                
                <Pressable
                  onPress={handleDeleteEntry}
                  style={[styles.confirmButton, styles.deleteConfirmButton]}
                >
                  <Text style={styles.deleteConfirmText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <NavigationBar
        title="Diary"
        subtitle="Your personal journal"
        showBackButton={true}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.content, { maxWidth }]}>
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, darkMode && styles.emptyTextDark]}>No diary entries yet</Text>
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
                <Pressable
                  key={entry.id}
                  onPress={() => handleEditEntry(entry)}
                  style={({ pressed }) => [
                    styles.entryCard,
                    darkMode && styles.entryCardDark,
                    pressed && styles.entryCardPressed,
                  ]}
                >
                  <View style={styles.entryHeader}>
                    <Text style={[styles.entryDate, darkMode && styles.entryDateDark]}>{formatDate(entry.date)}</Text>
                    <Text style={[styles.entryTime, darkMode && styles.entryTimeDark]}>
                      {entry.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={[styles.entryContent, darkMode && styles.textDark]}>{entry.content}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Floating Add Button */}
      <Pressable
        onPress={() => setShowAddEntry(true)}
        style={styles.floatingButton}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>
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
  addHeader: {
    padding: 16,
    maxWidth: maxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignSelf: 'flex-start',
  },
  cancelButtonDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  cancelButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  backTextDark: {
    color: '#94a3b8',
  },
  textDark: {
    color: '#e2e8f0',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  textAreaDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    color: '#e2e8f0',
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
  deleteButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#dc2626',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dc2626',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmDialog: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  confirmDialogDark: {
    backgroundColor: '#1e293b',
  },
  confirmIcon: {
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmTitleDark: {
    color: '#e2e8f0',
  },
  confirmMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  confirmMessageDark: {
    color: '#94a3b8',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelConfirmButton: {
    backgroundColor: '#e2e8f0',
  },
  cancelConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  deleteConfirmButton: {
    backgroundColor: '#dc2626',
  },
  deleteConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  emptyTextDark: {
    color: '#64748b',
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
  entryCardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  entryCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
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
  entryDateDark: {
    color: '#60a5fa',
  },
  entryTime: {
    fontSize: 14,
    color: '#94a3b8',
  },
  entryTimeDark: {
    color: '#64748b',
  },
  entryContent: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
});
