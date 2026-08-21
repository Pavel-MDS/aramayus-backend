CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE rol_usuario AS ENUM ('admin', 'cliente');

CREATE TABLE usuarios (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol           rol_usuario DEFAULT 'cliente',
  -- Medidas corporales (igual que en el frontend)
  altura        DECIMAL(5,1),
  peso          DECIMAL(5,1),
  pecho         DECIMAL(5,1),
  cintura       DECIMAL(5,1),
  cadera        DECIMAL(5,1),
  hombros       DECIMAL(5,1),
  talla_usual   VARCHAR(5),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);