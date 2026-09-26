import React from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';

LogBox.ignoreLogs([
  'expo-notifications functionality is not fully supported in Expo Go',
  'Push notifications (remote notifications) functionality',
  'Cannot connect to Expo CLI',
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
