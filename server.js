const http = require('http');
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');
const publicDir = path.join(__dirname, 'public');
const staticRoot = fs.existsSync(path.join(buildDir, 'index.html')) ? buildDir : publicDir;
const port = process.env.PORT || 3001;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(payload));
}

function isSafePath(root, requestPath) {
  const resolvedPath = path.resolve(root, `.${requestPath}`);
  return resolvedPath.startsWith(root);
}

async function proxyJson(url, res) {
  try {
    const upstreamResponse = await fetch(url);
    const contentType = upstreamResponse.headers.get('content-type') || 'application/json; charset=utf-8';
    const body = Buffer.from(await upstreamResponse.arrayBuffer());

    res.writeHead(upstreamResponse.status, {
      'Content-Type': contentType,
    });
    res.end(body);
  } catch {
    sendJson(res, 502, { error: 'Failed to reach the weather service.' });
  }
}

async function handleApi(requestUrl, res) {
  const { pathname, searchParams } = requestUrl;

  if (pathname === '/api/geocode/search') {
    const name = searchParams.get('name') || '';
    return proxyJson(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`,
      res
    );
  }

  if (pathname === '/api/geocode/reverse') {
    const latitude = searchParams.get('latitude') || '';
    const longitude = searchParams.get('longitude') || '';
    return proxyJson(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&count=1&language=en&format=json`,
      res
    );
  }

  if (pathname === '/api/weather') {
    const latitude = searchParams.get('latitude') || '';
    const longitude = searchParams.get('longitude') || '';
    return proxyJson(
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,surface_pressure,weather_code,is_day&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&forecast_days=7&timezone=auto`,
      res
    );
  }

  sendJson(res, 404, { error: 'Unknown API route.' });
}

async function serveStaticFile(requestPath, res) {
  const filePath = requestPath === '/' ? path.join(staticRoot, 'index.html') : path.join(staticRoot, requestPath);

  if (!isSafePath(staticRoot, requestPath)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const stats = await fs.promises.stat(filePath);

    if (stats.isDirectory()) {
      return serveStaticFile(path.join(requestPath, 'index.html'), res);
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(filePath).pipe(res);
  } catch {
    const fallbackIndex = path.join(staticRoot, 'index.html');
    if (fs.existsSync(fallbackIndex)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(fallbackIndex).pipe(res);
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  }
}

const server = http.createServer((request, res) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (request.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method not allowed');
    return;
  }

  if (requestUrl.pathname.startsWith('/api/')) {
    handleApi(requestUrl, res);
    return;
  }

  const publicPath = requestUrl.pathname === '/' ? '/' : requestUrl.pathname;
  serveStaticFile(publicPath, res);
});

server.listen(port, () => {
  console.log(`Weather app server running at http://localhost:${port}`);
});