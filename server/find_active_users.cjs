const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/App.jsx'), 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('activeUsersCount')) {
    console.log(`L${i+1}: ${l}`);
  }
});
