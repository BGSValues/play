const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function cleanText(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .trim();
}

async function inspectPage(pageSlug) {
  const url = `https://sites.google.com/view/bgs-collab-value-list/values/${pageSlug}`;
  console.log(`\n================== Fetching ${pageSlug} ==================`);
  const html = await fetchHtml(url);
  
  // Extract all text paragraphs
  const matches = html.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
  const texts = matches.map(cleanText).filter(Boolean);
  
  console.log(`Found ${texts.length} total text elements.`);
  
  // Look for pet entries
  // Typically after header paragraphs (e.g. "Limited Secrets", "Permanent Secrets", etc.)
  for (let i = 0; i < Math.min(texts.length, 120); i++) {
    console.log(`[${i}] ${texts[i]}`);
  }
}

async function run() {
  await inspectPage('limited-secrets');
  await inspectPage('permanent-secrets');
  await inspectPage('hats');
}

run();
