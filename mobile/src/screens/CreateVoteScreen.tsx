import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, Media, WatchPartyItem } from '../types';
import { SPACING, FONT_SIZES, MEDIA_STATUS } from '../constants';
import { apiService } from '../services/api';
import MediaPoster from '../components/MediaPoster';
import { useTranslatedTitle } from '../hooks/useTranslatedTitle';
import { useTheme } from '../contexts/ThemeContext';

// Composant pour un élément de média dans la liste de vote
const MediaItemForVote: React.FC<{
  item: WatchPartyItem;
  isSelected: boolean;
  onToggleSelection: (mediaId: number) => void;
  styles: any;
  theme: any;
}> = ({ item, isSelected, onToggleSelection, styles, theme }) => {
  const { t } = useTranslation();
  
  // Récupérer le titre traduit (seulement pour les films et séries avec TMDB ID)
  const shouldTranslate = item.media.type !== 'manga' && item.media.tmdbId;
  const { title: translatedTitle } = useTranslatedTitle(
    shouldTranslate ? item.media.tmdbId : undefined,
    item.media.type === 'tv' ? 'series' : item.media.type as 'movie' | 'series',
    item.media.title
  );

  const status = MEDIA_STATUS[item.status];

  const getStatusText = (status: string) => {
    switch(status) {
      case 'planned': return t('status.planned');
      case 'watching': return t('status.watching');
      case 'completed': return t('status.completed');
      case 'dropped': return t('status.dropped');
      default: return status;
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.mediaContainer,
        isSelected && styles.selectedMediaContainer
      ]}
      onPress={() => onToggleSelection(item.media.id)}
    >
      <View style={styles.mediaContent}>
        <MediaPoster 
          posterUrl={item.media.posterUrl}
          mediaType={item.media.type === 'tv' ? 'series' : item.media.type}
          size="small"
        />
        <View style={styles.mediaInfo}>
          <Text style={styles.mediaTitle} numberOfLines={2}>
            {translatedTitle}
          </Text>
          <Text style={styles.mediaMeta}>
            {item.media.genre}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
      </View>
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

type CreateVoteRouteProp = RouteProp<RootStackParamList, 'CreateVote'>;
type CreateVoteNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateVote'>;

const CreateVoteScreen: React.FC = () => {
  const route = useRoute<CreateVoteRouteProp>();
  const navigation = useNavigation<CreateVoteNavigationProp>();
  const { roomId } = route.params;
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');
  const [roomItems, setRoomItems] = useState<WatchPartyItem[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [creatorName, setCreatorName] = useState('');

  const styles = createStyles(theme);

  useEffect(() => {
    loadRoomItems();
  }, []);

  const loadRoomItems = async () => {
    try {
      setLoadingItems(true);
      const items = await apiService.getRoomItems(roomId);
      setRoomItems(items);
    } catch (error) {
      console.error('Erreur lors du chargement des médias:', error);
      Alert.alert('Erreur', 'Impossible de charger les médias de la room');
    } finally {
      setLoadingItems(false);
    }
  };

  const toggleMediaSelection = (mediaId: number) => {
    setSelectedMediaIds(prev => 
      prev.includes(mediaId) 
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const handleCreateVote = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return;
    }

    if (selectedMediaIds.length === 0) {
      Alert.alert('Erreur', 'Sélectionnez au moins un média');
      return;
    }

    if (!creatorName.trim()) {
      Alert.alert(t('common.error'), t('common.nameRequired'));
      return;
    }

    try {
      setLoading(true);
      
      const voteData = {
        roomId,
        title: title.trim(),
        duration: duration ? parseInt(duration) : undefined,
        durationUnit,
        mediaIds: selectedMediaIds,
        createdBy: creatorName.trim(),
      };

      const result = await apiService.createVote(voteData);
      
      // Note: Les notifications push seront gérées côté serveur
      // Le serveur enverra automatiquement les notifications à tous les 
      // utilisateurs abonnés à cette room qui ont activé les notifications
      
      Alert.alert(
        'Succès',
        'Vote créé avec succès !',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Erreur lors de la création du vote:', error);
      
      // Gérer l'erreur spécifique du vote déjà actif
      if (error.response?.status === 409) {
        const errorData = error.response.data;
        Alert.alert(
          t('vote.alreadyInProgress'),
          `Il y a déjà un vote actif dans cette room :\n\n"${errorData.details?.existingVoteTitle}" par ${errorData.details?.existingVoteCreatedBy}\n\nTerminez d'abord ce vote avant d'en créer un nouveau.`,
          [
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de créer le vote');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMediaItem = (item: WatchPartyItem) => {
    const isSelected = selectedMediaIds.includes(item.media.id);
    return (
      <MediaItemForVote
        key={item.id}
        item={item}
        isSelected={isSelected}
        onToggleSelection={toggleMediaSelection}
        styles={styles}
        theme={theme}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('vote.createVote')}</Text>
            <Text style={styles.subtitle}>
              {t('vote.proposeMoviesToGroup')}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('common.yourName')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre nom"
                placeholderTextColor={theme.placeholder}
                value={creatorName}
                onChangeText={setCreatorName}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Titre du vote</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Film du weekend"
                placeholderTextColor={theme.placeholder}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Durée (optionnel)</Text>
              <View style={styles.durationContainer}>
                <TextInput
                  style={[styles.input, styles.durationInput]}
                  placeholder="Ex: 30"
                  placeholderTextColor={theme.placeholder}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <View style={styles.unitSelector}>
                  <TouchableOpacity
                    style={[
                      styles.unitButton,
                      durationUnit === 'minutes' && styles.unitButtonActive
                    ]}
                    onPress={() => setDurationUnit('minutes')}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      durationUnit === 'minutes' && styles.unitButtonTextActive
                    ]}>
                      min
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.unitButton,
                      durationUnit === 'hours' && styles.unitButtonActive
                    ]}
                    onPress={() => setDurationUnit('hours')}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      durationUnit === 'hours' && styles.unitButtonTextActive
                    ]}>
                      h
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.helperText}>
                Laissez vide pour un vote permanent
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Sélectionnez les films ({selectedMediaIds.length} sélectionnés)
              </Text>
              
              {loadingItems ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={styles.loadingText}>Chargement des médias...</Text>
                </View>
              ) : roomItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {t('room.noMedia')}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    {t('common.addMoviesForVote')}
                  </Text>
                </View>
              ) : (
                <View style={styles.mediaList}>
                  {roomItems.map(renderMediaItem)}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.createButton,
              (loading || !title.trim() || selectedMediaIds.length === 0 || !creatorName.trim()) && 
              styles.createButtonDisabled
            ]}
            onPress={handleCreateVote}
            disabled={loading || !title.trim() || selectedMediaIds.length === 0 || !creatorName.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.onPrimary} />
            ) : (
              <Text style={styles.createButtonText}>Créer le vote</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: 0,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: theme.onBackground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: theme.placeholder,
    marginBottom: 24,
  },
  form: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: theme.onBackground,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: theme.onSurface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  helperText: {
    fontSize: FONT_SIZES.sm,
    color: theme.placeholder,
    marginTop: 4,
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: theme.placeholder,
    marginTop: 8,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: theme.onBackground,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: theme.placeholder,
    textAlign: 'center',
  },
  mediaList: {
    gap: 12,
  },
  mediaContainer: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  selectedMediaContainer: {
    borderColor: theme.primary,
  },
  mediaContent: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  mediaInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mediaTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: theme.onSurface,
    marginBottom: 4,
  },
  mediaMeta: {
    fontSize: FONT_SIZES.sm,
    color: theme.placeholder,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: theme.onPrimary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: theme.onPrimary,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: theme.onSurface,
  },
  createButton: {
    flex: 2,
    backgroundColor: theme.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: theme.placeholder,
  },
  createButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: theme.onPrimary,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationInput: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 2,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unitButtonActive: {
    backgroundColor: theme.primary,
  },
  unitButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: theme.placeholder,
  },
  unitButtonTextActive: {
    color: theme.onPrimary,
  },
});

export default CreateVoteScreen;
