const router = require('express').Router();
const ctrl = require('../controllers/productos.controller');
const verificarToken = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

// Públicas — catálogo
router.get('/', ctrl.listarProductos);
router.get('/tipos', ctrl.listarTipos);
router.post('/sugerir-talla', ctrl.sugerirTalla);
router.get('/:id', ctrl.obtenerProducto);

// Protegidas — solo admin
router.post('/', verificarToken, isAdmin, ctrl.crearProducto);
router.put('/:id', verificarToken, isAdmin, ctrl.actualizarProducto);
router.delete('/:id', verificarToken, isAdmin, ctrl.eliminarProducto);
router.post('/:id/imagenes', verificarToken, isAdmin, ctrl.agregarImagen);
router.put('/:id/inventario', verificarToken, isAdmin, ctrl.actualizarInventario);

module.exports = router;