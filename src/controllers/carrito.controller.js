const Carrito = require('../models/Carrito');
const Pedido = require('../models/Pedido');
const pool = require('../config/db');

const TAX_RATE = 0.18;
const SHIPPING = 25;

// GET /api/carrito
const obtenerCarrito = async (req, res) => {
  try {
    const items = await Carrito.obtener(req.usuario.id);
    const subtotal = items.reduce((sum, i) => sum + Number(i.precio_oferta || i.precio) * i.cantidad, 0);
    const envio = subtotal > 0 ? SHIPPING : 0;
    const igv = subtotal * TAX_RATE;
    const total = subtotal + envio + igv;

    res.json({ items, subtotal, envio, igv, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

// POST /api/carrito
const agregarItem = async (req, res) => {
  const { producto_id, talla, color, cantidad } = req.body;
  if (!producto_id) return res.status(400).json({ error: 'producto_id es obligatorio' });

  try {
    const item = await Carrito.agregarItem(req.usuario.id, { producto_id, talla, color, cantidad });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
};

// PUT /api/carrito/:itemId
const actualizarItem = async (req, res) => {
  const { cantidad } = req.body;
  if (cantidad === undefined) return res.status(400).json({ error: 'cantidad es obligatoria' });

  try {
    const item = await Carrito.actualizarCantidad(req.usuario.id, req.params.itemId, cantidad);
    res.json(item || { message: 'Item eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el item' });
  }
};

// DELETE /api/carrito/:itemId
const eliminarItem = async (req, res) => {
  try {
    await Carrito.eliminarItem(req.usuario.id, req.params.itemId);
    res.json({ message: 'Item eliminado del carrito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el item' });
  }
};

// POST /api/carrito/checkout — crea un pedido a partir del carrito actual
const checkout = async (req, res) => {
  try {
    const items = await Carrito.obtener(req.usuario.id);
    if (items.length === 0) return res.status(400).json({ error: 'El carrito está vacío' });

    const subtotal = items.reduce((sum, i) => sum + Number(i.precio_oferta || i.precio) * i.cantidad, 0);
    const envio = SHIPPING;
    const igv = subtotal * TAX_RATE;
    const total = subtotal + envio + igv;

    const pedidoItems = items.map(i => ({
      producto_id: i.producto_id,
      nombre_producto: i.nombre,
      talla: i.talla,
      color: i.color,
      cantidad: i.cantidad,
      precio_unitario: Number(i.precio_oferta || i.precio),
    }));

    const pedido = await Pedido.crear({
      usuario_id: req.usuario.id,
      subtotal, envio, igv, total,
      items: pedidoItems,
    });

    await Carrito.vaciar(req.usuario.id);

    res.status(201).json(pedido);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar el checkout' });
  }
};

module.exports = { obtenerCarrito, agregarItem, actualizarItem, eliminarItem, checkout };