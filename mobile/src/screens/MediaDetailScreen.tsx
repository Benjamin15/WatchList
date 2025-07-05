import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  StatusBar,
  Share
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Media, SearchResult, MediaDetails, Trailer } from '../types';
import { apiService } from '../services/api';
import { extractTmdbId, extractMediaType } from '../utils/helpers';

const { width, height } = Dimensions.get('window');

const MediaDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  const { media, roomId } = route.params as { media: Media | SearchResult; roomId?: string };
  
  // États
  const [mediaDetails, setMediaDetails] = useState<MediaDetails | null>(null);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTrailerIndex, setActiveTrailerIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(
    'status' in media ? media.status || 'planned' : 'planned'
  );
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistItem, setWatchlistItem] = useState<any>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Extraction du TMDB ID et du type
  const tmdbId = extractTmdbId(media);
  const tmdbMediaType = extractMediaType(media);
  const mediaType = tmdbMediaType === 'tv' ? 'series' : 'movie';
  
  // Fonction helper pour obtenir une propriété avec fallback
  const getProperty = (key: string): any => {
    if (!mediaDetails) return null;
    return mediaDetails[key as keyof MediaDetails];
  };
  
  // Fonction helper pour le rendu sécurisé du texte
  const safeText = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };
  
  // Helper pour le rendu sécurisé des genres
  const safeRenderGenres = (genres: any): string => {
    if (!genres) return '';
    
    try {
      if (Array.isArray(genres)) {
        return genres.slice(0, 2).map((g: any) => {
          if (typeof g === 'string') return g;
          if (g && typeof g === 'object' && g.name) return String(g.name);
          return String(g);
        }).filter(Boolean).join(', ');
      }
      
      if (typeof genres === 'string') return genres;
      return String(genres);
    } catch (err) {
      console.error('[MediaDetailScreen] Erreur rendu genres:', err);
      return '';
    }
  };
  
  // Helper pour obtenir des propriétés complexes
  const getComplexProperty = (key: string): any => {
    if (mediaDetails && (key in mediaDetails)) {
      return (mediaDetails as any)[key];
    }
    if (key in media) {
      return (media as any)[key];
    }
    return null;
  };
  
  useEffect(() => {
    loadMediaDetails();
    checkIfInWatchlist();
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const loadMediaDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[MediaDetailScreen] Media reçu:', JSON.stringify(media, null, 2));
      console.log('[MediaDetailScreen] TMDB ID extrait:', tmdbId);
      console.log('[MediaDetailScreen] Type de média:', mediaType);
      
      if (!tmdbId) {
        console.log('[MediaDetailScreen] Pas de TMDB ID, utilisation des données existantes');
        setMediaDetails(media as MediaDetails);
        setLoading(false);
        return;
      }
      
      console.log(`[MediaDetailScreen] Chargement des détails pour ${mediaType} ${tmdbId}`);
      
      // Charger les détails du média
      const details = await apiService.getMediaDetailsFromTMDB(tmdbId, mediaType);
      console.log('[MediaDetailScreen] Détails TMDB reçus:', details?.title);
      setMediaDetails(details);
      
      // Charger les trailers
      const trailersData = await apiService.getMediaTrailers(tmdbId, mediaType);
      console.log('[MediaDetailScreen] Trailers reçus:', trailersData.length);
      setTrailers(trailersData);
      
      console.log(`[MediaDetailScreen] Détails chargés: ${details.title}, ${trailersData.length} trailers`);
    } catch (err) {
      console.error('[MediaDetailScreen] Erreur:', err);
      console.log('[MediaDetailScreen] Utilisation des données de base en cas d\'erreur');
      setMediaDetails(media as MediaDetails);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };
  
  const checkIfInWatchlist = async () => {
    try {
      if (!roomId || !tmdbId) return;
      
      const result = await apiService.checkItemInRoom(roomId, tmdbId);
      setIsInWatchlist(result.isInWatchlist);
      
      if (result.item) {
        setWatchlistItem(result.item);
        setCurrentStatus(result.item.status);
      }
    } catch (error) {
      console.error('[MediaDetailScreen] Erreur vérification watchlist:', error);
    }
  };
  
  const handleAddToWatchlist = async () => {
    try {
      if (!roomId) {
        Alert.alert('Erreur', 'Impossible d\'ajouter le média sans room ID');
        return;
      }
      
      const mediaToAdd = {
        title: mediaDetails?.title || media.title,
        type: mediaType as 'movie' | 'series' | 'manga',
        year: mediaDetails?.release_date ? new Date(mediaDetails.release_date).getFullYear() : media.year,
        description: mediaDetails?.overview || media.description,
        image_url: mediaDetails?.posterUrl || media.posterUrl,
        tmdbId: tmdbId || undefined,
        rating: mediaDetails?.rating || media.rating,
        status: 'planned' as const
      };
      
      await apiService.addItemToRoom(roomId, mediaToAdd);
      setIsInWatchlist(true);
      setCurrentStatus('planned');
      
      console.log(`[MediaDetailScreen] Média ajouté à la watchlist: ${media.title}`);
      
      // Retourner à l'écran précédent après l'ajout
      navigation.goBack();
    } catch (err) {
      console.error('[MediaDetailScreen] Erreur ajout watchlist:', err);
      Alert.alert('Erreur', 'Impossible d\'ajouter le média à la watchlist');
    }
  };
  
  const handleStatusChange = async (newStatus: string) => {
    try {
      if (!roomId || !watchlistItem) {
        Alert.alert('Erreur', 'Impossible de changer le statut');
        return;
      }
      
      await apiService.updateItemStatus(roomId, watchlistItem.id, newStatus as 'watching' | 'completed' | 'planned' | 'dropped');
      setCurrentStatus(newStatus);
      
      // Mettre à jour l'item local
      setWatchlistItem({
        ...watchlistItem,
        status: newStatus
      });
      
      console.log(`[MediaDetailScreen] Statut mis à jour: ${newStatus}`);
    } catch (err) {
      console.error('[MediaDetailScreen] Erreur mise à jour statut:', err);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    }
  };
  
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Regarde ce film : ${safeText(mediaDetails?.title || media.title)}`,
        title: safeText(mediaDetails?.title || media.title),
      });
    } catch (err) {
      console.error('[MediaDetailScreen] Erreur partage:', err);
    }
  };
  
  const renderTrailerCarousel = () => {
    if (trailers.length === 0) return null;
    
    return (
      <View style={styles.trailerSection}>
        <Text style={styles.sectionTitle}>Bandes-annonces</Text>
        
        {/* Onglets des trailers */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.trailerTabs}
        >
          {trailers.map((trailer, index) => (
            <TouchableOpacity
              key={trailer.id}
              style={[
                styles.trailerTab,
                index === activeTrailerIndex && styles.activeTrailerTab
              ]}
              onPress={() => setActiveTrailerIndex(index)}
            >
              <Text style={[
                styles.trailerTabText,
                index === activeTrailerIndex && styles.activeTrailerTabText
              ]}>
                {trailer.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Player des trailers */}
        {trailers[activeTrailerIndex] && (
          <View style={styles.trailerPlayer}>
            <WebView
              source={{ uri: `https://www.youtube.com/embed/${trailers[activeTrailerIndex].key}` }}
              style={styles.webView}
              allowsFullscreenVideo={true}
              mediaPlaybackRequiresUserAction={false}
            />
          </View>
        )}
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec image de fond */}
        <View style={styles.header}>
          {getComplexProperty('backdrop_path') && (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w1280${getComplexProperty('backdrop_path')}` }}
              style={styles.backdrop}
              resizeMode="cover"
            />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          
          {/* Bouton retour */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Bouton partage */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Contenu principal */}
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Poster et informations principales */}
          <View style={styles.mainInfo}>
            <View style={styles.posterContainer}>
              <Image
                source={{ 
                  uri: mediaDetails?.posterUrl || media.posterUrl || 'https://via.placeholder.com/300x450'
                }}
                style={styles.poster}
                resizeMode="cover"
              />
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{safeText(mediaDetails?.title || media.title)}</Text>
              
              <View style={styles.metadata}>
                <Text style={styles.year}>
                  {safeText(mediaDetails?.release_date ? new Date(mediaDetails.release_date).getFullYear() : media.year)}
                </Text>
                
                {mediaDetails?.genres && (
                  <Text style={styles.genre}>
                    {safeRenderGenres(mediaDetails.genres)}
                  </Text>
                )}
                
                {mediaDetails?.runtime && (
                  <Text style={styles.runtime}>
                    {Math.floor(mediaDetails.runtime / 60)}h {mediaDetails.runtime % 60}min
                  </Text>
                )}
              </View>
              
              {mediaDetails?.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rating}>{mediaDetails.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Actions */}
          <View style={styles.actions}>
            {!isInWatchlist ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddToWatchlist}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addButtonText}>Ajouter à ma liste</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.statusSection}>
                <Text style={styles.statusSectionTitle}>Statut dans ma liste</Text>
                <View style={styles.statusOptions}>
                  {[
                    { key: 'planned', label: 'À regarder', icon: 'bookmark-outline', color: '#FF9500' },
                    { key: 'watching', label: 'En cours', icon: 'play-circle-outline', color: '#007AFF' },
                    { key: 'completed', label: 'Terminé', icon: 'checkmark-circle-outline', color: '#34C759' },
                    { key: 'dropped', label: 'Abandonné', icon: 'close-circle-outline', color: '#FF3B30' }
                  ].map((statusOption) => (
                    <TouchableOpacity
                      key={statusOption.key}
                      style={[
                        styles.statusOption,
                        currentStatus === statusOption.key && [styles.statusOptionActive, { borderColor: statusOption.color }]
                      ]}
                      onPress={() => handleStatusChange(statusOption.key)}
                    >
                      <Ionicons 
                        name={statusOption.icon as any} 
                        size={20} 
                        color={currentStatus === statusOption.key ? statusOption.color : '#666'} 
                      />
                      <Text style={[
                        styles.statusOptionText,
                        currentStatus === statusOption.key && [styles.statusOptionTextActive, { color: statusOption.color }]
                      ]}>
                        {statusOption.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
          
          {/* Trailers */}
          {renderTrailerCarousel()}
          
          {/* Synopsis */}
          {getProperty('overview') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Synopsis</Text>
              <Text style={styles.synopsisText}>{safeText(getProperty('overview'))}</Text>
            </View>
          )}
          
          {/* Détails */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails</Text>
            
            {getProperty('production_companies') && getProperty('production_companies').length > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Production :</Text>
                <Text style={styles.detailValue}>
                  {getProperty('production_companies').slice(0, 2).map((c: any) => c.name).join(', ')}
                </Text>
              </View>
            )}
            
            {mediaType === 'series' && getProperty('number_of_seasons') && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Saisons :</Text>
                <Text style={styles.detailValue}>{safeText(getProperty('number_of_seasons'))}</Text>
              </View>
            )}
            
            {mediaType === 'series' && getProperty('number_of_episodes') && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Épisodes :</Text>
                <Text style={styles.detailValue}>{safeText(getProperty('number_of_episodes'))}</Text>
              </View>
            )}
            
            {mediaType === 'series' && getProperty('networks') && getProperty('networks').length > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Chaînes :</Text>
                <Text style={styles.detailValue}>
                  {getProperty('networks').slice(0, 2).map((n: any) => n.name).join(', ')}
                </Text>
              </View>
            )}
            
            {mediaType === 'series' && getProperty('status') && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Statut :</Text>
                <Text style={styles.detailValue}>{safeText(getProperty('status'))}</Text>
              </View>
            )}
            
            {mediaType === 'movie' && getProperty('budget') && getProperty('budget') > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Budget :</Text>
                <Text style={styles.detailValue}>
                  ${getProperty('budget').toLocaleString()}
                </Text>
              </View>
            )}
            
            {mediaType === 'movie' && getProperty('revenue') && getProperty('revenue') > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Recettes :</Text>
                <Text style={styles.detailValue}>
                  ${getProperty('revenue').toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: height * 0.4,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#000',
    marginTop: -30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  mainInfo: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  posterContainer: {
    marginRight: 20,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 10,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  year: {
    color: '#ccc',
    marginRight: 12,
  },
  genre: {
    color: '#ccc',
    marginRight: 12,
  },
  runtime: {
    color: '#ccc',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  actions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    color: 'white',
    marginRight: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  statusText: {
    color: '#007AFF',
    marginRight: 4,
  },
  trailerSection: {
    marginBottom: 20,
  },
  trailerTabs: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  trailerTab: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeTrailerTab: {
    backgroundColor: '#007AFF',
  },
  trailerTabText: {
    color: '#ccc',
    fontSize: 14,
  },
  activeTrailerTabText: {
    color: 'white',
  },
  trailerPlayer: {
    height: 200,
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  synopsisText: {
    color: '#ccc',
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#999',
    width: 100,
    fontWeight: '500',
  },
  detailValue: {
    color: '#ccc',
    flex: 1,
  },
  statusSection: {
    marginBottom: 20,
  },
  statusSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
    minWidth: '48%',
  },
  statusOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
  },
  statusOptionText: {
    color: '#ccc',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  statusOptionTextActive: {
    fontWeight: '600',
  },
});

export default MediaDetailScreen;
