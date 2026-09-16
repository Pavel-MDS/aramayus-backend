const { body, validationResult } = require('express-validator');

function manejarErrores(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ error: errores.array()[0].msg, detalles: errores.array() });
  }
  next();
}

const validarRegistro = [
  body('nombre').trim().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Correo electrónico inválido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  manejarErrores,
];

const validarLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Correo electrónico inválido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  manejarErrores,
];

const validarProducto = [
  body('nombre').trim().isLength({ min: 2 }).withMessage('El nombre del producto es obligatorio'),
  body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor a 0'),
  manejarErrores,
];

const validarCarritoItem = [
  body('producto_id').isUUID().withMessage('producto_id debe ser un UUID válido'),
  body('cantidad').optional().isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero mayor a 0'),
  manejarErrores,
];

module.exports = { validarRegistro, validarLogin, validarProducto, validarCarritoItem };