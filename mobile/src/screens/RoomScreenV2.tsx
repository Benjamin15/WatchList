import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, Dimensions } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, WatchPartyItem } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { apiService } from '../services/api';
import LoadingScreen from './LoadingScreen';

type RoomScreenRouteProp = RouteProp<RootStackParamList, 'Room'>;

interface RoomScreenProps {
  route: RoomScreenRouteProp;
}

// Données mock pour les tests
const mockWatchPartyItems: WatchPartyItem[] = [
  {
    id: 1,
    roomId: 1,
    mediaId: 1,
    status: 'planned',
    addedAt: '2025-01-01T00:00:00Z',
    media: {
      id: 1,
      title: 'One Piece',
      type: 'series',
      year: 1997,
      genre: 'Aventure, Shounen',
      description: 'Les aventures de Monkey D. Luffy et de son équipage de pirates à la recherche du trésor ultime.',
      posterUrl: null,
      rating: 9.0,
      tmdbId: 37854,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  },
  {
    id: 2,
    roomId: 1,
    mediaId: 2,
    status: 'planned',
    addedAt: '2025-01-02T00:00:00Z',
    media: {
      id: 2,
      title: 'The Matrix',
      type: 'movie',
      year: 1999,
      genre: 'Action, Science-Fiction',
      description: 'Un programmeur informatique découvre que sa réalité est une simulation.',
      posterUrl: null,
      rating: 8.7,
      tmdbId: 603,
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    },
  },
  {
    id: 3,
    roomId: 1,
    mediaId: 3,
    status: 'watching',
    addedAt: '2025-01-03T00:00:00Z',
    media: {
      id: 3,
      title: 'Inception',
      type: 'movie',
      year: 2010,
      genre: 'Science-Fiction, Thriller',
      description: 'Un voleur qui s\'infiltre dans les rêves se voit offrir une chance de retrouver sa vie d\'avant.',
      posterUrl: null,
      rating: 8.8,
      tmdbId: 27205,
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z',
    },
  },
  {
    id: 4,
    roomId: 1,
    mediaId: 4,
    status: 'watching',
    addedAt: '2025-01-04T00:00:00Z',
    media: {
      id: 4,
      title: 'Stranger Things',
      type: 'series',
      year: 2016,
      genre: 'Drama, Fantasy',
      description: 'Un groupe d\'enfants découvre des forces surnaturelles dans leur petite ville.',
      posterUrl: null,
      rating: 8.7,
      tmdbId: 66732,
      createdAt: '2025-01-04T00:00:00Z',
      updatedAt: '2025-01-04T00:00:00Z',
    },
  },
  {
    id: 5,
    roomId: 1,
    mediaId: 5,
    status: 'completed',
    addedAt: '2025-01-05T00:00:00Z',
    media: {
      id: 5,
      title: 'Breaking Bad',
      type: 'series',
      year: 2008,
      genre: 'Crime, Drame',
      description: 'Un professeur de chimie atteint d\'un cancer terminal s\'associe avec un ancien élève.',
      posterUrl: null,
      rating: 9.5,
      tmdbId: 1396,
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-01-05T00:00:00Z',
    },
  },
  {
    id: 6,
    roomId: 1,
    mediaId: 6,
    status: 'completed',
    addedAt: '2025-01-06T00:00:00Z',
    media: {
      id: 6,
      title: 'Death Note',
      type: 'manga',
      year: 2003,
      genre: 'Thriller, Surnaturel',
      description: 'Un lycéen trouve un carnet de la mort et décide de créer un nouveau monde.',
      posterUrl: null,
      rating: 8.9,
      tmdbId: null,
      createdAt: '2025-01-06T00:00:00Z',
      updatedAt: '2025-01-06T00:00:00Z',
    },
  },
];

const RoomScreen: React.FC<RoomScreenProps> = ({ route }) => {
  const { roomId } = route.params;
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'planned' | 'watching' | 'completed'>('planned');
  const [WatchPartyItems, setWatchPartyItems] = useState<WatchPartyItem[]>(mockWatchPartyItems);

  // Ordre des statuts pour le swipe
  const statusOrder = ['planned', 'watching', 'completed'] as const;

  useEffect(() => {
    loadRoomData();
  }, [roomId]);

  const loadRoomData = async () => {
    try {
      const room = await apiService.getRoom(roomId);
      setRoomName(room.name);
      setRoomCode(room.room_id);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données de la room');
      console.error('Error loading room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = (itemId: number, direction: 'left' | 'right') => {
    const item = WatchPartyItems.find(item => item.id === itemId);
    if (!item) return;

    const currentIndex = statusOrder.indexOf(item.status);
    let newIndex = currentIndex;

    if (direction === 'right' && currentIndex < statusOrder.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'left' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
      const newStatus = statusOrder[newIndex];
      updateItemStatus(itemId, newStatus);
    }
  };

  const updateItemStatus = (itemId: number, newStatus: 'planned' | 'watching' | 'completed') => {
    setWatchPartyItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );

    // Afficher une notification
    const item = WatchPartyItems.find(item => item.id === itemId);
    if (item) {
      const statusLabels = {
        planned: 'À regarder',
        watching: 'En cours',
        completed: 'Terminé'
      };
      Alert.alert(
        'Statut modifié',
        `"${item.media.title}" déplacé vers "${statusLabels[newStatus]}"`
      );
    }
  };

  const getFilteredItems = () => {
    return WatchPartyItems.filter(item => item.status === currentTab);
  };

  const canSwipeLeft = (item: WatchPartyItem) => {
    const currentIndex = statusOrder.indexOf(item.status);
    return currentIndex > 0;
  };

  const canSwipeRight = (item: WatchPartyItem) => {
    const currentIndex = statusOrder.indexOf(item.status);
    return currentIndex < statusOrder.length - 1;
  };

  const renderMediaItem = ({ item }: { item: WatchPartyItem }) => (
    <MediaItem
      item={item}
      onSwipe={handleSwipe}
      canSwipeLeft={canSwipeLeft(item)}
      canSwipeRight={canSwipeRight(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyTitle}>Aucun média</Text>
      <Text style={styles.emptyMessage}>
        {currentTab === 'planned' && 'Ajoutez des médias à votre WatchParty !'}
        {currentTab === 'watching' && 'Commencez à regarder des médias !'}
        {currentTab === 'completed' && 'Terminez des médias pour les voir ici !'}
      </Text>
    </View>
  );

  if (isLoading) {
    return <LoadingScreen message="Chargement de la room..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{roomName}</Text>
        <Text style={styles.code}>Code: {roomCode}</Text>
      </View>

      <TabHeader currentTab={currentTab} onTabChange={setCurrentTab} />

      <FlatList
        data={getFilteredItems()}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  code: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
  },
  listContent: {
    padding: SPACING.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.onBackground,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.placeholder,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});

export default RoomScreen;
