import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronDown, Trophy, Flame, Wallet, ArrowRight, Users, Briefcase, ArrowUpRight, ArrowDownRight, AlertCircle, PlusCircle, X, BookOpen, ShieldCheck, TrendingUp, Banknote, RefreshCw, Trash2, Clock, Eye, EyeOff, Filter, TrendingDown } from 'lucide-react';

// --- 🔑 CONFIGURATION API ---
const FMP_API_KEY = 'YM7SZndpQ1iCTvxRpyBIC5R9GeNv3XHW'; // Votre clé (Fonctionne uniquement pour US)

const APP_CONFIG = {
  title: "ZIDALNO MANAGER",
  version: "V14 • Hybrid US Live",
  lastUpdate: "Mixed Data"
};

// --- 1. DONNÉES STATIQUES (EUROPE & ETF - SIMULÉES POUR EVITER ERREUR 403) ---
const STATIC_EU_DATA = [
  // ETF (Socle)
  { id: 'wpea', ticker: 'WPEA.PA', name: 'iShares MSCI World', price: 5.25, currency: '€', type: 'ETF', ovr: 85, position: 'SOCLE', country: 'EU', rarity: 'common', stats: { pac: 70, sho: 70, pas: 90, phy: 80 }, broker: 'PEA', comment: "Socle World à frais réduits." },
  { id: 'ese', ticker: 'ESE.PA', name: 'BNP S&P 500', price: 22.40, currency: '€', type: 'ETF', ovr: 88, position: 'SOCLE', country: 'EU', rarity: 'common', stats: { pac: 80, sho: 60, pas: 85, phy: 75 }, broker: 'PEA', comment: "Performance US dans le PEA." },
  { id: 'cw8', ticker: 'CW8.PA', name: 'Amundi MSCI World', price: 495.00, currency: '€', type: 'ETF', ovr: 85, position: 'SOCLE', country: 'EU', rarity: 'common', stats: { pac: 70, sho: 70, pas: 90, phy: 80 }, broker: 'PEA', comment: "Le classique indémodable." },
  
  // Actions FR (Pépites)
  { id: 'mc', ticker: 'MC.PA', name: 'LVMH', price: 715, currency: '€', type: 'Action', ovr: 91, position: 'LUXE', country: 'FR', rarity: 'gold', stats: { pac: 82, sho: 85, pas: 94, phy: 70 }, broker: 'LCL (PEA)', comment: "Le Roi du CAC40. Qualité 'Wide Moat'." },
  { id: 'rms', ticker: 'RMS.PA', name: 'HERMÈS', price: 2200, currency: '€', type: 'Action', ovr: 92, position: 'LUXE', country: 'FR', rarity: 'gold', stats: { pac: 85, sho: 40, pas: 99, phy: 50 }, broker: 'LCL (PEA)', comment: "L'ultra-luxe. Pricing power absolu." },
  { id: 'ai', ticker: 'AI.PA', name: 'AIR LIQUIDE', price: 175, currency: '€', type: 'Action', ovr: 89, position: 'IND', country: 'FR', rarity: 'icon', stats: { pac: 65, sho: 85, pas: 95, phy: 80 }, broker: 'LCL (PEA)', comment: "Stabilité exemplaire et actions gratuites." },
  { id: 'or', ticker: 'OR.PA', name: 'L\'ORÉAL', price: 445, currency: '€', type: 'Action', ovr: 86, position: 'CONS', country: 'FR', rarity: 'gold', stats: { pac: 70, sho: 75, pas: 90, phy: 72 }, broker: 'LCL (PEA)', comment: "Pilier défensif." },
  { id: 'su', ticker: 'SU.PA', name: 'SCHNEIDER', price: 240, currency: '€', type: 'Action', ovr: 90, position: 'ELEC', country: 'FR', rarity: 'if', stats: { pac: 88, sho: 65, pas: 88, phy: 60 }, broker: 'LCL (PEA)', comment: "Géant de la transition énergétique." },
  { id: 'asml', ticker: 'ASML', name: 'ASML', price: 880, currency: '€', type: 'Action', ovr: 94, position: 'TECH', country: 'NL', rarity: 'toty', stats: { pac: 96, sho: 45, pas: 99, phy: 65 }, broker: 'IBKR', comment: "Monopole technologique européen." }
];

// --- 2. TICKERS US A RECUPERER VIA API (LIVE) ---
const US_TICKERS_TO_FETCH = [
  "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", // Big Tech
  "KNSL", "V", "MA", "COST", "KO", "PEP", // Quality Growth
  "LLY", "JPM", "BLK" // Santé/Finance
];

// --- COMPOSANT CARTE FUT ---
const FutCard = ({ player, onAddToPortfolio, onAddToWatchlist, isInWatchlist }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const getCardStyle = (rarity) => {
    switch(rarity) {
      case 'toty': return "bg-gradient-to-b from-blue-600 via-blue-800 to-blue-950 text-blue-100 border-blue-400";
      case 'icon': return "bg-gradient-to-b from-slate-100 via-slate-300 to-slate-400 text-slate-900 border-yellow-200";
      case 'if': return "bg-gradient-to-b from-slate-800 via-slate-900 to-black text-yellow-400 border-slate-600";
      case 'common': return "bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 text-slate-900 border-slate-400";
      default: return "bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 text-slate-900 border-yellow-300";
    }
  };
  
  const getTrendBadge = (changePercent) => {
    if (changePercent > 2.5) return { icon: <Flame size={12}/>, color: 'bg-green-500', label: 'ON FIRE' };
    if (changePercent > 0.5) return { icon: <ArrowUpRight size={12}/>, color: 'bg-green-400', label: 'Forme' };
    if (changePercent < -2.5) return { icon: <TrendingDown size={12}/>, color: 'bg-red-500', label: 'COLD' };
    if (changePercent < -0.5) return { icon: <ArrowDownRight size={12}/>, color: 'bg-red-400', label: 'Méforme' };
    return { icon: <ArrowRight size={12}/>, color: 'bg-slate-500', label: 'Neutre' };
  };
  
  const style = getCardStyle(player.rarity);
  const textColor = ['icon', 'gold', 'common'].includes(player.rarity) ? 'text-slate-900' : 'text-white';
  const labelColor = ['icon', 'gold', 'common'].includes(player.rarity) ? 'text-slate-700' : 'text-slate-300';
  const trend = getTrendBadge(player.changePercent || 0);

  return (
    <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full aspect-[2/3] rounded-[1.5rem] p-1 shadow-xl cursor-pointer transform transition hover:scale-[1.02] ${style} border`}>
      <div className="h-full w-full border border-white/20 rounded-[1.3rem] p-2 flex flex-col relative overflow-hidden">
        
        <div className={`absolute top-1 right-1 ${trend.color} text-white rounded-full px-1.5 py-0.5 text-[8px] font-bold flex items-center gap-0.5 z-20`}>
          {trend.icon}
        </div>
        
        {!isFlipped ? (
          <>
            <div className="flex justify-between items-start relative z-10">
              <div className="flex flex-col items-center">
                <span className={`text-3xl font-black leading-none ${textColor}`}>{player.ovr}</span>
                <span className={`text-[10px] font-bold uppercase ${textColor}`}>{player.position}</span>
              </div>
              <span className="font-bold text-[10px] opacity-80 mt-1">{player.country}</span>
            </div>
            <div className="flex-1 flex items-center justify-center relative z-0">
               <h2 className={`text-xl sm:text-2xl font-black tracking-tighter opacity-90 text-center leading-none ${textColor}`}>{player.name}</h2>
            </div>
            <div className="relative z-10 border-t border-black/10 pt-1 mt-auto">
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.pac}</span><span className={`font-medium ${labelColor} text-[8px]`}>CRO</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.sho}</span><span className={`font-medium ${labelColor} text-[8px]`}>DIV</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.pas}</span><span className={`font-medium ${labelColor} text-[8px]`}>SUR</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.phy}</span><span className={`font-medium ${labelColor} text-[8px]`}>VAL</span></div>
              </div>
            </div>
            <div className="mt-2 text-center bg-black/10 rounded py-0.5"><span className={`font-bold text-xs ${textColor}`}>{player.price} {player.currency}</span></div>
          </>
        ) : (
          <div className="flex flex-col h-full text-center justify-center gap-2 animate-in fade-in relative z-10">
            <div className={`text-[10px] font-bold uppercase opacity-70 ${textColor}`}>Scout Report</div>
            <p className={`text-[10px] font-medium leading-tight ${textColor}`}>"{player.comment}"</p>
            <div className="bg-white/90 text-black rounded py-1 text-xs font-bold mt-2">{player.broker}</div>
            <div className="flex gap-2 justify-center mt-2">
              <button onClick={(e) => { e.stopPropagation(); onAddToPortfolio(player.ticker); }} className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                <PlusCircle size={12}/> Recruter
              </button>
              <button onClick={(e) => { e.stopPropagation(); onAddToWatchlist(player.ticker); }} className={`${isInWatchlist ? 'bg-yellow-600' : 'bg-slate-600'} text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1`}>
                {isInWatchlist ? <EyeOff size={12}/> : <Eye size={12}/>}
              </button>
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
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mercatoFilter, setMercatoFilter] = useState('all');
  
  const [portfolio, setPortfolio] = useState(() => {
    const savedPortfolio = localStorage.getItem('zidalno_portfolio');
    return savedPortfolio ? JSON.parse(savedPortfolio) : [];
  });
  
  const [watchlist, setWatchlist] = useState(() => {
    const savedWatchlist = localStorage.getItem('zidalno_watchlist');
    return savedWatchlist ? JSON.parse(savedWatchlist) : [];
  });
  
  const [etfPercentage, setEtfPercentage] = useState(() => {
    const saved = localStorage.getItem('zidalno_target_etf');
    return saved ? parseInt(saved) : 80;
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssetTicker, setNewAssetTicker] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newPru, setNewPru] = useState('');
  
  useEffect(() => { localStorage.setItem('zidalno_portfolio', JSON.stringify(portfolio)); }, [portfolio]);
  useEffect(() => { localStorage.setItem('zidalno_watchlist', JSON.stringify(watchlist)); }, [watchlist]);
  useEffect(() => { localStorage.setItem('zidalno_target_etf', etfPercentage.toString()); }, [etfPercentage]);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    
    // 1. Charger les données EU statiques (Toujours disponibles)
    const euData = STATIC_EU_DATA;

    // 2. Tenter de charger les données US (API)
    try {
      // On ne fetch QUE les tickers US pour ne pas être bloqué par l'API gratuite
      const tickersString = US_TICKERS_TO_FETCH.join(',');
      const res = await fetch(`https://financialmodelingprep.com/api/v3/quote/${tickersString}?apikey=${FMP_API_KEY}`);
      
      if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
      const usApiData = await res.json();

      // Transformation des données US
      const usData = usApiData.map(q => {
        const ovr = Math.min(99, Math.max(70, Math.floor(75 + (q.changesPercentage || 0) * 2 + (q.marketCap > 1e12 ? 10 : 0))));
        return {
          id: q.symbol,
          ticker: q.symbol,
          name: q.name.length > 15 ? q.symbol : q.name, // Si nom trop long, on met le ticker
          price: q.price,
          changePercent: q.changesPercentage || 0,
          currency: '$',
          ovr: ovr,
          position: 'US',
          type: 'Action',
          stats: { 
            pac: Math.min(99, Math.floor(70 + Math.abs(q.changesPercentage) * 5)), 
            sho: Math.min(99, Math.floor(50 + (q.eps || 2) * 5)), 
            pas: Math.min(99, Math.floor(80 + Math.random() * 15)), 
            phy: Math.min(99, Math.floor(60 + (q.pe || 20)))
          },
          broker: 'IBKR (CTO)',
          country: 'US',
          rarity: ovr > 90 ? 'toty' : (ovr > 85 ? 'gold' : (ovr > 80 ? 'if' : 'common')),
          comment: `Market Cap: ${(q.marketCap / 1e9).toFixed(1)}B $`
        };
      });

      // Fusion des deux mondes
      const combinedData = [...euData, ...usData];
      setPlayersData(combinedData);
      setLastUpdate(new Date());

    } catch (error) {
      console.error("Erreur API FMP (US):", error);
      // Si l'API plante, on affiche au moins les données EU
      setPlayersData(euData);
      alert("Impossible de récupérer les prix US en direct. Seules les valeurs EU sont affichées.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const intervalId = setInterval(fetchAllData, 60000); // Refresh toutes les minutes (c'est safe pour 20 actions)
    return () => clearInterval(intervalId);
  }, [fetchAllData]);

  const removePosition = (idToRemove) => {
    setPortfolio(portfolio.filter(pos => pos.id !== idToRemove));
  };
  
  const toggleWatchlist = (ticker) => {
    if (watchlist.includes(ticker)) {
      setWatchlist(watchlist.filter(t => t !== ticker));
    } else {
      setWatchlist([...watchlist, ticker]);
    }
  };
  
  const handleAddPosition = (e) => {
    e.preventDefault();
    const assetData = playersData.find(p => p.ticker === newAssetTicker);
    if (!assetData) return;

    const newPosition = {
      id: Date.now().toString(),
      ticker: assetData.ticker,
      name: assetData.name,
      qty: Number(newQty),
      avgPrice: Number(newPru),
      currentPrice: assetData.price,
      type: assetData.type || 'Action'
    };

    setPortfolio([...portfolio, newPosition]);
    setShowAddModal(false);
    setNewQty('');
    setNewPru('');
    setNewAssetTicker('');
  };

  const portfolioStats = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;
    let etfValue = 0;
    let stockValue = 0;

    portfolio.forEach(pos => {
      // On essaie de trouver le prix à jour, sinon on garde le vieux prix stocké
      const liveAsset = playersData.find(p => p.ticker === pos.ticker);
      const currentPrice = liveAsset ? liveAsset.price : pos.currentPrice;
      
      // Conversion $ vers € approximative pour le total (si nécessaire)
      const priceInEur = (pos.ticker.includes('.PA') || pos.ticker === 'ASML') ? currentPrice : currentPrice * 0.92;

      const val = pos.qty * priceInEur;
      const cost = pos.qty * pos.avgPrice; // On suppose PRU saisi en euros pour simplifier
      
      totalValue += val;
      totalCost += cost;
      if(pos.type === 'ETF') etfValue += val;
      else stockValue += val;
    });

    const currentEtfRatio = totalValue > 0 ? (etfValue / totalValue) * 100 : 0;
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return { totalValue, totalGain, totalGainPercent, currentEtfRatio, etfValue, stockValue };
  }, [portfolio, playersData]);

  const coachAdvice = useMemo(() => {
    const targetEtfVal = portfolioStats.totalValue * (etfPercentage / 100);
    const diff = targetEtfVal - portfolioStats.etfValue;
    
    if (portfolioStats.totalValue === 0) return { action: 'Débutant', msg: "Le club est vide. Commencez par recruter !", color: 'text-slate-400' };
    if (Math.abs(diff) < (portfolioStats.totalValue * 0.05)) return { action: 'Tactique Parfaite', msg: "L'équilibre Socle/Pépites est respecté. Continuez ainsi.", color: 'text-emerald-400' };
    if (diff > 0) return { action: 'Renforcer la Défense', msg: `Votre socle (ETF) est trop faible. Il manque environ ${diff.toFixed(0)}€ d'ETF pour respecter le ratio.`, color: 'text-blue-400' };
    return { action: 'Attaque Trop Lourde', msg: `Vous avez trop d'actions individuelles (${(100-portfolioStats.currentEtfRatio).toFixed(0)}%). Calmez le stock picking ou renforcez le socle.`, color: 'text-orange-400' };
  }, [portfolioStats, etfPercentage]);

  const filteredPlayers = useMemo(() => {
    let filtered = playersData.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    
    if (mercatoFilter === 'pepites') {
      filtered = filtered.filter(p => p.ovr >= 85 && p.changePercent < 0);
    } else if (mercatoFilter === 'dividendes') {
      filtered = filtered.filter(p => p.stats.sho >= 80);
    } else if (mercatoFilter === 'croissance') {
      filtered = filtered.filter(p => p.stats.pac >= 85);
    }
    
    return filtered.sort((a, b) => b.ovr - a.ovr);
  }, [playersData, search, mercatoFilter]);

  const watchlistPlayers = useMemo(() => {
    return playersData.filter(p => watchlist.includes(p.ticker));
  }, [playersData, watchlist]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm text-center">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-black italic text-white mb-1 tracking-tighter">ZIDALNO MANAGER</h1>
          <p className="text-slate-500 text-xs mb-8 uppercase font-bold tracking-widest">V14 • Hybrid US Live</p>
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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-sm border border-white/20">Z</div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Club Value</div>
            <div className="font-black text-sm text-white">{portfolioStats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} €</div>
          </div>
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded ${portfolioStats.totalGain >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {portfolioStats.totalGain >= 0 ? '+' : ''}{portfolioStats.totalGainPercent.toFixed(1)}%
        </div>
      </div>

      <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-1 text-[10px] text-yellow-500 font-bold text-center flex items-center justify-center gap-2">
        <Clock size={10} /> {lastUpdate ? `US Live: ${lastUpdate.toLocaleTimeString()}` : "Connexion US..."}
        <button onClick={fetchAllData} disabled={isLoading} className="ml-2 text-yellow-300 hover:text-yellow-100 disabled:opacity-50 transition">
          <RefreshCw size={10} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex p-2 bg-slate-800 mx-4 mt-4 rounded-xl border border-white/5 gap-1">
        <button onClick={() => setActiveTab('market')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1 transition ${activeTab === 'market' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
          <Flame size={12} /> Marché
        </button>
        <button onClick={() => setActiveTab('watchlist')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1 transition ${activeTab === 'watchlist' ? 'bg-yellow-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
          <Eye size={12} /> Vestiaire
        </button>
        <button onClick={() => setActiveTab('club')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1 transition ${activeTab === 'club' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
          <Briefcase size={12} /> Mon Club
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {activeTab === 'club' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={100} /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold text-xs uppercase tracking-widest">
                  <AlertCircle size={14} /> Rapport du Coach
                </div>
                <h3 className={`text-xl font-black italic mb-1 ${coachAdvice.color}`}>{coachAdvice.action}</h3>
                <p className="text-sm text-slate-300 font-medium leading-relaxed mb-4">{coachAdvice.msg}</p>
                <div className="bg-black/30 rounded-xl p-3 space-y-3 border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1 font-bold">MA COMPOSITION</span>
                      <span className="font-black text-white text-lg">{portfolioStats.currentEtfRatio.toFixed(0)} / {(100 - portfolioStats.currentEtfRatio).toFixed(0)}</span>
                      <span className="text-[10px] text-slate-500 block">Socle / Pépites</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-600" />
                    <div className="text-right">
                      <span className="text-slate-400 block mb-1 font-bold">CIBLE (TARGET)</span>
                      <span className="font-black text-emerald-400 text-lg">{etfPercentage} / {100 - etfPercentage}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Défensif (ETF)</span>
                      <span>Offensif (Actions)</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={etfPercentage} 
                      onChange={(e) => setEtfPercentage(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">Effectif Actuel</h3>
                <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-lg">
                  <PlusCircle size={14} /> Recruter
                </button>
              </div>

              {portfolio.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 text-sm">Aucun joueur dans l'équipe.</div>
              ) : (
                <div className="space-y-3">
                  {portfolio.map(pos => {
                    // Trouver l'asset en live pour avoir le prix actuel
                    const liveAsset = playersData.find(p => p.ticker === pos.ticker);
                    const currentPrice = liveAsset ? liveAsset.price : pos.currentPrice;
                    const gain = (currentPrice - pos.avgPrice) * pos.qty;
                    const gainPct = ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100;
                    
                    return (
                      <div key={pos.id} className="bg-slate-800/50 border border-white/5 rounded-xl p-3 flex justify-between items-center hover:bg-slate-800 transition group relative">
                        <button onClick={() => removePosition(pos.id)} className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition z-10">
                          <X size={12} />
                        </button>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border ${pos.type === 'ETF' ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' : 'bg-purple-900/20 text-purple-400 border-purple-500/30'}`}>
                            {pos.ticker.substring(0, 4)}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white">{pos.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {pos.qty} parts • PRU: {pos.avgPrice.toFixed(2)}
                              {pos.ticker.includes('.PA') ? '€' : (liveAsset?.currency || '$')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">{(pos.qty * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })} {pos.ticker.includes('.PA') ? '€' : (liveAsset?.currency || '$')}</div>
                          <div className={`text-[10px] font-bold flex items-center justify-end gap-1 ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {gain >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{gainPct.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-800 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3 text-yellow-400 font-bold text-sm uppercase">
                <Eye size={16} /> Le Vestiaire ({watchlist.length})
              </div>
              <p className="text-slate-400 text-xs mb-4">Vos joueurs en observation. Cliquez sur l'œil pour retirer de la watchlist.</p>
            </div>
            
            {watchlistPlayers.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-sm">Aucun joueur dans le vestiaire. Ajoutez-en depuis le Marché !</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {watchlistPlayers.map(player => (
                  <FutCard 
                    key={player.id} 
                    player={player} 
                    onAddToPortfolio={(ticker) => { setNewAssetTicker(ticker); setShowAddModal(true); }}
                    onAddToWatchlist={toggleWatchlist}
                    isInWatchlist={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            <div className="bg-slate-800 border border-white/10 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-2">
                <BookOpen size={14} className="text-blue-400" /> Centre de Formation
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 p-2 rounded border border-white/5 flex items-start gap-2">
                  <TrendingUp size={14} className="text-green-400 mt-0.5 shrink-0" />
                  <div><span className="text-[10px] font-black text-white block">CRO (Vitesse)</span><p className="text-[9px] text-slate-400 leading-tight">Croissance CA & Cash Flow.</p></div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-white/5 flex items-start gap-2">
                  <Wallet size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                  <div><span className="text-[10px] font-black text-white block">DIV (Tir)</span><p className="text-[9px] text-slate-400 leading-tight">Dividende croissant.</p></div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-white/5 flex items-start gap-2">
                  <ShieldCheck size={14} className="text-blue-400 mt-0.5 shrink-0" />
                  <div><span className="text-[10px] font-black text-white block">SUR (Passe)</span><p className="text-[9px] text-slate-400 leading-tight">Solidité & Moat.</p></div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-white/5 flex items-start gap-2">
                  <Banknote size={14} className="text-purple-400 mt-0.5 shrink-0" />
                  <div><span className="text-[10px] font-black text-white block">VAL (Physique)</span><p className="text-[9px] text-slate-400 leading-tight">Prix vs Juste Valeur.</p></div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 gap-2">
                <h2 className="text-lg font-black italic text-white flex items-center gap-2"><Flame className="text-orange-500" size={18} /> MERCATO</h2>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2 top-1.5 text-slate-500 w-3 h-3" />
                  <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-800 rounded-lg py-1 pl-7 text-[10px] text-white border border-slate-700 outline-none focus:border-blue-500" />
                </div>
              </div>
              
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button onClick={() => setMercatoFilter('all')} className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 transition ${mercatoFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  <Filter size={12} /> Tous
                </button>
                <button onClick={() => setMercatoFilter('pepites')} className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 transition ${mercatoFilter === 'pepites' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  <Trophy size={12} /> Pépites (OVR 85+)
                </button>
                <button onClick={() => setMercatoFilter('dividendes')} className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 transition ${mercatoFilter === 'dividendes' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  <Banknote size={12} /> Dividendes
                </button>
                <button onClick={() => setMercatoFilter('croissance')} className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 transition ${mercatoFilter === 'croissance' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  <TrendingUp size={12} /> Croissance
                </button>
              </div>
              
              {isLoading ? 
                <div className="text-center py-20 text-slate-500 animate-pulse">Chargement des données...</div> : 
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredPlayers.map(player => (
                    <FutCard 
                      key={player.id} 
                      player={player} 
                      onAddToPortfolio={(ticker) => { setNewAssetTicker(ticker); setShowAddModal(true); }}
                      onAddToWatchlist={toggleWatchlist}
                      isInWatchlist={watchlist.includes(player.ticker)}
                    />
                  ))}
                </div>
              }
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black italic text-white flex items-center gap-2"><PlusCircle className="text-emerald-500" /> NOUVELLE RECRUE</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddPosition} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Joueur (Action/ETF)</label>
                <div className="relative">
                  <select className="w-full bg-slate-800 text-white font-bold py-3 px-3 rounded-xl border border-slate-700 appearance-none outline-none focus:border-emerald-500" value={newAssetTicker} onChange={(e) => setNewAssetTicker(e.target.value)}>
                    <option value="">-- Choisir --</option>
                    <optgroup label="Marché (Disponibles)">
                        {playersData.map(p => <option key={p.id} value={p.ticker}>{p.name} ({p.ticker}) - {p.price}{p.currency}</option>)}
                    </optgroup>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Quantité</label><input type="number" step="any" required className="w-full bg-slate-800 text-white font-bold py-3 px-3 rounded-xl border border-slate-700 outline-none focus:border-emerald-500" placeholder="Ex: 10" value={newQty} onChange={(e) => setNewQty(e.target.value)} /></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">PRU (Prix d'achat)</label><input type="number" step="any" required className="w-full bg-slate-800 text-white font-bold py-3 px-3 rounded-xl border border-slate-700 outline-none focus:border-emerald-500" placeholder="Ex: 450" value={newPru} onChange={(e) => setNewPru(e.target.value)} /></div>
              </div>
              <button type="submit" disabled={!newAssetTicker} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl shadow-lg shadow-emerald-900/50 transition active:scale-95 mt-2">VALIDER LE TRANSFERT</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}