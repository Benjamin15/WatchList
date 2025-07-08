import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import './src/i18n'; // Initialiser i18n

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AppNavigator />
          <StatusBar style="auto" />
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
