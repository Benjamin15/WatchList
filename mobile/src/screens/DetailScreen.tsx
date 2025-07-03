import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootStackParamList, Media, SearchResult } from '../types';
import { COLORS, SPACING, FONT_SIZES, MEDIA_TYPES, MEDIA_STATUS, IMAGE_CONFIG } from '../constants';
import { apiService } from '../services/api';

type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Detail'>;

const { width } = Dimensions.get('window');

const DetailScreen: React.FC = () => {
  const navigation = useNavigation<DetailScreenNavigationProp>();
  const route = useRoute();
  const { media, roomId } = route.params as {
    media: Media | SearchResult;
    roomId?: number;
  };

  const [adding, setAdding] = useState(false);

  const isInWatchlist = 'status' in media;

  const handleAddToWatchlist = async () => {
    if (!roomId) {
      Alert.alert('Erreur', 'Room ID manquant');
      return;
    }

    setAdding(true);
    try {
      await apiService.addToWatchlist(roomId, {
        title: media.title,
        type: media.type,
        year: media.year,
        genre: media.genre,
        description: media.description,
        posterUrl: media.posterUrl,
        rating: media.rating,
        tmdbId: media.tmdbId,
        malId: media.malId,
      });
      Alert.alert('Succès', `"${media.title}" a été ajouté à la watchlist`);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setAdding(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Image
        source={{
          uri: media.posterUrl || IMAGE_CONFIG.PLACEHOLDER_IMAGE,
        }}
        style={styles.posterLarge}
        resizeMode="cover"
      />
      <View style={styles.headerInfo}>
        <Text style={styles.title}>{media.title}</Text>
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
          <Text style={styles.genre}>{media.genre}</Text>
        )}
        {media.rating && (
          <View style={styles.ratingContainer}>
            <Icon name="star" size={20} color={COLORS.secondary} />
            <Text style={styles.ratingText}>{media.rating.toFixed(1)}/10</Text>
          </View>
        )}
        {isInWatchlist && 'status' in media && media.status && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Statut :</Text>
            <View
              style={[
                styles.statusChip,
                { backgroundColor: MEDIA_STATUS[media.status as keyof typeof MEDIA_STATUS].color },
              ]}
            >
              <Text style={styles.statusChipText}>
                {MEDIA_STATUS[media.status as keyof typeof MEDIA_STATUS].label}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderDescription = () => {
    if (!media.description) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{media.description}</Text>
      </View>
    );
  };

  const renderAddButton = () => {
    if (isInWatchlist || !roomId) return null;

    return (
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddToWatchlist}
        disabled={adding}
      >
        <Icon
          name="add"
          size={24}
          color={COLORS.onPrimary}
          style={styles.addButtonIcon}
        />
        <Text style={styles.addButtonText}>
          {adding ? 'Ajout...' : 'Ajouter à la watchlist'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      {renderDescription()}
      {renderAddButton()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  posterLarge: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
    lineHeight: 28,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typeChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  typeChipText: {
    color: COLORS.onPrimary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  year: {
    color: COLORS.placeholder,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  genre: {
    color: COLORS.placeholder,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingText: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  statusLabel: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.sm,
  },
  statusChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusChipText: {
    color: COLORS.onPrimary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.onBackground,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.onBackground,
    lineHeight: 22,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  addButtonIcon: {
    marginRight: SPACING.sm,
  },
  addButtonText: {
    color: COLORS.onPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default DetailScreen;
