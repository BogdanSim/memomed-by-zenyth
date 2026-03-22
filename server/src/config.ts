import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const required = ['JWT_SECRET'];
required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[config] Missing ${key}. Using fallback dev value.`);
  }
});

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'change-me',
};

export const seedCredentials = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};
