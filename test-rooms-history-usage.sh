#!/bin/bash

# Guide d'utilisation et de test pour l'historique des rooms

echo "📱 Guide d'utilisation - Historique des rooms"
echo "============================================"

echo "🚀 Lancement de l'application pour test..."

# Vérifier si le serveur backend est en cours d'exécution
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ Serveur backend actif sur le port 3000"
else
    echo "⚠️  Serveur backend non actif - démarrage..."
    cd backend
    npm start &
    BACKEND_PID=$!
    echo "🔄 Attente de 5 secondes pour le démarrage du serveur..."
    sleep 5
    cd ..
fi

echo ""
echo "📋 Instructions de test détaillées :"
echo "===================================="
echo ""
echo "1️⃣ PREMIÈRE UTILISATION (Historique vide) :"
echo "   • Ouvrez l'application"
echo "   • Observez la page d'accueil"
echo "   • ✅ Vérifiez : Seules les sections 'Créer' et 'Rejoindre' sont visibles"
echo "   • ✅ Vérifiez : Aucune section 'Rooms récentes' (normal, historique vide)"
echo ""
echo "2️⃣ CRÉER UNE PREMIÈRE ROOM :"
echo "   • Tapez un nom de room (ex: 'Ma première room')"
echo "   • Cliquez sur 'Créer'"
echo "   • ✅ Vérifiez : Vous êtes redirigé vers la room"
echo "   • Note : Cette room est maintenant dans l'historique"
echo ""
echo "3️⃣ RETOUR À L'ACCUEIL :"
echo "   • Utilisez le bouton retour pour revenir à l'accueil"
echo "   • ✅ Vérifiez : Une nouvelle section 'Rooms récentes' est maintenant visible"
echo "   • ✅ Vérifiez : Votre room apparaît dans la liste avec :"
echo "     - Son nom en gras"
echo "     - Son code (ex: 'Code: ABC123')"
echo ""
echo "4️⃣ CRÉER PLUSIEURS ROOMS :"
echo "   • Créez 2-3 rooms supplémentaires avec des noms différents"
echo "   • Retournez à l'accueil après chaque création"
echo "   • ✅ Vérifiez : Toutes les rooms apparaissent dans 'Rooms récentes'"
echo "   • ✅ Vérifiez : Les rooms sont triées par ordre de création (plus récente en haut)"
echo ""
echo "5️⃣ TESTER LE JOIN DIRECT :"
echo "   • Cliquez sur une room dans 'Rooms récentes'"
echo "   • ✅ Vérifiez : Vous rejoignez directement la room sans taper le code"
echo "   • ✅ Vérifiez : Vous arrivez sur l'écran de la room sélectionnée"
echo ""
echo "6️⃣ TESTER LE TRI PAR DATE :"
echo "   • Retournez à l'accueil"
echo "   • Cliquez sur une room plus ancienne pour la rejoindre"
echo "   • Retournez à l'accueil"
echo "   • ✅ Vérifiez : Cette room est maintenant en haut de la liste"
echo "   • ✅ Vérifiez : Le tri se fait bien par 'dernière connexion'"
echo ""
echo "7️⃣ TESTER LA PERSISTANCE :"
echo "   • Fermez complètement l'application"
echo "   • Rouvrez l'application"
echo "   • ✅ Vérifiez : L'historique des rooms est toujours présent"
echo "   • ✅ Vérifiez : L'ordre est conservé"
echo ""
echo "8️⃣ TESTER AVEC UNE ROOM SUPPRIMÉE (Backend) :"
echo "   • Dans une room, notez son code"
echo "   • (Optionnel) Supprimez la room côté backend ou attendez qu'elle expire"
echo "   • Retournez à l'accueil et cliquez sur cette room dans l'historique"
echo "   • ✅ Vérifiez : Une alerte 'Room introuvable' s'affiche"
echo "   • ✅ Vérifiez : Options 'Non' et 'Supprimer' sont proposées"
echo "   • Cliquez sur 'Supprimer'"
echo "   • ✅ Vérifiez : La room disparaît de l'historique"
echo ""
echo "9️⃣ TESTER LA LIMITE D'HISTORIQUE :"
echo "   • Créez plus de 10 rooms"
echo "   • ✅ Vérifiez : Seules les 10 plus récentes sont conservées"
echo "   • ✅ Vérifiez : Les plus anciennes disparaissent automatiquement"
echo ""

echo "🎯 Points clés à vérifier :"
echo "=========================="
echo "• Affichage conditionnel de la section 'Rooms récentes'"
echo "• Join direct sans retaper le code"
echo "• Tri automatique par date de dernière connexion"
echo "• Persistance après fermeture/réouverture de l'app"
echo "• Gestion gracieuse des rooms inexistantes"
echo "• Limite de 10 rooms dans l'historique"
echo "• Interface cohérente avec le reste de l'app"
echo ""

echo "✨ Avantages de cette fonctionnalité :"
echo "====================================="
echo "• 🚀 Accès rapide aux rooms fréquemment utilisées"
echo "• 💾 Pas besoin de retenir/noter les codes de room"
echo "• 🕒 Tri intelligent par dernière utilisation"
echo "• 🧹 Nettoyage automatique des rooms obsolètes"
echo "• 📱 Interface native et intuitive"
echo "• 🔄 Persistance locale fiable"
echo ""

echo "🚀 Lancement de l'application mobile..."
cd mobile
npx expo start

echo ""
echo "📱 Application lancée - Suivez le guide ci-dessus pour tester !"
echo "🎉 Cette fonctionnalité améliore considérablement l'expérience utilisateur"
