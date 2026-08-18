const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (!loc.startsWith('http')) loc = 'https://sites.google.com' + loc;
        return fetchUrl(loc).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseVal(valStr) {
  if (!valStr) return null;
  valStr = valStr.toString().trim().toLowerCase().replace(/,/g, '');
  if (valStr === 'n/a' || valStr === '-' || valStr === 'none' || valStr === '?' || valStr === 'free') return null;
  if (valStr.endsWith('m')) {
    return parseFloat(valStr) * 1000000;
  }
  if (valStr.endsWith('k')) {
    return parseFloat(valStr) * 1000;
  }
  if (valStr.endsWith('b')) {
    return parseFloat(valStr) * 1000000000;
  }
  const num = parseFloat(valStr);
  return isNaN(num) ? null : num;
}

function parseDemand(demStr) {
  if (!demStr) return 5;
  demStr = demStr.toString().trim().toUpperCase();
  if (demStr.includes('GARBAGE') || demStr.includes('TERRIBLE') || demStr.includes('AWFUL') || demStr.includes('VERY LOW')) return 1;
  if (demStr.includes('LOW')) return 3;
  if (demStr.includes('AVERAGE') || demStr.includes('DECENT') || demStr.includes('NORMAL') || demStr.includes('MEDIUM')) return 5;
  if (demStr.includes('HIGH') || demStr.includes('GOOD')) return 8;
  if (demStr.includes('GREAT') || demStr.includes('HYPED') || demStr.includes('EXTREME') || demStr.includes('INSANE') || demStr.includes('AMAZING')) return 10;
  
  const m = demStr.match(/(\d+)\s*\/\s*1[01]/);
  if (m) return parseInt(m[1]);
  return 5;
}

function parseTrend(trStr) {
  if (!trStr) return 'Stable';
  if (trStr.includes('↔') || trStr.toLowerCase().includes('stable')) return 'Stable';
  if (trStr.includes('⬆') || trStr.toLowerCase().includes('rising')) return 'Rising';
  if (trStr.includes('⬇') || trStr.toLowerCase().includes('dropping')) return 'Dropping';
  if (trStr.includes('🔥') || trStr.toLowerCase().includes('hyped')) return 'Hyped';
  if (trStr.includes('🔄') || trStr.toLowerCase().includes('unstable')) return 'Unstable';
  return 'Stable';
}

async function scrapeAllCollab() {
  const pages = [
    // Pets
    'https://sites.google.com/view/bgs-collab-value-list/values/limited-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/values/permanent-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/values/secrets',
    'https://sites.google.com/view/bgs-collab-value-list/values/mythic-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/values/leaderboard-pets-and-miscellaneous-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/values/bubble-pass-pets',
    'https://sites.google.com/view/bgs-collab-value-list/values/reward-shop-challenge-pass-and-quest-pets',
    'https://sites.google.com/view/bgs-collab-value-list/values/index-reward-pets',
    'https://sites.google.com/view/bgs-collab-value-list/values/robux-and-gamepass-pets',
    'https://sites.google.com/view/bgs-collab-value-list/values/bubble-and-egg-prize-pets',
    'https://sites.google.com/view/bgs-collab-value-list/values/ogs',
    'https://sites.google.com/view/bgs-collab-value-list/values/t3s',
    'https://sites.google.com/view/bgs-collab-value-list/values/mythic-t3s',
    'https://sites.google.com/view/bgs-collab-value-list/values/mythic-t2s',
    'https://sites.google.com/view/bgs-collab-value-list/values/tier-1-2',
    'https://sites.google.com/view/bgs-collab-value-list/values/unique',
    'https://sites.google.com/view/bgs-collab-value-list/values/legendary',
    // Hats
    'https://sites.google.com/view/bgs-collab-value-list/hats/limited-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/hats/permanent-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/hats/mythic-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/hats/leaderboard-and-miscellaneous-secrets',
    'https://sites.google.com/view/bgs-collab-value-list/hats/event-pass-and-challenge-pass-hats',
    'https://sites.google.com/view/bgs-collab-value-list/hats/robux-and-gamepass-hats',
    'https://sites.google.com/view/bgs-collab-value-list/hats/ogs',
    'https://sites.google.com/view/bgs-collab-value-list/hats/tier-3s',
    'https://sites.google.com/view/bgs-collab-value-list/hats/mythic-tier-3s',
    'https://sites.google.com/view/bgs-collab-value-list/hats/tier-1-2s',
    'https://sites.google.com/view/bgs-collab-value-list/hats/legendary',
    'https://sites.google.com/view/bgs-collab-value-list/hats/unique',
  ];

  const scrapedItems = new Map();

  for (const pageUrl of pages) {
    try {
      console.log(`Scraping ${pageUrl}...`);
      const html = await fetchUrl(pageUrl);
      
      const pRegex = /<p\b[^>]*>(.*?)<\/p>/gs;
      const spans = [];
      let m;
      while ((m = pRegex.exec(html)) !== null) {
        const text = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").trim();
        if (text) spans.push(text);
      }

      console.log(`  Extracted ${spans.length} text elements from ${pageUrl.split('/').pop()}`);

      // Parse structured sequences
      // Look for pet names and associated values
      // Patterns in Collab list:
      // Pattern A: [Name, NormalVal, NormalDemand, ShinyVal, ShinyDemand, Trend, Origin]
      // Pattern B: [Name, NormalVal, NormalDemand, ShinyVal, ShinyDemand, MythicVal, MythicDemand, ShinyMythicVal, ShinyMythicDemand, Trend]
      
      for (let i = 0; i < spans.length; i++) {
        const item = spans[i];
        
        // Skip common header words
        if (['pet name', 'hat name', 'normal', 'shiny', 'mythic', 'shiny mythic', 'demand', 'trend', 'origin', 'values', 'value'].includes(item.toLowerCase())) {
          continue;
        }

        // Check if next item is a number/value or demand
        const next1 = spans[i + 1];
        const next2 = spans[i + 2];
        const next3 = spans[i + 3];

        if (next1 && (parseVal(next1) !== null || next1 === 'N/A' || next1 === '-')) {
          const name = item;
          // Valid pet name candidate
          // Let's inspect ahead
          const normalVal = parseVal(next1);
          let normalDemand = 5;
          let shinyVal = null;
          let shinyDemand = 5;
          let trend = 'Stable';
          let origin = '';

          // Find demand in next items
          let cursor = i + 2;
          if (spans[cursor] && ['GOOD', 'AVERAGE', 'HIGH', 'LOW', 'GARBAGE', 'GREAT', 'HYPED', 'TERRIBLE', 'EXTREME'].includes(spans[cursor].toUpperCase())) {
            normalDemand = parseDemand(spans[cursor]);
            cursor++;
          }

          if (spans[cursor] && (parseVal(spans[cursor]) !== null || spans[cursor] === 'N/A' || spans[cursor] === '-')) {
            shinyVal = parseVal(spans[cursor]);
            cursor++;
          }

          if (spans[cursor] && ['GOOD', 'AVERAGE', 'HIGH', 'LOW', 'GARBAGE', 'GREAT', 'HYPED', 'TERRIBLE', 'EXTREME'].includes(spans[cursor].toUpperCase())) {
            shinyDemand = parseDemand(spans[cursor]);
            cursor++;
          }

          if (spans[cursor] && (spans[cursor].includes('↔') || spans[cursor].includes('⬆') || spans[cursor].includes('⬇') || spans[cursor].includes('🔥') || spans[cursor].includes('🔄'))) {
            trend = parseTrend(spans[cursor]);
            cursor++;
          }

          if (spans[cursor] && (spans[cursor].startsWith('S.') || spans[cursor].includes('Prem') || spans[cursor].includes('Pass') || spans[cursor].includes('Egg') || spans[cursor].includes('Reward') || spans[cursor].includes('Event'))) {
            origin = spans[cursor];
          }

          if (name.length >= 2 && !scrapedItems.has(name.toLowerCase())) {
            scrapedItems.set(name.toLowerCase(), {
              name,
              normalValue: normalVal,
              normalDemand,
              shinyValue: shinyVal,
              shinyDemand,
              trend,
              origin,
              sourcePage: pageUrl.split('/').pop()
            });
          }
        }
      }
    } catch (e) {
      console.log(`Error on ${pageUrl}:`, e.message);
    }
  }

  console.log(`\nSuccessfully scraped ${scrapedItems.size} total items!`);
  const itemsArr = Array.from(scrapedItems.values());
  fs.writeFileSync(path.join(__dirname, 'collab_parsed_all.json'), JSON.stringify(itemsArr, null, 2));
  
  // Show sample
  console.log('Sample parsed items:', itemsArr.slice(0, 20));
}

scrapeAllCollab();
