const stripe = require('../config/stripe');
const Pedido = require('../models/Pedido');
const Pago = require('../models/Pago');
const pool = require('../config/db');

// POST /api/pagos/crear-sesion — genera un Stripe Checkout Session para un pedido existente
const crearSesionPago = async (req, res) => {
  const { pedido_id } = req.body;
  if (!pedido_id) return res.status(400).json({ error: 'pedido_id es obligatorio' });

  try {
    const pedido = await Pedido.buscarPorId(pedido_id, req.usuario.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (pedido.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Este pedido ya no está pendiente de pago' });
    }

    const line_items = pedido.items.map(item => ({
      price_data: {
        currency: 'pen',
        product_data: {
          name: item.nombre_producto,
          description: [item.talla, item.color].filter(Boolean).join(' · ') || undefined,
        },
        unit_amount: Math.round(Number(item.precio_unitario) * 100),
      },
      quantity: item.cantidad,
    }));

    line_items.push({
      price_data: { currency: 'pen', product_data: { name: 'Envío' }, unit_amount: Math.round(Number(pedido.envio) * 100) },
      quantity: 1,
    });
    line_items.push({
      price_data: { currency: 'pen', product_data: { name: 'IGV (18%)' }, unit_amount: Math.round(Number(pedido.igv) * 100) },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      customer_email: req.usuario.email,
      success_url: `${process.env.FRONTEND_URL}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancelado`,
      metadata: { pedido_id: pedido.id, usuario_id: req.usuario.id },
    });

    await Pago.crear({
      pedido_id: pedido.id,
      metodo: 'stripe',
      referencia_externa: session.id,
      monto: pedido.total,
    });

    res.json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la sesión de pago' });
  }
};

// POST /api/pagos/webhook — Stripe llama aquí de forma asíncrona
const webhookStripe = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Firma de webhook inválida:', err.message);
    return res.status(400).json({ error: 'Firma inválida' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const pedido_id = session.metadata?.pedido_id;

    try {
      await Pago.actualizarEstado(session.id, 'completado');
      if (pedido_id) {
        await pool.query(
          "UPDATE pedidos SET estado = 'pagado', updated_at = NOW() WHERE id = $1",
          [pedido_id]
        );
      }
    } catch (err) {
      console.error('Error al actualizar pedido tras webhook:', err);
    }
  }

  res.json({ received: true });
};

// POST /api/pagos/:pedido_id/reembolso (admin)
const reembolsarPago = async (req, res) => {
  const { pedido_id } = req.params;

  try {
    const pagoResult = await pool.query(
      "SELECT referencia_externa FROM pagos WHERE pedido_id = $1 AND estado = 'completado' ORDER BY created_at DESC LIMIT 1",
      [pedido_id]
    );

    if (pagoResult.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró un pago completado para este pedido' });
    }

    const sessionId = pagoResult.rows[0].referencia_externa;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const refund = await stripe.refunds.create({
      payment_intent: session.payment_intent,
    });

    await pool.query("UPDATE pagos SET estado = 'reembolsado' WHERE referencia_externa = $1", [sessionId]);
    await pool.query("UPDATE pedidos SET estado = 'cancelado', updated_at = NOW() WHERE id = $1", [pedido_id]);

    res.json({ message: 'Reembolso procesado correctamente', refund_id: refund.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar el reembolso' });
  }
};

module.exports = { crearSesionPago, webhookStripe, reembolsarPago };