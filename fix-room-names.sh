#!/bin/bash

# Script pour nettoyer l'historique et tester les corrections
echo "=== NETTOYAGE ET TEST DES CORRECTIONS ==="
echo "Date: $(date)"
echo ""

MOBILE_DIR="/Users/ben/workspace/WatchList/mobile"
cd "$MOBILE_DIR"

echo "1. Résumé des corrections appliquées:"
echo "   ✅ Fallback pour les noms vides: item.name || \`Room \${index + 1}\`"
echo "   ✅ Hauteur minimale pour le texte: minHeight: 24"
echo "   ✅ Validation du nom dans roomHistory.ts"
echo "   ✅ Logs améliorés pour le diagnostic"
echo ""

echo "2. Création d'un script de nettoyage AsyncStorage..."

# Créer un composant temporaire pour nettoyer l'historique
cat > src/components/CleanHistory.tsx << 'EOF'
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

const CleanHistory: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);

  const clearHistory = async () => {
    try {
      setIsClearing(true);
      await AsyncStorage.removeItem('watchlist_rooms_history');
      console.log('Historique nettoyé');
      Alert.alert('Succès', 'Historique des rooms nettoyé avec succès');
    } catch (error) {
      console.error('Erreur nettoyage:', error);
      Alert.alert('Erreur', 'Impossible de nettoyer l\'historique');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nettoyage Historique</Text>
      <Text style={styles.description}>
        Nettoyer l'historique des rooms pour résoudre les problèmes d'affichage
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, isClearing && styles.buttonDisabled]} 
        onPress={clearHistory}
        disabled={isClearing}
      >
        <Text style={styles.buttonText}>
          {isClearing ? 'Nettoyage...' : 'Nettoyer l\'historique'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.onBackground,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.placeholder,
  },
  buttonText: {
    color: COLORS.onPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});

export default CleanHistory;
EOF

echo "3. Modification temporaire de HomeScreen pour inclure le nettoyage..."

# Sauvegarder le HomeScreen actuel
cp src/screens/HomeScreen.tsx src/screens/HomeScreen.tsx.backup

# Ajouter le bouton de nettoyage
sed -i '' 's/import LoadingScreen from '\''\.\/LoadingScreen'\'';/import LoadingScreen from '\''\.\/LoadingScreen'\'';\
import CleanHistory from '\''\.\.\/components\/CleanHistory'\'';/' src/screens/HomeScreen.tsx

# Ajouter l'état pour le nettoyage
sed -i '' 's/const \[roomsHistory, setRoomsHistory\] = useState<RoomHistory\[\]>(\[\]);/const [roomsHistory, setRoomsHistory] = useState<RoomHistory[]>([]);\
  const [showCleanHistory, setShowCleanHistory] = useState(false);/' src/screens/HomeScreen.tsx

# Ajouter la condition pour afficher le nettoyage
sed -i '' 's/if (isLoading) {/if (showCleanHistory) {\
    return (\
      <View style={styles.container}>\
        <TouchableOpacity \
          style={styles.backButton} \
          onPress={() => setShowCleanHistory(false)}\
        >\
          <Text style={styles.backButtonText}>← Retour<\/Text>\
        <\/TouchableOpacity>\
        <CleanHistory \/>\
      <\/View>\
    );\
  }\
\
  if (isLoading) {/' src/screens/HomeScreen.tsx

# Ajouter le bouton de nettoyage après le titre
sed -i '' 's/<Text style={styles.subtitle}>Partagez vos listes de films, séries et mangas<\/Text>/<Text style={styles.subtitle}>Partagez vos listes de films, séries et mangas<\/Text>\
\
        <TouchableOpacity \
          style={styles.cleanButton} \
          onPress={() => setShowCleanHistory(true)}\
        >\
          <Text style={styles.cleanButtonText}>🧹 Nettoyer l'\''historique<\/Text>\
        <\/TouchableOpacity>/' src/screens/HomeScreen.tsx

# Ajouter les styles
sed -i '' 's/  },$/  },\
  backButton: {\
    backgroundColor: COLORS.surface,\
    padding: SPACING.md,\
    margin: SPACING.md,\
    borderRadius: 8,\
    alignItems: '\''center'\'',\
  },\
  backButtonText: {\
    color: COLORS.onSurface,\
    fontSize: FONT_SIZES.md,\
    fontWeight: '\''bold'\'',\
  },\
  cleanButton: {\
    backgroundColor: COLORS.error,\
    padding: SPACING.sm,\
    borderRadius: 8,\
    alignItems: '\''center'\'',\
    marginBottom: SPACING.lg,\
  },\
  cleanButtonText: {\
    color: COLORS.onPrimary,\
    fontSize: FONT_SIZES.sm,\
    fontWeight: '\''bold'\'',\
  },/' src/screens/HomeScreen.tsx

echo "4. Lancement de l'application pour test..."

# Lancer l'application
npx expo start &
EXPO_PID=$!

sleep 3

echo ""
echo "APPLICATION LANCÉE AVEC LES CORRECTIONS"
echo "PID: $EXPO_PID"
echo ""
echo "PLAN DE TEST:"
echo "1. Ouvrez l'application sur votre simulateur/device"
echo "2. Cliquez sur '🧹 Nettoyer l'historique' pour vider l'historique corrompu"
echo "3. Revenez à la page d'accueil"
echo "4. Créez une nouvelle room ou rejoignez une room existante"
echo "5. Revenez à la page d'accueil"
echo "6. Vérifiez la section 'Rooms récentes':"
echo "   - Le nom de la room doit maintenant être visible"
echo "   - S'il était vide, vous devez voir 'Room 1', 'Room 2', etc."
echo "   - Le texte doit être clairement visible"
echo "7. Testez avec plusieurs rooms pour confirmer le fix"
echo ""
echo "Si les noms sont maintenant visibles, les corrections sont efficaces!"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le test"

# Attendre l'arrêt manuel
wait $EXPO_PID

echo ""
echo "5. Nettoyage des fichiers temporaires..."
rm -f src/components/CleanHistory.tsx

# Restaurer HomeScreen
mv src/screens/HomeScreen.tsx.backup src/screens/HomeScreen.tsx

echo "6. Fichiers temporaires supprimés et HomeScreen restauré"
echo ""
echo "=== FIN DU TEST ==="
echo ""
echo "Si les noms sont maintenant visibles, les corrections suivantes ont été appliquées:"
echo "1. Fallback pour les noms vides dans l'affichage"
echo "2. Hauteur minimale pour le texte"
echo "3. Validation du nom dans le service roomHistory"
echo "4. Possibilité de nettoyer l'historique corrompu"
