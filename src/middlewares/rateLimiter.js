const rateLimit = require('express-rate-limit');

// Límite general — 100 solicitudes cada 15 minutos por IP
const limiteGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo en unos minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite estricto para login/registro — previene fuerza bruta
const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos. Espera unos minutos antes de volver a intentar' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { limiteGeneral, limiteAuth };