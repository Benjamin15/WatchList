/**
 * WatchList Mobile App
 * Application mobile collaborative de gestion de watchlist
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';

import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS } from './src/constants';
import ErrorBoundary from './src/components/ErrorBoundary';

function App(): React.JSX.Element {
  console.log('App: Starting WatchList Mobile App');
  
  try {
    console.log('App: Rendering components...');
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }} testID="app-container">
          <PaperProvider>
            <StatusBar
              barStyle="light-content"
              backgroundColor={COLORS.primary}
            />
            <AppNavigator />
          </PaperProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('App: Error rendering app:', error);
    throw error;
  }
}

export default App;
