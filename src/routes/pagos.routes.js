const router = require('express').Router();
const ctrl = require('../controllers/pagos.controller');
const verificarToken = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');


// El webhook se registra directamente en app.js (necesita body raw, no JSON)
router.post('/crear-sesion', verificarToken, ctrl.crearSesionPago);
router.post('/:pedido_id/reembolso', verificarToken, isAdmin, ctrl.reembolsarPago);

module.exports = router;