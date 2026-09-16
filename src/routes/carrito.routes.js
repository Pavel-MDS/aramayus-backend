const router = require('express').Router();
const ctrl = require('../controllers/carrito.controller');
const verificarToken = require('../middlewares/auth');

// Todas requieren sesión — el carrito es siempre del usuario autenticado
router.use(verificarToken);

router.get('/', ctrl.obtenerCarrito);
router.post('/', ctrl.agregarItem);
router.put('/:itemId', ctrl.actualizarItem);
router.delete('/:itemId', ctrl.eliminarItem);
router.post('/checkout', ctrl.checkout);

module.exports = router;