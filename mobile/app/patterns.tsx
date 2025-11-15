import React from 'react';
import { PatternDetectionScreen } from '@/components/PatternDetectionScreen';
import { useRouter } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Patterns: undefined;
};

type PatternDetectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Patterns'>;

// Create a navigation adapter for expo-router
export default function Patterns() {
  const router = useRouter();

  // Create a navigation object that matches what PatternDetectionScreen expects
  const navigation: PatternDetectionScreenNavigationProp = {
    goBack: () => router.back(),
  } as PatternDetectionScreenNavigationProp;

  return <PatternDetectionScreen navigation={navigation} />;
}

