#!/bin/bash

# Test des fonctionnalités de glissement (swipe) dans RoomScreen
echo "🔄 Test des glissements dans RoomScreen"
echo "======================================"

echo "🎯 Room de test disponible: 00aad2a0f34a"
echo "📝 Éléments pour tester les glissements:"

# Vérifier les éléments dans la room de test
curl -s "http://localhost:3000/api/rooms/00aad2a0f34a/items" | jq '.items[] | {id, title, status: (.status // "a_voir")}'

echo -e "\n📱 Instructions pour tester les glissements:"
echo "1. Ouvrir l'application mobile"
echo "2. Rejoindre la room : 00aad2a0f34a"
echo "3. Aller dans l'onglet 'À regarder'"
echo "4. Faire glisser Interstellar vers la droite (→) pour passer en 'En cours'"
echo "5. Aller dans l'onglet 'En cours'"
echo "6. Faire glisser vers la droite (→) pour 'Terminé' ou vers la gauche (←) pour 'À regarder'"

echo -e "\n🔧 Corrections apportées:"
echo "✅ Réorganisation de la structure TouchableOpacity/Animated.View"
echo "✅ PanResponder maintenant au niveau supérieur"
echo "✅ Amélioration de la détection du geste (horizontal vs vertical)"
echo "✅ Ajout du style touchableContent manquant"

echo -e "\n🎮 Test manuel des gestes:"
echo "- Glissement horizontal : doit changer le statut"
echo "- Tap : doit ouvrir les détails du média"
echo "- Glissement vertical : doit permettre le scroll de la liste"

echo -e "\n⚠️  Si les glissements ne fonctionnent toujours pas:"
echo "1. Vérifier les logs dans la console mobile"
echo "2. Tester sur un appareil physique (les gestes fonctionnent mieux que sur simulateur)"
echo "3. Vérifier que react-native-gesture-handler est correctement configuré"

echo -e "\n💡 Alternatives pour tester:"
echo "- Glissement lent et délibéré"
echo "- Maintenir le doigt un moment avant de glisser"
echo "- Essayer avec des gestes plus courts ou plus longs"
