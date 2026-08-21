const router = require('express').Router();
const ctrl = require('../controllers/usuarios.controller');
const verificarToken = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

// Públicas
router.post('/registro', ctrl.registro);
router.post('/login', ctrl.login);

// Protegidas — requieren token
router.get('/perfil', verificarToken, ctrl.obtenerPerfil);
router.put('/perfil', verificarToken, ctrl.actualizarPerfil);

// Protegidas — solo admin
router.get('/', verificarToken, isAdmin, ctrl.listarUsuarios);
router.delete('/:id', verificarToken, isAdmin, ctrl.eliminarUsuario);

module.exports = router;