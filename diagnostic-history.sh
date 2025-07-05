#!/bin/bash

# Script de diagnostic pour l'historique des rooms
echo "=== DIAGNOSTIC HISTORIQUE DES ROOMS ==="
echo "Date: $(date)"
echo ""

# Configuration
MOBILE_DIR="/Users/ben/workspace/WatchList/mobile"
SIMULATOR_DEVICE="iPhone 15"

cd "$MOBILE_DIR"

echo "1. Création d'un composant de diagnostic pour AsyncStorage..."

# Créer un composant de diagnostic temporaire
cat > src/components/DiagnosticHistory.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { roomHistoryService, RoomHistory } from '../services/roomHistory';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

const DiagnosticHistory: React.FC = () => {
  const [historyData, setHistoryData] = useState<RoomHistory[]>([]);
  const [rawData, setRawData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDiagnosticData();
  }, []);

  const loadDiagnosticData = async () => {
    try {
      // Récupérer les données brutes d'AsyncStorage
      const raw = await AsyncStorage.getItem('watchlist_rooms_history');
      setRawData(raw || 'Aucune donnée');
      
      // Récupérer via le service
      const history = await roomHistoryService.getRoomsHistory();
      setHistoryData(history);
      
      console.log('=== DIAGNOSTIC HISTORIQUE ===');
      console.log('Données brutes:', raw);
      console.log('Données parsées:', history);
      console.log('Nombre d\'items:', history.length);
      
      history.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          id: item.id,
          room_id: item.room_id,
          name: item.name,
          nameLength: item.name?.length || 0,
          nameType: typeof item.name,
          created_at: item.created_at,
          last_joined: item.last_joined
        });
      });
    } catch (error) {
      console.error('Erreur diagnostic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('watchlist_rooms_history');
      console.log('Historique vidé');
      loadDiagnosticData();
    } catch (error) {
      console.error('Erreur vidage:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Chargement diagnostic...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Diagnostic Historique</Text>
      
      <TouchableOpacity style={styles.button} onPress={loadDiagnosticData}>
        <Text style={styles.buttonText}>Recharger</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.buttonDanger} onPress={clearHistory}>
        <Text style={styles.buttonText}>Vider historique</Text>
      </TouchableOpacity>
      
      <Text style={styles.sectionTitle}>Données brutes:</Text>
      <Text style={styles.rawData}>{rawData}</Text>
      
      <Text style={styles.sectionTitle}>Données parsées ({historyData.length} items):</Text>
      {historyData.map((item, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.itemTitle}>Item {index + 1}:</Text>
          <Text style={styles.itemText}>ID: {item.id}</Text>
          <Text style={styles.itemText}>Room ID: {item.room_id}</Text>
          <Text style={styles.itemText}>Name: "{item.name}" (longueur: {item.name?.length || 0})</Text>
          <Text style={styles.itemText}>Type name: {typeof item.name}</Text>
          <Text style={styles.itemText}>Created: {item.created_at}</Text>
          <Text style={styles.itemText}>Last joined: {item.last_joined}</Text>
          
          {/* Test d'affichage du nom */}
          <View style={styles.testContainer}>
            <Text style={styles.testTitle}>Test d'affichage:</Text>
            <Text style={styles.testName}>{item.name}</Text>
            <Text style={styles.testName2}>|{item.name}|</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.onBackground,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  rawData: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  item: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  itemText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  testContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 4,
  },
  testTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  testName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    backgroundColor: COLORS.surface,
    padding: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  testName2: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.error,
    backgroundColor: COLORS.surface,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  buttonDanger: {
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  buttonText: {
    color: COLORS.onPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});

export default DiagnosticHistory;
EOF

echo "2. Modification temporaire de HomeScreen pour inclure le diagnostic..."

# Sauvegarder le HomeScreen actuel
cp src/screens/HomeScreen.tsx src/screens/HomeScreen.tsx.backup

# Modifier HomeScreen pour ajouter le diagnostic
cat > temp_homescreen_patch.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { apiService } from '../services/api';
import { roomHistoryService, RoomHistory } from '../services/roomHistory';
import LoadingScreen from './LoadingScreen';
import DiagnosticHistory from '../components/DiagnosticHistory';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roomsHistory, setRoomsHistory] = useState<RoomHistory[]>([]);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  // Charger l'historique des rooms
  const loadRoomsHistory = async () => {
    try {
      const history = await roomHistoryService.getRoomsHistory();
      setRoomsHistory(history);
    } catch (error) {
      console.error('[HomeScreen] Erreur chargement historique:', error);
    }
  };

  // Charger l'historique au focus de l'écran
  useFocusEffect(
    React.useCallback(() => {
      loadRoomsHistory();
    }, [])
  );

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de room');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating room with name:', roomName.trim());
      const room = await apiService.createRoom(roomName.trim());
      console.log('Room created successfully:', room);
      
      // Ajouter la room à l'historique
      await roomHistoryService.addRoomToHistory(room);
      
      console.log('Navigating to Room with roomId:', room.room_id);
      navigation.navigate('Room', { roomId: room.room_id, roomName: room.name });
    } catch (error) {
      console.error('Error creating room:', error);
      Alert.alert('Erreur', 'Impossible de créer la room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un code de room');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Joining room with code:', roomCode.trim().toUpperCase());
      const room = await apiService.joinRoom(roomCode.trim().toUpperCase());
      console.log('Room joined successfully:', room);
      
      // Ajouter la room à l'historique
      await roomHistoryService.addRoomToHistory(room);
      
      console.log('Navigating to Room with roomId:', room.room_id);
      navigation.navigate('Room', { roomId: room.room_id, roomName: room.name });
    } catch (error) {
      console.error('Error joining room:', error);
      Alert.alert('Erreur', 'Room non trouvée');
    } finally {
      setIsLoading(false);
    }
  };

  // Rejoindre une room depuis l'historique
  const handleJoinFromHistory = async (roomHistory: RoomHistory) => {
    setIsLoading(true);
    try {
      console.log('Joining room from history:', roomHistory.room_id);
      const room = await apiService.joinRoom(roomHistory.room_id);
      
      // Mettre à jour l'historique avec la nouvelle connexion
      await roomHistoryService.addRoomToHistory(room);
      
      navigation.navigate('Room', { roomId: room.room_id, roomName: room.name });
    } catch (error) {
      console.error('Error joining room from history:', error);
      Alert.alert(
        'Room introuvable',
        'Cette room n\'existe plus. Voulez-vous la supprimer de votre historique ?',
        [
          { text: 'Non', style: 'cancel' },
          { 
            text: 'Supprimer', 
            style: 'destructive',
            onPress: async () => {
              await roomHistoryService.removeRoomFromHistory(roomHistory.room_id);
              loadRoomsHistory();
            }
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Connexion en cours..." />;
  }

  if (showDiagnostic) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setShowDiagnostic(false)}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <DiagnosticHistory />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content}>
        <Text style={styles.title}>WatchList</Text>
        <Text style={styles.subtitle}>Partagez vos listes de films, séries et mangas</Text>

        {/* Bouton diagnostic */}
        <TouchableOpacity 
          style={styles.diagnosticButton} 
          onPress={() => setShowDiagnostic(true)}
        >
          <Text style={styles.diagnosticButtonText}>🔍 Diagnostic Historique</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Créer une nouvelle room</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom de la room"
            placeholderTextColor={COLORS.placeholder}
            value={roomName}
            onChangeText={setRoomName}
            maxLength={50}
          />
          <TouchableOpacity style={styles.button} onPress={handleCreateRoom}>
            <Text style={styles.buttonText}>Créer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rejoindre une room</Text>
          <TextInput
            style={styles.input}
            placeholder="Code de la room (ex: ABC123)"
            placeholderTextColor={COLORS.placeholder}
            value={roomCode}
            onChangeText={setRoomCode}
            maxLength={12}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.button} onPress={handleJoinRoom}>
            <Text style={styles.buttonText}>Rejoindre</Text>
          </TouchableOpacity>
        </View>

        {/* Historique des rooms */}
        {roomsHistory.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rooms récentes ({roomsHistory.length})</Text>
              {roomsHistory.map((item, index) => (
                <TouchableOpacity
                  key={item.room_id}
                  style={styles.historyItem}
                  onPress={() => handleJoinFromHistory(item)}
                >
                  <View style={styles.historyContent}>
                    <Text style={styles.historyRoomName}>
                      {item.name || `Room ${index + 1}`}
                    </Text>
                    <Text style={styles.historyRoomCode}>Code: {item.room_id}</Text>
                    <Text style={styles.historyLastJoined}>
                      Dernière connexion: {new Date(item.last_joined).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.onBackground,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  diagnosticButton: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  diagnosticButtonText: {
    color: COLORS.onSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.onBackground,
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.onPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xl,
  },
  historyItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyContent: {
    flex: 1,
  },
  historyRoomName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  historyRoomCode: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    marginBottom: SPACING.xs,
  },
  historyLastJoined: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.placeholder,
    fontStyle: 'italic',
  },
});

export default HomeScreen;
EOF

# Appliquer le patch temporaire
cp temp_homescreen_patch.tsx src/screens/HomeScreen.tsx

echo "3. Lancement de l'application pour diagnostic..."

# Lancer l'application
npx expo start --clear &
EXPO_PID=$!

echo "Application lancée avec PID: $EXPO_PID"
echo ""
echo "INSTRUCTIONS:"
echo "1. Ouvrez l'application sur votre simulateur/device"
echo "2. Cliquez sur '🔍 Diagnostic Historique' sur la page d'accueil"
echo "3. Vérifiez les données d'historique dans la console et l'interface"
echo "4. Testez la création/jointure de rooms pour voir les données"
echo "5. Appuyez sur Ctrl+C pour arrêter le diagnostic"
echo ""
echo "Le diagnostic va analyser:"
echo "- Les données brutes stockées dans AsyncStorage"
echo "- Les données parsées par le service"
echo "- Les noms de rooms et leur affichage"
echo "- Les types de données et leur validité"
echo ""

# Attendre l'arrêt manuel
wait $EXPO_PID

echo "4. Nettoyage des fichiers temporaires..."
rm -f temp_homescreen_patch.tsx
rm -f src/components/DiagnosticHistory.tsx

# Restaurer HomeScreen
mv src/screens/HomeScreen.tsx.backup src/screens/HomeScreen.tsx

echo "5. Fichiers temporaires supprimés et HomeScreen restauré"
echo ""
echo "=== FIN DU DIAGNOSTIC ==="
