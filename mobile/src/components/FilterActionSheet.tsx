import React from 'react';
import { ActionSheetIOS, Alert, Platform } from 'react-native';
import { FilterOptions } from '../types';

interface FilterActionSheetProps {
  options: FilterOptions;
  onUpdate: (options: FilterOptions) => void;
  onShow: () => void;
}

export const showFilterActionSheet = ({ options, onUpdate }: Omit<FilterActionSheetProps, 'onShow'>) => {
  const typeOptions = [
    { id: 'all', name: '🎯 Tous les contenus' },
    { id: 'movie', name: '🎬 Films uniquement' },
    { id: 'series', name: '📺 Séries uniquement' },
  ];

  const sortOptions = [
    { id: 'date_added', name: '📅 Plus récents d\'abord' },
    { id: 'title', name: '🔤 Par titre (A-Z)' },
    { id: 'rating', name: '⭐ Mieux notés d\'abord' },
    { id: 'popularity', name: '🔥 Plus populaires d\'abord' },
  ];

  if (Platform.OS === 'ios') {
    // Action Sheet iOS natif
    const buttons = [
      ...typeOptions.map(type => type.name),
      'Annuler'
    ];

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: buttons,
        cancelButtonIndex: buttons.length - 1,
        title: 'Filtrer le contenu',
        message: `Actuellement: ${typeOptions.find(t => t.id === options.type)?.name}`,
      },
      (buttonIndex) => {
        if (buttonIndex < typeOptions.length) {
          onUpdate({ ...options, type: typeOptions[buttonIndex].id as FilterOptions['type'] });
        }
      }
    );
  } else {
    // Alert Android avec options
    Alert.alert(
      'Filtrer le contenu',
      'Choisissez le type de contenu à afficher',
      [
        ...typeOptions.map(type => ({
          text: type.name,
          onPress: () => onUpdate({ ...options, type: type.id as FilterOptions['type'] })
        })),
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  }
};

export const showSortActionSheet = ({ options, onUpdate }: Omit<FilterActionSheetProps, 'onShow'>) => {
  const sortOptions = [
    { id: 'date_added', name: '📅 Plus récents d\'abord' },
    { id: 'title', name: '🔤 Par titre (A-Z)' },
    { id: 'rating', name: '⭐ Mieux notés d\'abord' },
    { id: 'popularity', name: '🔥 Plus populaires d\'abord' },
  ];

  if (Platform.OS === 'ios') {
    const buttons = [
      ...sortOptions.map(sort => sort.name),
      'Annuler'
    ];

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: buttons,
        cancelButtonIndex: buttons.length - 1,
        title: 'Trier les films',
        message: `Actuellement: ${sortOptions.find(s => s.id === options.sortBy)?.name}`,
      },
      (buttonIndex) => {
        if (buttonIndex < sortOptions.length) {
          const newSortBy = sortOptions[buttonIndex].id as FilterOptions['sortBy'];
          onUpdate({
            ...options,
            sortBy: newSortBy,
            sortDirection: options.sortBy === newSortBy && options.sortDirection === 'asc' ? 'desc' : 'asc'
          });
        }
      }
    );
  } else {
    Alert.alert(
      'Trier les films',
      'Choisissez l\'ordre de tri',
      [
        ...sortOptions.map(sort => ({
          text: sort.name,
          onPress: () => {
            const newSortBy = sort.id as FilterOptions['sortBy'];
            onUpdate({
              ...options,
              sortBy: newSortBy,
              sortDirection: options.sortBy === newSortBy && options.sortDirection === 'asc' ? 'desc' : 'asc'
            });
          }
        })),
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  }
};
