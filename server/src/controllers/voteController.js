const { PrismaClient } = require('@prisma/client');

class VoteController {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // Créer un nouveau vote
  async createVote(req, res) {
    try {
      const { roomId, title, description, duration, durationUnit, mediaIds, createdBy } = req.body;

      if (!roomId || !title || !mediaIds || mediaIds.length === 0 || !createdBy) {
        return res.status(400).json({ 
          error: 'roomId, title, mediaIds et createdBy sont requis' 
        });
      }

      // Convertir roomId en string pour assurer la compatibilité
      const roomIdStr = String(roomId);

      // Mettre à jour les votes expirés avant de vérifier s'il y en a un actif
      await this.updateExpiredVotes();

      // Vérifier s'il existe déjà un vote actif dans cette room
      const existingActiveVote = await this.prisma.vote.findFirst({
        where: {
          roomId: roomIdStr,
          status: 'active'
        }
      });

      if (existingActiveVote) {
        return res.status(409).json({
          error: 'Il y a déjà un vote actif dans cette room',
          details: {
            existingVoteId: existingActiveVote.id,
            existingVoteTitle: existingActiveVote.title,
            existingVoteCreatedBy: existingActiveVote.createdBy
          }
        });
      }

      // Calculer la date de fin si une durée est spécifiée
      let endsAt = null;
      if (duration && duration > 0) {
        const unit = durationUnit || 'hours'; // défaut: heures pour compatibilité
        let multiplier;
        
        switch (unit) {
          case 'seconds':
            multiplier = 1000; // Pour les tests
            break;
          case 'minutes':
            multiplier = 60 * 1000;
            break;
          case 'hours':
          default:
            multiplier = 60 * 60 * 1000;
            break;
        }
        
        endsAt = new Date(Date.now() + duration * multiplier);
      }

      // Créer le vote avec ses options dans une transaction
      const vote = await this.prisma.vote.create({
        data: {
          roomId: roomIdStr,
          title,
          description,
          duration,
          createdBy,
          endsAt,
          options: {
            create: mediaIds.map(mediaId => ({
              itemId: mediaId
            }))
          }
        },
        include: {
          options: {
            include: {
              item: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Vote créé avec succès',
        data: { voteId: vote.id }
      });
    } catch (error) {
      console.error('Erreur lors de la création du vote:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Obtenir tous les votes d'une room
  async getVotesByRoom(req, res) {
    try {
      const { roomId } = req.params;
      const { deviceId } = req.query;

      if (!roomId) {
        return res.status(400).json({ error: 'roomId est requis' });
      }

      // Mettre à jour les votes expirés avant de les récupérer
      await this.updateExpiredVotes();

      const votes = await this.prisma.vote.findMany({
        where: { roomId: String(roomId) },
        include: {
          options: {
            include: {
              item: true,
              results: true
            }
          },
          results: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculer les statistiques pour chaque vote
      const votesWithStats = votes.map(vote => {
        const totalVotes = vote.results.length;
        const userHasVoted = deviceId ? vote.results.some(result => result.deviceId === deviceId) : false;
        
        const optionsWithStats = vote.options.map(option => {
          const voteCount = option.results.length;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          
          return {
            id: option.id,
            voteId: option.voteId,
            mediaId: option.itemId,
            voteCount,
            percentage,
            media: {
              id: option.item.id,
              title: option.item.title,
              type: option.item.type,
              year: option.item.releaseDate ? new Date(option.item.releaseDate).getFullYear() : null,
              genre: option.item.description,
              posterUrl: option.item.imageUrl,
              tmdbId: option.item.externalId
            }
          };
        });

        return {
          id: vote.id,
          roomId: vote.roomId,
          title: vote.title,
          description: vote.description,
          duration: vote.duration,
          status: vote.status,
          createdBy: vote.createdBy,
          createdAt: vote.createdAt.toISOString(),
          endsAt: vote.endsAt ? vote.endsAt.toISOString() : null,
          totalVotes,
          userHasVoted,
          options: optionsWithStats
        };
      });

      res.json({
        success: true,
        data: votesWithStats
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des votes:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Obtenir un vote spécifique
  async getVoteById(req, res) {
    try {
      const { voteId } = req.params;
      const { deviceId } = req.query;

      if (!voteId) {
        return res.status(400).json({ error: 'voteId est requis' });
      }

      const vote = await this.prisma.vote.findUnique({
        where: { id: parseInt(voteId) },
        include: {
          options: {
            include: {
              item: true,
              results: true
            }
          },
          results: true
        }
      });

      if (!vote) {
        return res.status(404).json({ error: 'Vote non trouvé' });
      }

      const totalVotes = vote.results.length;
      const maxVotes = Math.max(...vote.options.map(o => o.results.length));
      const userHasVoted = deviceId ? vote.results.some(result => result.deviceId === deviceId) : false;
      
      const optionsWithStats = vote.options.map(option => {
        const voteCount = option.results.length;
        const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
        
        return {
          id: option.id,
          voteId: option.voteId,
          mediaId: option.itemId,
          voteCount,
          percentage,
          isWinner: voteCount === maxVotes && maxVotes > 0,
          media: {
            id: option.item.id,
            title: option.item.title,
            type: option.item.type,
            year: option.item.releaseDate ? new Date(option.item.releaseDate).getFullYear() : null,
            genre: option.item.description,
            description: option.item.description,
            posterUrl: option.item.imageUrl,
            tmdbId: option.item.externalId
          }
        };
      });

      const voteWithStats = {
        id: vote.id,
        roomId: vote.roomId,
        title: vote.title,
        description: vote.description,
        duration: vote.duration,
        status: vote.status,
        createdBy: vote.createdBy,
        createdAt: vote.createdAt.toISOString(),
        endsAt: vote.endsAt ? vote.endsAt.toISOString() : null,
        totalVotes,
        userHasVoted,
        options: optionsWithStats.sort((a, b) => b.voteCount - a.voteCount)
      };

      res.json({
        success: true,
        data: voteWithStats
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du vote:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Voter pour une option
  async submitVote(req, res) {
    try {
      const { voteId, optionId, voterName, deviceId } = req.body;

      if (!voteId || !optionId) {
        return res.status(400).json({ error: 'voteId et optionId sont requis' });
      }

      // Vérifier que le vote existe et est actif
      const vote = await this.prisma.vote.findUnique({
        where: { id: voteId },
        include: {
          options: {
            where: { id: optionId }
          },
          results: deviceId ? {
            where: { deviceId }
          } : false
        }
      });

      if (!vote) {
        return res.status(404).json({ error: 'Vote non trouvé' });
      }

      if (vote.status !== 'active') {
        return res.status(400).json({ error: 'Le vote n\'est plus actif' });
      }

      // Vérifier si le vote a expiré
      if (vote.endsAt && new Date(vote.endsAt) < new Date()) {
        // Marquer le vote comme expiré
        await this.prisma.vote.update({
          where: { id: voteId },
          data: { status: 'expired' }
        });
        return res.status(400).json({ error: 'Le vote a expiré' });
      }

      if (vote.options.length === 0) {
        return res.status(404).json({ error: 'Option non trouvée' });
      }

      // Vérifier si l'utilisateur a déjà voté (si deviceId fourni)
      if (deviceId && vote.results && vote.results.length > 0) {
        return res.status(400).json({ error: 'Vous avez déjà voté pour ce vote' });
      }

      // Enregistrer le vote
      const result = await this.prisma.voteResult.create({
        data: {
          voteId,
          optionId,
          voterName: voterName || null,
          deviceId: deviceId || null
        }
      });

      res.json({
        success: true,
        message: 'Vote enregistré avec succès',
        data: { resultId: result.id }
      });
    } catch (error) {
      console.error('Erreur lors du vote:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Supprimer un vote
  async deleteVote(req, res) {
    try {
      const { voteId } = req.params;

      if (!voteId) {
        return res.status(400).json({ error: 'voteId est requis' });
      }

      const vote = await this.prisma.vote.findUnique({
        where: { id: parseInt(voteId) }
      });

      if (!vote) {
        return res.status(404).json({ error: 'Vote non trouvé' });
      }

      await this.prisma.vote.delete({
        where: { id: parseInt(voteId) }
      });

      res.json({
        success: true,
        message: 'Vote supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du vote:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Mettre à jour le statut d'un vote
  async updateVoteStatus(req, res) {
    try {
      const { voteId } = req.params;
      const { status } = req.body;

      if (!voteId || !status) {
        return res.status(400).json({ error: 'voteId et status sont requis' });
      }

      if (!['active', 'completed', 'expired'].includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
      }

      const vote = await this.prisma.vote.findUnique({
        where: { id: parseInt(voteId) }
      });

      if (!vote) {
        return res.status(404).json({ error: 'Vote non trouvé' });
      }

      await this.prisma.vote.update({
        where: { id: parseInt(voteId) },
        data: { status }
      });

      res.json({
        success: true,
        message: 'Statut mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Mettre à jour automatiquement les votes expirés
  async updateExpiredVotes() {
    try {
      const now = new Date();
      
      // Trouver tous les votes actifs dont la date de fin est passée
      const expiredVotes = await this.prisma.vote.findMany({
        where: {
          status: 'active',
          endsAt: {
            lt: now
          }
        }
      });

      // Mettre à jour leur statut à 'expired'
      if (expiredVotes.length > 0) {
        await this.prisma.vote.updateMany({
          where: {
            status: 'active',
            endsAt: {
              lt: now
            }
          },
          data: {
            status: 'expired'
          }
        });

        console.log(`[VoteController] ${expiredVotes.length} votes mis à jour vers 'expired'`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des votes expirés:', error);
    }
  }
}

const voteController = new VoteController();

module.exports = {
  createVote: voteController.createVote.bind(voteController),
  getVotesByRoom: voteController.getVotesByRoom.bind(voteController),
  getVoteById: voteController.getVoteById.bind(voteController),
  submitVote: voteController.submitVote.bind(voteController),
  deleteVote: voteController.deleteVote.bind(voteController),
  updateVoteStatus: voteController.updateVoteStatus.bind(voteController),
};
