// aramayus-backend/src/models/Pago.js
const pool = require('../config/db');

const Pago = {
  async crear({ pedido_id, metodo, referencia_externa, monto }) {
    const result = await pool.query(
      `INSERT INTO pagos (pedido_id, metodo, referencia_externa, monto)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [pedido_id, metodo, referencia_externa, monto]
    );
    return result.rows[0];
  },

  async actualizarEstado(referencia_externa, estado) {
    const result = await pool.query(
      'UPDATE pagos SET estado = $1 WHERE referencia_externa = $2 RETURNING *',
      [estado, referencia_externa]
    );
    return result.rows[0];
  },
};

module.exports = Pago;