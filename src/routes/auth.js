import express from 'express';

const router = express.Router();

// TODO: Implementar endpoints de autenticación
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/refresh

router.post('/register', (req, res) => {
  res.json({ message: 'Endpoint de registro - Próximamente' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Endpoint de login - Próximamente' });
});

export default router;
