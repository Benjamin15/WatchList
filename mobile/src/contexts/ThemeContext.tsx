import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  primary: string;
  primaryVariant: string;
  secondary: string;
  secondaryVariant: string;
  background: string;
  surface: string;
  error: string;
  onPrimary: string;
  onSecondary: string;
  onBackground: string;
  onSurface: string;
  onError: string;
  placeholder: string;
  border: string;
}

export const lightTheme: Theme = {
  primary: '#6200EE',
  primaryVariant: '#3700B3',
  secondary: '#03DAC6',
  secondaryVariant: '#018786',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  error: '#B00020',
  onPrimary: '#FFFFFF',
  onSecondary: '#000000',
  onBackground: '#000000',
  onSurface: '#000000',
  onError: '#FFFFFF',
  placeholder: '#757575',
  border: '#E0E0E0',
};

export const darkTheme: Theme = {
  primary: '#6200EE',
  primaryVariant: '#3700B3',
  secondary: '#03DAC6',
  secondaryVariant: '#018786',
  background: '#121212',
  surface: '#1E1E1E',
  error: '#CF6679',
  onPrimary: '#FFFFFF',
  onSecondary: '#000000',
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  onError: '#000000',
  placeholder: '#666666',
  border: '#333333',
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );

  // Charger le thème depuis le stockage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.log('Erreur lors du chargement du thème:', error);
      }
    };

    loadTheme();
  }, []);

  // Écouter les changements du thème système
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });

    return () => subscription?.remove();
  }, []);

  // Sauvegarder le thème
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.log('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  // Déterminer le thème actuel
  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (themeMode === 'auto') {
      return systemTheme;
    }
    return themeMode;
  };

  const effectiveTheme = getEffectiveTheme();
  const theme = effectiveTheme === 'dark' ? darkTheme : lightTheme;
  const isDark = effectiveTheme === 'dark';

  const value: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
