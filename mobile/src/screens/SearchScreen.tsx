import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, SearchResult } from '../types';
import { SPACING, FONT_SIZES } from '../constants';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

type SearchScreenRouteProp = RouteProp<RootStackParamList, 'Search'>;
type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

interface SearchScreenProps {
  route: SearchScreenRouteProp;
  navigation: SearchScreenNavigationProp;
}

// Données mock pour la recherche
const mockSearchResults: SearchResult[] = [
  {
    id: 101,
    title: 'Spider-Man: No Way Home',
    type: 'movie',
    year: 2021,
    genre: 'Action, Adventure, Fantasy',
    description: 'Peter Parker demande de l\'aide au Dr Strange pour restaurer son identité secrète.',
    posterUrl: undefined,
    rating: 8.4,
    tmdbId: 634649,
  },
  {
    id: 102,
    title: 'Attack on Titan',
    type: 'series',
    year: 2013,
    genre: 'Action, Drama, Fantasy',
    description: 'L\'humanité lutte pour sa survie contre des géants mangeurs d\'hommes.',
    posterUrl: undefined,
    rating: 9.0,
    tmdbId: 1429,
  },
  {
    id: 103,
    title: 'Demon Slayer',
    type: 'manga',
    year: 2016,
    genre: 'Action, Supernatural',
    description: 'Tanjiro devient un chasseur de démons pour sauver sa sœur.',
    posterUrl: undefined,
    rating: 8.7,
    malId: 87216,
  },
  {
    id: 104,
    title: 'The Witcher',
    type: 'series',
    year: 2019,
    genre: 'Fantasy, Adventure, Drama',
    description: 'Geralt de Rivia, un chasseur de monstres, cherche sa destinée.',
    posterUrl: undefined,
    rating: 8.2,
    tmdbId: 71912,
  },
  {
    id: 105,
    title: 'Dune',
    type: 'movie',
    year: 2021,
    genre: 'Science Fiction, Adventure',
    description: 'Paul Atreides mène une rébellion pour libérer sa planète désertique.',
    posterUrl: undefined,
    rating: 8.0,
    tmdbId: 438631,
  },
];

const SearchScreen: React.FC<SearchScreenProps> = ({ route, navigation }) => {
  const { roomId } = route.params;
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [existingMediaIds, setExistingMediaIds] = useState<Set<string>>(new Set());

  const styles = createStyles(theme);

  // Charger les médias existants dans la room
  useEffect(() => {
    const loadExistingMedia = async () => {
      try {
        const roomItems = await apiService.getRoomItems(roomId);
        const existingIds = new Set<string>();
        
        roomItems.forEach(item => {
          // L'external_id vient du serveur au format "tmdb_XXXXX"
          if (item.media.tmdbId) {
            // Si tmdbId est déjà extrait du serveur, l'utiliser directement
            existingIds.add(String(item.media.tmdbId));
          }
          // Ajouter aussi le titre comme fallback
          existingIds.add(item.media.title.toLowerCase());
        });
        
        setExistingMediaIds(existingIds);
        console.log('SearchScreen: Loaded existing media IDs:', Array.from(existingIds));
      } catch (error) {
        console.error('Error loading existing media:', error);
      }
    };

    loadExistingMedia();
  }, [roomId]);

  // Fonction pour vérifier si un média existe déjà
  const isMediaAlreadyAdded = (media: SearchResult): boolean => {
    // Vérifier par tmdbId en priorité
    if (media.tmdbId) {
      const tmdbIdString = String(media.tmdbId);
      if (existingMediaIds.has(tmdbIdString)) {
        return true;
      }
    }
    
    // Fallback sur le titre
    return existingMediaIds.has(media.title.toLowerCase());
  };

  // Fonction de recherche avec debounce
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setCurrentSearchQuery('');
      return;
    }

    // Éviter les recherches redondantes
    if (currentSearchQuery === query) {
      return;
    }

    const searchQuery = query.trim();
    setCurrentSearchQuery(searchQuery);
    setIsSearching(true);
    
    try {
      console.log('SearchScreen: Performing search for:', searchQuery);
      // Utiliser l'API avec filtrage serveur par room
      const results = await apiService.searchMediaWithRoomFilter(searchQuery, roomId);
      console.log('SearchScreen: Search results received (server-filtered):', results.length);
      
      // Vérifier si c'est toujours la recherche actuelle
      if (currentSearchQuery === searchQuery || searchQuery === query.trim()) {
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching media:', error);
      
      // Vérifier si c'est toujours la recherche actuelle  
      if (currentSearchQuery === searchQuery || searchQuery === query.trim()) {
        // En cas d'erreur, utiliser les données mock comme fallback
        const filteredResults = mockSearchResults
          .filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.genre?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .filter(media => !isMediaAlreadyAdded(media));
        
        setSearchResults(filteredResults);
        
        Alert.alert(
          'Mode hors ligne',
          'Recherche effectuée avec les données locales. Vérifiez votre connexion pour accéder à plus de résultats.'
        );
      }
    } finally {
      setIsSearching(false);
    }
  }, [currentSearchQuery, roomId, isMediaAlreadyAdded]);

  // Debounce hook pour éviter de surcharger l'API
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 500); // Délai de 500ms pour éviter trop de requêtes

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  const handleImageError = (itemId: number) => {
    setImageErrors(prev => new Set([...prev, itemId]));
  };

  const renderSearchPoster = (item: SearchResult) => {
    const hasImageError = imageErrors.has(item.id);
    const posterUrl = item.posterUrl;
    
    // Si on a une URL d'image et qu'il n'y a pas d'erreur, afficher l'image
    if (posterUrl && !hasImageError) {
      return (
        <View style={styles.resultPoster}>
          <Image
            source={{ uri: posterUrl }}
            style={styles.posterImage}
            onError={() => handleImageError(item.id)}
            contentFit="cover"
          />
        </View>
      );
    }

    // Sinon, afficher le fallback emoji
    return (
      <View style={styles.resultPoster}>
        <Text style={styles.resultEmoji}>
          {item.type === 'movie' ? '🎬' : 
           item.type === 'series' ? '📺' : '📚'}
        </Text>
      </View>
    );
  };

  const handleAddToWatchParty = async (media: SearchResult) => {
    try {
      setIsSearching(true);
      
      // Ajouter le média à la room via l'API
      await apiService.addItemToRoom(roomId, {
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
      
      // Mettre à jour la liste des médias existants
      const newExistingIds = new Set(existingMediaIds);
      if (media.tmdbId) {
        newExistingIds.add(String(media.tmdbId));
      }
      newExistingIds.add(media.title.toLowerCase());
      setExistingMediaIds(newExistingIds);
      
      // Filtrer les résultats actuels pour retirer le média ajouté
      setSearchResults(prevResults => 
        prevResults.filter(item => {
          // Vérifier si ce média est celui qui vient d'être ajouté
          if (item.tmdbId && media.tmdbId && item.tmdbId === media.tmdbId) {
            return false;
          }
          if (item.title.toLowerCase() === media.title.toLowerCase()) {
            return false;
          }
          return true;
        })
      );
      
      // Retourner à l'écran précédent
      navigation.goBack();
    } catch (error) {
      console.error('Error adding media to WatchParty:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'ajouter le média à la WatchParty. Veuillez réessayer.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewDetails = (media: SearchResult) => {
    navigation.navigate('Detail', { media, roomId });
  };

  const renderSearchResult = (item: SearchResult) => (
    <TouchableOpacity
      key={item.id}
      style={styles.resultItem}
      onPress={() => handleViewDetails(item)}
    >
      {renderSearchPoster(item)}
      
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultMeta}>
          {item.year} • {item.genre}
        </Text>
        
        <View style={styles.resultFooter}>
          <Text style={styles.resultRating}>
            ⭐ {item.rating}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e: any) => {
              e.stopPropagation();
              handleAddToWatchParty(item);
            }}
          >
            <Text style={styles.addButtonText}>+ Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tapez pour rechercher (min. 2 caractères)..."
          placeholderTextColor={theme.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.searchButton}
          disabled={isSearching}
        >
          <Text style={styles.searchButtonText}>
            {isSearching ? '⏳' : '🔎'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {isSearching ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⏳</Text>
            <Text style={styles.emptyTitle}>{t('loading.searching')}</Text>
            <Text style={styles.emptyMessage}>
              Veuillez patienter
            </Text>
          </View>
        ) : searchResults.length > 0 ? (
          <View>
            <Text style={styles.resultsTitle}>
              {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
            </Text>
            {searchResults.map(renderSearchResult)}
          </View>
        ) : searchQuery.length > 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptyMessage}>
              Essayez avec d'autres mots-clés
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎬</Text>
            <Text style={styles.emptyTitle}>Rechercher des médias</Text>
            <Text style={styles.emptyMessage}>
              Tapez le nom d'un film, série ou manga pour commencer
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: theme.onBackground,
    borderWidth: 1,
    borderColor: theme.border,
    marginRight: SPACING.sm,
  },
  searchButton: {
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  searchButtonText: {
    fontSize: 18,
  },
  resultsContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  resultsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: theme.onBackground,
    marginBottom: SPACING.md,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  resultPoster: {
    width: 50,
    height: 75,
    backgroundColor: theme.border,
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
  resultEmoji: {
    fontSize: 20,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: theme.onSurface,
    marginBottom: SPACING.xs,
  },
  resultMeta: {
    fontSize: FONT_SIZES.sm,
    color: theme.placeholder,
    marginBottom: SPACING.sm,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultRating: {
    fontSize: FONT_SIZES.sm,
    color: theme.onSurface,
  },
  addButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: FONT_SIZES.xs,
    color: theme.onPrimary,
    fontWeight: 'bold',
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
    color: theme.onBackground,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: FONT_SIZES.md,
    color: theme.placeholder,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});

export default SearchScreen;
