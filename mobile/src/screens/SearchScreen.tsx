import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import { RootStackParamList, SearchResult, MediaType } from '../types';
import { COLORS, SPACING, FONT_SIZES, MEDIA_TYPES, IMAGE_CONFIG } from '../constants';
import { apiService } from '../services/api';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute();
  const { roomId } = route.params as { roomId?: number };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<MediaType>('all');

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await apiService.searchMedia(
        query.trim(),
        typeFilter === 'all' ? undefined : typeFilter
      );
      setSearchResults(results);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, typeFilter]);

  const handleAddToWatchlist = async (media: SearchResult) => {
    if (!roomId) return;
    
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
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const renderTypeFilter = () => (
    <View style={styles.filterContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[
          { key: 'all', label: 'Tous' },
          { key: 'movie', label: 'Films' },
          { key: 'series', label: 'Séries' },
          { key: 'manga', label: 'Mangas' },
        ]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterTab,
              typeFilter === item.key && styles.activeFilterTab,
            ]}
            onPress={() => setTypeFilter(item.key as MediaType)}
          >
            <Text
              style={[
                styles.filterTabText,
                typeFilter === item.key && styles.activeFilterTabText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.key}
      />
    </View>
  );

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <View style={styles.resultItem}>
      <TouchableOpacity
        style={styles.resultContent}
        onPress={() =>
          navigation.navigate('Detail', { media: item, roomId })
        }
      >
        <Image
          source={{
            uri: item.posterUrl || IMAGE_CONFIG.PLACEHOLDER_IMAGE,
          }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.resultMetadata}>
            <View
              style={[
                styles.typeChip,
                { backgroundColor: MEDIA_TYPES[item.type].color },
              ]}
            >
              <Text style={styles.typeChipText}>
                {MEDIA_TYPES[item.type].label}
              </Text>
            </View>
            {item.year && (
              <Text style={styles.resultYear}>{item.year}</Text>
            )}
          </View>
          {item.genre && (
            <Text style={styles.resultGenre} numberOfLines={1}>
              {item.genre}
            </Text>
          )}
          {item.rating && (
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={16} color={COLORS.secondary} />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToWatchlist(item)}
      >
        <MaterialIcons name="add" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color={COLORS.placeholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher films, séries, mangas..."
            placeholderTextColor={COLORS.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {loading && (
            <ActivityIndicator size="small" color={COLORS.primary} />
          )}
        </View>
        {renderTypeFilter()}
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => `${item.id}-${item.type}`}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {searchQuery ? (
              <>
                <Text style={styles.emptyText}>
                  Aucun résultat trouvé
                </Text>
                <Text style={styles.emptySubtext}>
                  Essayez avec d'autres mots-clés
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyText}>
                  Recherchez des médias
                </Text>
                <Text style={styles.emptySubtext}>
                  Tapez le titre d'un film, série ou manga pour commencer
                </Text>
              </>
            )}
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.onBackground,
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    color: COLORS.onBackground,
    fontSize: FONT_SIZES.sm,
  },
  activeFilterTabText: {
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
    padding: SPACING.md,
  },
  resultItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  resultContent: {
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
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  resultMetadata: {
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
  resultYear: {
    color: COLORS.placeholder,
    fontSize: FONT_SIZES.sm,
  },
  resultGenre: {
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
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    color: COLORS.onBackground,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    color: COLORS.placeholder,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SearchScreen;
