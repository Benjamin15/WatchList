import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface MediaPosterProps {
  posterUrl?: string;
  mediaType: 'movie' | 'series' | 'manga';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

const MediaPoster: React.FC<MediaPosterProps> = ({ 
  posterUrl, 
  mediaType, 
  size = 'medium' 
}) => {
  const [imageError, setImageError] = useState(false);
  const { theme } = useTheme();
  
  const styles = createStyles(theme);
  
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
        return { width: 60, height: 90 };
      case 'medium':
        return { width: 70, height: 105 };
      case 'large':
        return { width: 90, height: 135 };
      case 'xlarge':
        return { width: 110, height: 165 };
      default:
        return { width: 70, height: 105 };
    }
  };

  const getEmojiSize = (size: string) => {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 28;
      case 'large':
        return 36;
      case 'xlarge':
        return 44;
      default:
        return 28;
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

const createStyles = (theme: any) => StyleSheet.create({
  posterContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.border,
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
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.border,
  },
  fallbackEmoji: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default MediaPoster;
