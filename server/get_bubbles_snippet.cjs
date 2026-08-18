const https = require('https');

https.get('https://bubble-gum-simulator.fandom.com/api.php?action=parse&page=Lovely_Rose&prop=text&format=json', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const json = JSON.parse(d);
    const html = json.parse.text['*'];
    const idx = html.indexOf('Bubbles');
    console.log(html.slice(Math.max(0, idx - 100), idx + 1000));
  });
});
