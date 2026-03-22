import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { config } from './config.js';
import { db, runMigrations } from './db.js';

runMigrations();

const app = express();
app.use(cors());
app.use(express.json());

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

app.post('/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as UserRow | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
    },
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

const treatmentPayload = z.object({
  name: z.string().min(1),
  type: z.enum(['medication', 'supplement']),
  source: z.enum(['manual', 'woo']),
  wooProductId: z.string().optional(),
  wooProductImage: z.string().url().optional(),
  frequencyPerDay: z.number().int().positive(),
  unitsPerIntake: z.number().int().positive(),
  unitLabel: z.string().min(1),
  mealCondition: z.enum(['before', 'after', 'none']),
  times: z.array(z.string()).nonempty(),
  startDate: z.string(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  packageSize: z.number().int().positive().optional(),
});

const mapTreatment = (row: any) => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  type: row.type,
  source: row.source,
  wooProductId: row.woo_product_id ?? undefined,
  wooProductImage: row.woo_product_image ?? undefined,
  frequencyPerDay: row.frequency_per_day,
  unitsPerIntake: row.units_per_intake,
  unitLabel: row.unit_label,
  mealCondition: row.meal_condition,
  times: JSON.parse(row.times),
  startDate: row.start_date,
  endDate: row.end_date ?? undefined,
  notes: row.notes ?? undefined,
  packageSize: row.package_size ?? undefined,
});

app.get('/api/treatments', authenticate, (req: AuthenticatedRequest, res) => {
  const treatments = db
    .prepare('SELECT * FROM treatments WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.userId);
  res.json(treatments.map(mapTreatment));
});

app.post('/api/treatments', authenticate, (req: AuthenticatedRequest, res) => {
  const parsed = treatmentPayload.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const id = nanoid();
  const now = new Date().toISOString();
  const payload = parsed.data;
  db.prepare(`
    INSERT INTO treatments (
      id, user_id, name, type, source, woo_product_id, woo_product_image,
      frequency_per_day, units_per_intake, unit_label, meal_condition, times,
      start_date, end_date, notes, package_size, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    req.userId,
    payload.name,
    payload.type,
    payload.source,
    payload.wooProductId ?? null,
    payload.wooProductImage ?? null,
    payload.frequencyPerDay,
    payload.unitsPerIntake,
    payload.unitLabel,
    payload.mealCondition,
    JSON.stringify(payload.times),
    payload.startDate,
    payload.endDate ?? null,
    payload.notes ?? null,
    payload.packageSize ?? null,
    now,
    now
  );

  const today = new Date().toISOString().split('T')[0];
  const insertLog = db.prepare(`
    INSERT INTO intake_logs (id, treatment_id, scheduled_at, status, confirmed_at, created_at, updated_at)
    VALUES (?, ?, ?, 'pending', NULL, datetime('now'), datetime('now'))
  `);
  payload.times.forEach((time) => {
    insertLog.run(nanoid(), id, `${today}T${time}:00`);
  });

  const created = db.prepare('SELECT * FROM treatments WHERE id = ?').get(id);
  res.status(201).json(mapTreatment(created));
});

app.put('/api/treatments/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const parsed = treatmentPayload.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const existing = db.prepare('SELECT * FROM treatments WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: 'Treatment not found' });
  }

  const update = { ...mapTreatment(existing), ...parsed.data };
  db.prepare(`
    UPDATE treatments SET
      name = ?,
      type = ?,
      source = ?,
      woo_product_id = ?,
      woo_product_image = ?,
      frequency_per_day = ?,
      units_per_intake = ?,
      unit_label = ?,
      meal_condition = ?,
      times = ?,
      start_date = ?,
      end_date = ?,
      notes = ?,
      package_size = ?,
      updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(
    update.name,
    update.type,
    update.source,
    update.wooProductId ?? null,
    update.wooProductImage ?? null,
    update.frequencyPerDay,
    update.unitsPerIntake,
    update.unitLabel,
    update.mealCondition,
    JSON.stringify(update.times),
    update.startDate,
    update.endDate ?? null,
    update.notes ?? null,
    update.packageSize ?? null,
    new Date().toISOString(),
    req.params.id,
    req.userId
  );

  const fresh = db.prepare('SELECT * FROM treatments WHERE id = ?').get(req.params.id);
  res.json(mapTreatment(fresh));
});

app.delete('/api/treatments/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const result = db.prepare('DELETE FROM treatments WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Treatment not found' });
  }
  res.status(204).send();
});

const mapLog = (row: any) => ({
  id: row.id,
  treatmentId: row.treatment_id,
  scheduledAt: row.scheduled_at,
  status: row.status,
  confirmedAt: row.confirmed_at ?? undefined,
});

app.get('/api/intake-logs', authenticate, (req: AuthenticatedRequest, res) => {
  const { date } = req.query;
  const params: (string | undefined)[] = [req.userId];
  let sql = `
    SELECT logs.* FROM intake_logs logs
    JOIN treatments t ON t.id = logs.treatment_id
    WHERE t.user_id = ?
  `;
  if (typeof date === 'string' && date.length === 10) {
    sql += ' AND logs.scheduled_at LIKE ?';
    params.push(`${date}%`);
  }
  sql += ' ORDER BY logs.scheduled_at ASC';
  const logs = db.prepare(sql).all(...params);
  res.json(logs.map(mapLog));
});

const updateLogSchema = z.object({
  status: z.enum(['taken', 'skipped', 'missed', 'snoozed', 'pending']).optional(),
  confirmedAt: z.string().optional(),
});

app.patch('/api/intake-logs/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const parsed = updateLogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const log = db
    .prepare(`SELECT logs.* FROM intake_logs logs JOIN treatments t ON t.id = logs.treatment_id WHERE logs.id = ? AND t.user_id = ?`)
    .get(req.params.id, req.userId);
  if (!log) {
    return res.status(404).json({ error: 'Log not found' });
  }
  const fields = parsed.data;
  db.prepare('UPDATE intake_logs SET status = COALESCE(?, status), confirmed_at = COALESCE(?, confirmed_at), updated_at = ? WHERE id = ?')
    .run(fields.status ?? null, fields.confirmedAt ?? null, new Date().toISOString(), req.params.id);
  const updated = db.prepare('SELECT * FROM intake_logs WHERE id = ?').get(req.params.id);
  res.json(mapLog(updated));
});

const productSchema = z.object({
  name: z.string(),
  sku: z.string().optional(),
  image: z.string().url().optional(),
  price: z.number().nonnegative(),
  currency: z.string().default('RON'),
  unitsPerPackage: z.number().int().nonnegative().optional(),
  unitLabel: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  unitsPerIntake: z.number().int().nonnegative().optional(),
  frequencyPerDay: z.number().int().nonnegative().optional(),
  daysRemaining: z.number().int().nonnegative().optional(),
  totalDays: z.number().int().nonnegative().optional(),
});

const mapProduct = (row: any) => ({
  id: row.id,
  name: row.name,
  sku: row.sku ?? undefined,
  image: row.image ?? undefined,
  price: row.price,
  currency: row.currency,
  unitsPerPackage: row.units_per_package ?? undefined,
  unitLabel: row.unit_label ?? undefined,
  category: row.category ?? undefined,
  description: row.description ?? undefined,
  url: row.url ?? undefined,
  unitsPerIntake: row.units_per_intake ?? undefined,
  frequencyPerDay: row.frequency_per_day ?? undefined,
  daysRemaining: row.days_remaining ?? undefined,
  totalDays: row.total_days ?? undefined,
});

app.get('/api/products', authenticate, (_req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY name ASC').all();
  res.json(products.map(mapProduct));
});

app.post('/api/products', authenticate, (req: AuthenticatedRequest, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const id = req.body.id ?? nanoid();
  const payload = parsed.data;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO products (
      id, name, sku, image, price, currency, units_per_package, unit_label,
      category, description, url, units_per_intake, frequency_per_day,
      days_remaining, total_days, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      sku = excluded.sku,
      image = excluded.image,
      price = excluded.price,
      currency = excluded.currency,
      units_per_package = excluded.units_per_package,
      unit_label = excluded.unit_label,
      category = excluded.category,
      description = excluded.description,
      url = excluded.url,
      units_per_intake = excluded.units_per_intake,
      frequency_per_day = excluded.frequency_per_day,
      days_remaining = excluded.days_remaining,
      total_days = excluded.total_days,
      updated_at = excluded.updated_at
  `).run(
    id,
    payload.name,
    payload.sku ?? null,
    payload.image ?? null,
    payload.price,
    payload.currency,
    payload.unitsPerPackage ?? null,
    payload.unitLabel ?? null,
    payload.category ?? null,
    payload.description ?? null,
    payload.url ?? null,
    payload.unitsPerIntake ?? null,
    payload.frequencyPerDay ?? null,
    payload.daysRemaining ?? null,
    payload.totalDays ?? null,
    now,
    now
  );
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.status(201).json(mapProduct(product));
});

const orderSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

const mapOrder = (row: any) => ({
  id: row.id,
  productId: row.product_id,
  quantity: row.quantity,
  status: row.status,
  createdAt: row.created_at,
});

app.get('/api/orders', authenticate, (req: AuthenticatedRequest, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(orders.map(mapOrder));
});

app.post('/api/orders', authenticate, (req: AuthenticatedRequest, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { productId, quantity } = parsed.data;
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const id = nanoid();
  db.prepare('INSERT INTO orders (id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)')
    .run(id, req.userId, productId, quantity);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  res.status(201).json(mapOrder(order));
});

app.get('/api/me', authenticate, (req: AuthenticatedRequest, res) => {
  const user = db
    .prepare('SELECT id, email, created_at FROM users WHERE id = ?')
    .get(req.userId) as { id: string; email: string; created_at: string } | undefined;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ id: user.id, email: user.email, createdAt: user.created_at });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
