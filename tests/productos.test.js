const request = require('supertest');
const app = require('../src/app');

describe('API de Productos', () => {
  test('GET /api/productos — debe retornar el catálogo', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('productos');
    expect(Array.isArray(res.body.productos)).toBe(true);
  });

  test('GET /api/productos/tipos — debe retornar tipos de prenda', async () => {
    const res = await request(app).get('/api/productos/tipos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/productos/sugerir-talla — modo rápido debe sugerir una talla', async () => {
    const res = await request(app)
      .post('/api/productos/sugerir-talla')
      .send({ modo: 'rapido', altura: 165, peso: 65 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('talla_sugerida');
  });

  test('POST /api/productos/sugerir-talla — modo medidas debe sugerir una talla', async () => {
    const res = await request(app)
      .post('/api/productos/sugerir-talla')
      .send({ modo: 'medidas', pecho: 90, cintura: 74, cadera: 98, hombros: 41 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('talla_sugerida');
  });

  test('POST /api/productos/sugerir-talla — sin datos debe retornar error 400', async () => {
    const res = await request(app)
      .post('/api/productos/sugerir-talla')
      .send({ modo: 'rapido' });

    expect(res.statusCode).toBe(400);
  });
});