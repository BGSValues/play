const https = require('https');
const fs = require('fs');

function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  const html = await fetchHtml('https://sites.google.com/view/bgs-collab-value-list/home');
  // Match googleusercontent or background image urls
  const matches = html.match(/https:\/\/[^\s\"\'<>]+\.(?:jpg|png|webp|jpeg|gif)[^\s\"\'<>]*/gi) || [];
  const googleUrls = html.match(/https:\/\/lh\d+\.googleusercontent\.com\/[^\s\"\'<>]+/gi) || [];
  console.log('Image URLs found:', [...new Set([...matches, ...googleUrls])]);
}

run();
