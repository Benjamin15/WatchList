import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, WatchlistItem, Vote, FilterOptions } from '../types';
import { COLORS, SPACING, FONT_SIZES, MEDIA_STATUS } from '../constants';
import { apiService } from '../services/api';
import LoadingScreen from './LoadingScreen';
import FilterButton from '../components/FilterButton';
import FilterSidebar from '../components/FilterSidebar';

// Clé pour stocker les votes supprimés dans AsyncStorage (par room)
const getDismissedVotesStorageKey = (roomId: string) => `dismissedVotes_${roomId}`;

// Fonctions utilitaires pour la persistance des votes supprimés (par room)
const loadDismissedVotes = async (roomId: string): Promise<Set<number>> => {
  try {
    const stored = await AsyncStorage.getItem(getDismissedVotesStorageKey(roomId));
    if (stored) {
      const votesArray = JSON.parse(stored) as number[];
      return new Set(votesArray);
    }
  } catch (error) {
    console.error(`[RoomScreen] Erreur lors du chargement des votes supprimés pour room ${roomId}:`, error);
  }
  return new Set();
};

const saveDismissedVotes = async (roomId: string, dismissedVotes: Set<number>): Promise<void> => {
  try {
    const votesArray = Array.from(dismissedVotes);
    await AsyncStorage.setItem(getDismissedVotesStorageKey(roomId), JSON.stringify(votesArray));
    console.log(`[RoomScreen] ${votesArray.length} votes supprimés sauvegardés pour room ${roomId}`);
  } catch (error) {
    console.error(`[RoomScreen] Erreur lors de la sauvegarde des votes supprimés pour room ${roomId}:`, error);
  }
};

// Composant pour une notification de vote avec swipe-to-dismiss
interface VoteNotificationCardProps {
  vote: Vote;
  onPress: () => void;
  onDismiss: () => void;
  getVoteStatusText: (vote: Vote) => string;
  getVoteBadgeInfo: (vote: Vote) => { text: string; color: string };
  getVoteTimeRemaining: (vote: Vote) => string;
  getVoteEndTime: (vote: Vote) => string | null;
}

const VoteNotificationCard: React.FC<VoteNotificationCardProps> = ({
  vote,
  onPress,
  onDismiss,
  getVoteStatusText,
  getVoteBadgeInfo,
  getVoteTimeRemaining,
  getVoteEndTime
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handleGesture = (event: any) => {
    const { translationX } = event.nativeEvent;
    
    // Permettre seulement le swipe vers la gauche
    if (translationX < 0) {
      translateX.setValue(translationX);
    }
  };

  const handleGestureEnd = (event: any) => {
    const { translationX, velocityX } = event.nativeEvent;
    
    // Seuil pour déclencher la suppression (30% de la largeur ou vélocité élevée)
    const dismissThreshold = -120;
    const shouldDismiss = translationX < dismissThreshold || velocityX < -500;

    if (shouldDismiss) {
      // Animation de suppression
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -400,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss();
      });
    } else {
      // Retour à la position initiale
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  const badgeInfo = getVoteBadgeInfo(vote);

  return (
    <PanGestureHandler
      onGestureEvent={handleGesture}
      onHandlerStateChange={(event) => {
        if (event.nativeEvent.state === State.END) {
          handleGestureEnd(event);
        }
      }}
    >
      <Animated.View
        style={[
          styles.voteNotificationWrapper,
          {
            transform: [{ translateX }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.voteNotification}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={styles.voteNotificationHeader}>
            <View style={styles.voteNotificationTitle}>
              <Text style={styles.voteIcon}>🗳️</Text>
              <Text style={styles.voteTitle}>{getVoteStatusText(vote)}</Text>
            </View>
            <View style={[styles.voteBadge, { backgroundColor: badgeInfo.color }]}>
              <Text style={styles.voteBadgeText}>{badgeInfo.text}</Text>
            </View>
          </View>
          <Text style={styles.voteDescription}>
            <Text style={styles.voteDescriptionBold}>{vote.title}</Text> - {vote.createdBy} propose {vote.options.length} films
          </Text>
          <View style={styles.voteNotificationMeta}>
            <View style={styles.voteTimeInfo}>
              <Text style={styles.voteTimeRemaining}>
                ⏱️ {getVoteTimeRemaining(vote)}
              </Text>
              {getVoteEndTime(vote) && (
                <Text style={styles.voteEndTime}>
                  {getVoteEndTime(vote)}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Indicateur de swipe */}
        <View style={styles.swipeIndicator}>
          <Text style={styles.voteSwipeIndicatorText}>← Glisser pour supprimer</Text>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

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
  
  // Seuils pour le swipe (ultra-accessibles et très permissifs)
  const SWIPE_THRESHOLD = 15; // Réduit drastiquement de 25 à 15
  const SWIPE_VELOCITY_THRESHOLD = 0.08; // Réduit drastiquement de 0.15 à 0.08
  const VISUAL_FEEDBACK_THRESHOLD = 8; // Réduit de 10 à 8 pour feedback immédiat
  const RESISTANCE_THRESHOLD = 100; // Augmenté de 80 à 100 pour plus de tolérance
  const ACTIVATION_THRESHOLD = 0.5; // Réduit de 1 à 0.5 pour activation ultra-sensible
  
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
      
      // Activer dès le moindre mouvement horizontal significatif
      // - Mouvement horizontal > 0.5px ET
      // - (Mouvement horizontal > 20% du vertical OU mouvement horizontal > 2px OU mouvement purement horizontal)
      const shouldSet = horizontalMovement > ACTIVATION_THRESHOLD && 
        (horizontalMovement > verticalMovement * 0.2 || 
         horizontalMovement > 2 || 
         (horizontalMovement > 1 && verticalMovement < 3));
      
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
      // 2. (Distance > seuil ultra-bas OU vélocité > seuil ultra-bas OU distance > 10px avec vélocité minimum)
      const isValidSwipe = isSwipeAllowed(direction) && 
        (distance > SWIPE_THRESHOLD || 
         velocity > SWIPE_VELOCITY_THRESHOLD || 
         (distance > 10 && velocity > 0.03) || // Seuil ultra-bas pour gestes très lents
         (distance > 12 && velocity > 0.005)); // Seuil extrêmement bas pour gestes très intentionnels
      
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
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);
  
  // État pour les votes supprimés localement (swipe-to-dismiss)
  const [dismissedVotes, setDismissedVotes] = useState<Set<number>>(new Set());
  
  // État pour les votes cachés temporairement (disparaissent au reload de la room)
  const [temporarilyHiddenVotes, setTemporarilyHiddenVotes] = useState<Set<number>>(new Set());

  // FAB long press state
  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const LONG_PRESS_DURATION = 500;

  // États pour le filtrage et tri
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({
    type: 'all',
    genres: [],
    sortBy: 'none',
    sortDirection: 'desc',
  });
  const [filterSidebarVisible, setFilterSidebarVisible] = useState(false);

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
           (item.media.type === 'series' || item.media.type === 'tv') ? '📺' : '📚'}
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

  // Charger les votes supprimés sauvegardés au démarrage
  useEffect(() => {
    const loadSavedDismissedVotes = async () => {
      try {
        const savedDismissedVotes = await loadDismissedVotes(roomId);
        setDismissedVotes(savedDismissedVotes);
        console.log(`[RoomScreen] ${savedDismissedVotes.size} votes supprimés chargés depuis AsyncStorage pour room ${roomId}`);
      } catch (error) {
        console.error('[RoomScreen] Erreur lors du chargement des votes supprimés:', error);
      }
    };
    
    loadSavedDismissedVotes();
    
    // Réinitialiser les votes temporairement cachés à chaque changement de room
    setTemporarilyHiddenVotes(new Set());
    console.log(`[RoomScreen] Votes temporairement cachés réinitialisés pour room ${roomId}`);
  }, [roomId]); // Ajouter roomId en dépendance pour recharger lors du changement

  // Utiliser useFocusEffect pour recharger les données quand on revient sur cet écran
  useFocusEffect(
    useCallback(() => {
      loadWatchlistItems();
      loadVotes();
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

  // Nettoyer les votes supprimés anciens (votes qui ne sont plus affichables)
  const cleanupOldDismissedVotes = async (currentVotes: Vote[]) => {
    try {
      const currentDismissed = await loadDismissedVotes(roomId);
      const currentVoteIds = new Set(currentVotes.map(vote => vote.id));
      
      // Garder seulement les votes supprimés qui existent encore
      const validDismissedVotes = new Set(
        Array.from(currentDismissed).filter(voteId => currentVoteIds.has(voteId))
      );
      
      // Si des votes ont été nettoyés, sauvegarder la nouvelle liste
      if (validDismissedVotes.size !== currentDismissed.size) {
        await saveDismissedVotes(roomId, validDismissedVotes);
        setDismissedVotes(validDismissedVotes);
        console.log(`[RoomScreen] Nettoyage: ${currentDismissed.size - validDismissedVotes.size} votes supprimés anciens retirés pour room ${roomId}`);
      } else {
        setDismissedVotes(currentDismissed);
      }
    } catch (error) {
      console.error('[RoomScreen] Erreur lors du nettoyage des votes supprimés:', error);
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

  const loadVotes = async () => {
    try {
      setLoadingVotes(true);
      const votesData = await apiService.getVotesByRoom(roomId);
      setVotes(votesData);
      
      // Réinitialiser les votes cachés temporairement (ils réapparaissent)
      setTemporarilyHiddenVotes(new Set());
      console.log('[RoomScreen] Votes cachés temporairement réinitialisés - ils réapparaissent');
      
      // Nettoyer les votes supprimés anciens après chargement
      await cleanupOldDismissedVotes(votesData);
    } catch (error) {
      console.error('Error loading votes:', error);
      // En cas d'erreur, on continue sans votes
      setVotes([]);
    } finally {
      setLoadingVotes(false);
    }
  };

  // Fonctions pour le FAB avec appui long
  const handleFabPress = () => {
    if (!longPressActive) {
      // Clic normal - naviguer vers la recherche
      navigation.navigate('Search', { roomId });
    }
  };

  const handleFabLongPressStart = () => {
    setLongPressActive(false);
    longPressTimer.current = setTimeout(() => {
      setLongPressActive(true);
      setFabMenuVisible(true);
    }, LONG_PRESS_DURATION);
  };

  const handleFabLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const closeFabMenu = () => {
    setFabMenuVisible(false);
  };

  const handleCreateVote = () => {
    // Vérifier s'il y a déjà un vote actif
    if (hasActiveVote()) {
      Alert.alert(
        'Vote actif existant',
        'Il y a déjà un vote en cours dans cette room. Attendez qu\'il se termine pour en créer un nouveau.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    closeFabMenu();
    navigation.navigate('CreateVote', { roomId });
  };

  const handleAddMedia = () => {
    closeFabMenu();
    navigation.navigate('Search', { roomId });
  };

  const handleVotePress = (vote: Vote) => {
    navigation.navigate('VoteDetail', { voteId: vote.id, roomId });
  };

  // Vérifier si un média est dans un vote actif
  const isMediaInActiveVote = (mediaId: number) => {
    return votes.some(vote => 
      vote.status === 'active' && 
      vote.options.some(option => option.mediaId === mediaId)
    );
  };

  // Vérifier s'il y a un vote actif dans la room
  const hasActiveVote = () => {
    const now = new Date();
    return votes.some(vote => {
      // Vérifier le statut
      if (vote.status !== 'active') {
        return false;
      }
      
      // Si le vote a une date de fin, vérifier qu'elle n'est pas passée
      if (vote.endsAt) {
        const endsAt = new Date(vote.endsAt);
        return endsAt > now;
      }
      
      // Pas de date de fin = vote permanent actif
      return true;
    });
  };

  // Obtenir les votes à afficher (actifs et récemment terminés, non supprimés)
  const getDisplayableVotes = () => {
    return votes.filter(vote => {
      // Ne pas afficher les votes supprimés définitivement (expirés)
      if (dismissedVotes.has(vote.id)) return false;
      
      // Ne pas afficher les votes cachés temporairement
      if (temporarilyHiddenVotes.has(vote.id)) return false;
      
      // Afficher les votes actifs
      if (vote.status === 'active') return true;
      
      // Afficher les votes récemment terminés (moins de 24h)
      if (vote.status === 'completed' || vote.status === 'expired') {
        const voteEndTime = vote.endsAt ? new Date(vote.endsAt) : new Date(vote.createdAt);
        const now = new Date();
        const diffHours = (now.getTime() - voteEndTime.getTime()) / (1000 * 60 * 60);
        return diffHours < 24; // Afficher pendant 24h après la fin
      }
      
      return false;
    });
  };

  // Supprimer une notification de vote (logique différenciée selon le statut)
  const dismissVoteNotification = async (voteId: number) => {
    // Trouver le vote correspondant
    const vote = votes.find(v => v.id === voteId);
    if (!vote) return;
    
    // Si le vote est expiré, le supprimer définitivement
    if (vote.status === 'expired') {
      const newDismissedVotes = new Set([...dismissedVotes, voteId]);
      setDismissedVotes(newDismissedVotes);
      
      // Sauvegarder dans AsyncStorage pour persistance
      await saveDismissedVotes(roomId, newDismissedVotes);
      
      console.log(`[RoomScreen] Vote expiré ${voteId} supprimé définitivement pour room ${roomId}`);
    } else {
      // Pour les votes actifs ou terminés, les cacher temporairement (réapparaîtront au reload)
      const newTemporarilyHidden = new Set([...temporarilyHiddenVotes, voteId]);
      setTemporarilyHiddenVotes(newTemporarilyHidden);
      
      console.log(`[RoomScreen] Vote ${vote.status} ${voteId} caché temporairement dans room ${roomId} (réapparaîtra au reload)`);
    }
  };

  // Obtenir le texte de statut du vote
  const getVoteStatusText = (vote: Vote) => {
    switch (vote.status) {
      case 'active':
        return 'Vote en cours';
      case 'completed':
        return 'Vote terminé';
      case 'expired':
        return 'Vote expiré';
      default:
        return 'Vote en cours';
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getVoteBadgeInfo = (vote: Vote) => {
    switch (vote.status) {
      case 'active':
        return { text: 'EN COURS', color: '#4CAF50' };
      case 'completed':
        return { text: 'TERMINÉ', color: '#2196F3' };
      case 'expired':
        return { text: 'EXPIRÉ', color: '#FF9800' };
      default:
        return { text: 'EN COURS', color: '#4CAF50' };
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
    let filteredItems = watchlistItems.filter(item => item.status === currentTab);

    // Filtrer par type
    if (appliedFilters.type !== 'all') {
      // Mapper le type de filtre vers le type de données stockées
      const typeToMatch = appliedFilters.type === 'series' ? 'tv' : appliedFilters.type;
      filteredItems = filteredItems.filter(item => item.media.type === typeToMatch);
    }

    // Filtrer par genres (si des genres sont sélectionnés)
    if (appliedFilters.genres.length > 0) {
      filteredItems = filteredItems.filter(item => {
        if (!item.media.genre) return false;
        const itemGenres = item.media.genre.toLowerCase();
        return appliedFilters.genres.some(genre => itemGenres.includes(genre));
      });
    }

    // Trier seulement si un tri est sélectionné
    if (appliedFilters.sortBy !== 'none') {
      filteredItems.sort((a, b) => {
        let comparison = 0;

        switch (appliedFilters.sortBy) {
          case 'title':
            comparison = a.media.title.localeCompare(b.media.title);
            break;
          case 'year':
            const yearA = a.media.year || 0;
            const yearB = b.media.year || 0;
            comparison = yearA - yearB;
            break;
          case 'rating':
            const ratingA = a.media.rating || 0;
            const ratingB = b.media.rating || 0;
            comparison = ratingA - ratingB;
            break;
          case 'date_added':
            const dateA = new Date(a.addedAt).getTime();
            const dateB = new Date(b.addedAt).getTime();
            comparison = dateA - dateB;
            break;
          case 'duration':
            // Durée : on peut estimer selon le type de média
            // Films: ~120min, Séries: ~45min par épisode
            const getDuration = (item: WatchlistItem) => {
              if (item.media.type === 'movie') {
                return 120; // Minutes par défaut pour un film
              } else if (item.media.type === 'series' || item.media.type === 'tv') {
                return 45; // Minutes par épisode pour une série
              }
              return 30; // Défaut pour autres types
            };
            const durationA = getDuration(a);
            const durationB = getDuration(b);
            comparison = durationA - durationB;
            break;
          case 'popularity':
            // Popularité : on peut utiliser la note comme proxy
            // ou implémenter un vrai système de popularité plus tard
            const popA = a.media.rating || 0;
            const popB = b.media.rating || 0;
            comparison = popA - popB;
            break;
          default:
            // Pas de tri pour 'none' ou cas non géré
            comparison = 0;
        }

        return appliedFilters.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filteredItems;
  };

  // Compter le nombre de filtres actifs pour le badge
  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (appliedFilters.type !== 'all') count++;
    count += appliedFilters.genres.length;
    if (appliedFilters.sortBy !== 'none') count++; // Compter le tri seulement s'il est actif
    return count;
  };

  // Gestionnaire pour ouvrir le sidebar de filtrage
  const handleOpenFilterSidebar = () => {
    console.log('[RoomScreen] Ouverture du sidebar de filtrage...');
    setFilterSidebarVisible(true);
  };

  // Gestionnaires pour le sidebar de filtrage
  const handleCloseFilterSidebar = () => {
    setFilterSidebarVisible(false);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    console.log('[RoomScreen] Application des filtres:', newFilters);
    setAppliedFilters(newFilters);
    setFilterSidebarVisible(false);
  };

  const handleResetFilters = () => {
    console.log('[RoomScreen] Réinitialisation des filtres');
    const defaultFilters: FilterOptions = {
      type: 'all',
      genres: [],
      sortBy: 'none',
      sortDirection: 'desc',
    };
    setAppliedFilters(defaultFilters);
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
      {/* Notification de vote */}
      {getDisplayableVotes().length > 0 && (
        <View style={styles.voteNotificationContainer}>
          {getDisplayableVotes().map((vote) => (
            <VoteNotificationCard
              key={vote.id}
              vote={vote}
              onPress={() => handleVotePress(vote)}
              onDismiss={() => dismissVoteNotification(vote.id)}
              getVoteStatusText={getVoteStatusText}
              getVoteBadgeInfo={getVoteBadgeInfo}
              getVoteTimeRemaining={getVoteTimeRemaining}
              getVoteEndTime={getVoteEndTime}
            />
          ))}
        </View>
      )}

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
        {filteredItems.length > 0 ? (
          filteredItems.map(renderMediaItem)
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
      
      {/* Menu contextuel du FAB */}
      {fabMenuVisible && (
        <TouchableOpacity 
          style={styles.fabMenuOverlay}
          onPress={closeFabMenu}
          activeOpacity={1}
        />
      )}
      
      {fabMenuVisible && (
        <View style={styles.fabMenu}>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={handleAddMedia}
          >
            <Text style={styles.fabMenuIcon}>🎬</Text>
            <View style={styles.fabMenuTextContainer}>
              <Text style={styles.fabMenuText}>Ajouter un média</Text>
              <Text style={styles.fabMenuDescription}>Film ou série</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.fabMenuItem,
              hasActiveVote() && styles.fabMenuItemDisabled
            ]}
            onPress={handleCreateVote}
            disabled={hasActiveVote()}
          >
            <Text style={[
              styles.fabMenuIcon,
              hasActiveVote() && styles.fabMenuIconDisabled
            ]}>🗳️</Text>
            <View style={styles.fabMenuTextContainer}>
              <Text style={[
                styles.fabMenuText,
                hasActiveVote() && styles.fabMenuTextDisabled
              ]}>Créer un vote</Text>
              <Text style={[
                styles.fabMenuDescription,
                hasActiveVote() && styles.fabMenuDescriptionDisabled
              ]}>
                {hasActiveVote() ? 'Vote en cours...' : 'Proposer des films'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Bouton flottant pour ajouter des médias avec appui long */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleFabPress}
        onPressIn={handleFabLongPressStart}
        onPressOut={handleFabLongPressEnd}
        onLongPress={() => {}} // Désactiver le long press natif
        delayLongPress={LONG_PRESS_DURATION}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Bouton de filtrage */}
      <FilterButton 
        onPress={handleOpenFilterSidebar}
        activeFiltersCount={getActiveFiltersCount()}
      />

      {/* Sidebar de filtrage */}
      <FilterSidebar 
        visible={filterSidebarVisible}
        options={appliedFilters}
        onClose={handleCloseFilterSidebar}
        onApply={handleApplyFilters}
        resultsCount={filteredItems.length}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Vote notification styles
  voteNotificationContainer: {
    margin: SPACING.md,
  },
  voteNotification: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  voteNotificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  voteNotificationTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  voteIcon: {
    fontSize: FONT_SIZES.lg,
  },
  voteTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.onError,
  },
  voteBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  voteBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.onError,
  },
  voteDescription: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.sm,
  },
  voteDescriptionBold: {
    fontWeight: '600',
  },
  voteNotificationMeta: {
    flexDirection: 'column',
    gap: 8,
  },
  voteTimeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteTimeRemaining: {
    fontSize: FONT_SIZES.sm,
    color: '#FFE082',
    fontWeight: '600',
  },
  voteEndTime: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  voteMetaText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  voteNotificationWrapper: {
    position: 'relative',
  },
  swipeIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    opacity: 0.7,
  },
  voteSwipeIndicatorText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
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
    zIndex: 1000,
  },
  fabText: {
    fontSize: 24,
    color: COLORS.onPrimary,
    fontWeight: 'bold',
  },
  // FAB Menu styles
  fabMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  fabMenu: {
    position: 'absolute',
    bottom: 80,
    right: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    zIndex: 999,
    minWidth: 180,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  fabMenuIcon: {
    fontSize: FONT_SIZES.lg,
    width: 20,
    textAlign: 'center',
  },
  fabMenuTextContainer: {
    flex: 1,
  },
  fabMenuText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  fabMenuDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.placeholder,
    marginTop: 2,
  },
  fabMenuItemDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  fabMenuIconDisabled: {
    opacity: 0.5,
  },
  fabMenuTextDisabled: {
    opacity: 0.5,
  },
  fabMenuDescriptionDisabled: {
    opacity: 0.5,
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
    fontSize: 12,
    color: COLORS.onPrimary,
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
});

/**
 * Calcule le temps restant pour un vote
 */
const getVoteTimeRemaining = (vote: Vote) => {
  if (!vote.endsAt) {
    return 'Permanent';
  }

  const now = new Date();
  const endsAt = new Date(vote.endsAt);
  const diffMs = endsAt.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Expiré';
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 24) {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}j ${diffHours % 24}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
};

/**
 * Formate l'heure de fin d'un vote
 */
const getVoteEndTime = (vote: Vote) => {
  if (!vote.endsAt) {
    return null;
  }

  const endsAt = new Date(vote.endsAt);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeString = endsAt.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  if (endsAt.toDateString() === today.toDateString()) {
    return `Fin aujourd'hui à ${timeString}`;
  } else if (endsAt.toDateString() === tomorrow.toDateString()) {
    return `Fin demain à ${timeString}`;
  } else {
    return `Fin le ${endsAt.toLocaleDateString('fr-FR')} à ${timeString}`;
  }
};

export default RoomScreen;
