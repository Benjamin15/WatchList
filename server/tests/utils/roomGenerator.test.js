const { generateRoomId } = require('../../src/utils/roomGenerator');

describe('Room Generator', () => {
  describe('generateRoomId', () => {
    it('should generate a string', () => {
      const roomId = generateRoomId();
      expect(typeof roomId).toBe('string');
    });

    it('should generate a 12-character string', () => {
      const roomId = generateRoomId();
      expect(roomId).toHaveLength(12);
    });

    it('should generate unique IDs', () => {
      const roomIds = new Set();
      for (let i = 0; i < 100; i++) {
        roomIds.add(generateRoomId());
      }
      expect(roomIds.size).toBe(100);
    });

    it('should not contain hyphens', () => {
      const roomId = generateRoomId();
      expect(roomId).not.toContain('-');
    });

    it('should only contain alphanumeric characters', () => {
      const roomId = generateRoomId();
      expect(roomId).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });
});
