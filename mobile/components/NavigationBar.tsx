import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NavigationBarProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
}

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width, 448);

export function NavigationBar({ 
  title, 
  subtitle, 
  showBackButton = true,
}: NavigationBarProps) {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, darkMode && styles.headerDark, { paddingTop: insets.top }]}>
      <View style={[styles.headerContent, { maxWidth }]}>
        <View style={styles.headerTop}>
          {showBackButton ? (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                darkMode && styles.backButtonDark,
                pressed && styles.backButtonPressed,
              ]}
            >
              <Ionicons name="arrow-back" size={20} color={darkMode ? '#e2e8f0' : '#1e293b'} />
              <Text style={[styles.backText, darkMode && styles.textDark]}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.placeholder} />
          )}
          
          <Pressable
            onPress={toggleDarkMode}
            style={({ pressed }) => [
              styles.darkModeButton,
              darkMode && styles.darkModeButtonDark,
              pressed && styles.darkModeButtonPressed,
            ]}
          >
            <Ionicons 
              name={darkMode ? 'sunny' : 'moon'} 
              size={20} 
              color={darkMode ? '#fbbf24' : '#475569'} 
            />
            <Text style={[styles.darkModeText, darkMode && styles.textDark]}>
              {darkMode ? 'Light' : 'Dark'}
            </Text>
          </Pressable>
        </View>
        
        {title && (
          <>
            <Text style={[styles.headerTitle, darkMode && styles.textDark]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.headerSubtitle, darkMode && styles.headerSubtitleDark]}>{subtitle}</Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  headerDark: {
    backgroundColor: '#0f172a',
    borderBottomColor: '#0f172a',
  },
  headerContent: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  placeholder: {
    width: 70,
    height: 36,
  },
  backButton: {
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
  },
  backButtonDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  darkModeButton: {
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
  },
  darkModeButtonDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  darkModeButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  darkModeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  headerSubtitleDark: {
    color: '#94a3b8',
  },
  textDark: {
    color: '#e2e8f0',
  },
});
