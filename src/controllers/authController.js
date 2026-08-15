import { AuthService } from '../services/authService.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';

export class AuthController {
  /**
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const { email, username, password, passwordConfirm } = req.body;

      // Validar datos
      const { error, value } = validateRegister({
        email,
        username,
        password,
        passwordConfirm,
      });

      if (error) {
        return res.status(400).json({
          error: 'Validación fallida',
          details: error.details.map(e => ({
            field: e.path[0],
            message: e.message,
          })),
        });
      }

      // Registrar usuario
      const result = await AuthService.register(email, username, password);

      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validar datos
      const { error } = validateLogin({ email, password });

      if (error) {
        return res.status(400).json({
          error: 'Validación fallida',
          details: error.details.map(e => ({
            field: e.path[0],
            message: e.message,
          })),
        });
      }

      // Iniciar sesión
      const result = await AuthService.login(email, password);

      return res.status(200).json({
        message: 'Sesión iniciada exitosamente',
        data: result,
      });
    } catch (error) {
      // No exponer detalles sensibles
      return res.status(401).json({
        error: error.message === 'Email o contraseña incorrectos' 
          ? error.message 
          : 'Error al iniciar sesión',
      });
    }
  }

  /**
   * GET /api/auth/profile
   */
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const profile = await AuthService.getProfile(userId);

      return res.status(200).json({
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/auth/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { username } = req.body;

      // Solo permitir actualizar username por ahora
      if (!username || username.length < 3) {
        return res.status(400).json({
          error: 'Username debe tener al menos 3 caracteres',
        });
      }

      const updatedUser = await AuthService.updateProfile(userId, { username });

      return res.status(200).json({
        message: 'Perfil actualizado exitosamente',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/change-password
   */
  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword, passwordConfirm } = req.body;

      // Validar que las contraseñas coincidan
      if (newPassword !== passwordConfirm) {
        return res.status(400).json({
          error: 'Las nuevas contraseñas no coinciden',
        });
      }

      // Validar formato
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({
          error: 'Nueva contraseña debe tener al menos 8 caracteres',
        });
      }

      const result = await AuthService.changePassword(userId, oldPassword, newPassword);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }
          }
    
