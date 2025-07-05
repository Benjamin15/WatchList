import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, PanResponder, Animated, Share } from 'react-native';
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
  
  // Seuils pour le swipe (ultra-ultra accessibles)
  const SWIPE_THRESHOLD = 25; // Réduit drastiquement de 40 à 25
  const SWIPE_VELOCITY_THRESHOLD = 0.15; // Réduit drastiquement de 0.3 à 0.15
  const VISUAL_FEEDBACK_THRESHOLD = 10; // Réduit de 20 à 10 pour feedback immédiat
  const RESISTANCE_THRESHOLD = 80; // Augmenté de 60 à 80 pour plus de tolérance
  const ACTIVATION_THRESHOLD = 1; // Nouveau seuil ultra-bas pour activation
  
  // Reset animation avec spring plus fluide et plus rapide
  const resetAnimation = () => {
    Animated.parallel([
      Animated.spring(translateX, { 
        toValue: 0, 
        useNativeDriver: true,
        tension: 150, // Augmenté pour plus de réactivité
        friction: 10, // Augmenté pour moins de rebond
      }),
      Animated.spring(opacity, { 
        toValue: 1, 
        useNativeDriver: true,
        tension: 150,
        friction: 10,
      }),
      Animated.spring(scale, { 
        toValue: 1, 
        useNativeDriver: true,
        tension: 150,
        friction: 10,
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
      // Condition ultra-permissive pour activer le pan responder
      const horizontalMovement = Math.abs(gestureState.dx);
      const verticalMovement = Math.abs(gestureState.dy);
      
      // Activer si mouvement horizontal > 1px ET (mouvement horizontal > 30% du vertical OU mouvement horizontal > 3px)
      const shouldSet = horizontalMovement > ACTIVATION_THRESHOLD && 
        (horizontalMovement > verticalMovement * 0.3 || horizontalMovement > 3);
      
      console.log('[PanResponder] onMoveShouldSetPanResponder:', { 
        dx: gestureState.dx, 
        dy: gestureState.dy, 
        horizontalMovement,
        verticalMovement,
        shouldSet,
        activationThreshold: ACTIVATION_THRESHOLD
      });
      return shouldSet;
    },
    onPanResponderGrant: () => {
      console.log('[PanResponder] onPanResponderGrant - Geste commencé');
      // Feedback visuel immédiat ultra-marqué
      Animated.spring(scale, {
        toValue: 0.99,
        useNativeDriver: true,
        tension: 400,
        friction: 12,
      }).start();
    },
    onPanResponderMove: (evt, gestureState) => {
      const direction = gestureState.dx > 0 ? 'right' : 'left';
      const distance = Math.abs(gestureState.dx);
      
      // Limiter le mouvement selon les règles de l'onglet avec résistance très douce
      if (!isSwipeAllowed(direction)) {
        // Résistance progressive ultra-douce avec limite étendue
        const resistance = Math.sign(gestureState.dx) * Math.min(Math.abs(gestureState.dx) * 0.2, RESISTANCE_THRESHOLD);
        translateX.setValue(resistance);
        
        // Feedback visuel de résistance très subtil
        const resistancePercent = Math.min(Math.abs(resistance) / RESISTANCE_THRESHOLD, 1);
        scale.setValue(1 - resistancePercent * 0.01);
        opacity.setValue(1 - resistancePercent * 0.05);
        return;
      }
      
      // Mouvement fluide pour les directions autorisées
      translateX.setValue(gestureState.dx);
      
      // Effets visuels progressifs avec feedback de validation ultra-précoce
      const dragPercent = Math.min(distance / 80, 1); // Réduit de 100 à 80
      const willValidate = distance > VISUAL_FEEDBACK_THRESHOLD;
      
      // Scale effect avec feedback de validation ultra-marqué
      const targetScale = willValidate ? 
        Math.max(0.85, 1 - dragPercent * 0.15) : // Beaucoup plus marqué si va valider
        Math.max(0.98, 1 - dragPercent * 0.02);  // Très subtil sinon
      scale.setValue(targetScale);
      
      // Opacity effect avec feedback de validation ultra-marqué
      const targetOpacity = willValidate ?
        Math.max(0.5, 1 - dragPercent * 0.5) :   // Beaucoup plus transparent si va valider
        Math.max(0.95, 1 - dragPercent * 0.05);  // Très subtil sinon
      opacity.setValue(targetOpacity);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const direction = gestureState.dx > 0 ? 'right' : 'left';
      const distance = Math.abs(gestureState.dx);
      const velocity = Math.abs(gestureState.vx);
      
      console.log('[PanResponder] onPanResponderRelease:', { 
        direction, 
        distance, 
        velocity,
        threshold: SWIPE_THRESHOLD,
        velocityThreshold: SWIPE_VELOCITY_THRESHOLD,
        isAllowed: isSwipeAllowed(direction),
        currentStatus: item.status,
        currentTab
      });
      
      // Valider le swipe si:
      // 1. Direction autorisée ET
      // 2. (Distance > seuil ultra-bas OU vélocité > seuil ultra-bas OU distance > 15px avec vélocité minimum)
      const isValidSwipe = isSwipeAllowed(direction) && 
        (distance > SWIPE_THRESHOLD || 
         velocity > SWIPE_VELOCITY_THRESHOLD || 
         (distance > 15 && velocity > 0.05) || // Seuil ultra-bas pour gestes très lents
         (distance > 20 && velocity > 0.01)); // Seuil extrêmement bas pour gestes très intentionnels
      
      if (isValidSwipe) {
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
      {/* Indicateurs de swipe à gauche et à droite avec seuils ultra-bas */}
      <Animated.View style={[
        styles.swipeIndicatorLeft,
        {
          opacity: translateX.interpolate({
            inputRange: [-40, -8, 0],
            outputRange: [1, 0.2, 0],
            extrapolate: 'clamp',
          }),
          transform: [{
            scale: translateX.interpolate({
              inputRange: [-40, -8, 0],
              outputRange: [1.3, 0.7, 0.4],
              extrapolate: 'clamp',
            })
          }]
        }
      ]}>
        {canLeft && (
          <>
            <Text style={styles.swipeIndicatorIcon}>←</Text>
            <Text style={styles.swipeIndicatorText}>
              {statusOrder[statusOrder.indexOf(item.status as any) - 1] === 'planned' ? 'À regarder' :
               statusOrder[statusOrder.indexOf(item.status as any) - 1] === 'watching' ? 'En cours' : 'Terminé'}
            </Text>
          </>
        )}
      </Animated.View>
      
      <Animated.View style={[
        styles.swipeIndicatorRight,
        {
          opacity: translateX.interpolate({
            inputRange: [0, 8, 40],
            outputRange: [0, 0.2, 1],
            extrapolate: 'clamp',
          }),
          transform: [{
            scale: translateX.interpolate({
              inputRange: [0, 8, 40],
              outputRange: [0.4, 0.7, 1.3],
              extrapolate: 'clamp',
            })
          }]
        }
      ]}>
        {canRight && (
          <>
            <Text style={styles.swipeIndicatorIcon}>→</Text>
            <Text style={styles.swipeIndicatorText}>
              {statusOrder[statusOrder.indexOf(item.status as any) + 1] === 'planned' ? 'À regarder' :
               statusOrder[statusOrder.indexOf(item.status as any) + 1] === 'watching' ? 'En cours' : 'Terminé'}
            </Text>
          </>
        )}
      </Animated.View>

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
            {/* Indicateur visuel permanent plus visible */}
            <View style={styles.swipeHintContainer}>
              {currentTab === 'planned' && canRight && (
                <Text style={styles.swipeHintPermanent}>👉 Glisser</Text>
              )}
              {currentTab === 'completed' && canLeft && (
                <Text style={styles.swipeHintPermanent}>👈 Glisser</Text>
              )}
              {currentTab === 'watching' && (
                <Text style={styles.swipeHintPermanent}>
                  {canLeft && canRight ? '👈 👉 Glisser' : canLeft ? '👈 Glisser' : canRight ? '👉 Glisser' : ''}
                </Text>
              )}
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

  // Fonction pour partager la room
  const handleShareRoom = async () => {
    try {
      const shareContent = {
        title: 'Rejoignez ma WatchList !',
        message: `🎬 Rejoignez ma room "${roomName}" !\n\nCode d'accès : ${roomCode}\n\nPartagez et découvrez des films et séries ensemble ! 🍿`,
        url: `watchlist://room/${roomCode}`, // Deep link pour ouvrir directement la room
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        console.log('Room partagée avec succès');
      } else if (result.action === Share.dismissedAction) {
        console.log('Partage annulé');
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      Alert.alert('Erreur', 'Impossible de partager la room');
    }
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
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShareRoom}
        >
          <Text style={styles.shareButtonIcon}>📤</Text>
        </TouchableOpacity>
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
            💡 Glissez un média horizontalement pour changer son statut (seuil réduit pour plus de facilité)
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
    alignItems: 'flex-end',
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
  shareButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  shareButtonIcon: {
    fontSize: 18,
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
  swipeIndicatorLeft: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -30 }],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    zIndex: 1,
  },
  swipeIndicatorRight: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -30 }],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    zIndex: 1,
  },
  swipeIndicatorIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  swipeIndicatorText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 70,
    lineHeight: 12,
  },
  swipeHintContainer: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  swipeHintPermanent: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    opacity: 0.8,
  },
});

export default RoomScreen;
