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
import { RootStackParamList, Media, WatchlistItem } from '../types';
import { COLORS, SPACING, FONT_SIZES, MEDIA_STATUS } from '../constants';
import { apiService } from '../services/api';
import MediaPoster from '../components/MediaPoster';

type CreateVoteRouteProp = RouteProp<RootStackParamList, 'CreateVote'>;
type CreateVoteNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateVote'>;

const CreateVoteScreen: React.FC = () => {
  const route = useRoute<CreateVoteRouteProp>();
  const navigation = useNavigation<CreateVoteNavigationProp>();
  const { roomId } = route.params;
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');
  const [roomItems, setRoomItems] = useState<WatchlistItem[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [creatorName, setCreatorName] = useState('');

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
      Alert.alert('Erreur', 'Votre nom est requis');
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

  const renderMediaItem = (item: WatchlistItem) => {
    const isSelected = selectedMediaIds.includes(item.media.id);
    const status = MEDIA_STATUS[item.status];
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.mediaContainer,
          isSelected && styles.selectedMediaContainer
        ]}
        onPress={() => toggleMediaSelection(item.media.id)}
      >
        <View style={styles.mediaContent}>
          <MediaPoster 
            posterUrl={item.media.posterUrl}
            mediaType={item.media.type}
            size="small"
          />
          <View style={styles.mediaInfo}>
            <Text style={styles.mediaTitle} numberOfLines={2}>
              {item.media.title}
            </Text>
            <Text style={styles.mediaMeta}>
              {item.media.year} • {item.media.genre}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusText}>{status.label}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Créer un vote</Text>
            <Text style={styles.subtitle}>
              Proposez des films à votre groupe
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Votre nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre nom"
                placeholderTextColor={COLORS.placeholder}
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
                placeholderTextColor={COLORS.placeholder}
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
                  placeholderTextColor={COLORS.placeholder}
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
                  <ActivityIndicator size="large" color={COLORS.primary} />
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
              <ActivityIndicator size="small" color={COLORS.onPrimary} />
            ) : (
              <Text style={styles.createButtonText}>Créer le vote</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.onBackground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.placeholder,
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
    color: COLORS.onBackground,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.onSurface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  helperText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    marginTop: 4,
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.placeholder,
    marginTop: 8,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.onBackground,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
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
    borderColor: COLORS.primary,
  },
  mediaContent: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
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
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  mediaMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
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
    color: COLORS.onPrimary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: COLORS.onPrimary,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  createButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: COLORS.placeholder,
  },
  createButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.onPrimary,
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
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 2,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unitButtonActive: {
    backgroundColor: COLORS.primary,
  },
  unitButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.placeholder,
  },
  unitButtonTextActive: {
    color: COLORS.onPrimary,
  },
});

export default CreateVoteScreen;
