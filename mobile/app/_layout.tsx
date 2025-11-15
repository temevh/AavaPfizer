import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
<<<<<<< HEAD
import { SafeAreaProvider } from 'react-native-safe-area-context';
=======
import { UserProvider } from '@/contexts/UserContext';
>>>>>>> ced609b (added context)

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
<<<<<<< HEAD
    <SafeAreaProvider>
      <CustomThemeProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
=======
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <UserProvider>
>>>>>>> ced609b (added context)
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
<<<<<<< HEAD
          <StatusBar style="auto" />
        </ThemeProvider>
      </CustomThemeProvider>
    </SafeAreaProvider>
=======
        <StatusBar style="auto" />
      </UserProvider >
    </ThemeProvider>
>>>>>>> ced609b (added context)
  );
}
