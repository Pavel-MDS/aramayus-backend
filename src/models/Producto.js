const pool = require('../config/db');

const Producto = {
  // Listado con filtros, orden y paginación (para el catálogo)
  async listar({ tipo, talla, color, categoria, destacado, sort = 'recientes', page = 1, pageSize = 6 } = {}) {
    const params = [];
    let where = 'WHERE p.activo = true';

    if (tipo) {
      params.push(tipo);
      where += ` AND p.tipo = $${params.length}`;
    }
    if (categoria) {
      params.push(categoria);
      where += ` AND p.categoria = $${params.length}`;
    }
    if (destacado === true) {
      where += ` AND p.destacado = true`;
    }
    if (talla) {
      params.push(talla);
      where += ` AND EXISTS (SELECT 1 FROM inventario i WHERE i.producto_id = p.id AND i.talla = $${params.length})`;
    }
    if (color) {
      params.push(color);
      where += ` AND EXISTS (SELECT 1 FROM inventario i WHERE i.producto_id = p.id AND i.color = $${params.length})`;
    }

    let orderBy = 'p.created_at DESC';
    if (sort === 'precio-asc') orderBy = 'p.precio ASC';
    if (sort === 'precio-desc') orderBy = 'p.precio DESC';

    // Total para paginación
    const countResult = await pool.query(
      `SELECT COUNT(DISTINCT p.id) FROM productos p ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * pageSize;
    params.push(pageSize, offset);

    const result = await pool.query(
      `SELECT DISTINCT p.*, pi.url as imagen_principal
       FROM productos p
       LEFT JOIN producto_imagenes pi ON pi.producto_id = p.id AND pi.es_principal = true
       ${where}
       ORDER BY ${orderBy}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      productos: result.rows,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async buscarPorId(id) {
    const producto = await pool.query('SELECT * FROM productos WHERE id = $1 AND activo = true', [id]);
    if (producto.rows.length === 0) return null;

    const inventario = await pool.query(
      'SELECT * FROM inventario WHERE producto_id = $1', [id]
    );
    const imagenes = await pool.query(
      'SELECT * FROM producto_imagenes WHERE producto_id = $1 ORDER BY es_principal DESC', [id]
    );

    // Tallas y colores únicos disponibles (con stock > 0)
    const tallasDisponibles = [...new Set(
      inventario.rows.filter(i => i.stock > 0).map(i => i.talla)
    )];
    const coloresDisponibles = [...new Set(
      inventario.rows.filter(i => i.stock > 0 && i.color).map(i => i.color)
    )];

    return {
      ...producto.rows[0],
      inventario: inventario.rows,
      imagenes: imagenes.rows,
      tallas: tallasDisponibles,
      colores: coloresDisponibles,
    };
  },

  async crear({ nombre, descripcion, precio, precio_oferta, tipo, categoria, destacado }) {
    const result = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, precio_oferta, tipo, categoria, destacado)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nombre, descripcion, precio, precio_oferta || null, tipo || null, categoria || null, destacado || false]
    );
    return result.rows[0];
  },

  async actualizar(id, { nombre, descripcion, precio, precio_oferta, tipo, categoria, destacado, activo }) {
    const result = await pool.query(
      `UPDATE productos
       SET nombre        = COALESCE($1, nombre),
           descripcion   = COALESCE($2, descripcion),
           precio        = COALESCE($3, precio),
           precio_oferta = $4,
           tipo          = COALESCE($5, tipo),
           categoria     = COALESCE($6, categoria),
           destacado     = COALESCE($7, destacado),
           activo        = COALESCE($8, activo),
           updated_at    = NOW()
       WHERE id = $9 RETURNING *`,
      [nombre, descripcion, precio, precio_oferta || null, tipo, categoria, destacado, activo, id]
    );
    return result.rows[0] || null;
  },

  async eliminar(id) {
    // Soft delete — mantiene el histórico en pedidos
    await pool.query('UPDATE productos SET activo = false WHERE id = $1', [id]);
  },

  async agregarImagen(producto_id, { url, es_principal }) {
    if (es_principal) {
      await pool.query(
        'UPDATE producto_imagenes SET es_principal = false WHERE producto_id = $1',
        [producto_id]
      );
    }
    const result = await pool.query(
      `INSERT INTO producto_imagenes (producto_id, url, es_principal)
       VALUES ($1, $2, $3) RETURNING *`,
      [producto_id, url, es_principal || false]
    );
    return result.rows[0];
  },

  // Reemplaza todo el inventario de un producto (usado desde el admin)
  async upsertInventario(producto_id, items) {
    // items: [{ talla, color, stock }]
    await pool.query('DELETE FROM inventario WHERE producto_id = $1', [producto_id]);

    const insertados = [];
    for (const item of items) {
      const result = await pool.query(
        `INSERT INTO inventario (producto_id, talla, color, stock)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [producto_id, item.talla, item.color || null, item.stock || 0]
      );
      insertados.push(result.rows[0]);
    }
    return insertados;
  },

  // Tipos únicos existentes (para poblar el filtro "Tipo de prenda")
  async listarTipos() {
    const result = await pool.query(
      `SELECT DISTINCT tipo FROM productos WHERE tipo IS NOT NULL AND activo = true ORDER BY tipo`
    );
    return result.rows.map(r => r.tipo);
  },
};

module.exports = Producto;