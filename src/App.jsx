import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronDown, Trophy, Flame, Wallet, ArrowRight, Users, Briefcase, ArrowUpRight, ArrowDownRight, AlertCircle, PlusCircle, X, BookOpen, ShieldCheck, TrendingUp, Banknote, RefreshCw, Trash2, Clock, Eye, EyeOff, Filter, TrendingDown, Target, Zap, CheckCircle } from 'lucide-react';

// --- CONFIGURATION ---
const APP_CONFIG = {
  title: "ZIDALNO MANAGER",
  version: "V23 • Client Side Fetch",
  lastUpdate: "Yahoo Live"
};

// --- BASE DE DONNÉES MAÎTRE ---
// (Ta base de données reste identique, je la raccourcis ici pour la lisibilité, mais garde la tienne complète)
const MASTER_DB = [
  { id: 'wpea', ticker: 'WPEA.PA', name: 'iShares MSCI World', type: 'ETF', ovr: 85, position: 'SOCLE', country: 'EU', rarity: 'common', broker: 'PEA', stats: { pac: 70, sho: 70, pas: 90, phy: 80 }, fairValue: null, comment: "Frais mini. Le standard.", currency: '€', price: 5.93 },
  // ... (Garde toute ta liste MASTER_DB ici)
  { id: 'btc', ticker: 'BTC-USD', name: 'BITCOIN TEST', type: 'Crypto', ovr: 99, position: 'TEST', country: 'X', rarity: 'toty', broker: 'X', stats: { pac: 99, sho: 99, pas: 99, phy: 99 }, fairValue: null, comment: "Si le prix bouge, ça marche !", currency: '$', price: 90000 },
];

// --- FONCTION FETCH ROBUSTE (CLIENT SIDE) ---
const fetchYahooQuotes = async (tickers) => {
  if (!tickers || tickers.length === 0) return [];
  
  const symbols = tickers.join(',');
  
  // Astuce : On utilise un proxy "AllOrigins" qui est très permissif
  // C'est le navigateur du client qui fait la requête, donc pas de blocage IP serveur
  const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    // AllOrigins renvoie la réponse dans un champ "contents" qui est une string JSON
    const yahooData = JSON.parse(data.contents);
    
    return yahooData.quoteResponse?.result || [];
  } catch (error) {
    console.error("Erreur Fetch Yahoo (Client):", error);
    return [];
  }
};

// ... (Le reste du composant FutCard et ZidalnoManagerApp reste identique à ta V22)
// ... (Copie-colle tout le reste du code de la V22 à partir de "const FutCard = ...")

// Juste pour être sûr, je te remets la fin du code avec le useEffect modifié :

const FutCard = ({ player, onAddToPortfolio, onAddToWatchlist, isInWatchlist }) => {
    // ... (Code FutCard identique V22)
    // ...
    return <div>...</div>; // (Placeholder, mets ton code FutCard)
};

export default function ZidalnoManagerApp() {
  // ... (States identiques V22)
  
  // --- MISE A JOUR : ON UTILISE LA NOUVELLE FONCTION FETCH ---
  const updateMarketData = useCallback(async () => {
    setIsLoading(true);
    // On prend tous les tickers
    const allTickers = MASTER_DB.map(p => p.ticker);
    
    // On découpe en petits paquets de 5 pour être gentil avec le proxy
    const chunkSize = 5; 
    const chunks = [];
    for (let i = 0; i < allTickers.length; i += chunkSize) {
      chunks.push(allTickers.slice(i, i + chunkSize));
    }

    try {
      let allQuotes = [];
      
      for (const chunk of chunks) {
        const quotes = await fetchYahooQuotes(chunk);
        allQuotes = [...allQuotes, ...quotes];
        // Petite pause de 200ms entre chaque appel pour ne pas spammer
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const mergedData = MASTER_DB.map(staticPlayer => {
        const liveData = allQuotes.find(q => q.symbol === staticPlayer.ticker);
        if (!liveData) return staticPlayer;

        return {
          ...staticPlayer,
          price: liveData.regularMarketPrice || staticPlayer.price, 
          changePercent: liveData.regularMarketChangePercent || 0,
          currency: liveData.currency === 'EUR' ? '€' : (liveData.currency === 'USD' ? '$' : staticPlayer.currency)
        };
      });
      
      setPlayersData(mergedData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Erreur update globale:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ... (Le reste du code ZidalnoManagerApp est identique V22)
  
  return (
    // ... (JSX identique V22)
    <div>...</div>
  );
}
