// aramayus-backend/src/app.js
const express = require('express');
const cors    = require('cors');
require('dotenv').config();
require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: '🧶 Aramayu\'s Art — Backend API (Actividad 14)' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/productos', require('./routes/productos.routes')); 
app.use('/api/carrito', require('./routes/carrito.routes'));  
app.use('/api/pedidos', require('./routes/pedidos.routes')); 
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;