import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { FilterOptions } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface FilterSidebarProps {
  visible: boolean;
  options: FilterOptions;
  onClose: () => void;
  onApply: (options: FilterOptions) => void;
  resultsCount: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  visible,
  options,
  onClose,
  onApply,
  resultsCount,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [localOptions, setLocalOptions] = useState<FilterOptions>(options);
  const [slideAnim] = useState(new Animated.Value(-300)); // Commence hors écran à gauche
  const [opacityAnim] = useState(new Animated.Value(0));

  const screenWidth = Dimensions.get('window').width;
  const sidebarWidth = Math.min(300, screenWidth * 0.8);

  // Animation d'entrée/sortie
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -sidebarWidth,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim, sidebarWidth]);

  // Gestionnaire de gestes pour fermer en glissant
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 100;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        slideAnim.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -50) {
        onClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const typeOptions = [
    { id: 'all', name: t('filter.type.all'), emoji: '🎯' },
    { id: 'movie', name: t('filter.type.movie'), emoji: '🎬' },
    { id: 'series', name: t('filter.type.series'), emoji: '📺' },
  ];

  const sortOptions = [
    { id: 'date_added', name: t('filter.sort.date_added'), emoji: '📅' },
    { id: 'title', name: t('filter.sort.title'), emoji: '🔤' },
    { id: 'year', name: t('filter.sort.year'), emoji: '📆' },
    { id: 'rating', name: t('filter.sort.rating'), emoji: '⭐' },
    { id: 'duration', name: t('filter.sort.duration'), emoji: '⏱️' },
    { id: 'popularity', name: t('filter.sort.popularity'), emoji: '🔥' },
  ];

  const updateType = (type: FilterOptions['type']) => {
    setLocalOptions(prev => ({ ...prev, type }));
  };

  const updateSort = (sortBy: FilterOptions['sortBy']) => {
    setLocalOptions(prev => {
      // Si on clique sur le même tri, on change la direction ou on désactive
      if (prev.sortBy === sortBy) {
        if (prev.sortDirection === 'asc') {
          // Passer en décroissant
          return { ...prev, sortDirection: 'desc' };
        } else {
          // Désactiver le tri
          return { ...prev, sortBy: 'none', sortDirection: 'desc' };
        }
      }
      // Nouveau tri : toujours commencer par croissant pour permettre les deux sens
      return { ...prev, sortBy, sortDirection: 'asc' };
    });
  };

  // Fonction pour obtenir les labels de direction
  const getDirectionLabel = (sortBy: FilterOptions['sortBy'], direction: 'asc' | 'desc'): string => {
    const directionKey = `${sortBy}_${direction}` as keyof typeof t;
    const fallbackKey = direction === 'asc' ? 'filter.direction.asc' : 'filter.direction.desc';
    
    // Essayer d'abord la clé spécifique (ex: title_asc, year_desc)
    const specificKey = `filter.direction.${directionKey}`;
    if (t(specificKey) !== specificKey) {
      return t(specificKey);
    }
    
    // Sinon utiliser la clé générique
    return t(fallbackKey);
  };

  const handleApply = () => {
    onApply(localOptions);
    onClose();
  };

  const handleReset = () => {
    const resetOptions: FilterOptions = {
      type: 'all',
      genres: [],
      sortBy: 'none',
      sortDirection: 'desc',
    };
    setLocalOptions(resetOptions);
    onApply(resetOptions);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* Overlay cliquable pour fermer */}
      <TouchableOpacity 
        style={styles.overlayTouch}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View style={[styles.overlayBackground, { opacity: opacityAnim }]} />
      </TouchableOpacity>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            width: sidebarWidth,
            transform: [{ translateX: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{t('filter.title')}</Text>
            <Text style={styles.subtitle}>{resultsCount} {t('common.results')}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Contenu */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Type de contenu */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎬 {t('filter.contentType')}</Text>
            <View style={styles.optionsGrid}>
              {typeOptions.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.option,
                    localOptions.type === type.id && styles.optionActive,
                  ]}
                  onPress={() => updateType(type.id as FilterOptions['type'])}
                >
                  <Text style={styles.optionEmoji}>{type.emoji}</Text>
                  <Text style={[
                    styles.optionText,
                    localOptions.type === type.id && styles.optionTextActive,
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tri */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔀 {t('filter.sortBy')}</Text>
            <View style={styles.sortOptions}>
              {sortOptions.map((sort) => (
                <TouchableOpacity
                  key={sort.id}
                  style={[
                    styles.sortOption,
                    localOptions.sortBy === sort.id && styles.sortOptionActive,
                  ]}
                  onPress={() => updateSort(sort.id as FilterOptions['sortBy'])}
                >
                  <View style={styles.sortInfo}>
                    <Text style={styles.sortEmoji}>{sort.emoji}</Text>
                    <Text style={[
                      styles.sortText,
                      localOptions.sortBy === sort.id && styles.sortTextActive,
                    ]}>
                      {sort.name}
                    </Text>
                  </View>
                  
                  {/* Indicateur de direction simple */}
                  {localOptions.sortBy === sort.id && localOptions.sortBy !== 'none' && (
                    <View style={styles.sortIndicator}>
                      <Text style={styles.sortArrow}>
                        {localOptions.sortDirection === 'asc' ? '↑' : '↓'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>{t('filter.actions.reset')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>{t('filter.actions.apply')}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayTouch: {
    flex: 1,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.surface,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: theme.onSurface,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: theme.placeholder,
    marginTop: 2,
  },
  closeButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeIcon: {
    fontSize: 16,
    color: theme.onSurface,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: theme.onSurface,
    marginBottom: SPACING.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  optionActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  optionEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: theme.onSurface,
    fontWeight: '500',
  },
  optionTextActive: {
    color: theme.onPrimary,
    fontWeight: '600',
  },
  sortOptions: {
    gap: SPACING.sm,
  },
  sortOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sortOptionActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  sortInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  sortEmoji: {
    fontSize: 16,
  },
  sortText: {
    fontSize: FONT_SIZES.md,
    color: theme.onSurface,
    fontWeight: '500',
  },
  sortTextActive: {
    color: theme.onPrimary,
    fontWeight: '600',
  },
  sortIndicator: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortArrow: {
    fontSize: 16,
    color: theme.onPrimary,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  resetButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  resetButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: theme.onSurface,
  },
  applyButton: {
    flex: 1,
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: theme.onPrimary,
  },
});

export default FilterSidebar;
