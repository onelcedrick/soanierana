import 'dotenv/config';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://churchtask:churchtask@localhost:5432/churchtask_test';
