import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

interface FilterButtonProps {
  onPress: () => void;
  activeFiltersCount: number;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onPress, activeFiltersCount }) => {
  return (
    <TouchableOpacity style={styles.filterFab} onPress={onPress}>
      <Text style={styles.filterFabIcon}>🔽</Text>
      {activeFiltersCount > 0 && (
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  filterFab: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    width: 56,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 999,
  },
  filterFabIcon: {
    fontSize: 24,
    color: COLORS.onPrimary,
  },
  filterBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.onError,
  },
});

export default FilterButton;
