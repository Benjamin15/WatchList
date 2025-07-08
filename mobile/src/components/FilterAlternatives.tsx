import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { FilterOptions } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import FilterHeaderBar from './FilterHeaderBar';
import FilterSidebar from './FilterSidebar';
import { showFilterActionSheet, showSortActionSheet } from './FilterActionSheet';

interface FilterAlternativesProps {
  options: FilterOptions;
  onUpdate: (options: FilterOptions) => void;
  resultsCount: number;
}

const FilterAlternatives: React.FC<FilterAlternativesProps> = ({
  options,
  onUpdate,
  resultsCount,
}) => {
  const [currentMode, setCurrentMode] = useState<'header' | 'sidebar' | 'actionsheet'>('header');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const modes = [
    {
      id: 'header',
      name: '📋 Header Bar',
      description: 'Filtres intégrés dans l\'en-tête',
      pros: ['Toujours visible', 'Accès rapide', 'Compact'],
      cons: ['Espace limité', 'Peut encombrer'],
    },
    {
      id: 'sidebar',
      name: '📱 Sidebar',
      description: 'Panel coulissant depuis la gauche',
      pros: ['Plus d\'espace', 'Navigation familière', 'Stable'],
      cons: ['Prend de l\'espace', 'Un clic de plus'],
    },
    {
      id: 'actionsheet',
      name: '📋 Action Sheet',
      description: 'Menus natifs iOS/Android',
      pros: ['Interface native', 'Très fiable', 'Familier'],
      cons: ['Limité aux listes', 'Moins visuel'],
    },
  ];

  const handleSidebarOpen = () => {
    setSidebarVisible(true);
  };

  const handleSidebarClose = () => {
    setSidebarVisible(false);
  };

  const handleActionSheetFilter = () => {
    showFilterActionSheet({ options, onUpdate });
  };

  const handleActionSheetSort = () => {
    showSortActionSheet({ options, onUpdate });
  };

  return (
    <View style={styles.container}>
      {/* Sélecteur de mode */}
      <View style={styles.modeSelector}>
        <Text style={styles.selectorTitle}>🧪 Test des alternatives de filtrage</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeButton,
                currentMode === mode.id && styles.modeButtonActive,
              ]}
              onPress={() => setCurrentMode(mode.id as any)}
            >
              <Text style={[
                styles.modeButtonText,
                currentMode === mode.id && styles.modeButtonTextActive,
              ]}>
                {mode.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Description du mode actuel */}
      <View style={styles.modeDescription}>
        {modes.map((mode) => 
          currentMode === mode.id && (
            <View key={mode.id}>
              <Text style={styles.descriptionTitle}>{mode.name}</Text>
              <Text style={styles.descriptionText}>{mode.description}</Text>
              <View style={styles.prosConsContainer}>
                <View style={styles.prosContainer}>
                  <Text style={styles.prosTitle}>✅ Avantages:</Text>
                  {mode.pros.map((pro, index) => (
                    <Text key={index} style={styles.proText}>• {pro}</Text>
                  ))}
                </View>
                <View style={styles.consContainer}>
                  <Text style={styles.consTitle}>❌ Inconvénients:</Text>
                  {mode.cons.map((con, index) => (
                    <Text key={index} style={styles.conText}>• {con}</Text>
                  ))}
                </View>
              </View>
            </View>
          )
        )}
      </View>

      {/* Interface selon le mode */}
      <View style={styles.interfaceContainer}>
        {currentMode === 'header' && (
          <FilterHeaderBar
            options={options}
            onUpdate={onUpdate}
            resultsCount={resultsCount}
          />
        )}

        {currentMode === 'sidebar' && (
          <View style={styles.sidebarDemo}>
            <TouchableOpacity
              style={styles.sidebarTrigger}
              onPress={handleSidebarOpen}
            >
              <Text style={styles.sidebarTriggerText}>📱 Ouvrir le sidebar</Text>
            </TouchableOpacity>
            <FilterSidebar
              visible={sidebarVisible}
              options={options}
              onClose={handleSidebarClose}
              onApply={onUpdate}
              resultsCount={resultsCount}
            />
          </View>
        )}

        {currentMode === 'actionsheet' && (
          <View style={styles.actionSheetDemo}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleActionSheetFilter}
            >
              <Text style={styles.actionButtonText}>🎬 Filtrer le contenu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleActionSheetSort}
            >
              <Text style={styles.actionButtonText}>🔀 Changer le tri</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Statut actuel */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>📊 État actuel des filtres:</Text>
        <Text style={styles.statusText}>Type: {options.type}</Text>
        <Text style={styles.statusText}>Tri: {options.sortBy} ({options.sortDirection})</Text>
        <Text style={styles.statusText}>Résultats: {resultsCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modeSelector: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectorTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
  },
  modeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
  modeDescription: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  descriptionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  descriptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },
  prosConsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  prosContainer: {
    flex: 1,
  },
  consContainer: {
    flex: 1,
  },
  prosTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: SPACING.xs,
  },
  consTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: SPACING.xs,
  },
  proText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  conText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  interfaceContainer: {
    flex: 1,
  },
  sidebarDemo: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  sidebarTrigger: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sidebarTriggerText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.onPrimary,
  },
  actionSheetDemo: {
    padding: SPACING.lg,
    gap: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minWidth: 200,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.onPrimary,
  },
  statusContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statusTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    marginBottom: 2,
  },
});

export default FilterAlternatives;
