import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { Image } from 'expo-image';
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

// Composant pour les éléments de média avec animation
const MediaItemCard = ({ 
  item, 
  onSwipe, 
  statusOrder, 
  renderMediaPoster,
  currentTab,
  onViewDetails
}: { 
  item: WatchlistItem; 
  onSwipe: (id: number, direction: 'left' | 'right') => void;
  statusOrder: readonly string[];
  renderMediaPoster: (item: WatchlistItem) => React.ReactNode;
  currentTab: string;
  onViewDetails: (item: WatchlistItem) => void;
}) => {
  const statusConfig = {
    planned: { text: 'Prévu', color: MEDIA_STATUS.planned.color },
    watching: { text: 'En cours', color: MEDIA_STATUS.watching.color },
    completed: { text: 'Terminé', color: MEDIA_STATUS.completed.color },
  };

  const statusBadge = statusConfig[item.status as keyof typeof statusConfig];

  const currentIndex = statusOrder.indexOf(item.status as any);
  const canLeft = currentIndex > 0;
  const canRight = currentIndex < statusOrder.length - 1;
  
  // Déterminer les directions autorisées selon l'onglet actuel
  const isSwipeAllowed = (direction: 'left' | 'right') => {
    // Dans "À regarder" (planned), on peut seulement glisser à droite
    if (currentTab === 'planned') {
      return direction === 'right' && canRight;
    }
    // Dans "Terminé" (completed), on peut seulement glisser à gauche
    if (currentTab === 'completed') {
      return direction === 'left' && canLeft;
    }
    // Dans "En cours" (watching), on peut glisser dans les deux directions
    if (currentTab === 'watching') {
      return (direction === 'left' && canLeft) || (direction === 'right' && canRight);
    }
    return false;
  };
  
  // Animation values - persistent avec useRef
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  // Seuil pour valider le swipe (plus accessible)
  const SWIPE_THRESHOLD = 80;
  
  // Reset animation avec spring plus fluide
  const resetAnimation = () => {
    Animated.parallel([
      Animated.spring(translateX, { 
        toValue: 0, 
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(opacity, { 
        toValue: 1, 
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(scale, { 
        toValue: 1, 
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  };
  
  // Trigger swipe animation
  const triggerSwipeAnimation = (direction: 'left' | 'right') => {
    const targetX = direction === 'right' ? 350 : -350;
    
    // Animation de sortie plus fluide
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: targetX,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.2,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.75,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animation de retour plus rapide
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 120,
          friction: 9,
        }),
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 9,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 9,
        }),
      ]).start();
    });
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Activer le pan responder si le mouvement horizontal est supérieur au vertical
      const shouldSet = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 5;
      console.log('[PanResponder] onMoveShouldSetPanResponder:', { dx: gestureState.dx, dy: gestureState.dy, shouldSet });
      return shouldSet;
    },
    onPanResponderGrant: () => {
      console.log('[PanResponder] onPanResponderGrant - Geste commencé');
      // Petit feedback visuel au début du geste
      Animated.spring(scale, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 150,
        friction: 10,
      }).start();
    },
    onPanResponderMove: (evt, gestureState) => {
      const direction = gestureState.dx > 0 ? 'right' : 'left';
      
      // Limiter le mouvement selon les règles de l'onglet
      if (!isSwipeAllowed(direction)) {
        // Résistance progressive si le mouvement n'est pas autorisé
        const resistance = Math.sign(gestureState.dx) * Math.min(Math.abs(gestureState.dx) * 0.2, 30);
        translateX.setValue(resistance);
        return;
      }
      
      // Mouvement fluide pour les directions autorisées
      translateX.setValue(gestureState.dx);
      
      // Effets visuels progressifs
      const dragPercent = Math.min(Math.abs(gestureState.dx) / 150, 1);
      
      // Scale effect plus subtil
      scale.setValue(Math.max(0.96, 1 - dragPercent * 0.04));
      
      // Opacity effect plus subtil
      opacity.setValue(Math.max(0.8, 1 - dragPercent * 0.2));
    },
    onPanResponderRelease: (evt, gestureState) => {
      const direction = gestureState.dx > 0 ? 'right' : 'left';
      const distance = Math.abs(gestureState.dx);
      
      console.log('[PanResponder] onPanResponderRelease:', { 
        direction, 
        distance, 
        threshold: SWIPE_THRESHOLD, 
        isAllowed: isSwipeAllowed(direction),
        currentStatus: item.status,
        currentTab
      });
      
      if (distance > SWIPE_THRESHOLD && isSwipeAllowed(direction)) {
        // Swipe valide
        console.log('[PanResponder] Swipe valide - déclenchement animation');
        triggerSwipeAnimation(direction);
        setTimeout(() => onSwipe(item.id, direction), 50);
      } else {
        // Swipe annulé - retour à la position initiale
        console.log('[PanResponder] Swipe annulé - retour position initiale');
        resetAnimation();
      }
    },
    onPanResponderTerminate: () => {
      // En cas d'interruption, retour à la position initiale
      resetAnimation();
    },
  });

  return (
    <Animated.View 
      style={[
        styles.mediaItem,
        {
          transform: [
            { translateX: translateX },
            { scale: scale }
          ],
          opacity: opacity,
        }
      ]} 
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onViewDetails(item)}
        style={styles.touchableContent}
      >
        {renderMediaPoster(item)}
        
        <View style={styles.mediaContent}>
          <Text style={styles.title}>{item.media.title}</Text>
          <Text style={styles.meta}>{item.media.year} {item.media.genre}</Text>
          
          <View style={styles.footer}>
            <View style={[styles.badge, { backgroundColor: statusBadge.color }]}>
              <Text style={styles.badgeText}>{statusBadge.text}</Text>
            </View>
            {/* Indicateur visuel discret de la direction possible */}
            {currentTab === 'planned' && canRight && (
              <Text style={styles.swipeHint}>→</Text>
            )}
            {currentTab === 'completed' && canLeft && (
              <Text style={styles.swipeHint}>←</Text>
            )}
            {currentTab === 'watching' && (
              <Text style={styles.swipeHint}>
                {canLeft && canRight ? '← →' : canLeft ? '←' : canRight ? '→' : ''}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

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
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const statusOrder = ['planned', 'watching', 'completed'] as const;

  const handleImageError = (itemId: number) => {
    console.log(`[RoomScreen] Image error for item ${itemId}`);
    setImageErrors(prev => new Set([...prev, itemId]));
  };

  const retryImage = (itemId: number) => {
    console.log(`[RoomScreen] Retrying image for item ${itemId}`);
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  // Fonction pour naviguer vers les détails du média
  const handleViewMediaDetails = (item: WatchlistItem) => {
    navigation.navigate('Detail', { media: item.media, roomId });
  };

  const renderMediaPoster = (item: WatchlistItem) => {
    const hasImageError = imageErrors.has(item.id);
    const posterUrl = item.media.posterUrl;
    
    // Debug logs
    console.log(`[RoomScreen] renderMediaPoster for ${item.media.title}:`);
    console.log(`  - posterUrl: ${posterUrl}`);
    console.log(`  - hasImageError: ${hasImageError}`);
    console.log(`  - item.id: ${item.id}`);
    
    // Si on a une URL d'image et qu'il n'y a pas d'erreur, afficher l'image
    if (posterUrl && !hasImageError) {
      return (
        <View style={styles.poster}>
          <Image
            source={{ uri: posterUrl }}
            style={styles.posterImage}
            onError={() => handleImageError(item.id)}
            contentFit="cover"
          />
        </View>
      );
    }

    // Sinon, afficher le fallback emoji avec option de réessayer
    return (
      <View style={styles.poster}>
        <Text style={styles.posterEmoji}>
          {item.media.type === 'movie' ? '🎬' : 
           item.media.type === 'series' ? '📺' : '📚'}
        </Text>
        {hasImageError && posterUrl && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => retryImage(item.id)}
          >
            <Text style={styles.retryText}>↻</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
      console.log('Loading room data for roomId:', roomId);
      const room = await apiService.getRoom(roomId);
      console.log('Room loaded successfully:', room);
      setRoomName(room.name);
      setRoomCode(room.room_id);
    } catch (error) {
      console.error('Error loading room:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de la room');
    }
  };

  const loadWatchlistItems = async () => {
    try {
      console.log('Loading watchlist items for roomId:', roomId);
      const items = await apiService.getRoomItems(roomId);
      console.log('Watchlist items loaded successfully:', items);
      setWatchlistItems(items);
      // Réinitialiser les erreurs d'image quand on recharge les données
      setImageErrors(new Set());
    } catch (error) {
      console.error('Error loading watchlist items:', error);
      // En cas d'erreur, utiliser les données mock comme fallback
      console.log('Using mock data as fallback');
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

      // Log du changement sans modal
      const item = watchlistItems.find(item => item.id === itemId);
      if (item) {
        const statusLabels = {
          planned: 'À regarder',
          watching: 'En cours',
          completed: 'Terminé'
        };
        console.log(`[RoomScreen] Statut modifié: "${item.media.title}" déplacé vers "${statusLabels[newStatus]}"`);
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

  const renderMediaItem = (item: WatchlistItem) => (
    <MediaItemCard 
      key={item.id} 
      item={item} 
      onSwipe={handleSwipe} 
      statusOrder={statusOrder} 
      renderMediaPoster={renderMediaPoster} 
      currentTab={currentTab}
      onViewDetails={handleViewMediaDetails}
    />
  );

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
    overflow: 'hidden',
  },
  posterImage: {
    width: '100%',
    height: '100%',
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
  swipeHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    fontWeight: '600',
    marginLeft: SPACING.xs,
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
  touchableContent: {
    flexDirection: 'row',
    flex: 1,
  },
  retryButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default RoomScreen;
