import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'react-native';
import { COLORS } from '../constants';

interface MediaPosterProps {
  posterUrl?: string;
  mediaType: 'movie' | 'series' | 'manga';
  size?: 'small' | 'medium' | 'large';
}

const MediaPoster: React.FC<MediaPosterProps> = ({ 
  posterUrl, 
  mediaType, 
  size = 'medium' 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const getEmojiForType = (type: string) => {
    switch (type) {
      case 'movie':
        return '🎬';
      case 'series':
        return '📺';
      case 'manga':
        return '📚';
      default:
        return '🎬';
    }
  };

  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'small':
        return { width: 40, height: 60 };
      case 'medium':
        return { width: 60, height: 90 };
      case 'large':
        return { width: 80, height: 120 };
      default:
        return { width: 60, height: 90 };
    }
  };

  const getEmojiSize = (size: string) => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 24;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  const sizeStyles = getSizeStyles(size);
  const emojiSize = getEmojiSize(size);

  // Si on a une URL et qu'il n'y a pas d'erreur, afficher l'image
  if (posterUrl && !imageError) {
    return (
      <View style={[styles.posterContainer, sizeStyles]}>
        <Image
          source={{ uri: posterUrl }}
          style={[styles.posterImage, sizeStyles]}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Sinon, afficher le fallback emoji
  return (
    <View style={[styles.posterContainer, styles.fallbackContainer, sizeStyles]}>
      <Text style={[styles.fallbackEmoji, { fontSize: emojiSize }]}>
        {getEmojiForType(mediaType)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  posterContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.border,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  fallbackEmoji: {
    textAlign: 'center',
  },
});

export default MediaPoster;
