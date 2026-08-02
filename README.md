# 📈 Stocks Game - Real-Life Stock Market Trading Simulator

A real-life stock market trading simulator web application built with **React 19**, **TypeScript**, **Vite**, and **Recharts**. Users start with **£5,000.00** capital (customizable) to invest in real-world equities, track live active portfolio holdings, calculate realised & unrealised profit/loss, and maintain/export an audit log of all transactions.

---

## 💾 Hard Drive Local Storage & Session Persistence

The application includes an **Automated Hard Drive Disk Storage Engine** (`/api/state` endpoint integrated with Vite and Node/Express) to ensure your game progress is never lost:

### How Hard Drive Storage Works
1. **Local Disk Database File**:
   - Every buy, sell, cash balance change, portfolio update, and API key configuration is saved directly to a JSON database file on your local computer's hard drive at:
     ```
     data/savegame.json
     ```
2. **Immune to Browser Data & Cookie Clears**:
   - Standard browser `localStorage` can be erased if you click "Clear Browsing Data" or "Clear Cookies".
   - Our app automatically reads from `data/savegame.json` on startup. Even if you wipe all browser cache/cookies, open in Incognito mode, or switch browsers, your game resumes **EXACTLY where you left off** with zero data loss.
3. **No Login or Account Needed**:
   - Because the storage engine runs locally on your computer, no user accounts, passwords, or login forms are required.
4. **Dual-Layer Persistence**:
   - Automatically saves to both **Hard Drive Disk Storage** (`data/savegame.json`) and **Browser Storage** (`localStorage`) for maximum reliability and instant load performance.

---

## 🌐 Live Real-World Data Integration

The application features a **Multi-Source Live Market Data Engine** connecting directly to real-world financial endpoints:

### 1. Connected Live Data Feeds
- **CoinGecko Crypto API (Keyless Live Feed)**:
  - Automatically fetches real-time **Bitcoin (BTC)** live prices in British Pounds (£) with 24h percentage changes. Requires **zero setup or API key**.
- **Open Exchange Rates / ER-API (Live FX Conversion)**:
  - Fetches real-time **USD -> GBP (£)** exchange rates live so all global US stock equities (Apple, Nvidia, Tesla, Microsoft, Amazon, Alphabet, Meta) are dynamically converted into British Pounds.
- **Finnhub Stock Market API (Real-Time Equity Quotes)**:
  - Integrates with Finnhub's real-time stock quote API for global equities.

---

## 🚀 How to Use Live Data in the App

Follow these simple steps to activate and customize live market data:

1. **Open App Settings**:
   - Click the **`LIVE API`** button in the top navigation header (or click the version badge **`v0.1.0`** next to the logo).

2. **Select Data Source Engine Mode**:
   - **🌐 Live API Mode**: Polls live web APIs (CoinGecko, ER-API, Finnhub) for real real-time market prices.
   - **⚡ Real-Time Ticker Mode**: Simulates continuous price fluctuations every 2.5 seconds (ideal when stock exchanges are closed on weekends/after-hours).

3. **Add Your Free Finnhub API Key (Optional)**:
   - Finnhub offers a 100% free API key for real-time US stock market quotes
   - Click **[Get Free Key](https://finnhub.io/register)** to register in 10 seconds.
   - Paste your key into the **Finnhub API Key** field and click **Save & Update Settings**.
   - *Note: If left blank, CoinGecko live crypto & live FX rates remain active alongside market tick simulation. Your API key is permanently saved to your disk file (`data/savegame.json`).*

4. **Manual & Automatic Sync**:
   - Click the **Refresh Live Market** button ($\circlearrowleft$) in the navbar at any time to pull fresh live quotes on demand.
   - Live API mode automatically polls new quotes every 15 seconds in the background.

---

## ✨ Features Breakdown

### 💼 Portfolio Summary Dashboard
- **Available Cash**: Cash available for investment (starts at £5,000.00).
- **Money Invested**: Total current market value of all open stock positions.
- **Total Portfolio Value**: Available Cash + Money Invested.
- **Unrealised P/L**: Open positions profit/loss (£ and %).
- **Realised P/L**: Cumulative profit/loss locked in from closed/sold positions.

### 📊 Active Holdings Breakdown Table
Detailed portfolio table featuring all required metrics:
- **Name**: Stock Symbol & full company name (e.g. `AAPL - Apple Inc.`).
- **Shares Owned**: Quantity of shares owned (supports fractional shares up to 4 decimal places).
- **Average Cost**: Average purchase cost per share (£).
- **Current Price**: Live price per share (£).
- **Current Value**: $\text{Shares Owned} \times \text{Current Price}$.
- **Unrealised P/L**: $\text{Current Value} - \text{Total Cost}$.
- **Realised P/L**: Cumulative profit/loss accrued from previous sales of this stock.
- **Actions**: "+ Buy More" and "Sell" modal triggers.

### 📜 Transaction Log & CSV Export
- Complete audit log tracking every BUY and SELL trade with exact timestamps, execution prices, total order value, realised P/L, and updated cash balance.
- **Download Log (.csv)** button to export your complete transaction history to a CSV file.

### ⚙️ Customizable App Settings & Versioning
- **Dynamic Versioning**: Edit `"version": "0.1.0"` in `package.json` and Vite hot-reloads the header version badge instantly.
- **Custom App Info**: Edit Application Title, Version, or Default Starting Capital (£) directly in the UI Settings modal.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Running

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

Open your browser and navigate to **`http://localhost:5173/`**.

---

## 📜 Tech Stack

- **Framework**: React 18 / 19 + Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Fintech Dark Mode with Glassmorphism)
- **Database / Disk Storage**: Local JSON File Engine (`data/savegame.json` via `/api/state`)
- **Charts**: Recharts
- **Icons**: Lucide React
