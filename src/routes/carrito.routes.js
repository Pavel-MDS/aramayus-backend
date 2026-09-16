const router = require('express').Router();
const ctrl = require('../controllers/carrito.controller');
const verificarToken = require('../middlewares/auth');
const { validarCarritoItem } = require('../middlewares/validaciones');


// Todas requieren sesión — el carrito es siempre del usuario autenticado
router.use(verificarToken);

router.get('/', ctrl.obtenerCarrito);
router.post('/', validarCarritoItem, ctrl.agregarItem);
router.put('/:itemId', ctrl.actualizarItem);
router.delete('/:itemId', ctrl.eliminarItem);
router.post('/checkout', ctrl.checkout);

module.exports = router;