import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FilterOptions } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

interface FilterHeaderBarProps {
  options: FilterOptions;
  onUpdate: (options: FilterOptions) => void;
  resultsCount: number;
}

const FilterHeaderBar: React.FC<FilterHeaderBarProps> = ({
  options,
  onUpdate,
  resultsCount,
}) => {
  const [expanded, setExpanded] = useState(false);

  const typeOptions = [
    { id: 'all', name: 'Tous', emoji: '🎯' },
    { id: 'movie', name: 'Films', emoji: '🎬' },
    { id: 'series', name: 'Séries', emoji: '📺' },
  ];

  const sortOptions = [
    { id: 'date_added', name: 'Récent', emoji: '📅' },
    { id: 'title', name: 'Titre', emoji: '🔤' },
    { id: 'year', name: 'Année', emoji: '📆' },
    { id: 'rating', name: 'Note', emoji: '⭐' },
    { id: 'duration', name: 'Durée', emoji: '⏱️' },
    { id: 'popularity', name: 'Populaire', emoji: '🔥' },
  ];

  const updateType = (type: FilterOptions['type']) => {
    onUpdate({ ...options, type });
  };

  const updateSort = (sortBy: FilterOptions['sortBy']) => {
    onUpdate({
      ...options,
      sortBy,
      sortDirection: options.sortBy === sortBy && options.sortDirection === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortIcon = () => {
    return options.sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <View style={styles.container}>
      {/* Barre principale toujours visible */}
      <View style={styles.mainBar}>
        <View style={styles.leftSection}>
          <Text style={styles.resultsText}>{resultsCount} films</Text>
        </View>

        <View style={styles.centerSection}>
          {/* Filtres rapides type */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickFilters}
            contentContainerStyle={styles.quickFiltersContent}
          >
            {typeOptions.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.quickFilter,
                  options.type === type.id && styles.quickFilterActive,
                ]}
                onPress={() => updateType(type.id as FilterOptions['type'])}
              >
                <Text style={styles.quickFilterEmoji}>{type.emoji}</Text>
                <Text style={[
                  styles.quickFilterText,
                  options.type === type.id && styles.quickFilterTextActive,
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity 
          style={styles.expandButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.expandIcon}>{expanded ? '▼' : '▲'}</Text>
        </TouchableOpacity>
      </View>

      {/* Section étendue pour tri et genres */}
      {expanded && (
        <View style={styles.expandedSection}>
          <Text style={styles.sectionTitle}>🔀 Tri</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.sortSection}
          >
            {sortOptions.map((sort) => (
              <TouchableOpacity
                key={sort.id}
                style={[
                  styles.sortOption,
                  options.sortBy === sort.id && styles.sortOptionActive,
                ]}
                onPress={() => updateSort(sort.id as FilterOptions['sortBy'])}
              >
                <Text style={styles.sortEmoji}>{sort.emoji}</Text>
                <Text style={[
                  styles.sortText,
                  options.sortBy === sort.id && styles.sortTextActive,
                ]}>
                  {sort.name}
                </Text>
                {options.sortBy === sort.id && (
                  <Text style={styles.sortDirection}>{getSortIcon()}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mainBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 56,
  },
  leftSection: {
    flex: 0.3,
  },
  centerSection: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  resultsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    fontWeight: '500',
  },
  quickFilters: {
    flexGrow: 0,
  },
  quickFiltersContent: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  quickFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickFilterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickFilterEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  quickFilterText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  quickFilterTextActive: {
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
  expandButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  expandIcon: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  expandedSection: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.onSurface,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  sortSection: {
    flexGrow: 0,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  sortText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  sortTextActive: {
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
  sortDirection: {
    fontSize: 12,
    color: COLORS.onPrimary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default FilterHeaderBar;
