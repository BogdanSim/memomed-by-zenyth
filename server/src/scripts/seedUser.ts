import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { db, runMigrations } from '../db.js';
import { seedCredentials } from '../config.js';

const treatments = [
  {
    id: 'treat-1',
    name: 'Vitamina C 1000mg',
    type: 'supplement',
    source: 'woo',
    wooProductId: 'zp-1',
    wooProductImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
    frequencyPerDay: 1,
    unitsPerIntake: 1,
    unitLabel: 'capsulă',
    mealCondition: 'after',
    times: ['08:00'],
    startDate: '2026-03-01',
    endDate: '2026-04-01',
    packageSize: 30,
  },
  {
    id: 'treat-2',
    name: 'Omega 3',
    type: 'supplement',
    source: 'woo',
    wooProductId: 'zp-2',
    wooProductImage: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200&h=200&fit=crop',
    frequencyPerDay: 2,
    unitsPerIntake: 1,
    unitLabel: 'capsulă',
    mealCondition: 'before',
    times: ['08:00', '20:00'],
    startDate: '2026-03-10',
    packageSize: 60,
  },
  {
    id: 'treat-3',
    name: 'Magneziu B6',
    type: 'supplement',
    source: 'manual',
    frequencyPerDay: 1,
    unitsPerIntake: 2,
    unitLabel: 'comprimate',
    mealCondition: 'none',
    times: ['21:00'],
    startDate: '2026-03-15',
    endDate: '2026-04-15',
  },
];

const today = '2026-03-19';
const intakeLogs = [
  { id: 'log-1', treatmentId: 'treat-1', scheduledAt: `${today}T08:00:00`, status: 'taken', confirmedAt: `${today}T08:05:00` },
  { id: 'log-2', treatmentId: 'treat-2', scheduledAt: `${today}T08:00:00`, status: 'taken', confirmedAt: `${today}T08:03:00` },
  { id: 'log-3', treatmentId: 'treat-2', scheduledAt: `${today}T20:00:00`, status: 'pending' },
  { id: 'log-4', treatmentId: 'treat-3', scheduledAt: `${today}T21:00:00`, status: 'pending' },
];

const products = [
  {
    id: 'zp-1',
    name: 'Vitamina C 1000mg Zenyth',
    sku: 'ZEN-VC1000',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    price: 45,
    currency: 'RON',
    unitsPerPackage: 30,
    unitLabel: 'capsule',
    category: 'Vitamine',
    description: 'Boost zilnic de Vitamina C.',
    url: '#',
    unitsPerIntake: 1,
    frequencyPerDay: 1,
    daysRemaining: 6,
    totalDays: 30,
  },
  {
    id: 'zp-2',
    name: 'Omega 3 Premium Zenyth',
    sku: 'ZEN-OM3P',
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=400&fit=crop',
    price: 69,
    currency: 'RON',
    unitsPerPackage: 60,
    unitLabel: 'capsule',
    category: 'Acizi grași',
    description: 'Acizi grași Omega 3 din ulei de pește.',
    url: '#',
    unitsPerIntake: 1,
    frequencyPerDay: 2,
    daysRemaining: 3,
    totalDays: 30,
  },
];

const main = async () => {
  const email = seedCredentials.email?.toLowerCase();
  const password = seedCredentials.password;
  if (!email || !password) {
    console.error('Set ADMIN_EMAIL și ADMIN_PASSWORD în server/.env înainte de seed.');
    process.exit(1);
  }

  runMigrations();

  type SeedUserRow = { id: string; email: string };
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as SeedUserRow | undefined;
  if (!user) {
    const id = nanoid();
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(id, email, hash);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as SeedUserRow;
    console.log(`Created user ${email}`);
  } else {
    console.log(`User ${email} already exists, refreshing data...`);
  }

  const userId = user.id;
  db.prepare('DELETE FROM treatments WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM intake_logs WHERE treatment_id NOT IN (SELECT id FROM treatments)').run();

  const insertTreatment = db.prepare(`
    INSERT INTO treatments (
      id, user_id, name, type, source, woo_product_id, woo_product_image,
      frequency_per_day, units_per_intake, unit_label, meal_condition, times,
      start_date, end_date, notes, package_size, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  for (const t of treatments) {
    insertTreatment.run(
      t.id,
      userId,
      t.name,
      t.type,
      t.source,
      t.wooProductId ?? null,
      t.wooProductImage ?? null,
      t.frequencyPerDay,
      t.unitsPerIntake,
      t.unitLabel,
      t.mealCondition,
      JSON.stringify(t.times),
      t.startDate,
      t.endDate ?? null,
      null,
      t.packageSize ?? null
    );
  }

  db.prepare('DELETE FROM intake_logs WHERE 1=1').run();
  const insertLog = db.prepare(`
    INSERT INTO intake_logs (id, treatment_id, scheduled_at, status, confirmed_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  for (const log of intakeLogs) {
    insertLog.run(log.id, log.treatmentId, log.scheduledAt, log.status, log.confirmedAt ?? null);
  }

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, name, sku, image, price, currency, units_per_package, unit_label,
      category, description, url, units_per_intake, frequency_per_day,
      days_remaining, total_days, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
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
  `);
  for (const product of products) {
    insertProduct.run(
      product.id,
      product.name,
      product.sku,
      product.image,
      product.price,
      product.currency,
      product.unitsPerPackage,
      product.unitLabel,
      product.category,
      product.description,
      product.url,
      product.unitsPerIntake,
      product.frequencyPerDay,
      product.daysRemaining,
      product.totalDays
    );
  }

  console.log('Seed complete.');
  process.exit(0);
};

main();
