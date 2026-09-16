// aramayus-backend/src/models/Pedido.js
const pool = require('../config/db');

const Pedido = {
  async crear({ usuario_id, subtotal, envio, igv, total, items }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const pedido = await client.query(
        `INSERT INTO pedidos (usuario_id, subtotal, envio, igv, total)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [usuario_id, subtotal, envio, igv, total]
      );

      for (const item of items) {
        await client.query(
          `INSERT INTO pedido_items (pedido_id, producto_id, nombre_producto, talla, color, cantidad, precio_unitario)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [pedido.rows[0].id, item.producto_id, item.nombre_producto, item.talla, item.color, item.cantidad, item.precio_unitario]
        );
      }

      await client.query('COMMIT');
      return pedido.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async listarPorUsuario(usuario_id) {
    const result = await pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC',
      [usuario_id]
    );
    return result.rows;
  },

  async actualizarEstado(id, estado) {
    const result = await pool.query(
      'UPDATE pedidos SET estado = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [estado, id]
    );
    return result.rows[0];
  },
};

module.exports = Pedido;