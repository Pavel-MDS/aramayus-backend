const Producto = require('../models/Producto');

// ─────────────────────────────────────────────
// Motor de sugerencia de talla (mismo algoritmo que el frontend)
// ─────────────────────────────────────────────
const SIZE_CHART = {
  XS:  { pecho: [76, 82],   cintura: [60, 66], cadera: [84, 90],   hombros: [36, 38] },
  S:   { pecho: [82, 88],   cintura: [66, 72], cadera: [90, 96],   hombros: [38, 40] },
  M:   { pecho: [88, 94],   cintura: [72, 78], cadera: [96, 102],  hombros: [40, 42] },
  L:   { pecho: [94, 100],  cintura: [78, 84], cadera: [102, 108], hombros: [42, 44] },
  XL:  { pecho: [100, 106], cintura: [84, 90], cadera: [108, 114], hombros: [44, 46] },
  XXL: { pecho: [106, 114], cintura: [90, 98], cadera: [114, 122], hombros: [46, 49] },
};
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function mejorTallaDisponible(talla, disponibles) {
  if (disponibles.includes(talla)) return talla;
  const idx = SIZE_ORDER.indexOf(talla);
  for (let i = 1; i <= SIZE_ORDER.length; i++) {
    if (idx + i < SIZE_ORDER.length && disponibles.includes(SIZE_ORDER[idx + i])) return SIZE_ORDER[idx + i];
    if (idx - i >= 0 && disponibles.includes(SIZE_ORDER[idx - i])) return SIZE_ORDER[idx - i];
  }
  return disponibles[0] || 'M';
}

function sugerirPorAlturaPeso(altura, peso) {
  const imc = peso / ((altura / 100) ** 2);
  if (altura < 158) return imc < 20 ? 'XS' : imc < 24 ? 'S' : imc < 28 ? 'M' : 'L';
  if (altura < 168) return imc < 19 ? 'XS' : imc < 23 ? 'S' : imc < 27 ? 'M' : imc < 31 ? 'L' : 'XL';
  if (altura < 178) return imc < 19 ? 'S' : imc < 23 ? 'M' : imc < 27 ? 'L' : imc < 31 ? 'XL' : 'XXL';
  return imc < 21 ? 'M' : imc < 25 ? 'L' : imc < 29 ? 'XL' : 'XXL';
}

function sugerirPorMedidas(pecho, cintura, cadera, hombros) {
  let mejorTalla = 'M';
  let mejorPuntaje = Infinity;

  for (const [talla, rangos] of Object.entries(SIZE_CHART)) {
    const distancia = (valor, [min, max]) =>
      valor < min ? min - valor : valor > max ? valor - max : 0;

    const puntaje =
      distancia(pecho, rangos.pecho) * 2 +
      distancia(cintura, rangos.cintura) * 1.5 +
      distancia(cadera, rangos.cadera) +
      distancia(hombros, rangos.hombros);

    if (puntaje < mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejorTalla = talla;
    }
  }
  return mejorTalla;
}

// POST /api/productos/sugerir-talla
const sugerirTalla = async (req, res) => {
  const { modo, altura, peso, pecho, cintura, cadera, hombros, tallas_disponibles } = req.body;

  if (!modo || !['rapido', 'medidas'].includes(modo)) {
    return res.status(400).json({ error: "El campo 'modo' debe ser 'rapido' o 'medidas'" });
  }

  let tallaBase;
  if (modo === 'rapido') {
    if (!altura || !peso) {
      return res.status(400).json({ error: 'Se requiere altura y peso para el modo rápido' });
    }
    tallaBase = sugerirPorAlturaPeso(Number(altura), Number(peso));
  } else {
    if (!pecho || !cintura || !cadera || !hombros) {
      return res.status(400).json({ error: 'Se requieren pecho, cintura, cadera y hombros para el modo medidas' });
    }
    tallaBase = sugerirPorMedidas(Number(pecho), Number(cintura), Number(cadera), Number(hombros));
  }

  const disponibles = Array.isArray(tallas_disponibles) && tallas_disponibles.length > 0
    ? tallas_disponibles
    : SIZE_ORDER;

  const tallaFinal = mejorTallaDisponible(tallaBase, disponibles);

  res.json({ talla_sugerida: tallaFinal, talla_base: tallaBase, modo });
};

// ─────────────────────────────────────────────
// CRUD de productos
// ─────────────────────────────────────────────

// GET /api/productos
const listarProductos = async (req, res) => {
  try {
    const { tipo, talla, color, categoria, destacado, sort, page, pageSize } = req.query;
    const resultado = await Producto.listar({
      tipo, talla, color, categoria,
      destacado: destacado === 'true',
      sort: sort || 'recientes',
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 6,
    });
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar productos' });
  }
};

// GET /api/productos/tipos
const listarTipos = async (req, res) => {
  try {
    const tipos = await Producto.listarTipos();
    res.json(tipos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar tipos' });
  }
};

// GET /api/productos/:id
const obtenerProducto = async (req, res) => {
  try {
    const producto = await Producto.buscarPorId(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// POST /api/productos (admin)
const crearProducto = async (req, res) => {
  const { nombre, precio } = req.body;
  if (!nombre || !precio) {
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
  }
  try {
    const producto = await Producto.crear(req.body);
    res.status(201).json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// PUT /api/productos/:id (admin)
const actualizarProducto = async (req, res) => {
  try {
    const producto = await Producto.actualizar(req.params.id, req.body);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// DELETE /api/productos/:id (admin)
const eliminarProducto = async (req, res) => {
  try {
    await Producto.eliminar(req.params.id);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

// POST /api/productos/:id/imagenes (admin)
const agregarImagen = async (req, res) => {
  const { url, es_principal } = req.body;
  if (!url) return res.status(400).json({ error: 'La URL de la imagen es obligatoria' });
  try {
    const imagen = await Producto.agregarImagen(req.params.id, { url, es_principal });
    res.status(201).json(imagen);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar imagen' });
  }
};

// PUT /api/productos/:id/inventario (admin)
const actualizarInventario = async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Se espera un arreglo 'items' con { talla, color, stock }" });
  }
  try {
    const inventario = await Producto.upsertInventario(req.params.id, items);
    res.json(inventario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar inventario' });
  }
};

module.exports = {
  listarProductos,
  listarTipos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  agregarImagen,
  actualizarInventario,
  sugerirTalla,
};