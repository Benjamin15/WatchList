import AsyncStorage from '@react-native-async-storage/async-storage';
import { Room } from '../types';

const ROOMS_HISTORY_KEY = 'WatchParty_rooms_history';

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
      
      // S'assurer que le nom n'est pas vide
      const roomName = room.name?.trim() || `Room ${room.room_id}`;
      
      // Vérifier si la room existe déjà
      const existingIndex = history.findIndex(item => item.room_id === room.room_id);
      
      if (existingIndex >= 0) {
        // Mettre à jour la date de dernière connexion et le nom
        history[existingIndex].last_joined = now;
        history[existingIndex].name = roomName;
        console.log('[RoomHistoryService] Room mise à jour:', roomName);
      } else {
        // Ajouter la nouvelle room
        const newRoomHistory: RoomHistory = {
          id: room.id,
          room_id: room.room_id,
          name: roomName,
          created_at: room.created_at,
          last_joined: now
        };
        history.unshift(newRoomHistory);
        console.log('[RoomHistoryService] Nouvelle room ajoutée:', roomName);
      }
      
      // Limiter à 10 rooms maximum dans l'historique
      const limitedHistory = history.slice(0, 10);
      
      await AsyncStorage.setItem(ROOMS_HISTORY_KEY, JSON.stringify(limitedHistory));
      console.log('[RoomHistoryService] Historique sauvegardé avec', limitedHistory.length, 'rooms');
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
