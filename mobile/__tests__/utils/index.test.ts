import { 
  formatDate, 
  formatRelativeDate, 
  truncateText, 
  getTmdbImageUrl, 
  validateRoomCode, 
  capitalize, 
  formatRoomName, 
  generateId 
} from '../../src/utils';

describe('Utility functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const formatted = formatDate('2023-01-15T10:30:00Z');
      
      expect(formatted).toBe('15/01/2023');
    });

    it('handles invalid date', () => {
      const formatted = formatDate('invalid');
      
      expect(formatted).toBe('Invalid Date');
    });

    it('formats date string correctly', () => {
      const formatted = formatDate('2023-12-25T15:45:00Z');
      
      expect(formatted).toBe('25/12/2023');
    });
  });

  describe('formatRelativeDate', () => {
    it('formats today correctly', () => {
      const today = new Date().toISOString();
      const formatted = formatRelativeDate(today);
      
      expect(formatted).toBe("Aujourd'hui");
    });

    it('formats yesterday correctly', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formatted = formatRelativeDate(yesterday.toISOString());
      
      expect(formatted).toBe('Hier');
    });

    it('formats days ago correctly', () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const formatted = formatRelativeDate(fiveDaysAgo.toISOString());
      
      expect(formatted).toBe('Il y a 5 jours');
    });

    it('formats months ago correctly', () => {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const formatted = formatRelativeDate(twoMonthsAgo.toISOString());
      
      expect(formatted).toContain('Il y a');
      expect(formatted).toContain('mois');
    });

    it('formats years ago correctly', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const formatted = formatRelativeDate(twoYearsAgo.toISOString());
      
      expect(formatted).toBe('Il y a 2 ans');
    });

    it('formats one year ago correctly', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const formatted = formatRelativeDate(oneYearAgo.toISOString());
      
      expect(formatted).toBe('Il y a 1 an');
    });
  });

  describe('truncateText', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const truncated = truncateText(longText, 20);
      
      expect(truncated).toBe('This is a very lo...');
      expect(truncated.length).toBeLessThanOrEqual(23); // 20 + 3 for "..."
    });

    it('does not truncate short text', () => {
      const shortText = 'Short text';
      const truncated = truncateText(shortText, 20);
      
      expect(truncated).toBe(shortText);
    });

    it('handles exact length text', () => {
      const exactText = 'This is exactly 20ch';
      const truncated = truncateText(exactText, 20);
      
      expect(truncated).toBe(exactText);
    });

    it('handles empty text', () => {
      const truncated = truncateText('', 20);
      
      expect(truncated).toBe('');
    });

    it('handles zero max length', () => {
      const truncated = truncateText('Some text', 0);
      
      expect(truncated).toBe('...');
    });

    it('handles very short max length', () => {
      const truncated = truncateText('Some text', 3);
      
      expect(truncated).toBe('...');
    });
  });

  describe('getTmdbImageUrl', () => {
    it('generates correct URL with default size', () => {
      const url = getTmdbImageUrl('/path/to/image.jpg');
      
      expect(url).toBe('https://image.tmdb.org/t/p/w500/path/to/image.jpg');
    });

    it('generates correct URL with custom size', () => {
      const url = getTmdbImageUrl('/path/to/image.jpg', 'w185');
      
      expect(url).toBe('https://image.tmdb.org/t/p/w185/path/to/image.jpg');
    });

    it('handles null path', () => {
      const url = getTmdbImageUrl(null);
      
      expect(url).toBe('https://via.placeholder.com/500x750/333333/FFFFFF?text=Pas+d%27image');
    });

    it('handles all sizes', () => {
      const sizes = ['w185', 'w342', 'w500', 'w780', 'original'] as const;
      
      sizes.forEach(size => {
        const url = getTmdbImageUrl('/test.jpg', size);
        expect(url).toBe(`https://image.tmdb.org/t/p/${size}/test.jpg`);
      });
    });
  });

  describe('validateRoomCode', () => {
    it('validates correct room code', () => {
      const isValid = validateRoomCode('ABC123');
      
      expect(isValid).toBe(true);
    });

    it('validates uppercase letters and numbers', () => {
      const isValid = validateRoomCode('XYZ789');
      
      expect(isValid).toBe(true);
    });

    it('rejects lowercase letters', () => {
      const isValid = validateRoomCode('abc123');
      
      expect(isValid).toBe(false);
    });

    it('rejects wrong length', () => {
      expect(validateRoomCode('ABC12')).toBe(false);  // too short
      expect(validateRoomCode('ABC1234')).toBe(false); // too long
    });

    it('rejects special characters', () => {
      const isValid = validateRoomCode('ABC-12');
      
      expect(isValid).toBe(false);
    });

    it('rejects empty string', () => {
      const isValid = validateRoomCode('');
      
      expect(isValid).toBe(false);
    });
  });

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      const result = capitalize('hello');
      
      expect(result).toBe('Hello');
    });

    it('handles already capitalized text', () => {
      const result = capitalize('Hello');
      
      expect(result).toBe('Hello');
    });

    it('handles uppercase text', () => {
      const result = capitalize('HELLO');
      
      expect(result).toBe('Hello');
    });

    it('handles mixed case text', () => {
      const result = capitalize('hELLO');
      
      expect(result).toBe('Hello');
    });

    it('handles empty string', () => {
      const result = capitalize('');
      
      expect(result).toBe('');
    });

    it('handles single character', () => {
      const result = capitalize('a');
      
      expect(result).toBe('A');
    });
  });

  describe('formatRoomName', () => {
    it('trims whitespace', () => {
      const result = formatRoomName('  Room Name  ');
      
      expect(result).toBe('Room Name');
    });

    it('replaces multiple spaces with single space', () => {
      const result = formatRoomName('Room    Name');
      
      expect(result).toBe('Room Name');
    });

    it('handles normal text', () => {
      const result = formatRoomName('Room Name');
      
      expect(result).toBe('Room Name');
    });

    it('handles empty string', () => {
      const result = formatRoomName('');
      
      expect(result).toBe('');
    });

    it('handles only spaces', () => {
      const result = formatRoomName('   ');
      
      expect(result).toBe('');
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
    });

    it('generates string IDs', () => {
      const id = generateId();
      
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('generates consistent format', () => {
      const ids = Array.from({ length: 10 }, () => generateId());
      
      ids.forEach(id => {
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(10); // Should be reasonably long
      });
    });
  });
});
