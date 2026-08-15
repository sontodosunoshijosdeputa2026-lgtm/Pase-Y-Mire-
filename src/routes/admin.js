import express from 'express';
import { roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// TODO: Implementar endpoints de administración
// GET /api/admin/users
// POST /api/admin/credits
// GET /api/admin/stats

router.use(roleMiddleware(['super_admin', 'sub_admin']));

router.get('/users', (req, res) => {
  res.json({ message: 'Listado de usuarios - Próximamente' });
});

export default router;
