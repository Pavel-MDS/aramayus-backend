const Pedido = require('../models/Pedido');

const ESTADOS_VALIDOS = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

// GET /api/pedidos — historial del usuario autenticado
const listarMisPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.listarPorUsuario(req.usuario.id);
    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar pedidos' });
  }
};

// GET /api/pedidos/:id
const obtenerPedido = async (req, res) => {
  try {
    const pedido = await Pedido.buscarPorId(req.params.id, req.usuario.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
};

// PUT /api/pedidos/:id/estado (admin)
const actualizarEstado = async (req, res) => {
  const { estado } = req.body;
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Usa uno de: ${ESTADOS_VALIDOS.join(', ')}` });
  }
  try {
    const pedido = await Pedido.actualizarEstado(req.params.id, estado);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
};

// GET /api/pedidos/admin/todos (admin)
const listarTodosLosPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.listarTodos();
    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar todos los pedidos' });
  }
};

module.exports = { listarMisPedidos, obtenerPedido, actualizarEstado, listarTodosLosPedidos };