import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const categories = [
    { name: 'Secret', category: 'Category:Secret_Pets' },
    { name: 'Legendary', category: 'Category:Legendary_Pets' },
    { name: 'Epic', category: 'Category:Epic_Pets' },
    { name: 'Rare', category: 'Category:Rare_Pets' },
    { name: 'Common', category: 'Category:Common_Pets' },
    { name: 'Unique', category: 'Category:Unique_Pets' },
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateStats(rarity) {
    let baseValue = 0;
    let demand = 0;
    
    switch(rarity) {
        case 'Secret':
            baseValue = getRandomInt(100000, 250000);
            demand = getRandomInt(8, 10);
            break;
        case 'Legendary':
            baseValue = getRandomInt(50000, 200000);
            demand = getRandomInt(7, 10);
            break;
        case 'Epic':
            baseValue = getRandomInt(50, 800);
            demand = getRandomInt(2, 3);
            break;
        case 'Rare':
            baseValue = getRandomInt(20, 500);
            demand = getRandomInt(1, 3);
            break;
        case 'Common':
            baseValue = getRandomInt(10, 250);
            demand = getRandomInt(1, 2);
            break;
        case 'Unique':
            baseValue = getRandomInt(30000, 150000);
            demand = getRandomInt(6, 9);
            break;
    }
    
    return { baseValue, demand };
}

async function fetchCategoryMembers(categoryTitle) {
    let members = [];
    let cmcontinue = null;
    
    do {
        let url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(categoryTitle)}&cmlimit=500&cmtype=page&format=json`;
        if (cmcontinue) {
            url += `&cmcontinue=${encodeURIComponent(cmcontinue)}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.query && data.query.categorymembers) {
            const validMembers = data.query.categorymembers.filter(m => m.ns === 0);
            members = members.concat(validMembers.map(m => m.title));
        }
        
        cmcontinue = data.continue ? data.continue.cmcontinue : null;
        await delay(200);
    } while (cmcontinue);
    
    return members;
}

async function fetchImagesForTitles(titles) {
    const images = {};
    
    // Process in batches of 10
    for (let i = 0; i < titles.length; i += 10) {
        const batch = titles.slice(i, i + 10);
        const url = `https://bubble-gum-simulator.fandom.com/api.php?action=query&titles=${encodeURIComponent(batch.join('|'))}&prop=pageimages&piprop=original&format=json`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.query && data.query.pages) {
            for (const pageId in data.query.pages) {
                const page = data.query.pages[pageId];
                if (page.original && page.original.source) {
                    let source = page.original.source;
                    // Strip the /revision/latest... suffix
                    const revIndex = source.indexOf('/revision/latest');
                    if (revIndex !== -1) {
                        source = source.substring(0, revIndex);
                    }
                    images[page.title] = source;
                }
            }
        }
        await delay(200);
    }
    
    return images;
}

async function main() {
    console.log("Starting wiki scrape...");
    const allPets = [];
    const stats = {};
    let idCounter = 1;
    
    for (const cat of categories) {
        console.log(`Fetching ${cat.name} pets...`);
        const titles = await fetchCategoryMembers(cat.category);
        console.log(`Found ${titles.length} ${cat.name} pets. Fetching images...`);
        
        const images = await fetchImagesForTitles(titles);
        
        stats[cat.name] = titles.length;
        
        for (const title of titles) {
            const { baseValue, demand } = generateStats(cat.name);
            allPets.push({
                id: idCounter++,
                name: title,
                rarity: cat.name,
                image: images[title] || null,
                baseValue,
                demand,
                trend: "stable"
            });
        }
    }
    
    console.log("Saving data...");
    const dataDir = path.join(__dirname, 'data');
    const srcDataDir = path.join(__dirname, '..', 'src', 'data');
    
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(srcDataDir)) {
        fs.mkdirSync(srcDataDir, { recursive: true });
    }
    
    const outputPath1 = path.join(dataDir, 'pets.json');
    const outputPath2 = path.join(srcDataDir, 'pets.json');
    
    const jsonStr = JSON.stringify(allPets, null, 2);
    
    fs.writeFileSync(outputPath1, jsonStr);
    fs.writeFileSync(outputPath2, jsonStr);
    
    console.log("\nSummary:");
    let total = 0;
    for (const cat in stats) {
        console.log(`${cat}: ${stats[cat]}`);
        total += stats[cat];
    }
    console.log(`Total: ${total}`);
}

main().catch(console.error);
