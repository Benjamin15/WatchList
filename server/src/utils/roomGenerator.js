const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique room ID
 * @returns {string} A unique room ID
 */
function generateRoomId() {
  return uuidv4().replace(/-/g, '').substring(0, 12);
}

module.exports = {
  generateRoomId
};
