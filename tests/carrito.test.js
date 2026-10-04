const request = require('supertest');
const app = require('../src/app');

describe('API de Carrito', () => {
  const emailPrueba = `carrito_${Date.now()}@aramayus.com`;
  let token;
  let productoId;

  beforeAll(async () => {
    // Crear usuario y loguearse
    await request(app)
      .post('/api/usuarios/registro')
      .send({ nombre: 'Test Carrito', email: emailPrueba, password: 'Test1234' });

    const loginRes = await request(app)
      .post('/api/usuarios/login')
      .send({ email: emailPrueba, password: 'Test1234' });
    token = loginRes.body.token;

    // Obtener un producto real del catálogo
    const productosRes = await request(app).get('/api/productos');
    productoId = productosRes.body.productos[0]?.id;
  });

  test('GET /api/carrito — sin token debe retornar 401', async () => {
    const res = await request(app).get('/api/carrito');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/carrito — carrito vacío debe retornar items en []', async () => {
    const res = await request(app)
      .get('/api/carrito')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  test('POST /api/carrito — debe agregar un producto', async () => {
    if (!productoId) return; // skip si no hay productos cargados

    const res = await request(app)
      .post('/api/carrito')
      .set('Authorization', `Bearer ${token}`)
      .send({ producto_id: productoId, talla: 'M', cantidad: 1 });

    expect(res.statusCode).toBe(201);
  });

  test('GET /api/carrito — debe mostrar el item agregado con totales calculados', async () => {
    if (!productoId) return;

    const res = await request(app)
      .get('/api/carrito')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('total');
  });
});