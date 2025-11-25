import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Trophy, Flame, Wallet, ArrowRight, Users, Briefcase, ArrowUpRight, ArrowDownRight, AlertCircle, PlusCircle, X, BookOpen, ShieldCheck, TrendingUp, Banknote, RefreshCw, Trash2, Clock, Eye, EyeOff, Filter, Zap, Target, FileSpreadsheet, Layers } from 'lucide-react';

// --- CONFIGURATION ---
// REMPLACEZ PAR VOTRE LIEN CSV GOOGLE SHEETS (Publié sur le web)
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRudxcCXc1m-e0rKNVApV0KgoOlu3kvXQ_UN8wU5faNnHaJbP17-uOA8wr1RiE2anVkr3qgAv1JSo4/pub?gid=0&single=true&output=csv"; 

const APP_CONFIG = {
  title: "ZIDALNO GOAT",
  version: "V23 • Unlimited DB",
};

// --- PARSEUR CSV INTELLIGENT ---
// Transforme les colonnes du Sheet en objets Joueurs
const parseCSV = (text) => {
  const rows = text.split('\n').slice(1); // Ignore header
  return rows.map((row, index) => {
    // Regex pour gérer les virgules dans les cellules (ex: "LVMH, Inc")
    const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
    
    if (cols.length < 8) return null; // Ignorer lignes vides

    // MAPPING DES COLONNES (A=0, B=1, etc.)
    const ticker = cols[0];
    const name = cols[1];
    const type = cols[2]; // Action ou ETF
    const broker = cols[3]; // PEA ou CTO
    const score = parseInt(cols[4]) || 75; // Score QGDV (OVR)
    const fairValue = parseFloat(cols[5].replace(',', '.')) || 0;
    const price = parseFloat(cols[6].replace(',', '.')) || 0;
    const change = parseFloat(cols[7].replace(',', '.').replace('%', '')) || 0;

    // Génération procédurale des stats FIFA basées sur le score global (pour éviter de tout saisir)
    const seed = name.length;
    const stats = {
      pac: Math.min(99, Math.max(40, score + (seed % 10) - 5)), // Croissance simulée
      sho: Math.min(99, Math.max(40, score - (seed % 8) + 4)), // Dividende simulé
      pas: Math.min(99, Math.max(60, score + 2)),              // Sûreté (proche du score)
      phy: fairValue > 0 ? Math.min(99, Math.max(10, Math.round((fairValue / price) * 50))) : 50 // Valeur réelle
    };

    return {
      id: ticker + index,
      ticker, name, type, broker, ovr: score, fairValue, price, 
      changePercent: change, stats,
      currency: ticker.includes('EPA') ? '€' : '$',
      position: type === 'ETF' ? 'SOCLE' : (broker === 'PEA' ? 'EUR' : 'USA'),
      country: ticker.includes('EPA') ? 'FR' : 'US',
      rarity: score >= 90 ? 'toty' : (score >= 85 ? 'gold' : (score >= 80 ? 'if' : 'common'))
    };
  }).filter(item => item !== null && item.price > 0);
};

const FutCard = ({ player, onAddToPortfolio, onAddToWatchlist, isInWatchlist }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const getSignal = () => {
    if (!player.fairValue) return { label: "NEUTRE", color: "bg-slate-500", icon: <Zap size={10}/> };
    const upside = ((player.fairValue - player.price) / player.price) * 100;
    if (upside > 10) return { label: "ACHAT", color: "bg-emerald-500", icon: <Target size={10}/> };
    if (upside < -10) return { label: "CHERE", color: "bg-red-500", icon: <AlertCircle size={10}/> };
    return { label: "FAIR", color: "bg-blue-500", icon: <Zap size={10}/> };
  };
  const signal = getSignal();
  
  const getCardStyle = (rarity) => {
    switch(rarity) {
      case 'toty': return "bg-gradient-to-b from-blue-600 via-blue-800 to-blue-950 text-blue-100 border-blue-400";
      case 'icon': return "bg-gradient-to-b from-slate-100 via-slate-300 to-slate-400 text-slate-900 border-yellow-200";
      case 'if': return "bg-gradient-to-b from-slate-800 via-slate-900 to-black text-yellow-400 border-slate-600";
      default: return "bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 text-slate-900 border-yellow-300";
    }
  };
  const style = getCardStyle(player.rarity);
  const textColor = ['icon', 'gold', 'common'].includes(player.rarity) ? 'text-slate-900' : 'text-white';
  const labelColor = ['icon', 'gold', 'common'].includes(player.rarity) ? 'text-slate-700' : 'text-slate-300';

  return (
    <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full aspect-[2/3] rounded-[1.5rem] p-1 shadow-xl cursor-pointer transform transition hover:scale-[1.02] ${style} border`}>
      <div className="h-full w-full border border-white/20 rounded-[1.3rem] p-2 flex flex-col relative overflow-hidden">
        {signal && <div className={`absolute top-2 right-2 ${signal.color} text-white rounded-full px-2 py-0.5 text-[8px] font-bold flex items-center gap-1 z-20 shadow-sm`}>{signal.icon} {signal.label}</div>}
        {player.broker === 'PEA' && <div className="absolute top-2 left-2 bg-white/90 text-blue-800 rounded px-1.5 py-0.5 text-[8px] font-black z-20">PEA</div>}
        
        {!isFlipped ? (
          <>
            <div className="flex justify-between items-start relative z-10">
              <div className="flex flex-col items-center"><span className={`text-3xl font-black leading-none ${textColor}`}>{player.ovr}</span><span className={`text-[10px] font-bold uppercase ${textColor}`}>{player.position}</span></div>
              <span className="font-bold text-[10px] opacity-80 mt-1">{player.ticker.split(':')[0].replace('NASDAQ','US')}</span>
            </div>
            <div className="flex-1 flex items-center justify-center relative z-0 px-1"><h2 className={`text-xl sm:text-xl font-black tracking-tighter opacity-90 text-center leading-none break-words ${textColor}`}>{player.name}</h2></div>
            <div className="relative z-10 border-t border-black/10 pt-1 mt-auto">
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.pac}</span><span className={`font-medium ${labelColor} text-[8px]`}>CRO</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.sho}</span><span className={`font-medium ${labelColor} text-[8px]`}>DIV</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.pas}</span><span className={`font-medium ${labelColor} text-[8px]`}>SUR</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.phy}</span><span className={`font-medium ${labelColor} text-[8px]`}>VAL</span></div>
              </div>
            </div>
            <div className="mt-2 text-center bg-black/10 rounded py-0.5 flex flex-col items-center justify-center">
              <span className={`font-bold text-xs ${textColor}`}>{player.price.toFixed(2)} {player.currency}</span>
              <span className={`text-[8px] font-bold ${player.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{player.changePercent > 0 ? '+' : ''}{player.changePercent.toFixed(2)}%</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full text-center justify-center gap-2 animate-in fade-in relative z-10">
            <div className={`text-[10px] font-bold uppercase opacity-70 ${textColor}`}>Scout Report</div>
            <div className="flex flex-col gap-1 text-xs font-bold">
               <span className={textColor}>Fair Value: {player.fairValue || 'N/A'} {player.currency}</span>
               <span className={textColor}>Broker: {player.broker}</span>
            </div>
            <div className="flex gap-2 justify-center mt-4">
              <button onClick={(e) => { e.stopPropagation(); onAddToPortfolio(player.ticker); }} className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"><PlusCircle size={12}/> Recruter</button>
              <button onClick={(e) => { e.stopPropagation(); onAddToWatchlist(player.ticker); }} className={`${isInWatchlist ? 'bg-yellow-600' : 'bg-slate-600'} text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1`}>{isInWatchlist ? <EyeOff size={12}/> : <Eye size={12}/>}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ZidalnoManagerApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('market'); 
  const [playersData, setPlayersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [search, setSearch] = useState('');
  const [mercatoFilter, setMercatoFilter] = useState('all'); // all, pea, cto, buy
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Helpers
  const safeJSONParse = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
  const [portfolio, setPortfolio] = useState(() => safeJSONParse('zidalno_portfolio', []));
  const [watchlist, setWatchlist] = useState(() => safeJSONParse('zidalno_watchlist', []));
  const [etfPercentage, setEtfPercentage] = useState(() => parseInt(localStorage.getItem('zidalno_target_etf') || 80));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssetTicker, setNewAssetTicker] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newPru, setNewPru] = useState('');
  
  useEffect(() => { localStorage.setItem('zidalno_portfolio', JSON.stringify(portfolio)); }, [portfolio]);
  useEffect(() => { localStorage.setItem('zidalno_watchlist', JSON.stringify(watchlist)); }, [watchlist]);
  useEffect(() => { localStorage.setItem('zidalno_target_etf', etfPercentage.toString()); }, [etfPercentage]);

  const updateFromSheet = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(GOOGLE_SHEET_URL);
      if (!response.ok) throw new Error("Erreur Sheet");
      const text = await response.text();
      if (text.startsWith("<!DOCTYPE")) throw new Error("Lien invalide");

      const loadedData = parseCSV(text);
      if (loadedData.length === 0) throw new Error("Sheet vide");

      setPlayersData(loadedData);
      setIsDemoMode(false);
      setLastUpdate(new Date());
    } catch (err) {
      console.warn("Mode Démo activé", err);
      setIsDemoMode(true);
      // Données bidon pour la démo si le sheet est vide
      setPlayersData([
        { id: 'demo1', ticker: 'DEMO:LVMH', name: 'LVMH Demo', price: 600, changePercent: 1.2, ovr: 92, stats: {pac:80,sho:80,pas:90,phy:70}, type: 'Action', broker: 'PEA', currency: '€', country: 'FR', rarity: 'gold', fairValue: 750 },
        { id: 'demo2', ticker: 'DEMO:NVDA', name: 'Nvidia Demo', price: 130, changePercent: -2.5, ovr: 95, stats: {pac:99,sho:20,pas:80,phy:60}, type: 'Action', broker: 'CTO', currency: '$', country: 'US', rarity: 'toty', fairValue: 150 }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    updateFromSheet();
    const interval = setInterval(updateFromSheet, 60000);
    return () => clearInterval(interval);
  }, [updateFromSheet]);

  const removePosition = (id) => setPortfolio(portfolio.filter(pos => pos.id !== id));
  const toggleWatchlist = (ticker) => setWatchlist(watchlist.includes(ticker) ? watchlist.filter(t => t !== ticker) : [...watchlist, ticker]);
  const handleAddPosition = (e) => {
    e.preventDefault();
    const assetData = playersData.find(p => p.ticker === newAssetTicker);
    if (!assetData) return;
    setPortfolio([...portfolio, { id: Date.now().toString(), ticker: assetData.ticker, name: assetData.name, qty: Number(newQty), avgPrice: Number(newPru), type: assetData.type }]);
    setShowAddModal(false); setNewQty(''); setNewPru(''); setNewAssetTicker('');
  };

  const portfolioStats = useMemo(() => {
    let totalValue = 0; let totalCost = 0; let etfValue = 0;
    portfolio.forEach(pos => {
      const liveAsset = playersData.find(p => p.ticker === pos.ticker);
      const currentPrice = liveAsset?.price || 0;
      const priceInEur = (pos.ticker.includes('NASDAQ') || pos.ticker.includes('NYSE')) ? currentPrice * 0.95 : currentPrice;
      totalValue += (pos.qty || 0) * priceInEur;
      totalCost += (pos.qty || 0) * (pos.avgPrice || 0);
      if (pos.type === 'ETF') etfValue += (pos.qty || 0) * priceInEur;
    });
    const currentEtfRatio = totalValue > 0 ? (etfValue / totalValue) * 100 : 0;
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    return { totalValue, totalGain, totalGainPercent, currentEtfRatio };
  }, [portfolio, playersData]);

  const coachAdvice = useMemo(() => {
    const diff = (portfolioStats.totalValue * (etfPercentage / 100)) - (portfolioStats.totalValue * (portfolioStats.currentEtfRatio / 100));
    if (portfolioStats.totalValue === 0) return { action: 'Débutant', msg: "Connectez votre Sheet et recrutez !", color: 'text-slate-400' };
    if (Math.abs(diff) < (portfolioStats.totalValue * 0.05)) return { action: 'Parfait', msg: "Formation équilibrée.", color: 'text-emerald-400' };
    return { action: 'Rééquilibrage', msg: `Ajustez le socle (${diff.toFixed(0)}€).`, color: 'text-yellow-400' };
  }, [portfolioStats, etfPercentage]);

  const filteredPlayers = useMemo(() => {
    let filtered = playersData.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (mercatoFilter === 'pea') filtered = filtered.filter(p => p.broker === 'PEA');
    else if (mercatoFilter === 'cto') filtered = filtered.filter(p => p.broker !== 'PEA');
    else if (mercatoFilter === 'buy') filtered = filtered.filter(p => p.fairValue > 0 && p.price < p.fairValue);
    return filtered.sort((a, b) => b.ovr - a.ovr);
  }, [playersData, search, mercatoFilter]);

  const watchlistPlayers = useMemo(() => playersData.filter(p => watchlist.includes(p.ticker)), [playersData, watchlist]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm text-center">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-black italic text-white mb-1 tracking-tighter">ZIDALNO MANAGER</h1>
          <p className="text-slate-500 text-xs mb-8 uppercase font-bold tracking-widest">V23 • GOAT EDITION</p>
          <form onSubmit={(e) => { e.preventDefault(); if(passwordInput.toLowerCase() === 'zidalno') setIsAuthenticated(true); }} className="space-y-4">
            <input type="password" placeholder="PASSWORD" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 text-center text-white font-bold tracking-widest focus:border-yellow-500 outline-none" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-xl transition">ENTER CLUB</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-24 overflow-x-hidden relative">
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-sm border border-white/20">Z</div><div><div className="text-[10px] text-slate-400 font-bold uppercase">Club Value</div><div className="font-black text-sm text-white">{portfolioStats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} €</div></div></div>
        <div className="flex items-center gap-3"><div className={`text-xs font-bold px-2 py-1 rounded ${portfolioStats.totalGain >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{portfolioStats.totalGain >= 0 ? '+' : ''}{portfolioStats.totalGainPercent.toFixed(1)}%</div><button onClick={() => {localStorage.clear(); window.location.reload();}} className="p-2 bg-red-500/10 hover:bg-red-500/30 rounded-full text-red-500 transition"><Trash2 size={14} /></button></div>
      </div>

      <div className={`border-b border-white/10 px-4 py-1 text-[10px] font-bold text-center flex items-center justify-center gap-2 ${isDemoMode ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>
        {isDemoMode ? <AlertCircle size={10}/> : <FileSpreadsheet size={10}/>}
        {isDemoMode ? "CONNECTEZ VOTRE SHEET (Voir Code)" : `LIVE DATA: ${playersData.length} JOUEURS`}
        <button onClick={updateFromSheet} disabled={isLoading} className="ml-2 hover:text-white transition"><RefreshCw size={10} className={isLoading ? 'animate-spin' : ''} /></button>
      </div>

      <div className="flex p-2 bg-slate-800 mx-4 mt-4 rounded-xl border border-white/5 gap-1">
        <button onClick={() => setActiveTab('market')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1 transition ${activeTab === 'market' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}><Flame size={12} /> Marché</button>
        <button onClick={() => setActiveTab('watchlist')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1 transition ${activeTab === 'watchlist' ? 'bg-yellow-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}><Eye size={12} /> Vestiaire</button>
        <button onClick={() => setActiveTab('club')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1 transition ${activeTab === 'club' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}><Briefcase size={12} /> Mon Club</button>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {activeTab === 'club' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={100} /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold text-xs uppercase tracking-widest"><AlertCircle size={14} /> Rapport du Coach</div>
                <h3 className={`text-xl font-black italic mb-1 ${coachAdvice.color}`}>{coachAdvice.action}</h3>
                <p className="text-sm text-slate-300 font-medium leading-relaxed mb-4">{coachAdvice.msg}</p>
                <div className="bg-black/30 rounded-xl p-3 space-y-3 border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <div><span className="text-slate-400 block mb-1 font-bold">MA COMPOSITION</span><span className="font-black text-white text-lg">{portfolioStats.currentEtfRatio.toFixed(0)} / {(100 - portfolioStats.currentEtfRatio).toFixed(0)}</span></div>
                    <ArrowRight size={14} className="text-slate-600" />
                    <div className="text-right"><span className="text-slate-400 block mb-1 font-bold">CIBLE</span><span className="font-black text-emerald-400 text-lg">{etfPercentage} / {100 - etfPercentage}</span></div>
                  </div>
                  <input type="range" min="0" max="100" value={etfPercentage} onChange={(e) => setEtfPercentage(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"/>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-3"><h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">Effectif Actuel</h3><button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-lg"><PlusCircle size={14} /> Recruter</button></div>
              {portfolio.length === 0 ? <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 text-sm">Aucun joueur. Recrutez !</div> : 
                <div className="space-y-3">
                  {portfolio.map(pos => {
                    const liveAsset = playersData.find(p => p.ticker === pos.ticker);
                    const currentPrice = liveAsset?.price || 0;
                    const gainPct = pos.avgPrice > 0 ? ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100 : 0;
                    return (
                      <div key={pos.id} className="bg-slate-800/50 border border-white/5 rounded-xl p-3 flex justify-between items-center hover:bg-slate-800 transition group relative">
                        <button onClick={() => removePosition(pos.id)} className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition z-10"><X size={12} /></button>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border ${pos.type === 'ETF' ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' : 'bg-purple-900/20 text-purple-400 border-purple-500/30'}`}>{pos.ticker.split(':')[1] || pos.ticker.substring(0,4)}</div>
                          <div><div className="font-bold text-sm text-white">{pos.name}</div><div className="text-[10px] text-slate-400 font-mono">{pos.qty} parts • PRU: {pos.avgPrice.toFixed(2)}{liveAsset?.currency}</div></div>
                        </div>
                        <div className="text-right"><div className="font-bold text-sm">{(pos.qty * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })} {liveAsset?.currency}</div><div className={`text-[10px] font-bold flex items-center justify-end gap-1 ${gainPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{gainPct >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{gainPct.toFixed(1)}%</div></div>
                      </div>
                    );
                  })}
                </div>
              }
            </div>
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {watchlistPlayers.map(player => <FutCard key={player.id} player={player} onAddToPortfolio={(ticker) => { setNewAssetTicker(ticker); setShowAddModal(true); }} onAddToWatchlist={toggleWatchlist} isInWatchlist={true} />)}
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            <div>
              <div className="flex items-center justify-between mb-4 gap-2">
                <h2 className="text-lg font-black italic text-white flex items-center gap-2"><Flame className="text-orange-500" size={18} /> MERCATO ({playersData.length})</h2>
                <div className="relative flex-1 max-w-xs"><Search className="absolute left-2 top-1.5 text-slate-500 w-3 h-3" /><input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-800 rounded-lg py-1 pl-7 text-[10px] text-white border border-slate-700 outline-none focus:border-blue-500" /></div>
              </div>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setMercatoFilter('all')} className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 transition ${mercatoFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><Filter size={12} /> Tous</button>
                <button onClick={() => setMercatoFilter('pea')} className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 transition ${mercatoFilter === 'pea' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><ShieldCheck size={12} /> PEA</button>
                <button onClick={() => setMercatoFilter('buy')} className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 transition ${mercatoFilter === 'buy' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><Target size={12} /> Achat</button>
                <button onClick={() => setMercatoFilter('pepites')} className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 transition ${mercatoFilter === 'pepites' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><Trophy size={12} /> Top (85+)</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredPlayers.map(player => <FutCard key={player.id} player={player} onAddToPortfolio={(ticker) => { setNewAssetTicker(ticker); setShowAddModal(true); }} onAddToWatchlist={toggleWatchlist} isInWatchlist={watchlist.includes(player.ticker)} />)}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black italic text-white flex items-center gap-2"><PlusCircle className="text-emerald-500" /> RECRUTER</h3><button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button></div>
            <form onSubmit={handleAddPosition} className="space-y-4">
              <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Joueur</label><div className="relative"><select className="w-full bg-slate-800 text-white font-bold py-3 px-3 rounded-xl border border-slate-700 appearance-none outline-none focus:border-emerald-500" value={newAssetTicker} onChange={(e) => setNewAssetTicker(e.target.value)}><option value="">-- Choisir --</option><optgroup label="Marché">{playersData.map(p => <option key={p.id} value={p.ticker}>{p.name}</option>)}</optgroup></select><ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} /></div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Quantité</label><input type="number" step="any" required className="w-full bg-slate-800 text-white font-bold py-3 px-3 rounded-xl border border-slate-700 outline-none focus:border-emerald-500" placeholder="Ex: 10" value={newQty} onChange={(e) => setNewQty(e.target.value)} /></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">PRU</label><input type="number" step="any" required className="w-full bg-slate-800 text-white font-bold py-3 px-3 rounded-xl border border-slate-700 outline-none focus:border-emerald-500" placeholder="Ex: 450" value={newPru} onChange={(e) => setNewPru(e.target.value)} /></div>
              </div>
              <button type="submit" disabled={!newAssetTicker} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-black py-3 rounded-xl shadow-lg shadow-emerald-900/50 transition active:scale-95 mt-2">VALIDER</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}