import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import { MediaType, StatusType } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

interface FilterTabsProps {
  typeFilter: MediaType;
  statusFilter: StatusType;
  onTypeFilterChange: (type: MediaType) => void;
  onStatusFilterChange: (status: StatusType) => void;
  showStatusFilter?: boolean;
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  typeFilter,
  statusFilter,
  onTypeFilterChange,
  onStatusFilterChange,
  showStatusFilter = true,
}) => {
  const typeFilters = [
    { key: 'all', label: 'Tous' },
    { key: 'movie', label: 'Films' },
    { key: 'series', label: 'Séries' },
    { key: 'manga', label: 'Mangas' },
  ];

  const statusFilters = [
    { key: 'all', label: 'Tous' },
    { key: 'watching', label: 'En cours' },
    { key: 'completed', label: 'Terminés' },
    { key: 'planned', label: 'Prévus' },
    { key: 'dropped', label: 'Abandonnés' },
  ];

  const renderFilterTab = (
    item: { key: string; label: string },
    isActive: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        isActive && styles.activeFilterTab,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterTabText,
          isActive && styles.activeFilterTabText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Type :</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={typeFilters}
          renderItem={({ item }) =>
            renderFilterTab(
              item,
              typeFilter === item.key,
              () => onTypeFilterChange(item.key as MediaType)
            )
          }
          keyExtractor={(item) => item.key}
        />
      </View>

      {showStatusFilter && (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Statut :</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={statusFilters}
            renderItem={({ item }) =>
              renderFilterTab(
                item,
                statusFilter === item.key,
                () => onStatusFilterChange(item.key as StatusType)
              )
            }
            keyExtractor={(item) => item.key}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSection: {
    marginBottom: SPACING.sm,
  },
  filterLabel: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginHorizontal: SPACING.xs,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    color: COLORS.onBackground,
    fontSize: FONT_SIZES.sm,
  },
  activeFilterTabText: {
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
});

export default FilterTabs;
