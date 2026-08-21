const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

// POST /api/usuarios/registro
const registro = async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y password son obligatorios' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  try {
    const existente = await Usuario.buscarPorEmail(email);
    if (existente) {
      return res.status(409).json({ error: 'Este correo ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const nuevoUsuario = await Usuario.crear({ nombre, email, password_hash });
    const token = generarToken(nuevoUsuario);

    res.status(201).json({ usuario: nuevoUsuario, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// POST /api/usuarios/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }

  try {
    const usuario = await Usuario.buscarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);
    const { password_hash, ...usuarioSinPassword } = usuario;

    res.json({ usuario: usuarioSinPassword, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// GET /api/usuarios/perfil (protegida)
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.buscarPorId(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// PUT /api/usuarios/perfil (protegida)
const actualizarPerfil = async (req, res) => {
  try {
    const usuarioActualizado = await Usuario.actualizarPerfil(req.usuario.id, req.body);
    res.json(usuarioActualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

// GET /api/usuarios (protegida, solo admin)
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.listar();
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

// DELETE /api/usuarios/:id (protegida, solo admin)
const eliminarUsuario = async (req, res) => {
  try {
    await Usuario.eliminar(req.params.id);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

module.exports = {
  registro,
  login,
  obtenerPerfil,
  actualizarPerfil,
  listarUsuarios,
  eliminarUsuario,
};