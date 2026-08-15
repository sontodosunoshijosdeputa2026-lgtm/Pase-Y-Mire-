import { supabase } from '../config/supabase.js';
import { User } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../config/jwt.js';

export class AuthService {
  /**
   * Registra un nuevo usuario
   */
  static async register(email, username, password) {
    try {
      // Verificar si el email ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Verificar si el username ya existe
      const { data: existingUsername } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUsername) {
        throw new Error('El username ya está en uso');
      }

      // Hashear contraseña
      const hashedPassword = await hashPassword(password);

      // Crear usuario en Supabase
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            username,
            password: hashedPassword,
            role: 'player',
            credits: 0,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error('Error al crear usuario: ' + error.message);
      }

      // Crear token JWT
      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      });

      return {
        user: new User(newUser).toJSON(),
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  static async login(email, password) {
    try {
      // Obtener usuario
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        throw new Error('Email o contraseña incorrectos');
      }

      // Verificar si está activo
      if (!user.is_active) {
        throw new Error('Tu cuenta ha sido desactivada');
      }

      // Comparar contraseña
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Email o contraseña incorrectos');
      }

      // Crear token JWT
      const token = generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });

      return {
        user: new User(user).toJSON(),
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  static async getProfile(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error('Usuario no encontrado');
      }

      return new User(user).toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  static async updateProfile(userId, updates) {
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error('Error al actualizar perfil: ' + error.message);
      }

      return new User(updatedUser).toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cambia la contraseña del usuario
   */
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      // Obtener usuario actual
      const { data: user } = await supabase
        .from('users')
        .select('password')
        .eq('id', userId)
        .single();

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña antigua
      const isPasswordValid = await comparePassword(oldPassword, user.password);

      if (!isPasswordValid) {
        throw new Error('Contraseña actual es incorrecta');
      }

      // Hashear nueva contraseña
      const hashedPassword = await hashPassword(newPassword);

      // Actualizar
      const { error } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw new Error('Error al cambiar contraseña: ' + error.message);
      }

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      throw error;
    }
  }
          }
  
