// Local dev server: serves public/ and mounts api/stock.js with just enough
// of Vercel's req/res helpers to be faithful. Run: node scripts/dev.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import handler from '../api/stock.js';

const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css' };
const PORT = 3000;

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/stock') {
    req.query = Object.fromEntries(url.searchParams);
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return res; };
    try { await handler(req, res); } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: String(e) })); }
    return;
  }

  const path = url.pathname === '/' ? '/index.html' : url.pathname;
  try {
    const body = await readFile(join('public', path));
    res.setHeader('Content-Type', TYPES[extname(path)] ?? 'application/octet-stream');
    res.end(body);
  } catch {
    res.statusCode = 404;
    res.end('not found');
  }
}).listen(PORT, () => console.log(`dev server  http://localhost:${PORT}`));
