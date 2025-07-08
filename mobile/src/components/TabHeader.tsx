import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

interface TabHeaderProps {
  currentTab: 'planned' | 'watching' | 'completed';
  onTabChange: (tab: 'planned' | 'watching' | 'completed') => void;
}

const TabHeader: React.FC<TabHeaderProps> = ({ currentTab, onTabChange }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const tabs = [
    { key: 'planned', label: t('status.planned') },
    { key: 'watching', label: t('status.watching') },
    { key: 'completed', label: t('status.completed') },
  ] as const;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            currentTab === tab.key && styles.activeTab,
          ]}
          onPress={() => onTabChange(tab.key)}
        >
          <Text
            style={[
              styles.tabText,
              currentTab === tab.key && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    color: theme.placeholder,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.primary,
  },
});

export default TabHeader;
