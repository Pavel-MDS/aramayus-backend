// aramayus-backend/src/app.js
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();
require('./config/db');

const stripe = require('./config/stripe');
const { limiteGeneral } = require('./middlewares/rateLimiter');
const sanitizarBody = require('./middlewares/sanitizar');

const app = express();

// ─── Seguridad ───
app.use(helmet()); // Cabeceras HTTP seguras (previene varios ataques XSS/clickjacking)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(limiteGeneral); // Rate limiting global

// ─── Webhook de Stripe — DEBE ir ANTES de express.json() ───
// Stripe necesita el body crudo (raw) para verificar la firma
app.post('/api/pagos/webhook', express.raw({ type: 'application/json' }), require('./controllers/pagos.controller').webhookStripe);

// ─── Parsers normales (para el resto de rutas) ───
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizarBody); // Sanitización contra XSS en todos los bodies

app.get('/', (req, res) => {
  res.json({ message: '🧶 Aramayu\'s Art — Backend API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/usuarios',  require('./routes/usuarios.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/carrito',   require('./routes/carrito.routes'));
app.use('/api/pedidos',   require('./routes/pedidos.routes'));
app.use('/api/pagos',     require('./routes/pagos.routes'));

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;