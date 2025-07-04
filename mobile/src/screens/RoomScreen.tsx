import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import { RootStackParamList, WatchlistItem, MediaType, StatusType } from '../types';
import { COLORS, SPACING, FONT_SIZES, MEDIA_STATUS, MEDIA_TYPES, IMAGE_CONFIG } from '../constants';
import { apiService } from '../services/api';

type RoomScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Room'>;

const RoomScreen: React.FC = () => {
  const navigation = useNavigation<RoomScreenNavigationProp>();
  const route = useRoute();
  const { roomId } = route.params as { roomId: number };

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<MediaType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusType>('all');

  const loadWatchlist = useCallback(async () => {
    try {
      const response = await apiService.getWatchlist(roomId, {
        type: typeFilter,
        status: statusFilter,
      });
      setWatchlist(response.data);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [roomId, typeFilter, statusFilter]);

  useFocusEffect(
    useCallback(() => {
      loadWatchlist();
    }, [loadWatchlist])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadWatchlist();
  };

  const handleStatusChange = async (item: WatchlistItem, newStatus: StatusType) => {
    if (newStatus === 'all') return;

    try {
      await apiService.updateWatchlistItem(roomId, item.id, { status: newStatus });
      setWatchlist(prevList =>
        prevList.map(listItem =>
          listItem.id === item.id
            ? { ...listItem, status: newStatus }
            : listItem
        )
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleRemoveItem = async (item: WatchlistItem) => {
    Alert.alert(
      'Supprimer',
      `Voulez-vous supprimer "${item.media.title}" de la watchlist ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.removeFromWatchlist(roomId, item.id);
              setWatchlist(prevList =>
                prevList.filter(listItem => listItem.id !== item.id)
              );
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Type :</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'all', label: 'Tous' },
            { key: 'movie', label: 'Films' },
            { key: 'series', label: 'Séries' },
            { key: 'manga', label: 'Mangas' },
          ]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTab,
                typeFilter === item.key && styles.activeFilterTab,
              ]}
              onPress={() => setTypeFilter(item.key as MediaType)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  typeFilter === item.key && styles.activeFilterTabText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
        />
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Statut :</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'all', label: 'Tous' },
            { key: 'watching', label: 'En cours' },
            { key: 'completed', label: 'Terminés' },
            { key: 'planned', label: 'Prévus' },
            { key: 'dropped', label: 'Abandonnés' },
          ]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTab,
                statusFilter === item.key && styles.activeFilterTab,
              ]}
              onPress={() => setStatusFilter(item.key as StatusType)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  statusFilter === item.key && styles.activeFilterTabText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
        />
      </View>
    </View>
  );

  const renderWatchlistItem = ({ item }: { item: WatchlistItem }) => (
    <View style={styles.mediaItem}>
      <TouchableOpacity
        style={styles.mediaContent}
        onPress={() =>
          navigation.navigate('Detail', { media: item.media, roomId })
        }
      >
        <Image
          source={{
            uri: item.media.posterUrl || IMAGE_CONFIG.PLACEHOLDER_IMAGE,
          }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.mediaInfo}>
          <Text style={styles.mediaTitle} numberOfLines={2}>
            {item.media.title}
          </Text>
          <View style={styles.mediaMetadata}>
            <View
              style={[
                styles.typeChip,
                { backgroundColor: MEDIA_TYPES[item.media.type].color },
              ]}
            >
              <Text style={styles.typeChipText}>
                {MEDIA_TYPES[item.media.type].label}
              </Text>
            </View>
            {item.media.year && (
              <Text style={styles.mediaYear}>{item.media.year}</Text>
            )}
          </View>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusChip,
                { backgroundColor: MEDIA_STATUS[item.status].color },
              ]}
            >
              <Text style={styles.statusChipText}>
                {MEDIA_STATUS[item.status].label}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.mediaActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // Cycle through statuses
            const statuses: StatusType[] = ['watching', 'completed', 'planned', 'dropped'];
            const currentIndex = statuses.indexOf(item.status);
            const nextStatus = statuses[(currentIndex + 1) % statuses.length];
            handleStatusChange(item, nextStatus);
          }}
        >
          <MaterialIcons name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRemoveItem(item)}
        >
          <MaterialIcons name="delete" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer} testID="loading-indicator">
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderFilterTabs()}
      <FlatList
        data={watchlist}
        renderItem={renderWatchlistItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        testID="room-scroll-view"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucun média dans la watchlist
            </Text>
            <Text style={styles.emptySubtext}>
              Utilisez l'onglet Recherche pour ajouter des films, séries ou mangas
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.onBackground,
    fontSize: FONT_SIZES.md,
  },
  filterContainer: {
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
  listContainer: {
    flexGrow: 1,
    padding: SPACING.md,
  },
  mediaItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  mediaContent: {
    flex: 1,
    flexDirection: 'row',
    padding: SPACING.md,
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: SPACING.md,
  },
  mediaInfo: {
    flex: 1,
  },
  mediaTitle: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  mediaMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  typeChip: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  typeChipText: {
    color: COLORS.onPrimary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  mediaYear: {
    color: COLORS.placeholder,
    fontSize: FONT_SIZES.sm,
  },
  statusContainer: {
    marginTop: SPACING.xs,
  },
  statusChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    color: COLORS.onPrimary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  mediaActions: {
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  actionButton: {
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    color: COLORS.onBackground,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    color: COLORS.placeholder,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RoomScreen;
