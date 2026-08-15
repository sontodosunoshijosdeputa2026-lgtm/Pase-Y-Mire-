import express from 'express';

const router = express.Router();

// TODO: Implementar endpoints de juegos
// POST /api/games/spin
// POST /api/games/play
// GET /api/games/available

router.post('/spin', (req, res) => {
  res.json({ message: 'Spin del slot - Próximamente' });
});

export default router;
