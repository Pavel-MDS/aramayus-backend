-- ═══════════════════════════════════════
-- PRODUCTOS
-- ═══════════════════════════════════════
CREATE TABLE productos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre        VARCHAR(200) NOT NULL,
  descripcion   TEXT,
  precio        DECIMAL(10,2) NOT NULL CHECK (precio > 0),
  precio_oferta DECIMAL(10,2),
  categoria     VARCHAR(100),
  destacado     BOOLEAN DEFAULT FALSE,
  activo        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Imágenes de cada producto
CREATE TABLE producto_imagenes (
  id           SERIAL PRIMARY KEY,
  producto_id  UUID REFERENCES productos(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  es_principal BOOLEAN DEFAULT FALSE
);

-- Inventario: talla + color + stock, separado del producto
CREATE TABLE inventario (
  id          SERIAL PRIMARY KEY,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  talla       VARCHAR(5) NOT NULL,
  color       VARCHAR(50),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  UNIQUE(producto_id, talla, color)
);

-- ═══════════════════════════════════════
-- PEDIDOS
-- ═══════════════════════════════════════
CREATE TYPE estado_pedido AS ENUM ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado');

CREATE TABLE pedidos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id       UUID REFERENCES usuarios(id),
  subtotal         DECIMAL(10,2) NOT NULL,
  envio            DECIMAL(10,2) NOT NULL DEFAULT 0,
  igv              DECIMAL(10,2) NOT NULL DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL,
  estado           estado_pedido DEFAULT 'pendiente',
  direccion_envio  JSONB,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- Items dentro de cada pedido
CREATE TABLE pedido_items (
  id              SERIAL PRIMARY KEY,
  pedido_id       UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id     UUID REFERENCES productos(id),
  nombre_producto VARCHAR(200), -- snapshot: si el producto se borra, el pedido conserva el nombre
  talla           VARCHAR(5),
  color           VARCHAR(50),
  cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL
);

-- ═══════════════════════════════════════
-- PAGOS
-- ═══════════════════════════════════════
CREATE TYPE estado_pago AS ENUM ('pendiente', 'completado', 'fallido', 'reembolsado');
CREATE TYPE metodo_pago AS ENUM ('stripe', 'paypal');

CREATE TABLE pagos (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id          UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  metodo             metodo_pago NOT NULL DEFAULT 'stripe',
  referencia_externa TEXT,     -- ej: stripe_session_id
  monto              DECIMAL(10,2) NOT NULL,
  estado             estado_pago DEFAULT 'pendiente',
  created_at         TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- ÍNDICES
-- ═══════════════════════════════════════
CREATE INDEX idx_inventario_producto ON inventario(producto_id);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedido_items_pedido ON pedido_items(pedido_id);
CREATE INDEX idx_pagos_pedido ON pagos(pedido_id);