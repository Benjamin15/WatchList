const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

// Créer un nouveau vote
router.post('/', voteController.createVote);

// Obtenir tous les votes d'une room
router.get('/room/:roomId', voteController.getVotesByRoom);

// Obtenir un vote spécifique
router.get('/:voteId', voteController.getVoteById);

// Voter pour une option
router.post('/submit', voteController.submitVote);

// Mettre à jour le statut d'un vote
router.patch('/:voteId/status', voteController.updateVoteStatus);

// Supprimer un vote
router.delete('/:voteId', voteController.deleteVote);

module.exports = router;
