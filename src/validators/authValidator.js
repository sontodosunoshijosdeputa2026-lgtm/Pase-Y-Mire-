import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email es requerido',
    }),
  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.min': 'Username debe tener al menos 3 caracteres',
      'string.max': 'Username no puede exceder 30 caracteres',
      'any.required': 'Username es requerido',
    }),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      'string.min': 'Contraseña debe tener al menos 8 caracteres',
      'string.pattern.base': 'Contraseña debe incluir mayúscula, minúscula, número y símbolo',
      'any.required': 'Contraseña es requerida',
    }),
  passwordConfirm: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'any.required': 'Confirmación de contraseña es requerida',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email es requerido',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Contraseña es requerida',
    }),
});

export const validateRegister = (data) => {
  return registerSchema.validate(data, { abortEarly: false });
};

export const validateLogin = (data) => {
  return loginSchema.validate(data, { abortEarly: false });
};
  
