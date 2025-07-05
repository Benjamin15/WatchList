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
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Media, SearchResult, MediaDetails, Trailer } from '../types';
import { apiService } from '../services/api';
import { extractTmdbId } from '../utils/helpers';

const { width, height } = Dimensions.get('window');

type MediaDetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;
type MediaDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Detail'>;

interface MediaDetailScreenProps {
  route: MediaDetailScreenRouteProp;
  navigation: MediaDetailScreenNavigationProp;
}

const MediaDetailScreen: React.FC<MediaDetailScreenProps> = () => {
  const route = useRoute<MediaDetailScreenRouteProp>();
  const navigation = useNavigation<MediaDetailScreenNavigationProp>();
  
  const { media, roomId } = route.params;
  
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
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Extraction du TMDB ID
  const tmdbId = extractTmdbId(media);
  const mediaType = media.type === 'series' ? 'series' : 'movie';
  
  useEffect(() => {
    loadMediaDetails();
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
      
      Alert.alert('Succès', 'Média ajouté à votre watchlist !');
    } catch (err) {
      console.error('[MediaDetailScreen] Erreur ajout watchlist:', err);
      Alert.alert('Erreur', 'Impossible d\'ajouter le média à la watchlist');
    }
  };
  
  const handleStatusChange = async (newStatus: string) => {
    try {
      if (!roomId || !media.id) {
        Alert.alert('Erreur', 'Impossible de changer le statut');
        return;
      }
      
      await apiService.updateItemStatus(roomId, media.id, newStatus as 'watching' | 'completed' | 'planned' | 'dropped');
      setCurrentStatus(newStatus);
      
      Alert.alert('Succès', 'Statut mis à jour !');
    } catch (err) {
      console.error('[MediaDetailScreen] Erreur changement statut:', err);
      Alert.alert('Erreur', 'Impossible de changer le statut');
    }
  };
  
  const handleShare = async () => {
    try {
      const message = `Découvre ${mediaDetails?.title || media.title} sur notre WatchList !`;
      await Share.share({
        message,
        url: mediaDetails?.homepage || '',
      });
    } catch (err) {
      console.error('[MediaDetailScreen] Erreur partage:', err);
    }
  };
  
  const formatRuntime = (minutes: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
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
                {trailer.name.length > 20 ? `${trailer.name.slice(0, 20)}...` : trailer.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Lecteur de trailer */}
        {showTrailer && trailers[activeTrailerIndex] && (
          <View style={styles.trailerPlayer}>
            <WebView
              source={{
                uri: `https://www.youtube.com/embed/${trailers[activeTrailerIndex].key}?autoplay=1&rel=0`
              }}
              style={styles.webView}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
            />
            <TouchableOpacity
              style={styles.closeTrailerButton}
              onPress={() => setShowTrailer(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Bouton play trailer */}
        {!showTrailer && trailers[activeTrailerIndex] && (
          <TouchableOpacity
            style={styles.playTrailerButton}
            onPress={() => setShowTrailer(true)}
          >
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.playTrailerText}>Voir la bande-annonce</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  const renderStatusSelector = () => {
    const statuses = [
      { key: 'planned', label: 'À regarder', color: '#3498db' },
      { key: 'watching', label: 'En cours', color: '#e74c3c' },
      { key: 'completed', label: 'Terminé', color: '#27ae60' },
      { key: 'dropped', label: 'Abandonné', color: '#95a5a6' }
    ];
    
    return (
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Statut</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statuses.map(status => (
            <TouchableOpacity
              key={status.key}
              style={[
                styles.statusButton,
                { backgroundColor: status.color },
                currentStatus === status.key && styles.activeStatusButton
              ]}
              onPress={() => handleStatusChange(status.key)}
            >
              <Text style={styles.statusButtonText}>{status.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMediaDetails}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const details = mediaDetails || media;
  
  // Helper pour accéder aux propriétés de manière sécurisée
  const getProperty = (key: string): any => {
    if (mediaDetails && (key in mediaDetails)) {
      return (mediaDetails as any)[key];
    }
    if (key in media) {
      return (media as any)[key];
    }
    return null;
  };

  // Helper pour s'assurer que le texte est rendu correctement
  const safeText = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec image de fond */}
        <View style={styles.header}>
          {getProperty('backdrop_path') && (
            <Image
              source={{ uri: getProperty('backdrop_path') }}
              style={styles.backdropImage}
              resizeMode="cover"
            />
          )}
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          
          {/* Boutons header */}
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Contenu principal */}
        <Animated.View
          style={[
            styles.content,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Informations principales */}
          <View style={styles.mainInfo}>
            <View style={styles.posterContainer}>
              {details.posterUrl ? (
                <Image
                  source={{ uri: details.posterUrl }}
                  style={styles.posterImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.posterPlaceholder}>
                  <Text style={styles.posterPlaceholderText}>
                    {details.type === 'movie' ? '🎬' : '📺'}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{details.title}</Text>
              
              {getProperty('tagline') && (
                <Text style={styles.tagline}>{getProperty('tagline')}</Text>
              )}
              
              <View style={styles.metadata}>
                <Text style={styles.metadataItem}>
                  {getProperty('release_date') && safeText(new Date(getProperty('release_date')).getFullYear())}
                </Text>
                {getProperty('runtime') && (
                  <Text style={styles.metadataItem}>
                    {safeText(formatRuntime(getProperty('runtime')))}
                  </Text>
                )}
                {getProperty('vote_average') && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#f39c12" />
                    <Text style={styles.rating}>{safeText(getProperty('vote_average').toFixed(1))}</Text>
                  </View>
                )}
              </View>
              
              {getProperty('genres') && getProperty('genres').length > 0 && (
                <View style={styles.genresContainer}>
                  {getProperty('genres').slice(0, 3).map((genre: string, index: number) => (
                    <View key={index} style={styles.genreTag}>
                      <Text style={styles.genreText}>{genre}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
          
          {/* Boutons d'action */}
          <View style={styles.actionButtons}>
            {!isInWatchlist ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleAddToWatchlist}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Ajouter à ma liste</Text>
              </TouchableOpacity>
            ) : (
              renderStatusSelector()
            )}
          </View>
          
          {/* Synopsis */}
          {getProperty('overview') && (
            <View style={styles.synopsisSection}>
              <Text style={styles.sectionTitle}>Synopsis</Text>
              <Text style={styles.synopsisText}>{getProperty('overview')}</Text>
            </View>
          )}
          
          {/* Carrousel de trailers */}
          {renderTrailerCarousel()}
          
          {/* Détails supplémentaires */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Informations</Text>
            
            {getProperty('production_companies') && getProperty('production_companies').length > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Production :</Text>
                <Text style={styles.detailValue}>
                  {getProperty('production_companies').slice(0, 2).join(', ')}
                </Text>
              </View>
            )}
            
            {getProperty('number_of_seasons') && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Saisons :</Text>
                <Text style={styles.detailValue}>{getProperty('number_of_seasons')}</Text>
              </View>
            )}
            
            {getProperty('number_of_episodes') && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Épisodes :</Text>
                <Text style={styles.detailValue}>{getProperty('number_of_episodes')}</Text>
              </View>
            )}
            
            {getProperty('networks') && getProperty('networks').length > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Réseaux :</Text>
                <Text style={styles.detailValue}>
                  {getProperty('networks').slice(0, 2).join(', ')}
                </Text>
              </View>
            )}
            
            {getProperty('status_text') && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Statut :</Text>
                <Text style={styles.detailValue}>{getProperty('status_text')}</Text>
              </View>
            )}
            
            {getProperty('budget') && getProperty('budget') > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Budget :</Text>
                <Text style={styles.detailValue}>
                  ${getProperty('budget').toLocaleString()}
                </Text>
              </View>
            )}
            
            {getProperty('revenue') && getProperty('revenue') > 0 && (
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
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    height: height * 0.4,
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headerButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    marginTop: -50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  posterContainer: {
    width: 120,
    height: 180,
    marginRight: 16,
  },
  posterImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  posterPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholderText: {
    fontSize: 32,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    color: '#b0b0b0',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metadataItem: {
    color: '#b0b0b0',
    fontSize: 14,
    marginRight: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#f39c12',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '600',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  genreText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusSection: {
    marginBottom: 16,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    opacity: 0.7,
  },
  activeStatusButton: {
    opacity: 1,
  },
  statusButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  synopsisSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  synopsisText: {
    color: '#b0b0b0',
    fontSize: 14,
    lineHeight: 20,
  },
  trailerSection: {
    marginBottom: 24,
  },
  trailerTabs: {
    marginBottom: 16,
  },
  trailerTab: {
    backgroundColor: '#2c2c2c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTrailerTab: {
    backgroundColor: '#3498db',
  },
  trailerTabText: {
    color: '#b0b0b0',
    fontSize: 14,
  },
  activeTrailerTabText: {
    color: '#ffffff',
  },
  trailerPlayer: {
    height: 200,
    backgroundColor: '#000000',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  closeTrailerButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTrailerButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  playTrailerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#b0b0b0',
    fontSize: 14,
    fontWeight: '500',
    width: 100,
  },
  detailValue: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
});

export default MediaDetailScreen;
