import React from 'react';
import { ActionSheetIOS, Alert, Platform } from 'react-native';
import i18next from 'i18next';
import { FilterOptions } from '../types';

interface FilterActionSheetProps {
  options: FilterOptions;
  onUpdate: (options: FilterOptions) => void;
  onShow: () => void;
}

export const showFilterActionSheet = ({ options, onUpdate }: Omit<FilterActionSheetProps, 'onShow'>) => {
  const typeOptions = [
    { id: 'all', name: i18next.t('filter.actionSheet.options.all') },
    { id: 'movie', name: i18next.t('filter.actionSheet.options.movie') },
    { id: 'series', name: i18next.t('filter.actionSheet.options.series') },
  ];

  const sortOptions = [
    { id: 'date_added', name: i18next.t('filter.actionSheet.options.dateAdded') },
    { id: 'title', name: i18next.t('filter.actionSheet.options.title') },
    { id: 'rating', name: i18next.t('filter.actionSheet.options.rating') },
    { id: 'popularity', name: i18next.t('filter.actionSheet.options.popularity') },
  ];

  if (Platform.OS === 'ios') {
    // Action Sheet iOS natif
    const buttons = [
      ...typeOptions.map(type => type.name),
      i18next.t('filter.actionSheet.cancel')
    ];

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: buttons,
        cancelButtonIndex: buttons.length - 1,
        title: i18next.t('filter.actionSheet.filterTitle'),
        message: `${i18next.t('filter.actionSheet.currently')} ${typeOptions.find(t => t.id === options.type)?.name}`,
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
      i18next.t('filter.actionSheet.filterTitle'),
      i18next.t('filter.actionSheet.filterMessage'),
      [
        ...typeOptions.map(type => ({
          text: type.name,
          onPress: () => onUpdate({ ...options, type: type.id as FilterOptions['type'] })
        })),
        { text: i18next.t('filter.actionSheet.cancel'), style: 'cancel' }
      ]
    );
  }
};

export const showSortActionSheet = ({ options, onUpdate }: Omit<FilterActionSheetProps, 'onShow'>) => {
  const sortOptions = [
    { id: 'date_added', name: i18next.t('filter.actionSheet.options.dateAdded') },
    { id: 'title', name: i18next.t('filter.actionSheet.options.title') },
    { id: 'rating', name: i18next.t('filter.actionSheet.options.rating') },
    { id: 'popularity', name: i18next.t('filter.actionSheet.options.popularity') },
  ];

  if (Platform.OS === 'ios') {
    const buttons = [
      ...sortOptions.map(sort => sort.name),
      i18next.t('filter.actionSheet.cancel')
    ];

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: buttons,
        cancelButtonIndex: buttons.length - 1,
        title: i18next.t('filter.actionSheet.sortTitle'),
        message: `${i18next.t('filter.actionSheet.currently')} ${sortOptions.find(s => s.id === options.sortBy)?.name}`,
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
      i18next.t('filter.actionSheet.sortTitle'),
      i18next.t('filter.actionSheet.sortMessage'),
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
        { text: i18next.t('filter.actionSheet.cancel'), style: 'cancel' }
      ]
    );
  }
};
