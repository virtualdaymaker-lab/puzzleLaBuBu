const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const PUBLIC = path.join(__dirname, '..', 'public');

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function send404(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Not found');
}

function serveFile(filePath, res) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send404(res);
    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', type);
    const rs = fs.createReadStream(filePath);
    rs.pipe(res);
    rs.on('error', () => send404(res));
  });
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let safePath = urlPath.replace(/^\/+/, '');
    if (!safePath || safePath === '') safePath = 'testsite.html';
    // prevent path traversal
    if (safePath.includes('..')) return send404(res);
    const filePath = path.join(PUBLIC, safePath);
    serveFile(filePath, res);
  } catch (e) {
    send404(res);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Static server running at http://localhost:${PORT}/ (serving ${PUBLIC})`);
});
