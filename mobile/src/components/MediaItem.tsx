import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { SPACING, FONT_SIZES, MEDIA_STATUS } from '../constants';
import { WatchlistItem } from '../types';
import { translateStatus } from '../utils/translations';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;
const INDICATOR_THRESHOLD = 50;

interface MediaItemProps {
  item: WatchlistItem;
  onSwipe: (itemId: number, direction: 'left' | 'right') => void;
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
}

const MediaItem: React.FC<MediaItemProps> = ({ 
  item, 
  onSwipe, 
  canSwipeLeft, 
  canSwipeRight 
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const styles = createStyles(theme);

  const handleSwipe = (direction: 'left' | 'right') => {
    onSwipe(item.id, direction);
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      opacity.value = withTiming(0.8);
    },
    onActive: (event) => {
      const deltaX = event.translationX;
      
      // Limiter le swipe selon les possibilités
      if (deltaX > 0 && !canSwipeRight) {
        translateX.value = Math.min(deltaX * 0.2, 30);
      } else if (deltaX < 0 && !canSwipeLeft) {
        translateX.value = Math.max(deltaX * 0.2, -30);
      } else {
        translateX.value = deltaX;
      }
    },
    onEnd: (event) => {
      const deltaX = event.translationX;
      const shouldSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD;
      
      if (shouldSwipe) {
        // Animation de sortie
        translateX.value = withTiming(
          deltaX > 0 ? screenWidth : -screenWidth,
          { duration: 300 },
          () => {
            if (deltaX > 0 && canSwipeRight) {
              runOnJS(handleSwipe)('right');
            } else if (deltaX < 0 && canSwipeLeft) {
              runOnJS(handleSwipe)('left');
            }
            // Réinitialiser après le swipe
            translateX.value = 0;
            opacity.value = 1;
          }
        );
      } else {
        // Retour à la position initiale
        translateX.value = withSpring(0);
        opacity.value = withTiming(1);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const shouldShowIndicator = Math.abs(translateX.value) > INDICATOR_THRESHOLD;
    const backgroundColor = shouldShowIndicator
      ? translateX.value > 0
        ? MEDIA_STATUS.watching.color // Bleu pour avancer
        : MEDIA_STATUS.completed.color // Vert pour reculer
      : theme.surface;

    return {
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
      backgroundColor: withTiming(backgroundColor, { duration: 200 }),
    };
  });

  const getStatusBadge = () => {
    // Mapper les statuts mobiles vers les statuts backend pour la traduction
    const statusMapping: Record<string, string> = {
      'planned': 'a_voir',
      'watching': 'en_cours',
      'completed': 'vu',
      'dropped': 'abandonne'
    };

    const backendStatus = statusMapping[item.status] || item.status;
    const translatedText = translateStatus(backendStatus, currentLanguage);

    const statusConfig = {
      planned: { text: translatedText, color: MEDIA_STATUS.planned.color },
      watching: { text: translatedText, color: MEDIA_STATUS.watching.color },
      completed: { text: translatedText, color: MEDIA_STATUS.completed.color },
      dropped: { text: translatedText, color: MEDIA_STATUS.dropped.color },
    };

    const config = statusConfig[item.status] || statusConfig.planned;
    return { ...config };
  };

  const statusBadge = getStatusBadge();

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.posterContainer}>
          <View style={styles.poster}>
            <Text style={styles.posterEmoji}>
              {item.media.type === 'movie' ? '🎬' : 
               (item.media.type === 'series' || item.media.type === 'tv') ? '📺' : '📚'}
            </Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {item.media.title}
          </Text>
          
          <Text style={styles.meta} numberOfLines={1}>
            {item.media.year} • {item.media.genre}
          </Text>
          
          <Text style={styles.description} numberOfLines={3}>
            {item.media.description}
          </Text>
          
          <View style={styles.footer}>
            <View style={[styles.badge, { backgroundColor: statusBadge.color }]}>
              <Text style={styles.badgeText}>{statusBadge.text}</Text>
            </View>
            
            <View style={styles.swipeIndicator}>
              <Text style={styles.swipeText}>
                {canSwipeLeft && canSwipeRight ? '◀️▶️' : 
                 canSwipeRight ? '▶️' : 
                 canSwipeLeft ? '◀️' : ''}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  posterContainer: {
    marginRight: SPACING.md,
  },
  poster: {
    width: 60,
    height: 90,
    backgroundColor: theme.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterEmoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: theme.onSurface,
    marginBottom: SPACING.xs,
  },
  meta: {
    fontSize: FONT_SIZES.sm,
    color: theme.placeholder,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: theme.placeholder,
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
    color: theme.onPrimary,
  },
  swipeIndicator: {
    padding: SPACING.xs,
  },
  swipeText: {
    fontSize: 16,
  },
});

export default MediaItem;
