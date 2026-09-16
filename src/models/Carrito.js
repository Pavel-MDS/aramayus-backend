const pool = require('../config/db');

const Carrito = {
  async obtener(usuario_id) {
    const result = await pool.query(
      `SELECT ci.id, ci.talla, ci.color, ci.cantidad,
              p.id as producto_id, p.nombre, p.precio, p.precio_oferta,
              pi.url as imagen
       FROM carrito_items ci
       JOIN productos p ON p.id = ci.producto_id
       LEFT JOIN producto_imagenes pi ON pi.producto_id = p.id AND pi.es_principal = true
       WHERE ci.usuario_id = $1
       ORDER BY ci.created_at DESC`,
      [usuario_id]
    );
    return result.rows;
  },

  async agregarItem(usuario_id, { producto_id, talla, color, cantidad = 1 }) {
    const result = await pool.query(
      `INSERT INTO carrito_items (usuario_id, producto_id, talla, color, cantidad)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (usuario_id, producto_id, talla, color)
       DO UPDATE SET cantidad = carrito_items.cantidad + EXCLUDED.cantidad
       RETURNING *`,
      [usuario_id, producto_id, talla || null, color || null, cantidad]
    );
    return result.rows[0];
  },

  async actualizarCantidad(usuario_id, item_id, cantidad) {
    if (cantidad <= 0) {
      await pool.query(
        'DELETE FROM carrito_items WHERE id = $1 AND usuario_id = $2',
        [item_id, usuario_id]
      );
      return null;
    }
    const result = await pool.query(
      `UPDATE carrito_items SET cantidad = $1
       WHERE id = $2 AND usuario_id = $3 RETURNING *`,
      [cantidad, item_id, usuario_id]
    );
    return result.rows[0] || null;
  },

  async eliminarItem(usuario_id, item_id) {
    await pool.query(
      'DELETE FROM carrito_items WHERE id = $1 AND usuario_id = $2',
      [item_id, usuario_id]
    );
  },

  async vaciar(usuario_id) {
    await pool.query('DELETE FROM carrito_items WHERE usuario_id = $1', [usuario_id]);
  },
};

module.exports = Carrito;