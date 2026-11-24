import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Lightweight in-memory rate limiter: max 5 submissions per 15 minutes per IP
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const rateStore = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (rateStore.size > 2000) {
    for (const [key, entry] of rateStore.entries()) {
      if (entry.resetAt <= now) rateStore.delete(key);
    }
  }
  const current = rateStore.get(ip);
  if (!current || current.resetAt <= now) {
    rateStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (current.count >= RATE_MAX_REQUESTS) {
    return true;
  }
  current.count += 1;
  return false;
}

function stripHeaderBreaks(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createTransporter() {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  return {
    user,
    to: (process.env.CONTACT_TO_EMAIL || user).trim(),
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: {
        user,
        pass,
      },
    }),
  };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  app.get('/healthz', (_req: Request, res: Response) => {
    res.status(200).json({ ok: true });
  });

  app.post('/api/contact', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
      res.status(429).json({
        error: 'Demasiados envíos en pocos minutos. Inténtalo nuevamente más tarde.',
      });
      return;
    }

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const segment = body.segment === 'hogar' ? 'hogar' : body.segment === 'empresa' ? 'empresa' : null;
    const name = typeof body.name === 'string' ? stripHeaderBreaks(body.name) : '';
    const email = typeof body.email === 'string' ? stripHeaderBreaks(body.email) : '';
    const phone = typeof body.phone === 'string' ? stripHeaderBreaks(body.phone) : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!segment) {
      res.status(400).json({ error: 'Selecciona un tipo de proyecto válido.' });
      return;
    }
    if (name.length < 2 || name.length > 120) {
      res.status(400).json({ error: 'Ingresa un nombre válido (entre 2 y 120 caracteres).' });
      return;
    }
    if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
      return;
    }
    const digitsOnly = phone.replace(/\D/g, '');
    if (phone.length > 40 || digitsOnly.length < 7) {
      res.status(400).json({ error: 'Ingresa un teléfono de contacto válido.' });
      return;
    }
    if (message.length > 1500) {
      res.status(400).json({ error: 'El mensaje no puede superar los 1500 caracteres.' });
      return;
    }

    const mailConfig = createTransporter();
    if (!mailConfig) {
      res.status(503).json({
        error: 'El servicio de correo aún no está configurado en el servidor (faltan variables SMTP_USER / SMTP_PASS).',
      });
      return;
    }

    const refCode = `BLD-${Math.floor(10000 + Math.random() * 90000)}`;
    const segmentLabel = segment === 'empresa' ? 'Empresarial' : 'Hogar';
    const safeMessageText = message || '(Sin mensaje adicional)';

    try {
      await mailConfig.transporter.sendMail({
        from: `"BlinD Seguridad Perimetral" <${mailConfig.user}>`,
        to: mailConfig.to,
        replyTo: email,
        subject: `[BlinD ${refCode}] Nuevo contacto (${segmentLabel}) - ${name}`,
        text: [
          `Nuevo contacto desde www.blind.pe`,
          `Referencia: #${refCode}`,
          `Segmento: ${segmentLabel}`,
          `Nombre: ${name}`,
          `Correo: ${email}`,
          `Teléfono: ${phone}`,
          ``,
          `Mensaje:`,
          safeMessageText,
        ].join('\n'),
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #070B10; color: #F2F6FA; padding: 28px; border-radius: 12px; border: 1px solid #1E293B;">
            <p style="margin: 0; font-size: 12px; letter-spacing: 0.14em; color: #38BDF8; font-weight: 700;">BLIND SEGURIDAD PERIMETRAL</p>
            <h2 style="margin: 8px 0 18px; font-size: 20px; color: #FFFFFF;">Nuevo mensaje de contacto #${escapeHtml(refCode)}</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #94A3B8; width: 120px;">Segmento</td><td style="padding: 8px 0; color: #FFFFFF; font-weight: 600;">${escapeHtml(segmentLabel)}</td></tr>
              <tr><td style="padding: 8px 0; color: #94A3B8;">Nombre</td><td style="padding: 8px 0; color: #FFFFFF;">${escapeHtml(name)}</td></tr>
              <tr><td style="padding: 8px 0; color: #94A3B8;">Correo</td><td style="padding: 8px 0; color: #38BDF8;">${escapeHtml(email)}</td></tr>
              <tr><td style="padding: 8px 0; color: #94A3B8;">Teléfono</td><td style="padding: 8px 0; color: #FFFFFF;">${escapeHtml(phone)}</td></tr>
            </table>
            <div style="margin-top: 18px; padding: 14px; background: #0D141D; border-radius: 8px; border: 1px solid #1E293B;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #94A3B8;">Mensaje</p>
              <p style="margin: 0; font-size: 14px; color: #E2E8F0; white-space: pre-wrap;">${escapeHtml(safeMessageText)}</p>
            </div>
          </div>
        `,
      });

      res.status(200).json({ ok: true, code: refCode });
    } catch {
      res.status(502).json({
        error: 'No se pudo enviar el correo en este momento. Verifica las credenciales SMTP o inténtalo nuevamente.',
      });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distDir, {
        maxAge: '30d',
        index: false,
      })
    );
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BlinD server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
