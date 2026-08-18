const fs = require('fs');
const path = require('path');

// Let's test parser on bubble-pass-pets first
const html = fs.readFileSync('C:\\Users\\Ben Binu\\.gemini\\antigravity\\brain\\08e1e321-56ea-4b1f-a64d-cde7ffebcd23\\.system_generated\\steps\\4093\\content.md', 'utf8');

// Extract all text inside spans/paragraphs
const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
const spans = [];
let m;
while ((m = pRegex.exec(html)) !== null) {
  const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
  if (text) spans.push(text);
}

console.log('Total text elements:', spans.length);
console.log('Sample text elements:', spans.slice(20, 80));
