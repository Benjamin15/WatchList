import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, Vote, VoteOption } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { apiService } from '../services/api';
import MediaPoster from '../components/MediaPoster';
import { useTranslatedTitle } from '../hooks/useTranslatedTitle';
import { useTheme } from '../contexts/ThemeContext';

const VoteOptionItem: React.FC<{
  option: VoteOption;
  vote: Vote | null;
  onSelect: (option: VoteOption) => void;
}> = ({ option, vote, onSelect }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  // Récupérer le titre traduit (seulement pour les films et séries avec TMDB ID)
  const shouldTranslate = option.media.type !== 'manga' && option.media.tmdbId;
  const { title: translatedTitle } = useTranslatedTitle(
    shouldTranslate ? option.media.tmdbId : undefined,
    option.media.type === 'tv' ? 'series' : option.media.type as 'movie' | 'series',
    option.media.title
  );

  const isDisabled = vote?.status !== 'active' || vote?.userHasVoted;

  return (
    <TouchableOpacity
      style={[
        styles.optionContainer,
        isDisabled && styles.disabledContainer
      ]}
      onPress={() => onSelect(option)}
      disabled={isDisabled}
    >
      <View style={styles.optionContent}>
        <MediaPoster 
          posterUrl={option.media.posterUrl}
          mediaType={option.media.type === 'tv' ? 'series' : option.media.type}
          size="small"
        />
        <View style={styles.optionInfo}>
          <Text style={styles.optionTitle} numberOfLines={2}>
            {translatedTitle}
          </Text>
          <View style={styles.voteStats}>
            <Text style={styles.voteCount}>
              {t('vote.votes', { count: option.voteCount })}
            </Text>
            <Text style={styles.votePercentage}>
              {option.percentage}%
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Composant pour l'option sélectionnée dans la modal
const SelectedOptionPreview: React.FC<{
  selectedOption: VoteOption;
}> = ({ selectedOption }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  // Récupérer le titre traduit (seulement pour les films et séries avec TMDB ID)
  const shouldTranslate = selectedOption.media.type !== 'manga' && selectedOption.media.tmdbId;
  const { title: translatedTitle } = useTranslatedTitle(
    shouldTranslate ? selectedOption.media.tmdbId : undefined,
    selectedOption.media.type === 'tv' ? 'series' : selectedOption.media.type as 'movie' | 'series',
    selectedOption.media.title
  );

  return (
    <View style={styles.selectedOptionPreview}>
      <MediaPoster 
        posterUrl={selectedOption.media.posterUrl}
        mediaType={selectedOption.media.type === 'tv' ? 'series' : selectedOption.media.type}
        size="small"
      />
      <View style={styles.selectedOptionInfo}>
        <Text style={styles.selectedOptionTitle}>
          {translatedTitle}
        </Text>
      </View>
    </View>
  );
};

type VoteDetailRouteProp = RouteProp<RootStackParamList, 'VoteDetail'>;
type VoteDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VoteDetail'>;

const VoteDetailScreen: React.FC = () => {
  const route = useRoute<VoteDetailRouteProp>();
  const navigation = useNavigation<VoteDetailNavigationProp>();
  const { voteId, roomId } = route.params;
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [vote, setVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<VoteOption | null>(null);
  const [voterName, setVoterName] = useState('');
  const [anonymousVote, setAnonymousVote] = useState(false);

  useEffect(() => {
    loadVoteDetails();
  }, []);

  const loadVoteDetails = async () => {
    try {
      setLoading(true);
      const voteData = await apiService.getVoteById(voteId);
      setVote(voteData);
    } catch (error) {
      console.error('Erreur lors du chargement du vote:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du vote');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleVotePress = (option: VoteOption) => {
    if (vote?.userHasVoted) {
      Alert.alert(t('vote.alreadyVoted'), t('vote.alreadyVoted'));
      return;
    }

    if (vote?.status !== 'active') {
      Alert.alert('Vote fermé', 'Ce vote n\'est plus actif');
      return;
    }

    setSelectedOption(option);
    setShowVoteModal(true);
  };

  const submitVote = async () => {
    if (!selectedOption) return;

    if (!anonymousVote && !voterName.trim()) {
      Alert.alert(t('common.error'), t('vote.enterNameOrVoteAnonymously'));
      return;
    }

    try {
      setVoting(true);
      
      await apiService.submitVote({
        voteId,
        optionId: selectedOption.id,
        voterName: anonymousVote ? undefined : voterName.trim(),
      });

      setShowVoteModal(false);
      setSelectedOption(null);
      setVoterName('');
      setAnonymousVote(false);
      
      Alert.alert('Succès', 'Vote enregistré avec succès !');
      
      // Recharger les détails pour voir les nouveaux résultats
      await loadVoteDetails();
    } catch (error) {
      console.error('Erreur lors du vote:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer votre vote');
    } finally {
      setVoting(false);
    }
  };

  const getVoteStatus = () => {
    if (!vote) return '';
    
    switch (vote.status) {
      case 'active':
        return vote.endsAt ? 
          `${t('vote.endOn')} ${new Date(vote.endsAt).toLocaleDateString()}` : 
          'Vote permanent';
      case 'completed':
        return t('vote.voteCompleted');
      case 'expired':
        return t('vote.voteExpired');
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    if (!vote) return theme.placeholder;
    
    switch (vote.status) {
      case 'active':
        return theme.secondary;
      case 'completed':
        return theme.primary;
      case 'expired':
        return theme.error;
      default:
        return theme.placeholder;
    }
  };

  const renderVoteOption = (option: VoteOption, index: number) => {
    const isWinner = option.isWinner && vote?.status === 'completed';
    
    return (
      <View key={option.id} style={[isWinner && styles.winnerContainer]}>
        <VoteOptionItem 
          option={option}
          vote={vote}
          onSelect={handleVotePress}
        />
        
        {/* Barre de progression */}
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${option.percentage}%`,
                backgroundColor: isWinner ? theme.secondary : theme.primary,
              }
            ]} 
          />
        </View>
        
        {isWinner && (
          <View style={styles.winnerBadge}>
            <Text style={styles.winnerText}>🏆 Gagnant</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Chargement du vote...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!vote) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Vote non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{vote.title}</Text>
          {vote.description && (
            <Text style={styles.description}>{vote.description}</Text>
          )}
          <View style={styles.voteInfo}>
            <Text style={styles.creator}>{t('vote.createdBy')} {vote.createdBy}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{getVoteStatus()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{vote.totalVotes}</Text>
            <Text style={styles.statLabel}>
              {t('vote.voteLabel')}{vote.totalVotes !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{vote.options.length}</Text>
            <Text style={styles.statLabel}>
              {t('vote.optionLabel')}{vote.options.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {new Date(vote.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.statLabel}>{t('vote.created')}</Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>{t('vote.options')}</Text>
          {vote.options.map((option, index) => renderVoteOption(option, index))}
        </View>

        {vote.userHasVoted && (
          <View style={styles.votedMessage}>
            <Text style={styles.votedText}>✓ {t('vote.alreadyVoted')}</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de vote */}
      <Modal
        visible={showVoteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVoteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('vote.confirmVote')}</Text>
            
            {selectedOption && (
              <SelectedOptionPreview selectedOption={selectedOption} />
            )}

            <View style={styles.voteForm}>
              <TouchableOpacity
                style={styles.anonymousToggle}
                onPress={() => setAnonymousVote(!anonymousVote)}
              >
                <View style={[styles.checkbox, anonymousVote && styles.checkboxChecked]}>
                  {anonymousVote && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.anonymousText}>Vote anonyme</Text>
              </TouchableOpacity>

              {!anonymousVote && (
                <TextInput
                  style={styles.nameInput}
                  placeholder={t('common.yourName')}
                  placeholderTextColor={theme.placeholder}
                  value={voterName}
                  onChangeText={setVoterName}
                  maxLength={50}
                />
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowVoteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  voting && styles.confirmButtonDisabled
                ]}
                onPress={submitVote}
                disabled={voting}
              >
                {voting ? (
                  <ActivityIndicator size="small" color={theme.onPrimary} />
                ) : (
                  <Text style={styles.confirmButtonText}>Voter</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: theme.placeholder,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: theme.error,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: theme.onBackground,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: theme.placeholder,
    marginBottom: SPACING.lg,
  },
  voteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creator: {
    fontSize: FONT_SIZES.sm,
    color: theme.placeholder,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: theme.onPrimary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.lg,
    backgroundColor: theme.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: theme.onSurface,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: theme.placeholder,
    marginTop: SPACING.xs,
  },
  optionsContainer: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: theme.onBackground,
    marginBottom: SPACING.lg,
  },
  optionContainer: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  winnerContainer: {
    borderColor: theme.secondary,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  optionContent: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: theme.onSurface,
    marginBottom: SPACING.xs,
  },
  optionMeta: {
    fontSize: FONT_SIZES.sm,
    color: theme.placeholder,
    marginBottom: SPACING.md,
  },
  voteStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteCount: {
    fontSize: FONT_SIZES.sm,
    color: theme.onSurface,
  },
  votePercentage: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: theme.primary,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: theme.border,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  winnerBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: theme.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  winnerText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: theme.onSecondary,
  },
  votedMessage: {
    margin: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: theme.secondary,
    borderRadius: 12,
    alignItems: 'center',
  },
  votedText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: theme.onSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: theme.onSurface,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  selectedOptionPreview: {
    flexDirection: 'row',
    backgroundColor: theme.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  selectedOptionInfo: {
    flex: 1,
  },
  selectedOptionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: theme.onBackground,
    marginBottom: SPACING.xs,
  },
  selectedOptionMeta: {
    fontSize: FONT_SIZES.sm,
    color: theme.placeholder,
  },
  voteForm: {
    marginBottom: SPACING.lg,
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.border,
    borderRadius: 4,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checkmark: {
    color: theme.onPrimary,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  anonymousText: {
    fontSize: FONT_SIZES.md,
    color: theme.onSurface,
  },
  nameInput: {
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: theme.onBackground,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: theme.onBackground,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: theme.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: theme.placeholder,
  },
  confirmButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: theme.onPrimary,
  },
});

export default VoteDetailScreen;
