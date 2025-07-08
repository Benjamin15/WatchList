import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { FilterOptions } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

interface FilterPanelProps {
  visible: boolean;
  options: FilterOptions;
  onClose: () => void;
  onApply: (options: FilterOptions) => void;
  onReset: () => void;
  resultsCount: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  visible,
  options,
  onClose,
  onApply,
  onReset,
  resultsCount,
}) => {
  const { t } = useTranslation();
  const [localOptions, setLocalOptions] = useState<FilterOptions>(options);
  const [panY] = useState(new Animated.Value(0));
  const [scaleValue] = useState(new Animated.Value(0));
  const [opacityValue] = useState(new Animated.Value(0));

  const screenHeight = Dimensions.get('window').height;

  // Animation d'entrée/sortie
  useEffect(() => {
    if (visible) {
      // Animation d'ouverture
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animation de fermeture
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Genres disponibles
  const availableGenres = [
    { id: 'action', name: 'Action', emoji: '💥' },
    { id: 'drama', name: 'Drame', emoji: '🎭' },
    { id: 'comedy', name: 'Comédie', emoji: '😂' },
    { id: 'sci-fi', name: 'Sci-Fi', emoji: '🚀' },
    { id: 'horror', name: 'Horreur', emoji: '👻' },
    { id: 'romance', name: 'Romance', emoji: '💕' },
    { id: 'thriller', name: 'Thriller', emoji: '🔪' },
    { id: 'fantasy', name: 'Fantasy', emoji: '🧙' },
    { id: 'adventure', name: 'Aventure', emoji: '🗺️' },
    { id: 'animation', name: 'Animation', emoji: '🎨' },
  ];

  // Options de tri
  const sortOptions = [
    { id: 'date_added', name: 'Date d\'ajout', emoji: '📅' },
    { id: 'title', name: 'Titre (A-Z)', emoji: '🔤' },
    { id: 'year', name: 'Année de sortie', emoji: '📆' },
    { id: 'rating', name: 'Note TMDB', emoji: '⭐' },
    { id: 'duration', name: 'Durée', emoji: '⏱️' },
  ];

  // PanResponder amélioré pour le swipe vers le bas
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 10 && Math.abs(gestureState.dx) < 80;
    },
    onPanResponderGrant: () => {
      // Petit feedback visuel au début du swipe
      Animated.spring(scaleValue, {
        toValue: 0.98,
        tension: 300,
        friction: 7,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        const translateY = Math.min(gestureState.dy, screenHeight * 0.3);
        panY.setValue(translateY);
        
        // Réduire l'opacité pendant le swipe
        const opacity = Math.max(0.3, 1 - (gestureState.dy / (screenHeight * 0.4)));
        opacityValue.setValue(opacity);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 120 || gestureState.vy > 0.5) {
        // Fermer le modal
        onClose();
      } else {
        // Revenir à la position normale avec animation
        Animated.parallel([
          Animated.spring(panY, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(scaleValue, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
  });

  const updateType = (type: FilterOptions['type']) => {
    setLocalOptions(prev => ({ ...prev, type }));
  };

  const toggleGenre = (genre: string) => {
    setLocalOptions(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const updateSort = (sortBy: FilterOptions['sortBy']) => {
    setLocalOptions(prev => ({
      ...prev,
      sortBy,
      // Inverser la direction si on clique sur le même tri
      sortDirection: prev.sortBy === sortBy && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleReset = () => {
    // Animation de feedback pour le bouton reset
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const resetOptions: FilterOptions = {
      type: 'all',
      genres: [],
      sortBy: 'date_added',
      sortDirection: 'desc',
    };
    setLocalOptions(resetOptions);
    onReset();
  };

  const handleApply = () => {
    // Animation de feedback pour le bouton apply
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.02,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onApply(localOptions);
      onClose();
    });
  };

  const getSortIcon = (sortBy: FilterOptions['sortBy']) => {
    if (localOptions.sortBy === sortBy) {
      return localOptions.sortDirection === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: opacityValue,
          }
        ]}
      >
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        
        <Animated.View
          style={[
            styles.panel,
            {
              transform: [
                { translateY: panY },
                { scale: scaleValue },
              ],
              opacity: opacityValue,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragIndicator} />
            <Text style={styles.title}>Filtrer et trier</Text>
            <Text style={styles.subtitle}>Personnalisez l'affichage de vos films</Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Type de contenu */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🎬 Type de contenu</Text>
              </View>
              <View style={styles.optionsGrid}>
                {[
                  { id: 'all', name: 'Tous', emoji: '🎯' },
                  { id: 'movie', name: 'Films', emoji: '🎬' },
                  { id: 'series', name: 'Séries', emoji: '📺' },
                ].map((type) => (
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

            {/* Genres */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🎭 Genres</Text>
              </View>
              <View style={styles.optionsGrid}>
                {availableGenres.map((genre) => (
                  <TouchableOpacity
                    key={genre.id}
                    style={[
                      styles.option,
                      localOptions.genres.includes(genre.id) && styles.optionActive,
                    ]}
                    onPress={() => toggleGenre(genre.id)}
                  >
                    <Text style={styles.optionEmoji}>{genre.emoji}</Text>
                    <Text style={[
                      styles.optionText,
                      localOptions.genres.includes(genre.id) && styles.optionTextActive,
                    ]}>
                      {genre.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tri */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🔀 Trier par</Text>
              </View>
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
                    <Text style={styles.sortDirection}>
                      {getSortIcon(sort.id as FilterOptions['sortBy'])}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>
                Appliquer ({resultsCount} films)
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  },
  header: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.placeholder,
    borderRadius: 2,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minWidth: 75,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionActive: {
    backgroundColor: 'rgba(233, 69, 96, 0.2)',
    borderColor: COLORS.primary,
  },
  optionEmoji: {
    fontSize: 14,
    marginBottom: 2,
  },
  optionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sortOptions: {
    gap: SPACING.sm,
  },
  sortOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sortOptionActive: {
    backgroundColor: 'rgba(233, 69, 96, 0.2)',
    borderColor: COLORS.primary,
  },
  sortInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sortEmoji: {
    fontSize: 14,
  },
  sortText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.onSurface,
  },
  sortTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sortDirection: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  resetButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  resetButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  applyButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  applyButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default FilterPanel;
