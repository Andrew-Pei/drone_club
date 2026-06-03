const {
  sendJson,
  getBearerToken,
  requireAdmin,
  normalizeField,
  normalizeCategory,
  sanitizeFileName,
  formatFileSize,
  findMaterial,
  VALID_CATEGORIES,
} = require('../server');

// --- normalizeField ---
describe('normalizeField', () => {
  test('returns trimmed string for normal input', () => {
    expect(normalizeField('  hello  ')).toBe('hello');
  });

  test('returns fallback for undefined', () => {
    expect(normalizeField(undefined, 'default')).toBe('default');
  });

  test('returns fallback for null', () => {
    expect(normalizeField(null, 'default')).toBe('default');
  });

  test('returns fallback for empty string', () => {
    expect(normalizeField('', 'default')).toBe('default');
  });

  test('returns first element of array', () => {
    expect(normalizeField(['first', 'second'])).toBe('first');
  });

  test('returns fallback if first array element is empty', () => {
    expect(normalizeField(['', 'second'], 'fallback')).toBe('fallback');
  });

  test('returns default fallback when none provided', () => {
    expect(normalizeField(undefined)).toBe('');
  });

  test('converts numbers to string', () => {
    expect(normalizeField(42)).toBe('42');
  });
});

// --- normalizeCategory ---
describe('normalizeCategory', () => {
  test('returns valid category as-is', () => {
    expect(normalizeCategory('training')).toBe('training');
  });

  test('returns valid category after trimming', () => {
    expect(normalizeCategory('  tutorial  ')).toBe('tutorial');
  });

  test('returns "other" for invalid category', () => {
    expect(normalizeCategory('invalid')).toBe('other');
  });

  test('returns "other" for undefined', () => {
    expect(normalizeCategory(undefined)).toBe('other');
  });

  test('handles array input', () => {
    expect(normalizeCategory(['reference'])).toBe('reference');
  });

  test('all VALID_CATEGORIES are accepted', () => {
    for (const cat of VALID_CATEGORIES) {
      expect(normalizeCategory(cat)).toBe(cat);
    }
  });
});

// --- sanitizeFileName ---
describe('sanitizeFileName', () => {
  test('removes dangerous characters', () => {
    expect(sanitizeFileName('file<>name.pdf')).toBe('file__name.pdf');
  });

  test('replaces backslashes and slashes', () => {
    expect(sanitizeFileName('path\\to/file')).toBe('path_to_file');
  });

  test('collapses whitespace', () => {
    expect(sanitizeFileName('hello   world.txt')).toBe('hello world.txt');
  });

  test('returns "material" for empty input', () => {
    expect(sanitizeFileName('')).toBe('material');
  });

  test('trims whitespace', () => {
    expect(sanitizeFileName('  file.txt  ')).toBe('file.txt');
  });
});

// --- formatFileSize ---
describe('formatFileSize', () => {
  test('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  test('formats kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  test('formats megabytes', () => {
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
  });

  test('returns empty for non-finite', () => {
    expect(formatFileSize(Infinity)).toBe('');
    expect(formatFileSize(NaN)).toBe('');
  });

  test('formats zero', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });
});

// --- getBearerToken ---
describe('getBearerToken', () => {
  test('extracts Bearer token', () => {
    const req = { headers: { authorization: 'Bearer mytoken123' } };
    expect(getBearerToken(req)).toBe('mytoken123');
  });

  test('falls back to x-admin-token header', () => {
    const req = { headers: { 'x-admin-token': 'admintoken' } };
    expect(getBearerToken(req)).toBe('admintoken');
  });

  test('prefers Bearer over x-admin-token', () => {
    const req = { headers: { authorization: 'Bearer bearer', 'x-admin-token': 'admin' } };
    expect(getBearerToken(req)).toBe('bearer');
  });

  test('returns empty string when no auth headers', () => {
    const req = { headers: {} };
    expect(getBearerToken(req)).toBe('');
  });

  test('trims token value', () => {
    const req = { headers: { authorization: 'Bearer   spaced   ' } };
    expect(getBearerToken(req)).toBe('spaced');
  });
});

// --- requireAdmin ---
describe('requireAdmin', () => {
  const originalToken = process.env.ADMIN_TOKEN;

  beforeEach(() => {
    process.env.ADMIN_TOKEN = 'test-secret';
  });

  afterAll(() => {
    if (originalToken === undefined) delete process.env.ADMIN_TOKEN;
    else process.env.ADMIN_TOKEN = originalToken;
  });

  test('returns true for correct Bearer token', () => {
    const req = { headers: { authorization: 'Bearer test-secret' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    expect(requireAdmin(req, res)).toBe(true);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns true for correct x-admin-token', () => {
    const req = { headers: { 'x-admin-token': 'test-secret' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    expect(requireAdmin(req, res)).toBe(true);
  });

  test('returns false and sends 401 for wrong token', () => {
    const req = { headers: { authorization: 'Bearer wrong' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    expect(requireAdmin(req, res)).toBe(false);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns false and sends 500 when ADMIN_TOKEN not set', () => {
    delete process.env.ADMIN_TOKEN;
    const req = { headers: { authorization: 'Bearer anything' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    expect(requireAdmin(req, res)).toBe(false);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// --- findMaterial ---
describe('findMaterial', () => {
  const materials = [
    { id: 'abc123', originalName: 'file1.pdf' },
    { id: 'def456', originalName: 'file2.pdf' },
  ];

  test('finds existing material by id', () => {
    expect(findMaterial(materials, 'abc123')).toEqual(materials[0]);
  });

  test('returns undefined for non-existent id', () => {
    expect(findMaterial(materials, 'nonexistent')).toBeUndefined();
  });

  test('returns undefined for empty array', () => {
    expect(findMaterial([], 'abc123')).toBeUndefined();
  });
});

// --- sendJson ---
describe('sendJson', () => {
  test('calls res.status().json() with correct args', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    sendJson(res, 200, { ok: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});
