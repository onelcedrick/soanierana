import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';

describe('GET /api/health', () => {
  it('retourne un statut ok', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('churchtask-api');
    await app.close();
  });
});
