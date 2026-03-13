const https = require('https');
https.get('https://unpkg.com/lucide@latest', (res) => {
  console.log(res.headers.location);
});
