// Utilitaires pour formater les données

/**
 * Formate une date en format lisible
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formate une date en format relatif (il y a X jours)
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Aujourd'hui";
  } else if (diffInDays === 1) {
    return 'Hier';
  } else if (diffInDays < 30) {
    return `Il y a ${diffInDays} jours`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `Il y a ${months} mois`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  }
};

/**
 * Tronque un texte à une longueur donnée
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Génère une URL d'image TMDB complète
 */
export const getTmdbImageUrl = (
  path: string | null,
  size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string => {
  if (!path) {
    return 'https://via.placeholder.com/500x750/333333/FFFFFF?text=Pas+d%27image';
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * Valide un code de room (6 caractères alphanumériques)
 */
export const validateRoomCode = (code: string): boolean => {
  const regex = /^[A-Z0-9]{6}$/;
  return regex.test(code);
};

/**
 * Capitalise la première lettre d'une chaîne
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Nettoie et formate un nom de room
 */
export const formatRoomName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ');
};

/**
 * Génère un identifiant unique simple
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
