const https = require('https');

https.get('https://bubble-gum-simulator.fandom.com/api.php?action=parse&page=Lovely_Rose&prop=text&format=json', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const json = JSON.parse(d);
    const html = json.parse.text['*'];
    const pRegex = /<h3 class="pi-data-label pi-secondary-font">([^<]+)<\/h3>\s*<div class="pi-data-value pi-font"><span>([^<]+)<\/span><\/div>/g;
    let m;
    while ((m = pRegex.exec(html)) !== null) {
      console.log(m[1], '->', m[2]);
    }
  });
});
