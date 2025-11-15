import { EmergencyTipsScreen } from '@/components/EmergencyTipsScreen';
import { useRouter } from 'expo-router';
import React from 'react';

// Create a navigation adapter for expo-router
export default function Emergency() {
  const router = useRouter();

  // Create a navigation object that matches what EmergencyTipsScreen expects
  const navigation = {
    goBack: () => router.back(),
    navigate: (route: string) => {
      if (route === 'Main') {
        router.push('/(tabs)');
      }
    },
  };

  return <EmergencyTipsScreen navigation={navigation} />;
}

