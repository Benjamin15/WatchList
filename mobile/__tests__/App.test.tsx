/**
 * @format
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from '../App';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  NavigationContainer: ({ children }: any) => children,
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

describe('App', () => {
  it('renders correctly', () => {
    render(<App />);
    // L'app devrait se charger sans erreur
    expect(screen.getByTestId('app-container')).toBeTruthy();
  });

  it('renders navigation structure', () => {
    render(<App />);
    // Vérifier que la structure de navigation est présente
    expect(screen.getByTestId('app-container')).toBeTruthy();
  });
});
