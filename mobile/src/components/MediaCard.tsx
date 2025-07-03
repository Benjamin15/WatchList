import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Media, SearchResult } from '../types';
import { COLORS, SPACING, FONT_SIZES, MEDIA_TYPES, IMAGE_CONFIG } from '../constants';

interface MediaCardProps {
  media: Media | SearchResult;
  onPress: () => void;
  onActionPress?: () => void;
  actionIcon?: string;
  actionColor?: string;
  showStatus?: boolean;
  showRating?: boolean;
}

const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onPress,
  onActionPress,
  actionIcon,
  actionColor,
  showStatus = false,
  showRating = true,
}) => {
  const isInWatchlist = 'status' in media;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.content} onPress={onPress}>
        <Image
          source={{
            uri: media.posterUrl || IMAGE_CONFIG.PLACEHOLDER_IMAGE,
          }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {media.title}
          </Text>
          <View style={styles.metadata}>
            <View
              style={[
                styles.typeChip,
                { backgroundColor: MEDIA_TYPES[media.type].color },
              ]}
            >
              <Text style={styles.typeChipText}>
                {MEDIA_TYPES[media.type].label}
              </Text>
            </View>
            {media.year && (
              <Text style={styles.year}>{media.year}</Text>
            )}
          </View>
          {media.genre && (
            <Text style={styles.genre} numberOfLines={1}>
              {media.genre}
            </Text>
          )}
          {showRating && media.rating && (
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color={COLORS.secondary} />
              <Text style={styles.ratingText}>{media.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      {onActionPress && actionIcon && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onActionPress}
        >
          <Icon name={actionIcon} size={24} color={actionColor || COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  content: {
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
  info: {
    flex: 1,
  },
  title: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  metadata: {
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
  year: {
    color: COLORS.placeholder,
    fontSize: FONT_SIZES.sm,
  },
  genre: {
    color: COLORS.placeholder,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
});

export default MediaCard;
