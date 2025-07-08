import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, PanResponder, Animated, Share } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, WatchlistItem, Vote, FilterOptions } from '../types';
import { COLORS, SPACING, FONT_SIZES, MEDIA_STATUS } from '../constants';
import { apiService } from '../services/api';
import LoadingScreen from './LoadingScreen';
import FilterButton from '../components/FilterButton';
import FilterSidebar from '../components/FilterSidebar';
import SettingsSidebar from '../components/SettingsSidebar';
import MediaPoster from '../components/MediaPoster';
import { translateStatus } from '../utils/translations';
import { useLanguage } from '../hooks/useLanguage';
import { useTranslatedTitle } from '../hooks/useTranslatedTitle';

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
  const { t } = useTranslation();
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
            <Text style={styles.voteDescriptionBold}>{vote.title}</Text> - {vote.createdBy} {t('vote.proposesMovies', { count: vote.options.length })}
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
  onViewDetails,
  currentLanguage
}: { 
  item: WatchlistItem; 
  onSwipe: (id: number, direction: 'left' | 'right') => void;
  statusOrder: readonly string[];
  renderMediaPoster: (item: WatchlistItem) => React.ReactNode;
  currentTab: string;
  onViewDetails: (item: WatchlistItem) => void;
  currentLanguage: string;
}) => {
  // Récupérer le titre traduit (seulement pour les films et séries avec TMDB ID)
  const shouldTranslate = item.media.type !== 'manga' && item.media.tmdbId;
  const { title: translatedTitle } = useTranslatedTitle(
    shouldTranslate ? item.media.tmdbId : undefined,
    item.media.type === 'tv' ? 'series' : item.media.type as 'movie' | 'series',
    item.media.title
  );

  // Mapper les statuts mobiles vers les statuts backend pour la traduction
  const statusMapping: Record<string, string> = {
    'planned': 'a_voir',
    'watching': 'en_cours',
    'completed': 'vu'
  };

  const getTranslatedStatus = (status: string) => {
    const backendStatus = statusMapping[status] || status;
    return translateStatus(backendStatus, currentLanguage);
  };

  const statusConfig = {
    planned: { text: getTranslatedStatus('planned'), color: MEDIA_STATUS.planned.color },
    watching: { text: getTranslatedStatus('watching'), color: MEDIA_STATUS.watching.color },
    completed: { text: getTranslatedStatus('completed'), color: MEDIA_STATUS.completed.color },
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
              {statusOrder[statusOrder.indexOf(item.status as any) - 1] === 'planned' ? getTranslatedStatus('planned') :
               statusOrder[statusOrder.indexOf(item.status as any) - 1] === 'watching' ? getTranslatedStatus('watching') : getTranslatedStatus('completed')}
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
              {statusOrder[statusOrder.indexOf(item.status as any) + 1] === 'planned' ? getTranslatedStatus('planned') :
               statusOrder[statusOrder.indexOf(item.status as any) + 1] === 'watching' ? getTranslatedStatus('watching') : getTranslatedStatus('completed')}
            </Text>
          </>
        )}
      </Animated.View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onViewDetails(item)}
        style={styles.touchableContent}
      >
        {renderMediaPoster(item)}
        
        <View style={styles.mediaContent}>
          <Text style={styles.title}>{translatedTitle}</Text>
          <Text style={styles.meta}>{item.media.genre}</Text>
          
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
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
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
  
  // État pour le sidebar des paramètres
  const [settingsSidebarVisible, setSettingsSidebarVisible] = useState(false);

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

  // Fonction pour rendre l'affiche du média
  const renderMediaPoster = (item: WatchlistItem) => (
    <MediaPoster
      mediaType={item.media.type === 'tv' ? 'series' : item.media.type}
      posterUrl={item.media.posterUrl}
      size="small"
    />
  );

  /**
   * Formate l'heure de fin d'un vote avec traductions
   */
  const getVoteEndTimeFormatted = (vote: Vote) => {
    if (!vote.endsAt) {
      return null;
    }

    const endsAt = new Date(vote.endsAt);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeString = endsAt.toLocaleTimeString(currentLanguage === 'fr' ? 'fr-FR' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (endsAt.toDateString() === today.toDateString()) {
      return t('vote.endsToday', { time: timeString });
    } else if (endsAt.toDateString() === tomorrow.toDateString()) {
      return t('vote.endsTomorrow', { time: timeString });
    } else {
      return t('vote.endsOn', { 
        date: endsAt.toLocaleDateString(currentLanguage === 'fr' ? 'fr-FR' : 'en-US'), 
        time: timeString 
      });
    }
  };

  // Configuration des boutons du header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 8, marginRight: 8 }}>
          {/* Bouton de partage */}
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.1)',
            }}
            onPress={() => {
              const shareContent = {
                message: t('room.shareMessage', { roomName, roomCode }),
                title: t('room.shareTitle'),
              };
              
              Share.share(shareContent).catch((error) => {
                console.error('Erreur lors du partage:', error);
                Alert.alert('Erreur', 'Impossible de partager la room');
              });
            }}
          >
            <Text style={{ fontSize: 18 }}>📤</Text>
          </TouchableOpacity>
          
          {/* Bouton Settings */}
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.1)',
            }}
            onPress={() => setSettingsSidebarVisible(true)}
          >
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, roomName, roomCode]);

  const loadRoomData = async () => {
    try {
      console.log('Loading room data for roomId:', roomId);
      const room = await apiService.getRoom(roomId);
      console.log('Room loaded successfully:', room);
      setRoomName(room.name);
      setRoomCode(room.room_id);
    } catch (error) {
      console.error('Error loading room:', error);
      Alert.alert(t('common.error'), t('room.errorLoadingRoom'));
    }
  };

  const loadWatchlistItems = async () => {
    try {
      console.log('Loading watchlist items for roomId:', roomId);
      console.log('RoomId type:', typeof roomId);
      
      const response = await apiService.getWatchlist(roomId);
      console.log('Watchlist loaded successfully:', response.data.length, 'items');
      setWatchlistItems(response.data);
    } catch (error) {
      console.error('Error loading watchlist:', error);
      console.error('Error details:', {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
        roomId: roomId
      });
      Alert.alert(t('common.error'), t('room.errorLoadingWatchlist'));
    }
  };

  const loadVotes = async () => {
    try {
      console.log('Loading votes for roomId:', roomId);
      setLoadingVotes(true);
      const votesData = await apiService.getVotesByRoom(roomId);
      console.log('Votes loaded successfully:', votesData.length, 'votes');
      setVotes(votesData);
      
      // Charger les votes supprimés depuis le stockage local
      const dismissed = await loadDismissedVotes(roomId);
      setDismissedVotes(dismissed);
    } catch (error) {
      console.error('Error loading votes:', error);
      // Ne pas afficher d'erreur pour les votes car ce n'est pas critique
    } finally {
      setLoadingVotes(false);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadRoomData(),
        loadWatchlistItems(),
        loadVotes()
      ]);
    } catch (error) {
      console.error('Error loading room data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [roomId]);

  // Recharger les données quand l'écran retrouve le focus
  useFocusEffect(
    useCallback(() => {
      // Recharger seulement les votes et la watchlist, pas les données de base de la room
      loadWatchlistItems();
      loadVotes();
    }, [roomId])
  );

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

  /**
   * Calcule le temps restant pour un vote
   */
  const getVoteTimeRemaining = (vote: Vote) => {
    if (!vote.endsAt) {
      return t('vote.permanent');
    }

    const now = new Date();
    const endsAt = new Date(vote.endsAt);
    const diffMs = endsAt.getTime() - now.getTime();

    if (diffMs <= 0) {
      return t('vote.expired');
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}${t('common.days')} ${diffHours % 24}${t('common.hours')}`;
    } else if (diffHours > 0) {
      return `${diffHours}${t('common.hours')} ${diffMinutes}${t('common.minutes')}`;
    } else {
      return `${diffMinutes}${t('common.minutes')}`;
    }
  };

  // Fonction pour vérifier s'il y a un vote actif
  const hasActiveVote = () => {
    return votes.some(vote => {
      if (!vote.endsAt) return true; // Vote permanent
      const now = new Date();
      const endsAt = new Date(vote.endsAt);
      return endsAt.getTime() > now.getTime();
    });
  };

  // Fonction pour obtenir les votes affichables (non supprimés)
  const getDisplayableVotes = () => {
    return votes.filter(vote => 
      !dismissedVotes.has(vote.id) && 
      !temporarilyHiddenVotes.has(vote.id)
    );
  };

  // Fonction pour supprimer une notification de vote
  const dismissVoteNotification = async (voteId: number) => {
    console.log(`[RoomScreen] Suppression du vote ${voteId}`);
    
    // Ajouter aux votes supprimés localement
    const newDismissedVotes = new Set(dismissedVotes);
    newDismissedVotes.add(voteId);
    setDismissedVotes(newDismissedVotes);
    
    try {
      // Sauvegarder dans AsyncStorage pour persistance
      await saveDismissedVotes(roomId, newDismissedVotes);
    } catch (error) {
      console.error('[RoomScreen] Erreur lors de la sauvegarde des votes supprimés:', error);
    }
  };

  // Fonction pour obtenir le texte de statut d'un vote
  const getVoteStatusText = (vote: Vote) => {
    if (!vote.endsAt) {
      return t('vote.active');
    }
    
    const now = new Date();
    const endsAt = new Date(vote.endsAt);
    
    if (endsAt.getTime() <= now.getTime()) {
      return t('vote.completed');
    }
    
    return t('vote.active');
  };

  // Fonction pour obtenir les informations de badge d'un vote
  const getVoteBadgeInfo = (vote: Vote) => {
    if (!vote.endsAt) {
      return { text: t('vote.activeLabel'), color: '#4CAF50' };
    }
    
    const now = new Date();
    const endsAt = new Date(vote.endsAt);
    
    if (endsAt.getTime() <= now.getTime()) {
      return { text: t('vote.completedLabel'), color: '#FF9800' };
    }
    
    return { text: t('vote.activeLabel'), color: '#4CAF50' };
  };

  // Fonction pour filtrer les éléments de la watchlist
  const getFilteredItems = () => {
    let filtered = watchlistItems.filter(item => item.status === currentTab);

    // Appliquer les filtres
    if (appliedFilters.type !== 'all') {
      filtered = filtered.filter(item => {
        if (appliedFilters.type === 'movie') return item.media.type === 'movie';
        if (appliedFilters.type === 'series') return item.media.type === 'tv' || item.media.type === 'series';
        return true;
      });
    }

    if (appliedFilters.genres && appliedFilters.genres.length > 0) {
      filtered = filtered.filter(item => 
        item.media.genre && 
        appliedFilters.genres?.includes(item.media.genre)
      );
    }

    // Appliquer le tri
    if (appliedFilters.sortBy !== 'none') {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (appliedFilters.sortBy) {
          case 'title':
            comparison = a.media.title.localeCompare(b.media.title);
            break;
          case 'year':
            comparison = (a.media.year || 0) - (b.media.year || 0);
            break;
          case 'rating':
            comparison = (a.media.rating || 0) - (b.media.rating || 0);
            break;
          case 'date_added':
            comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
            break;
          default:
            break;
        }
        
        return appliedFilters.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  };

  // Fonction pour rendre un élément de média avec gestures
  const renderMediaItem = (item: WatchlistItem) => (
    <MediaItemCard
      key={item.id}
      item={item}
      onSwipe={handleSwipe}
      statusOrder={['planned', 'watching', 'completed']}
      renderMediaPoster={renderMediaPoster}
      currentTab={currentTab}
      onViewDetails={handleViewMediaDetails}
      currentLanguage={currentLanguage}
    />
  );

  // Fonction pour rendre l'état vide
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyTitle}>{t('room.noMedia')}</Text>
      <Text style={styles.emptyMessage}>
        {currentTab === 'planned' && t('room.emptyPlanned')}
        {currentTab === 'watching' && t('room.emptyWatching')}
        {currentTab === 'completed' && t('room.emptyCompleted')}
      </Text>
    </View>
  );

  // Fonctions pour la gestion des filtres
  const getActiveFiltersCount = () => {
    let count = 0;
    if (appliedFilters.type !== 'all') count++;
    if (appliedFilters.genres && appliedFilters.genres.length > 0) count++;
    if (appliedFilters.sortBy !== 'none') count++;
    return count;
  };

  const handleOpenFilterSidebar = () => {
    setFilterSidebarVisible(true);
  };

  const handleCloseFilterSidebar = () => {
    setFilterSidebarVisible(false);
  };

  const handleApplyFilters = (filters: FilterOptions) => {
    setAppliedFilters(filters);
    setFilterSidebarVisible(false);
  };

  // Fonction pour gérer les changements de statut via glissement
  const handleSwipe = async (itemId: number, direction: 'left' | 'right') => {
    try {
      const item = watchlistItems.find(i => i.id === itemId);
      if (!item) return;

      const statusOrder = ['planned', 'watching', 'completed'] as const;
      const currentIndex = statusOrder.indexOf(item.status as any);
      
      let newStatus: 'planned' | 'watching' | 'completed';
      
      if (direction === 'right' && currentIndex < statusOrder.length - 1) {
        newStatus = statusOrder[currentIndex + 1];
      } else if (direction === 'left' && currentIndex > 0) {
        newStatus = statusOrder[currentIndex - 1];
      } else {
        return; // Pas de changement valide
      }

      console.log('Swipe detected:', { itemId, direction, currentStatus: item.status, newStatus });

      // Mettre à jour optimistiquement l'interface
      setWatchlistItems(prev => 
        prev.map(i => 
          i.id === itemId ? { ...i, status: newStatus } : i
        )
      );

      // Appeler l'API pour persister le changement (utiliser le roomId du screen, pas de l'item)
      await apiService.updateWatchlistItem(roomId, itemId, { status: newStatus });
      
      console.log('Status updated successfully via swipe');
    } catch (error) {
      console.error('Error updating status via swipe:', error);
      
      // En cas d'erreur, recharger les données pour revenir à l'état cohérent
      loadWatchlistItems();
      
      Alert.alert(t('common.error'), t('room.errorUpdatingStatus'));
    }
  };

  if (isLoading) {
    return <LoadingScreen message={t('room.loading')} />;
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
              getVoteEndTime={getVoteEndTimeFormatted}
            />
          ))}
        </View>
      )}

      <View style={styles.tabs}>
        {[
          { key: 'planned', label: t('status.planned') },
          { key: 'watching', label: t('status.watching') },
          { key: 'completed', label: t('status.completed') },
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
              ]}>{t('vote.createVote')}</Text>
              <Text style={[
                styles.fabMenuDescription,
                hasActiveVote() && styles.fabMenuDescriptionDisabled
              ]}>
                {hasActiveVote() ? t('vote.voteInProgress') + '...' : t('common.proposeMovies')}
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

      {/* Sidebar des paramètres */}
      <SettingsSidebar
        visible={settingsSidebarVisible}
        onClose={() => setSettingsSidebarVisible(false)}
        roomId={roomId}
        roomName={roomName}
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
    paddingTop: SPACING.sm, // Légèrement réduit pour les cartes plus espacées
  },
  mediaItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    marginHorizontal: 2, // Pour laisser de la place aux ombres
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  poster: {
    width: 60,
    height: 90,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterEmoji: {
    fontSize: 28,
    opacity: 0.7,
  },
  mediaContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingLeft: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  meta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.placeholder,
    marginBottom: SPACING.sm,
    lineHeight: 16,
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.onPrimary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  swipeHint: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.placeholder,
    fontWeight: '300',
    marginLeft: SPACING.sm,
    opacity: 0.6,
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
    borderRadius: 12,
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
    left: 16,
    top: '50%',
    transform: [{ translateY: -30 }],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 80,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  swipeIndicatorRight: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -30 }],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 80,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  swipeIndicatorIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  swipeIndicatorText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 80,
    lineHeight: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default RoomScreen;
