const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('🗑️  Nettoyage de la base de données...');
    
    // Supprimer toutes les relations d'abord (à cause des contraintes de clés étrangères)
    console.log('Suppression des relations item_in_room...');
    await prisma.itemInRoom.deleteMany({});
    
    // Supprimer tous les items
    console.log('Suppression des items...');
    await prisma.item.deleteMany({});
    
    // Supprimer toutes les rooms
    console.log('Suppression des rooms...');
    await prisma.room.deleteMany({});
    
    // Vérifier que tout est supprimé
    const roomCount = await prisma.room.count();
    const itemCount = await prisma.item.count();
    const relationCount = await prisma.itemInRoom.count();
    
    console.log('\n📊 État de la base de données après nettoyage:');
    console.log(`Rooms: ${roomCount}`);
    console.log(`Items: ${itemCount}`);
    console.log(`Relations: ${relationCount}`);
    
    if (roomCount === 0 && itemCount === 0 && relationCount === 0) {
      console.log('\n✅ Base de données nettoyée avec succès !');
    } else {
      console.log('\n❌ Erreur: Certaines données n\'ont pas été supprimées');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
