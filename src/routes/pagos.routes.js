const router = require('express').Router();
const ctrl = require('../controllers/pagos.controller');
const verificarToken = require('../middlewares/auth');

// El webhook se registra directamente en app.js (necesita body raw, no JSON)
router.post('/crear-sesion', verificarToken, ctrl.crearSesionPago);

module.exports = router;