# Bubble Gum Simulator Trading Server & Pet Value Hub 🧼

A modern full-stack web application for **Roblox Bubble Gum Simulator** inspired by top Roblox trading sites (such as `bssmvalues.com`). Features an interactive **Pet Value List**, **Side-by-Side Trade Calculator**, **Online Player Marketplace**, **Admin Management Panel**, and an automated **Fandom Wiki Scraper**.

---

## 🌟 Key Features

1. **Online Trading Market (inspired by bssmvalues.com)**
   - Browse player trade listings filtered by **Selling** or **Buying**.
   - Sort by Newest First, Price (High to Low / Low to High).
   - Display offered & requested pets with total estimated values.
   - One-click copy Roblox username & Discord handle.
   - Post your own trade listings directly onto the market feed.

2. **Side-by-Side Trade Calculator**
   - Add pets to "Your Offer" (Side A) vs "Their Offer" (Side B).
   - Select variants (**Normal**, **Shiny**, **Mythic**, **Shiny Mythic**).
   - Real-time fairness evaluation: **BIG WIN**, **WIN**, **FAIR**, **LOSS**, **BIG LOSS** with value difference breakdown.

3. **Pet Value List**
   - Interactive search bar with instant filter by Rarity (**Secret**, **Mythic**, **Legendary**, **Epic**, **Rare**, **Common**).
   - Demand ratings (1-10) and status badges (**Rising**, **Hyped**, **Stable**, **Dropping**).
   - Variant value preview buttons.
   - Direct "+ Add to Trade Calculator" action.

4. **Fandom Wiki Data Extraction**
   - Automated scraper parsing pet names, thumbnails, and rarities directly from:
     `https://bubble-gum-simulator.fandom.com/wiki/Category:Pets?from=A`
   - One-click "Run Fandom Wiki Scraper" button in Admin Panel.

5. **Admin Management Panel**
   - Manually add new pets with custom base values, demand ratings, and images.
   - Inline edit base values and demand.
   - Delete pet entries from local JSON database (`server/data/pets.json`).

---

## 🚀 Quick Start (Local Run)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)

### Installation & Run

1. Clone or navigate to the project directory:
   ```bash
   cd bgs_trading_hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start both the Express Backend (Port 5000) and Vite Frontend (Port 3000) concurrently:
   ```bash
   npm start
   ```

4. Open your browser at: `http://localhost:3000`

---

## 📦 How to Post / Host on GitHub

### Option A: GitHub Repository Setup & Free Hosting via Vercel / Render

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Bubble Gum Simulator Trading Server"
   ```

2. **Push to GitHub**:
   - Create a new repository on [GitHub](https://github.com/new) named `bgs-trading-hub`.
   - Run:
     ```bash
     git remote add origin https://github.com/YOUR_USERNAME/bgs-trading-hub.git
     git branch -M main
     git push -u origin main
     ```

3. **Deploy Fullstack App for Free**:
   - **Vercel** (Frontend + Serverless API): Import your GitHub repository on [vercel.com](https://vercel.com).
   - **Render** (Express Server + React Frontend): Import repo on [render.com](https://render.com) and set build command to `npm install && npm run build` and start command to `npm run server`.

### Option B: Deploying Frontend to GitHub Pages

1. Build the production static web app:
   ```bash
   npm run build
   ```
2. The compiled web app will be created inside `dist/` directory, ready to be hosted on GitHub Pages or any web server!

---

## 📂 Project Structure

```
bgs_trading_hub/
├── index.html                 # Main HTML entry point
├── package.json               # Node.js dependencies & scripts
├── vite.config.js             # Vite config & API proxy settings
├── server/
│   ├── server.js              # Express REST API (pets, listings, trade evaluator)
│   ├── scraper.js             # Fandom Wiki Cheerio/Axios scraper
│   └── data/
│       ├── pets.json          # Persistent JSON database for pets
│       └── listings.json      # Persistent JSON database for market listings
└── src/
    ├── App.jsx                # Main single-page app layout & tab router
    ├── index.css              # Glassmorphism dark mode design system
    └── components/
        ├── ValueList.jsx      # Pet value grid with search & filters
        ├── TradeCalculator.jsx# Dual-sided trade calculator & fairness evaluator
        ├── Marketplace.jsx    # Online player trade marketplace
        └── AdminPanel.jsx     # Manual pet manager & wiki scraper interface
```
