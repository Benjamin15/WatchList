import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { FilterOptions } from '../types';
import { COLORS } from '../constants';
import FilterAlternatives from '../components/FilterAlternatives';

const FilterTestScreen: React.FC = () => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    type: 'all',
    genres: [],
    sortBy: 'date_added',
    sortDirection: 'desc',
  });

  // Données de test
  const mockResultsCount = 42;

  const handleUpdateFilters = (newOptions: FilterOptions) => {
    setFilterOptions(newOptions);
    console.log('📊 Filtres mis à jour:', newOptions);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <FilterAlternatives
        options={filterOptions}
        onUpdate={handleUpdateFilters}
        resultsCount={mockResultsCount}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default FilterTestScreen;
