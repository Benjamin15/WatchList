import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { useTranslation } from 'react-i18next';

interface TabHeaderProps {
  currentTab: 'planned' | 'watching' | 'completed';
  onTabChange: (tab: 'planned' | 'watching' | 'completed') => void;
}

const TabHeader: React.FC<TabHeaderProps> = ({ currentTab, onTabChange }) => {
  const { t } = useTranslation();
  
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.placeholder,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
  },
});

export default TabHeader;
