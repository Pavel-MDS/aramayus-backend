const router = require('express').Router();
const ctrl = require('../controllers/pedidos.controller');
const verificarToken = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

router.use(verificarToken);

router.get('/', ctrl.listarMisPedidos);
router.get('/admin/todos', isAdmin, ctrl.listarTodosLosPedidos);
router.get('/:id', ctrl.obtenerPedido);
router.put('/:id/estado', isAdmin, ctrl.actualizarEstado);

module.exports = router;