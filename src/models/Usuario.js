const pool = require('../config/db');

const Usuario = {
  async crear({ nombre, email, password_hash }) {
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, email, rol, created_at`,
      [nombre, email, password_hash]
    );
    return result.rows[0];
  },

  async buscarPorEmail(email) {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async buscarPorId(id) {
    const result = await pool.query(
      `SELECT id, nombre, email, rol, altura, peso, pecho, cintura, cadera, hombros, talla_usual, created_at
       FROM usuarios WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async listar() {
    const result = await pool.query(
      `SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async actualizarPerfil(id, datos) {
    const { nombre, altura, peso, pecho, cintura, cadera, hombros, talla_usual } = datos;
    const result = await pool.query(
      `UPDATE usuarios
       SET nombre      = COALESCE($1, nombre),
           altura      = $2,
           peso        = $3,
           pecho       = $4,
           cintura     = $5,
           cadera      = $6,
           hombros     = $7,
           talla_usual = $8,
           updated_at  = NOW()
       WHERE id = $9
       RETURNING id, nombre, email, rol, altura, peso, pecho, cintura, cadera, hombros, talla_usual`,
      [nombre, altura || null, peso || null, pecho || null, cintura || null, cadera || null, hombros || null, talla_usual || null, id]
    );
    return result.rows[0];
  },

  async eliminar(id) {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
  },
};

module.exports = Usuario;