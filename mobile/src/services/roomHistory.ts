import AsyncStorage from '@react-native-async-storage/async-storage';
import { Room } from '../types';

const ROOMS_HISTORY_KEY = 'watchlist_rooms_history';

export interface RoomHistory {
  id: number;
  room_id: string;
  name: string;
  created_at: string;
  last_joined: string;
}

class RoomHistoryService {
  // Récupérer l'historique des rooms
  async getRoomsHistory(): Promise<RoomHistory[]> {
    try {
      const historyStr = await AsyncStorage.getItem(ROOMS_HISTORY_KEY);
      if (historyStr) {
        const history: RoomHistory[] = JSON.parse(historyStr);
        // Trier par date de dernière connexion (plus récent en premier)
        return history.sort((a, b) => new Date(b.last_joined).getTime() - new Date(a.last_joined).getTime());
      }
      return [];
    } catch (error) {
      console.error('[RoomHistoryService] Erreur récupération historique:', error);
      return [];
    }
  }

  // Ajouter une room à l'historique
  async addRoomToHistory(room: Room): Promise<void> {
    try {
      const history = await this.getRoomsHistory();
      const now = new Date().toISOString();
      
      // Vérifier si la room existe déjà
      const existingIndex = history.findIndex(item => item.room_id === room.room_id);
      
      if (existingIndex >= 0) {
        // Mettre à jour la date de dernière connexion
        history[existingIndex].last_joined = now;
        history[existingIndex].name = room.name; // Mettre à jour le nom au cas où il aurait changé
      } else {
        // Ajouter la nouvelle room
        const newRoomHistory: RoomHistory = {
          id: room.id,
          room_id: room.room_id,
          name: room.name,
          created_at: room.created_at,
          last_joined: now
        };
        history.unshift(newRoomHistory);
      }
      
      // Limiter à 10 rooms maximum dans l'historique
      const limitedHistory = history.slice(0, 10);
      
      await AsyncStorage.setItem(ROOMS_HISTORY_KEY, JSON.stringify(limitedHistory));
      console.log('[RoomHistoryService] Room ajoutée à l\'historique:', room.name);
    } catch (error) {
      console.error('[RoomHistoryService] Erreur ajout historique:', error);
    }
  }

  // Supprimer une room de l'historique
  async removeRoomFromHistory(roomId: string): Promise<void> {
    try {
      const history = await this.getRoomsHistory();
      const filteredHistory = history.filter(item => item.room_id !== roomId);
      await AsyncStorage.setItem(ROOMS_HISTORY_KEY, JSON.stringify(filteredHistory));
      console.log('[RoomHistoryService] Room supprimée de l\'historique:', roomId);
    } catch (error) {
      console.error('[RoomHistoryService] Erreur suppression historique:', error);
    }
  }

  // Vider l'historique complet
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ROOMS_HISTORY_KEY);
      console.log('[RoomHistoryService] Historique vidé');
    } catch (error) {
      console.error('[RoomHistoryService] Erreur vidage historique:', error);
    }
  }
}

export const roomHistoryService = new RoomHistoryService();
