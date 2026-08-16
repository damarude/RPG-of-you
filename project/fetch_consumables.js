const https = require('https');
https.get('https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/ConsumablesData/Consumables.txt', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log(data); });
});
