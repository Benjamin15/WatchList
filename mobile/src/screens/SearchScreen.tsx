import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SearchResult } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { apiService } from '../services/api';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

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

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      Alert.alert('Erreur', 'Veuillez entrer au moins 2 caractères pour effectuer une recherche.');
      return;
    }

    setIsSearching(true);
    
    try {
      // Utiliser l'API réelle pour la recherche
      const results = await apiService.searchMedia(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching media:', error);
      
      // En cas d'erreur, utiliser les données mock comme fallback
      const filteredResults = mockSearchResults.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredResults);
      
      Alert.alert(
        'Mode hors ligne',
        'Recherche effectuée avec les données locales. Vérifiez votre connexion pour accéder à plus de résultats.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToWatchlist = async (media: SearchResult) => {
    Alert.alert(
      'Ajouter à la watchlist',
      `Voulez-vous ajouter "${media.title}" à votre watchlist ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Ajouter', 
          onPress: async () => {
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
              
              Alert.alert('✅ Ajouté', `"${media.title}" a été ajouté à votre watchlist !`);
              navigation.goBack();
            } catch (error) {
              console.error('Error adding media to watchlist:', error);
              Alert.alert(
                'Erreur',
                'Impossible d\'ajouter le média à la watchlist. Veuillez réessayer.'
              );
            } finally {
              setIsSearching(false);
            }
          }
        }
      ]
    );
  };

  const renderSearchResult = (item: SearchResult) => (
    <TouchableOpacity
      key={item.id}
      style={styles.resultItem}
      onPress={() => handleAddToWatchlist(item)}
    >
      {renderSearchPoster(item)}
      
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultMeta}>
          {item.year} • {item.genre}
        </Text>
        <Text style={styles.resultDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.resultFooter}>
          <Text style={styles.resultRating}>
            ⭐ {item.rating}
          </Text>
          <View style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Ajouter</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des films, séries, manga..."
          placeholderTextColor={COLORS.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isSearching}
        >
          <Text style={styles.searchButtonText}>
            {isSearching ? '🔍' : '🔎'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {searchResults.length > 0 ? (
          <View>
            <Text style={styles.resultsTitle}>
              {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
            </Text>
            {searchResults.map(renderSearchResult)}
          </View>
        ) : searchQuery.length > 0 && !isSearching ? (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.onBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
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
    color: COLORS.onBackground,
    marginBottom: SPACING.md,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultPoster: {
    width: 50,
    height: 75,
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
  resultEmoji: {
    fontSize: 20,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  resultMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    marginBottom: SPACING.xs,
  },
  resultDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultRating: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.onSurface,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.onPrimary,
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
    color: COLORS.onBackground,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.placeholder,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});

export default SearchScreen;
