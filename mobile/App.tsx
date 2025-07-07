import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';
import './src/i18n'; // Initialiser i18n

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppNavigator />
        <StatusBar style="light" />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
