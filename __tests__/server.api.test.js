const request = require('supertest');
const fs = require('fs/promises');
const fss = require('fs');
const path = require('path');

// Set env before requiring server
process.env.ADMIN_TOKEN = 'test-admin-token';
process.env.UPLOAD_DIR = path.join(__dirname, '__test_uploads__');
process.env.PORT = '0'; // random port

const INDEX_PATH = path.join(process.env.UPLOAD_DIR, 'index.json');

// We need to create the app without listen for supertest
// Re-require server.js — it calls listen() but supertest can still work
const { app } = require('../server');

// Helper to auth as admin
function authRequest(req) {
  return req.set('Authorization', 'Bearer test-admin-token');
}

// Clean up test uploads before each test
beforeEach(async () => {
  if (fss.existsSync(process.env.UPLOAD_DIR)) {
    const files = await fs.readdir(process.env.UPLOAD_DIR);
    for (const file of files) {
      await fs.unlink(path.join(process.env.UPLOAD_DIR, file));
    }
  } else {
    await fs.mkdir(process.env.UPLOAD_DIR, { recursive: true });
  }
  // Start with empty index
  await fs.writeFile(INDEX_PATH, '[]', 'utf-8');
});

afterAll(async () => {
  // Clean up test uploads directory
  if (fss.existsSync(process.env.UPLOAD_DIR)) {
    const files = await fs.readdir(process.env.UPLOAD_DIR);
    for (const file of files) {
      await fs.unlink(path.join(process.env.UPLOAD_DIR, file));
    }
    await fs.rmdir(process.env.UPLOAD_DIR);
  }
});

// --- GET /api/materials ---
describe('GET /api/materials', () => {
  test('returns empty array when no materials', async () => {
    const res = await request(app).get('/api/materials');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns materials from index', async () => {
    const materials = [{ id: 'test1', originalName: 'file.pdf' }];
    await fs.writeFile(INDEX_PATH, JSON.stringify(materials), 'utf-8');

    const res = await request(app).get('/api/materials');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe('test1');
  });
});

// --- POST /api/materials ---
describe('POST /api/materials', () => {
  test('rejects upload without admin token', async () => {
    const res = await request(app)
      .post('/api/materials')
      .field('category', 'training');

    expect(res.status).toBe(401);
  });

  test('rejects upload without file', async () => {
    const res = await authRequest(
      request(app).post('/api/materials').field('category', 'training')
    );

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/选择/);
  });

  test('uploads a file successfully', async () => {
    const res = await authRequest(
      request(app)
        .post('/api/materials')
        .field('category', 'training')
        .field('description', 'A test file')
        .attach('file', Buffer.from('hello world'), 'test.txt')
    );

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.category).toBe('training');
    expect(res.body.description).toBe('A test file');

    // Verify it's in the index
    const indexData = JSON.parse(await fs.readFile(INDEX_PATH, 'utf-8'));
    expect(indexData).toHaveLength(1);
    expect(indexData[0].id).toBe(res.body.id);
  });

  test('defaults category to "other" for invalid value', async () => {
    const res = await authRequest(
      request(app)
        .post('/api/materials')
        .field('category', 'nonexistent')
        .attach('file', Buffer.from('data'), 'file.pdf')
    );

    expect(res.status).toBe(201);
    expect(res.body.category).toBe('other');
  });
});

// --- DELETE /api/materials/:id ---
describe('DELETE /api/materials/:id', () => {
  test('rejects delete without admin token', async () => {
    const res = await request(app).delete('/api/materials/nonexistent');
    expect(res.status).toBe(401);
  });

  test('returns 404 for non-existent material', async () => {
    const res = await authRequest(
      request(app).delete('/api/materials/nonexistent')
    );
    expect(res.status).toBe(404);
  });

  test('deletes an existing material', async () => {
    // First upload
    const uploadRes = await authRequest(
      request(app)
        .post('/api/materials')
        .field('category', 'tutorial')
        .attach('file', Buffer.from('delete me'), 'del.txt')
    );
    expect(uploadRes.status).toBe(201);
    const { id } = uploadRes.body;

    // Then delete
    const delRes = await authRequest(
      request(app).delete(`/api/materials/${id}`)
    );
    expect(delRes.status).toBe(200);
    expect(delRes.body.ok).toBe(true);

    // Verify it's gone from index
    const indexData = JSON.parse(await fs.readFile(INDEX_PATH, 'utf-8'));
    expect(indexData).toHaveLength(0);
  });
});

// --- GET /api/materials/:id/download ---
describe('GET /api/materials/:id/download', () => {
  test('returns 404 for non-existent material', async () => {
    const res = await request(app).get('/api/materials/nonexistent/download');
    expect(res.status).toBe(404);
  });

  test('downloads an existing file', async () => {
    // First upload
    const uploadRes = await authRequest(
      request(app)
        .post('/api/materials')
        .field('category', 'reference')
        .attach('file', Buffer.from('download content'), 'dl.txt')
    );
    expect(uploadRes.status).toBe(201);
    const { id } = uploadRes.body;

    // Then download
    const dlRes = await request(app).get(`/api/materials/${id}/download`);
    expect(dlRes.status).toBe(200);
  });
});
