const router = require('express').Router();
const ctrl = require('../controllers/usuarios.controller');
const verificarToken = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const { limiteAuth } = require('../middlewares/rateLimiter');
const { validarRegistro, validarLogin } = require('../middlewares/validaciones');

router.post('/registro', limiteAuth, validarRegistro, ctrl.registro);
router.post('/login', limiteAuth, validarLogin, ctrl.login);

router.get('/perfil', verificarToken, ctrl.obtenerPerfil);
router.put('/perfil', verificarToken, ctrl.actualizarPerfil);

router.get('/', verificarToken, isAdmin, ctrl.listarUsuarios);
router.delete('/:id', verificarToken, isAdmin, ctrl.eliminarUsuario);

module.exports = router;