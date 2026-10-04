const request = require('supertest');
const app = require('../src/app');

describe('API de Usuarios', () => {
  const emailPrueba = `test_${Date.now()}@aramayus.com`;
  let token;

  test('POST /api/usuarios/registro — debe crear un usuario nuevo', async () => {
    const res = await request(app)
      .post('/api/usuarios/registro')
      .send({ nombre: 'Usuario Test', email: emailPrueba, password: 'Test1234' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.email).toBe(emailPrueba);
  });

  test('POST /api/usuarios/registro — debe rechazar correo duplicado', async () => {
    const res = await request(app)
      .post('/api/usuarios/registro')
      .send({ nombre: 'Usuario Test', email: emailPrueba, password: 'Test1234' });

    expect(res.statusCode).toBe(409);
  });

  test('POST /api/usuarios/login — debe iniciar sesión correctamente', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({ email: emailPrueba, password: 'Test1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  test('POST /api/usuarios/login — debe rechazar contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({ email: emailPrueba, password: 'password_incorrecto' });

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/usuarios/perfil — sin token debe retornar 401', async () => {
    const res = await request(app).get('/api/usuarios/perfil');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/usuarios/perfil — con token válido debe retornar el perfil', async () => {
    const res = await request(app)
      .get('/api/usuarios/perfil')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(emailPrueba);
  });
});