import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { scrapeFandomPets } from './scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PETS_FILE = path.join(__dirname, 'data', 'pets.json');
const LISTINGS_FILE = path.join(__dirname, 'data', 'listings.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to read database files
async function getData(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper function to save database files
async function saveData(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ---------------- BACKEND IMAGE PROXY WITH CACHE (BYPASSES FANDOM HOTLINK BLOCKS) ----------------
const imageCache = new Map();
const MAX_CACHE_SIZE = 500;

app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return res.status(400).send('Invalid Image URL');
    }

    // Check cache first
    if (imageCache.has(imageUrl)) {
      const cached = imageCache.get(imageUrl);
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Cache-Control', 'public, max-age=604800');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Cache', 'HIT');
      return res.send(cached.data);
    }

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/avif,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://bubble-gum-simulator.fandom.com/',
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const contentType = response.headers['content-type'] || 'image/png';
    const imageBuffer = Buffer.from(response.data);

    // Cache the image (evict oldest if cache is full)
    if (imageCache.size >= MAX_CACHE_SIZE) {
      const firstKey = imageCache.keys().next().value;
      imageCache.delete(firstKey);
    }
    imageCache.set(imageUrl, { data: imageBuffer, contentType });

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Cache', 'MISS');
    res.send(imageBuffer);
  } catch (err) {
    console.error('[Proxy] Failed:', imageUrl?.substring(0, 80), err.message);
    res.status(500).send('Image Proxy Failed');
  }
});

// ---------------- USER AUTHENTICATION & STAFF RANKS API ----------------
app.get('/api/users', async (req, res) => {
  try {
    const users = await getData(USERS_FILE);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, robloxUsername, discord, password } = req.body;

    if (!username || !robloxUsername || !password) {
      return res.status(400).json({ success: false, error: 'Username, Roblox Username, and Password are required.' });
    }

    const users = await getData(USERS_FILE);
    const existing = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() || u.robloxUsername.toLowerCase() === robloxUsername.toLowerCase()
    );

    if (existing) {
      return res.status(400).json({ success: false, error: 'Username or Roblox Username is already registered.' });
    }

    const newUser = {
      id: 'user_' + Date.now(),
      username,
      robloxUsername,
      discord: discord || '',
      password,
      role: 'member',
      rank: 'Verified Trader',
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await saveData(USERS_FILE, users);

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        robloxUsername: newUser.robloxUsername,
        discord: newUser.discord,
        role: newUser.role,
        rank: newUser.rank,
        isVerified: true,
        badge: 'Verified Trader ✓',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, role, pin } = req.body;

    if (role === 'owner' || role === 'mod') {
      if (role === 'owner' && pin === 'owner123') {
        return res.json({
          success: true,
          user: {
            id: 'user_owner',
            username: username || 'Owner_Admin',
            robloxUsername: 'BGS_Owner_Official',
            role: 'owner',
            rank: 'Owner & Lead Dev',
            isVerified: true,
            badge: '👑 Owner',
          },
        });
      }
      if (role === 'mod' && (pin === 'mod123' || pin === 'staff123')) {
        return res.json({
          success: true,
          user: {
            id: 'user_mod_' + Date.now(),
            username: username || 'Staff_Mod',
            robloxUsername: 'Staff_Mod_Roblox',
            role: 'mod',
            rank: 'Head Moderator',
            isVerified: true,
            badge: '🛡️ Staff Mod',
          },
        });
      }
      return res.status(401).json({ success: false, error: 'Invalid Staff Security PIN.' });
    }

    const users = await getData(USERS_FILE);
    const user = users.find(
      (u) => u.username.toLowerCase() === username?.toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid Username or Password.' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, error: 'This account is suspended/banned by an administrator.' });
    }

    // Update last login timestamp and status to active
    user.lastLogin = new Date().toISOString();
    user.status = 'active';
    await saveData(USERS_FILE, users);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        robloxUsername: user.robloxUsername,
        discord: user.discord,
        role: user.role,
        rank: user.rank || 'Verified Trader',
        status: user.status || 'active',
        isVerified: true,
        badge: user.role === 'owner' ? '👑 Owner' : user.role === 'mod' ? '🛡️ Staff Mod' : 'Verified Trader ✓',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify user session status (banned/kicked check)
app.get('/api/auth/verify', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.json({ success: true, status: 'active' });
    const users = await getData(USERS_FILE);
    const user = users.find((u) => u.id === id);
    if (!user) return res.json({ success: true, status: 'active' });

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, status: 'banned', error: 'You have been suspended by an administrator.' });
    }
    if (user.status === 'kicked') {
      user.status = 'active';
      await saveData(USERS_FILE, users);
      return res.status(401).json({ success: false, status: 'kicked', error: 'You were kicked from the active session.' });
    }
    res.json({ success: true, status: user.status || 'active', role: user.role });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- ADMIN USER MODERATION API ----------------
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await getData(USERS_FILE);
    const listings = await getData(LISTINGS_FILE);

    // Calculate listing counts per user
    const formatted = users.map((u) => {
      const userListings = listings.filter((l) => l.seller?.username === u.username || l.userId === u.id);
      return {
        id: u.id,
        username: u.username,
        robloxUsername: u.robloxUsername,
        discord: u.discord || 'None',
        role: u.role || 'member',
        rank: u.rank || 'Verified Trader',
        status: u.status || 'active',
        createdAt: u.createdAt || new Date().toISOString(),
        lastLogin: u.lastLogin || u.createdAt || 'Never',
        listingsCount: userListings.length,
      };
    });

    res.json({ success: true, users: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ban User
app.post('/api/admin/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await getData(USERS_FILE);
    const user = users.find((u) => u.id === id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.status = 'banned';
    user.bannedAt = new Date().toISOString();
    await saveData(USERS_FILE, users);

    // Delete active trade listings for this banned user
    const listings = await getData(LISTINGS_FILE);
    const filteredListings = listings.filter((l) => l.seller?.username !== user.username && l.userId !== user.id);
    await saveData(LISTINGS_FILE, filteredListings);

    res.json({ success: true, message: `User @${user.username} has been banned and their listings removed.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Unban User
app.post('/api/admin/users/:id/unban', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await getData(USERS_FILE);
    const user = users.find((u) => u.id === id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.status = 'active';
    delete user.bannedAt;
    await saveData(USERS_FILE, users);

    res.json({ success: true, message: `User @${user.username} has been unbanned.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Kick User (Force Logout)
app.post('/api/admin/users/:id/kick', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await getData(USERS_FILE);
    const user = users.find((u) => u.id === id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.status = 'kicked';
    user.kickedAt = new Date().toISOString();
    await saveData(USERS_FILE, users);

    res.json({ success: true, message: `User @${user.username} has been kicked from their active session.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Role (Promote/Demote)
app.put('/api/admin/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, rank } = req.body;
    const users = await getData(USERS_FILE);
    const user = users.find((u) => u.id === id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.role = role || user.role;
    user.rank = rank || (role === 'owner' ? 'Owner & Lead Dev' : role === 'mod' ? 'Head Moderator' : 'Verified Trader');
    await saveData(USERS_FILE, users);

    res.json({ success: true, message: `User @${user.username} updated to ${user.role} (${user.rank}).` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete User
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await getData(USERS_FILE);
    const user = users.find((u) => u.id === id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const updatedUsers = users.filter((u) => u.id !== id);
    await saveData(USERS_FILE, updatedUsers);

    // Delete listings
    const listings = await getData(LISTINGS_FILE);
    const filteredListings = listings.filter((l) => l.seller?.username !== user.username && l.userId !== user.id);
    await saveData(LISTINGS_FILE, filteredListings);

    res.json({ success: true, message: `User @${user.username} was permanently deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const { username, robloxUsername, rank } = req.body;

    if (!username || !rank) {
      return res.status(400).json({ success: false, error: 'Staff Username and Rank are required.' });
    }

    const users = await getData(USERS_FILE);
    const index = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase());

    if (index !== -1) {
      users[index].role = 'mod';
      users[index].rank = rank;
    } else {
      users.push({
        id: 'staff_' + Date.now(),
        username,
        robloxUsername: robloxUsername || username,
        discord: '',
        role: 'mod',
        rank,
        isVerified: true,
        createdAt: new Date().toISOString(),
      });
    }

    await saveData(USERS_FILE, users);
    res.json({ success: true, message: `Staff member "${username}" updated with rank "${rank}".` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- PETS API ----------------
app.get('/api/pets', async (req, res) => {
  try {
    const pets = await getData(PETS_FILE);
    res.json({ success: true, count: pets.length, pets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/pets', async (req, res) => {
  try {
    const {
      name,
      type,
      rarity,
      baseValue,
      customValues,
      demand,
      status,
      category,
      image,
      description,
      stats,
      existence,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Item Name is required.' });
    }

    const pets = await getData(PETS_FILE);
    const id = (type === 'hat' ? 'hat_' : 'pet_') + Date.now();

    const isHat = type === 'hat' || category?.toLowerCase().includes('hat');

    const newPet = {
      id,
      name,
      type: isHat ? 'hat' : 'pet',
      rarity: rarity || 'Common',
      baseValue: baseValue !== '' && baseValue !== null && !isNaN(baseValue) ? Number(baseValue) : null,
      customValues: customValues || null,
      demand: Number(demand) || 5,
      status: status || 'Stable',
      category: category || (isHat ? 'Hats' : rarity ? `${rarity} Pets` : 'Custom Pets'),
      image: image || '',
      multipliers: isHat
        ? null
        : {
            Normal: 1.0,
            Shiny: 2.5,
            Mythic: 10.0,
            ShinyMythic: 25.0,
          },
      description: description || (isHat ? 'Equippable Hat Accessory in Bubble Gum Simulator.' : 'Companion Pet in Bubble Gum Simulator.'),
      stats: stats || (isHat ? null : {
        buffs: { Bubbles: 100, Coins: 250, Gems: 200 },
        movementType: 'Walk',
      }),
      existence: existence || {},
    };

    pets.unshift(newPet);
    await saveData(PETS_FILE, pets);

    res.status(201).json({ success: true, pet: newPet });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const pets = await getData(PETS_FILE);
    const index = pets.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }

    pets[index] = {
      ...pets[index],
      ...updates,
      baseValue: updates.baseValue !== undefined ? Number(updates.baseValue) : pets[index].baseValue,
      demand: updates.demand !== undefined ? Number(updates.demand) : pets[index].demand,
    };

    await saveData(PETS_FILE, pets);
    res.json({ success: true, pet: pets[index] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let pets = await getData(PETS_FILE);
    const initialLen = pets.length;
    pets = pets.filter((p) => p.id !== id);

    if (pets.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }

    await saveData(PETS_FILE, pets);
    res.json({ success: true, message: 'Pet deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- MARKETPLACE LISTINGS API ----------------
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await getData(LISTINGS_FILE);
    res.json({ success: true, count: listings.length, listings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/listings', async (req, res) => {
  try {
    const { traderName, robloxUsername, discord, type, offering, requesting, isVerified, picture, email } = req.body;

    if (!traderName || !offering || offering.length === 0) {
      return res.status(400).json({ success: false, error: 'Trader Name and Offered Pets are required.' });
    }

    const listings = await getData(LISTINGS_FILE);
    const newListing = {
      id: 'list_' + Date.now(),
      traderName,
      robloxUsername: robloxUsername || traderName,
      discord: discord || '',
      email: email || '',
      picture: picture || '',
      type: type || 'sell',
      offering: offering || [],
      requesting: requesting || [],
      isVerified: isVerified !== undefined ? isVerified : true,
      createdAt: new Date().toISOString(),
    };

    listings.unshift(newListing);
    await saveData(LISTINGS_FILE, listings);

    res.status(201).json({ success: true, listing: newListing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    let listings = await getData(LISTINGS_FILE);
    const index = listings.findIndex((l) => l.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    listings[index] = {
      ...listings[index],
      ...updates,
    };

    await saveData(LISTINGS_FILE, listings);
    res.json({ success: true, listing: listings[index] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let listings = await getData(LISTINGS_FILE);
    listings = listings.filter((l) => l.id !== id);
    await saveData(LISTINGS_FILE, listings);
    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- SCRAPER API ----------------
app.post('/api/scrape', async (req, res) => {
  try {
    const result = await scrapeFandomPets();
    res.json({ success: true, message: 'Wiki scrape completed!', ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to scrape Fandom Wiki: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Server] Bubble Gum Simulator API backend running at http://localhost:${PORT}`);
});
