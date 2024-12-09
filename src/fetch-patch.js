const http = require('http');
const https = require('https');

// Переопределяем fetch для работы с http и https
global.fetch = (url, options = {}) => {
  const urlObj = new URL(url);
  const isHttp = urlObj.protocol === 'http:';

  const client = isHttp ? http : https;

  return new Promise((resolve, reject) => {
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
    }, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data),
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
};
