import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'watchlist_device_id';

/**
 * Génère un identifiant unique pour l'appareil
 */
function generateDeviceId(): string {
  return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Récupère l'identifiant de l'appareil, en le créant s'il n'existe pas
 */
export async function getDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      deviceId = generateDeviceId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Erreur lors de la récupération du deviceId:', error);
    // Fallback: générer un ID temporaire
    return generateDeviceId();
  }
}

/**
 * Supprime l'identifiant de l'appareil (pour les tests/debug)
 */
export async function clearDeviceId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression du deviceId:', error);
  }
}
