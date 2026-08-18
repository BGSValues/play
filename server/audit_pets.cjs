const fs = require('fs');
const path = require('path');

const petsPath = path.join(__dirname, '../src/data/pets.json');
let pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));

const CATEGORIES = ['Secret', 'Legendary', 'Epic', 'Rare', 'Common', 'Unique'];
const BASE_API = 'https://bubble-gum-simulator.fandom.com/api.php';

async function fetchWikiCategories() {
    const wikiData = {};
    for (const cat of CATEGORIES) {
        console.log(`Fetching members for Category:${cat}...`);
        let members = [];
        let cmcontinue = '';
        while (true) {
            let url = `${BASE_API}?action=query&list=categorymembers&cmtitle=Category:${cat}&cmlimit=500&format=json`;
            if (cmcontinue) url += `&cmcontinue=${cmcontinue}`;
            
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.query && data.query.categorymembers) {
                members = members.concat(data.query.categorymembers.map(m => m.title));
            }
            if (data.continue && data.continue.cmcontinue) {
                cmcontinue = data.continue.cmcontinue;
            } else {
                break;
            }
        }
        wikiData[cat] = new Set(members);
    }
    return wikiData;
}

async function verifyImages(petNames) {
    console.log(`Verifying ${petNames.length} images...`);
    const validUrls = {};
    const chunkSize = 50;
    
    for (let i = 0; i < petNames.length; i += chunkSize) {
        const chunk = petNames.slice(i, i + chunkSize);
        const titles = chunk.map(name => `File:${name.replace(/ /g, '_')}.png`).join('|');
        const url = `${BASE_API}?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url&format=json`;
        
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.query && data.query.pages) {
                for (const pageId in data.query.pages) {
                    const page = data.query.pages[pageId];
                    if (page.imageinfo && page.imageinfo.length > 0) {
                        const title = page.title.replace('File:', '').replace('.png', '').replace(/_/g, ' ');
                        validUrls[title] = page.imageinfo[0].url;
                    }
                }
            }
        } catch (e) {
            console.error('Error fetching images:', e);
        }
    }
    return validUrls;
}

async function main() {
    let initialCount = pets.length;
    console.log(`Loaded ${initialCount} pets.`);

    // 4 & 7. Remove dupes
    const uniqueIds = new Set();
    const uniqueNames = new Set();
    let filteredPets = [];
    
    let dupeCount = 0;
    for (const pet of pets) {
        const isKnownDupe = pet.name.toLowerCase().includes('dupe') || 
                            (pet.category && pet.category.toLowerCase().includes('dupe'));
                            
        if (isKnownDupe) {
            dupeCount++;
            continue;
        }
        
        if (uniqueIds.has(pet.id) || uniqueNames.has(pet.name)) {
            dupeCount++;
            continue;
        }
        
        uniqueIds.add(pet.id);
        uniqueNames.add(pet.name);
        filteredPets.push(pet);
    }
    console.log(`Removed ${dupeCount} duplicates/dupes.`);

    // 1 & 3. Fix Rarities and Categories
    const wikiData = await fetchWikiCategories();
    
    let rarityFixCount = 0;
    let categoryFixCount = 0;
    
    for (const pet of filteredPets) {
        // Skip hats?
        const isHat = pet.type === 'hat' || (pet.category && pet.category.toLowerCase().includes('hat'));
        
        if (!isHat) {
            // Find correct rarity from wiki
            let correctRarity = pet.rarity;
            for (const cat of CATEGORIES) {
                if (wikiData[cat].has(pet.name)) {
                    correctRarity = cat;
                    break;
                }
            }
            
            if (correctRarity !== pet.rarity) {
                pet.rarity = correctRarity;
                rarityFixCount++;
            }
            
            const correctCategory = `${correctRarity} Pets`;
            if (pet.category !== correctCategory) {
                pet.category = correctCategory;
                categoryFixCount++;
            }
        }
    }
    console.log(`Fixed ${rarityFixCount} rarities and ${categoryFixCount} categories.`);

    // 6. Fix Multipliers
    let multiplierFixCount = 0;
    for (const pet of filteredPets) {
        const isHat = pet.type === 'hat' || (pet.category && pet.category.toLowerCase().includes('hat'));
        
        if (isHat) {
            if (pet.multipliers) {
                delete pet.multipliers;
                multiplierFixCount++;
            }
        } else {
            pet.multipliers = {
                Normal: 1,
                Shiny: 2.5,
                Mythic: 10,
                ShinyMythic: 25
            };
            multiplierFixCount++;
        }
    }
    console.log(`Fixed/Set multipliers for ${multiplierFixCount} pets.`);

    // 2. Fix Images
    // Collect all filenames from current images
    const filenamesToVerify = [];
    for (const pet of filteredPets) {
        if (pet.image) {
            const match = pet.image.match(/([^\/]+)\.(png|webp)/i);
            if (match) {
                filenamesToVerify.push(match[0].replace('.webp', '.png')); // Wiki usually uses png
            }
        }
    }
    
    // De-duplicate
    const uniqueFilenames = [...new Set(filenamesToVerify)].map(f => f.replace('.png', ''));
    const validUrls = await verifyImages(uniqueFilenames);
    
    let imageFixCount = 0;
    for (const pet of filteredPets) {
        if (pet.image) {
            const match = pet.image.match(/([^\/]+)\.(png|webp)/i);
            if (match) {
                let imgName = match[1];
                let formattedName = imgName.replace(/_/g, ' ');
                if (validUrls[formattedName]) {
                    let newUrl = validUrls[formattedName];
                    if (!newUrl.includes('/revision/latest')) {
                        newUrl += '/revision/latest';
                    }
                    if (pet.image !== newUrl) {
                        pet.image = newUrl;
                        imageFixCount++;
                    }
                }
            }
        }
    }
    console.log(`Fixed ${imageFixCount} images.`);

    // Save
    fs.writeFileSync(petsPath, JSON.stringify(filteredPets, null, 2));
    console.log(`Saved ${filteredPets.length} pets successfully!`);
}

main().catch(console.error);
