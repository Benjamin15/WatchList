import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, PanResponder } from 'react-native';
import { RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, WatchlistItem } from '../types';
import { COLORS, SPACING, FONT_SIZES, MEDIA_STATUS } from '../constants';
import { apiService } from '../services/api';
import LoadingScreen from './LoadingScreen';

type RoomScreenRouteProp = RouteProp<RootStackParamList, 'Room'>;
type RoomScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Room'>;

interface RoomScreenProps {
  route: RoomScreenRouteProp;
}

// Données mock pour les tests
const mockWatchlistItems: WatchlistItem[] = [
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
      description: 'Les aventures de Monkey D. Luffy et de son équipage de pirates.',
      posterUrl: undefined,
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
      posterUrl: undefined,
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
      description: 'Un voleur qui s\'infiltre dans les rêves.',
      posterUrl: undefined,
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
    status: 'completed',
    addedAt: '2025-01-04T00:00:00Z',
    media: {
      id: 4,
      title: 'Breaking Bad',
      type: 'series',
      year: 2008,
      genre: 'Crime, Drame',
      description: 'Un professeur de chimie atteint d\'un cancer terminal.',
      posterUrl: undefined,
      rating: 9.5,
      tmdbId: 1396,
      createdAt: '2025-01-04T00:00:00Z',
      updatedAt: '2025-01-04T00:00:00Z',
    },
  },
];

const RoomScreen: React.FC<RoomScreenProps> = ({ route }) => {
  const { roomId } = route.params;
  const navigation = useNavigation<RoomScreenNavigationProp>();
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'planned' | 'watching' | 'completed'>('planned');
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);

  const statusOrder = ['planned', 'watching', 'completed'] as const;

  useEffect(() => {
    loadRoomData();
  }, [roomId]);

  // Utiliser useFocusEffect pour recharger les données quand on revient sur cet écran
  useFocusEffect(
    useCallback(() => {
      loadWatchlistItems();
    }, [roomId])
  );

  const loadRoomData = async () => {
    try {
      const room = await apiService.getRoom(roomId);
      setRoomName(room.name);
      setRoomCode(room.room_id);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données de la room');
      console.error('Error loading room:', error);
    }
  };

  const loadWatchlistItems = async () => {
    try {
      const items = await apiService.getRoomItems(roomId);
      setWatchlistItems(items);
    } catch (error) {
      console.error('Error loading watchlist items:', error);
      // En cas d'erreur, utiliser les données mock comme fallback
      setWatchlistItems(mockWatchlistItems);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = (itemId: number, direction: 'left' | 'right') => {
    const item = watchlistItems.find(item => item.id === itemId);
    if (!item) return;

    const currentIndex = statusOrder.indexOf(item.status as any);
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

  const updateItemStatus = async (itemId: number, newStatus: 'planned' | 'watching' | 'completed') => {
    try {
      // Mise à jour optimiste de l'interface
      setWatchlistItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );

      // Appel API pour persister le changement
      await apiService.updateItemStatus(roomId, itemId, newStatus);

      const item = watchlistItems.find(item => item.id === itemId);
      if (item) {
        const statusLabels = {
          planned: 'À regarder',
          watching: 'En cours',
          completed: 'Terminé'
        };
        Alert.alert(
          '✅ Statut modifié',
          `"${item.media.title}" déplacé vers "${statusLabels[newStatus]}"`
        );
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      
      // Rollback en cas d'erreur
      setWatchlistItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, status: item.status } : item
        )
      );
      
      Alert.alert(
        'Erreur',
        'Impossible de modifier le statut. Veuillez réessayer.'
      );
    }
  };

  const getFilteredItems = () => {
    return watchlistItems.filter(item => item.status === currentTab);
  };

  const renderMediaItem = (item: WatchlistItem) => {
    const statusConfig = {
      planned: { text: 'Prévu', color: MEDIA_STATUS.planned.color },
      watching: { text: 'En cours', color: MEDIA_STATUS.watching.color },
      completed: { text: 'Terminé', color: MEDIA_STATUS.completed.color },
    };

    const statusBadge = statusConfig[item.status as keyof typeof statusConfig];

    const currentIndex = statusOrder.indexOf(item.status as any);
    const canLeft = currentIndex > 0;
    const canRight = currentIndex < statusOrder.length - 1;
    
    let swipeIndicator = '';
    if (canLeft && canRight) swipeIndicator = '◀️▶️';
    else if (canRight) swipeIndicator = '▶️';
    else if (canLeft) swipeIndicator = '◀️';

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 100) {
          if (gestureState.dx > 0 && canRight) {
            handleSwipe(item.id, 'right');
          } else if (gestureState.dx < 0 && canLeft) {
            handleSwipe(item.id, 'left');
          }
        }
      },
    });

    return (
      <View key={item.id} {...panResponder.panHandlers} style={styles.mediaItem}>
        <View style={styles.poster}>
          <Text style={styles.posterEmoji}>
            {item.media.type === 'movie' ? '🎬' : 
             item.media.type === 'series' ? '📺' : '📚'}
          </Text>
        </View>
        
        <View style={styles.mediaContent}>
          <Text style={styles.title}>{item.media.title}</Text>
          <Text style={styles.meta}>{item.media.year} • {item.media.genre}</Text>
          <Text style={styles.description}>{item.media.description}</Text>
          
          <View style={styles.footer}>
            <View style={[styles.badge, { backgroundColor: statusBadge.color }]}>
              <Text style={styles.badgeText}>{statusBadge.text}</Text>
            </View>
            <Text style={styles.swipeIndicator}>{swipeIndicator}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyTitle}>Aucun média</Text>
      <Text style={styles.emptyMessage}>
        {currentTab === 'planned' && 'Ajoutez des médias à votre watchlist !'}
        {currentTab === 'watching' && 'Commencez à regarder des médias !'}
        {currentTab === 'completed' && 'Terminez des médias pour les voir ici !'}
      </Text>
    </View>
  );

  if (isLoading) {
    return <LoadingScreen message="Chargement de la room..." />;
  }

  const filteredItems = getFilteredItems();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roomTitle}>{roomName}</Text>
        <Text style={styles.roomCode}>Code: {roomCode}</Text>
      </View>

      <View style={styles.tabs}>
        {[
          { key: 'planned', label: 'À regarder' },
          { key: 'watching', label: 'En cours' },
          { key: 'completed', label: 'Terminé' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, currentTab === tab.key && styles.activeTab]}
            onPress={() => setCurrentTab(tab.key as any)}
          >
            <Text style={[styles.tabText, currentTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            💡 Glissez un média vers la gauche ou la droite pour changer son statut
          </Text>
        </View>
        
        {filteredItems.length > 0 ? (
          filteredItems.map(renderMediaItem)
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
      
      {/* Bouton flottant pour ajouter des médias */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Search', { roomId })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  roomTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  roomCode: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.placeholder,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  hint: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hintText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    textAlign: 'center',
  },
  mediaItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  poster: {
    width: 60,
    height: 90,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  posterEmoji: {
    fontSize: 24,
  },
  mediaContent: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  meta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.onPrimary,
  },
  swipeIndicator: {
    fontSize: 16,
    padding: SPACING.xs,
  },
  emptyState: {
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
  fab: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    width: 56,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 24,
    color: COLORS.onPrimary,
    fontWeight: 'bold',
  },
});

export default RoomScreen;
