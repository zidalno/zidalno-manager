import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Trophy, Flame, Wallet, ArrowRight, Users, Briefcase, ArrowUpRight, ArrowDownRight, AlertCircle, PlusCircle, X, BookOpen, ShieldCheck, TrendingUp, Banknote, RefreshCw, Trash2, Clock, Eye, EyeOff, Filter, TrendingDown, Target, Zap, CheckCircle, Info } from 'lucide-react';

// --- CONFIGURATION ---
// ⚠️ REMPLACE PAR TON URL DU SHEET EXPORTÉ EN CSV
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1E7PgpVnoNnh8_Q-dJBnXJuy-JiDihP6gzfn6Fg2ZvXQ/edit?usp=sharing";

const APP_CONFIG = {
  title: "ZIDALNO MANAGER",
  version: "V28 • Bug Fix",
  lastUpdate: "Live"
};

// --- PARSEUR CSV ---
const parseCSV = (text) => {
  if (!text || text.length === 0) {
    console.error("❌ CSV vide");
    return [];
  }

  const rows = text.split('\n').slice(1).filter(row => row.trim().length > 0);
  
  return rows.map((row, index) => {
    try {
      const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
      
      if (cols.length < 8) return null;

      return {
        id: `stock_${index}`,
        ticker: cols[0] || "N/A",
        name: cols[1] || "Unknown",
        country: cols[2] || "FR",
        sector: cols[3] || "Divers",
        ovr: parseInt(cols[4]) || 0,
        stats: {
          pac: parseInt(cols[5]) || 0,
          sho: parseInt(cols[6]) || 0,
          pas: parseInt(cols[7]) || 0,
          phy: parseInt(cols[8]) || 0
        },
        sheetPrice: parseFloat(cols[9]) || 0,
        sheetChange: cols[10] || "0",
        roe: cols[11] || "-",
        margin: cols[12] || "-",
        debt: cols[13] || "-",
        cagr_ca: cols[14] || "-",
        cagr_bn: cols[15] || "-",
        cagr_fcf: cols[16] || "-",
        div_yield: cols[17] || "-",
        div_growth: cols[18] || "-",
        payout: cols[19] || "-",
        per: cols[20] || "-",
        per_hist: cols[21] || "-",
        per_sect: cols[22] || "-",
        fairValue: parseFloat(cols[23]) || null,
        potential: cols[24] || "-",
        signal: cols[25] || "SURVEILLER",
        moat: cols[26] === "Oui",
        qualityNote: cols[27] || "",
        profil: cols[29] || "DANGER",
        alert: cols[30] || "OK",
        comment: cols[32] || "Pas de données.",
        price: parseFloat(cols[9]) || 0,
        changePercent: 0,
        currency: (cols[0] && (cols[0].includes('.PA') || cols[0].includes('.AS') || cols[0].includes('.MC'))) ? '€' : '$',
        type: 'Action'
      };
    } catch (e) {
      console.warn("⚠️ Erreur parsing ligne", index, e);
      return null;
    }
  }).filter(item => item !== null);
};

// --- FETCH LIVE (SÉCURISÉ) ---
const fetchLiveQuotes = async (tickers) => {
  if (!tickers || tickers.length === 0) return [];
  
  try {
    const response = await fetch(`/api/proxy?symbols=${tickers.join(',')}&t=${Date.now()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.warn("⚠️ API réponse:", response.status);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("⚠️ Fetch live quotes:", error.message);
    return [];
  }
};

// --- CARTE ---
const FutCard = ({ player, onAddToPortfolio, onAddToWatchlist, isInWatchlist }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const getCardStyle = (profil) => {
    if (profil?.includes("GOAT")) return "bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 text-slate-900 border-yellow-400 shadow-yellow-500/50";
    if (profil?.includes("TITULAIRE")) return "bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 text-slate-900 border-slate-300";
    if (profil?.includes("DANGER")) return "bg-gradient-to-b from-red-900 via-red-950 to-black text-red-100 border-red-700";
    return "bg-gradient-to-b from-blue-600 via-blue-800 to-blue-950 text-white border-blue-500";
  };
  
  const style = getCardStyle(player.profil);
  const textColor = style.includes("text-slate-900") ? "text-slate-900" : "text-white";
  const labelColor = style.includes("text-slate-900") ? "text-slate-700" : "text-slate-400";
  const buySignal = player.signal === "ACHAT";

  return (
    <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full aspect-[2/3] rounded-[1.5rem] p-1 shadow-xl cursor-pointer transform transition hover:scale-[1.02] duration-300 ${style} border group`}>
      <div className="h-full w-full border border-white/20 rounded-[1.3rem] p-2 flex flex-col relative overflow-hidden backdrop-blur-sm">
        
        {/* Badge Signal */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-sm z-20 ${buySignal ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-700/50 text-white'}`}>
          {buySignal ? <Target size={10}/> : <Eye size={10}/>} {player.signal}
        </div>

        {player.moat && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black px-1.5 py-0.5 rounded text-[8px] font-black flex items-center gap-1 z-20 shadow-sm">
            <ShieldCheck size={10}/> MOAT
          </div>
        )}

        {!isFlipped ? (
          <>
            {/* RECTO */}
            <div className="mt-6 flex justify-between items-start relative z-10 px-1">
              <div className="flex flex-col items-center">
                <span className={`text-4xl font-black leading-none ${textColor}`}>{player.ovr}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${textColor}`}>{player.sector?.substring(0, 8)}</span>
              </div>
              <div className="flex flex-col items-end mt-1">
                 <span className={`font-bold text-[10px] opacity-80 ${textColor}`}>{player.country}</span>
                 <span className={`text-[9px] font-black px-1 rounded ${player.alert === "OK" ? "text-green-500 bg-green-900/20" : "text-red-500 bg-red-900/20"}`}>
                    {player.alert === "OK" ? "APT" : "⚠️"}
                 </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-0 my-2">
               <h2 className={`text-xl sm:text-2xl font-black tracking-tighter text-center leading-none ${textColor} drop-shadow-md`}>{player.name}</h2>
               <div className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded bg-black/20 ${textColor}`}>{player.qualityNote}</div>
            </div>

            <div className="relative z-10 border-t border-black/10 pt-2 mt-auto">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs px-1">
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.pac || 0}</span><span className={`font-medium ${labelColor} text-[9px]`}>Q</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.sho || 0}</span><span className={`font-medium ${labelColor} text-[9px]`}>C</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.pas || 0}</span><span className={`font-medium ${labelColor} text-[9px]`}>D</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.phy || 0}</span><span className={`font-medium ${labelColor} text-[9px]`}>V</span></div>
              </div>
            </div>

            <div className="mt-3 text-center bg-black/20 rounded py-1 flex justify-center items-center gap-2 mx-1">
              <span className={`font-bold text-sm ${textColor}`}>{(player.price || 0).toFixed(2)} {player.currency}</span>
              <span className={`text-[10px] font-bold ${(player.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(player.changePercent || 0) > 0 ? '+' : ''}{(player.changePercent || 0).toFixed(2)}%
              </span>
            </div>
          </>
        ) : (
          <>
            {/* VERSO */}
            <div className="flex flex-col h-full relative z-10 p-2 animate-in fade-in duration-200 text-white overflow-hidden">
              <div className="text-center text-[10px] font-black uppercase mb-2 opacity-70 tracking-widest">RAPPORT</div>
              
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                <div className="bg-white/10 rounded p-1 border border-white/5">
                  <div className="text-[8px] font-bold text-emerald-400 flex justify-between"><span>QUALITÉ</span><span>{player.stats.pac}/20</span></div>
                  <div className="text-[8px] text-slate-200">ROE: {player.roe}% | Marge: {player.margin}%</div>
                </div>

                <div className="bg-white/10 rounded p-1 border border-white/5">
                  <div className="text-[8px] font-bold text-blue-400 flex justify-between"><span>CROISSANCE</span><span>{player.stats.sho}/20</span></div>
                  <div className="text-[8px] text-slate-200">CA: {player.cagr_ca}% | BNA: {player.cagr_bn}%</div>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[8px]">
                  <div className="bg-white/10 rounded p-1 border border-white/5"><span className="font-bold text-yellow-400">DIV</span><div className="text-slate-200">{player.div_yield}%</div></div>
                  <div className="bg-white/10 rounded p-1 border border-white/5"><span className="font-bold text-purple-400">PER</span><div className="text-slate-200">{player.per}</div></div>
                </div>

                <div className="bg-white/10 rounded p-1 border border-white/5">
                  <div className="text-[8px] italic text-slate-300 leading-tight">"{player.comment.substring(0, 80)}..."</div>
                </div>
              </div>
              
              <div className="flex gap-1 justify-center mt-2 text-[10px]">
                <button onClick={(e) => { e.stopPropagation(); onAddToPortfolio(player.ticker); }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded font-bold transition">Recruter</button>
                <button onClick={(e) => { e.stopPropagation(); onAddToWatchlist(player.ticker); }} className={`flex-1 ${isInWatchlist ? 'bg-yellow-600' : 'bg-slate-600'} hover:opacity-90 text-white px-2 py-1 rounded font-bold transition`}>
                  {isInWatchlist ? '👁️' : '🔍'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- APP PRINCIPALE ---
export default function ZidalnoManagerApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('market');
  const [playersData, setPlayersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [search, setSearch] = useState('');
  const [mercatoFilter, setMercatoFilter] = useState('all');
  
  const safeJSONParse = (key, fallback) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      return fallback;
    }
  };
  
  const [portfolio, setPortfolio] = useState(() => safeJSONParse('zidalno_portfolio', []));
  const [watchlist, setWatchlist] = useState(() => safeJSONParse('zidalno_watchlist', []));
  const [etfPercentage, setEtfPercentage] = useState(() => {
    const saved = localStorage.getItem('zidalno_target_etf');
    return saved ? parseInt(saved) : 80;
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssetTicker, setNewAssetTicker] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newPru, setNewPru] = useState('');

  useEffect(() => {
    localStorage.setItem('zidalno_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('zidalno_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('zidalno_target_etf', etfPercentage.toString());
  }, [etfPercentage]);

  const handleHardReset = () => {
    if (confirm("🗑️ Effacer tout le portefeuille ?")) {
      setPortfolio([]);
      setWatchlist([]);
      setEtfPercentage(80);
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    console.log("📡 Chargement du Sheet...");
    
    try {
      const sheetResponse = await fetch(GOOGLE_SHEET_URL);
      
      if (!sheetResponse.ok) {
        console.error("❌ Sheet réponse:", sheetResponse.status);
        setPlayersData([]);
        setIsLoading(false);
        return;
      }

      const sheetText = await sheetResponse.text();
      const parsedPlayers = parseCSV(sheetText);
      
      console.log("✅ Actions chargées:", parsedPlayers.length);

      setPlayersData(parsedPlayers);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("❌ Erreur chargement:", error);
      setPlayersData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh 1 min
    return () => clearInterval(interval);
  }, [loadData]);

  const removePosition = (id) => {
    setPortfolio(portfolio.filter(pos => pos.id !== id));
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
    const asset = playersData.find(p => p.ticker === newAssetTicker);
    if (!asset || !newQty || !newPru) return;
    
    setPortfolio([...portfolio, {
      id: Date.now().toString(),
      ticker: asset.ticker,
      name: asset.name,
      qty: Number(newQty),
      avgPrice: Number(newPru),
      currentPrice: asset.price,
      type: asset.type
    }]);
    
    setShowAddModal(false);
    setNewQty('');
    setNewPru('');
    setNewAssetTicker('');
  };

  const stats = useMemo(() => {
    let totalVal = 0, totalCost = 0, etfVal = 0;
    
    portfolio.forEach(pos => {
      const live = playersData.find(p => p.ticker === pos.ticker);
      const price = live?.price || pos.currentPrice || 0;
      const val = (pos.qty || 0) * price;
      totalVal += val;
      totalCost += (pos.qty || 0) * (pos.avgPrice || 0);
      
      if (pos.ticker.includes("ETF") || pos.ticker.includes("CW8") || pos.ticker.includes("WPEA")) {
        etfVal += val;
      }
    });
    
    return {
      totalVal,
      gain: totalVal - totalCost,
      gainPct: totalCost ? ((totalVal - totalCost) / totalCost) * 100 : 0,
      etfRatio: totalVal ? (etfVal / totalVal) * 100 : 0
    };
  }, [portfolio, playersData]);

  const filteredPlayers = useMemo(() => {
    let res = playersData.filter(p =>
      (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.ticker || "").toLowerCase().includes(search.toLowerCase())
    );

    if (mercatoFilter === 'buy') res = res.filter(p => p.signal === "ACHAT");
    if (mercatoFilter === 'goat') res = res.filter(p => p.profil?.includes("GOAT") || p.profil?.includes("TITULAIRE"));
    if (mercatoFilter === 'div') res = res.filter(p => p.stats.pas > 15);

    return res.sort((a, b) => b.ovr - a.ovr);
  }, [playersData, search, mercatoFilter]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
        <Trophy className="w-12 h-12 text-yellow-500 mb-4 animate-bounce" />
        <h1 className="text-3xl font-black italic text-white tracking-tighter mb-8">ZIDALNO MANAGER</h1>
        <form onSubmit={(e) => {
          e.preventDefault();
          if(passwordInput.toLowerCase() === 'zidalno') setIsAuthenticated(true);
        }} className="w-full max-w-xs space-y-4">
          <input
            type="password"
            placeholder="PASSWORD"
            className="w-full bg-white/10 border border-white/20 rounded-xl py-3 text-center text-white font-bold tracking-widest outline-none focus:border-yellow-500"
            value={passwordInput}
            onChange={(e)=>setPasswordInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-xl transition">
            START SEASON
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-white/10 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-black border border-white/20">Z</div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Club Value</div>
            <div className="font-black text-sm">{stats.totalVal.toLocaleString(undefined, {maximumFractionDigits:0})} €</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2 py-1 rounded ${stats.gain >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {stats.gain >= 0 ? '+' : ''}{stats.gainPct.toFixed(1)}%
          </span>
          <button onClick={handleHardReset} className="p-1">
            <Trash2 size={14} className="text-red-500/50 hover:text-red-500"/>
          </button>
        </div>
      </div>

      {/* Live indicator */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-1 text-[10px] text-yellow-500 font-bold text-center flex justify-center items-center gap-2">
        <Clock size={10} /> 
        {lastUpdate ? `LIVE: ${lastUpdate.toLocaleTimeString()}` : "Chargement..."}
        <button onClick={loadData} disabled={isLoading} className="ml-2 hover:text-white">
          <RefreshCw size={10} className={isLoading?'animate-spin':''}/>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-slate-800 mx-4 mt-4 rounded-xl border border-white/5 gap-1">
        {['market', 'watchlist', 'club'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1 transition ${
              activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            {tab === 'market' && <Flame size={12}/>}
            {tab === 'watchlist' && <Eye size={12}/>}
            {tab === 'club' && <Briefcase size={12}/>}
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {activeTab === 'market' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            {/* Search + Filters */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2 text-slate-500 w-3 h-3" />
                <input
                  type="text"
                  placeholder="Scouter..."
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                  className="w-full bg-slate-800 rounded-lg py-1.5 pl-8 text-xs text-white border border-slate-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setMercatoFilter('all')}
                className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap transition ${
                  mercatoFilter==='all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Tout
              </button>
              <button
                onClick={() => setMercatoFilter('goat')}
                className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap transition ${
                  mercatoFilter==='goat' ? 'bg-yellow-600 text-black' : 'bg-slate-800 text-slate-400'
                }`}
              >
                🐐 GOATs
              </button>
              <button
                onClick={() => setMercatoFilter('buy')}
                className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap transition ${
                  mercatoFilter==='buy' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                🎯 Zone Achat
              </button>
            </div>

            {/* Cards grid */}
            {isLoading && playersData.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs animate-pulse">
                ⏳ Recherche de talents...
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                ❌ Aucune action trouvée
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredPlayers.map(player => (
                  <FutCard
                    key={player.id}
                    player={player}
                    onAddToPortfolio={()=>{
                      setNewAssetTicker(player.ticker);
                      setShowAddModal(true);
                    }}
                    onAddToWatchlist={toggleWatchlist}
                    isInWatchlist={watchlist.includes(player.ticker)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="animate-in fade-in">
            {watchlist.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">📭 Vestiaire vide</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {playersData.filter(p => watchlist.includes(p.ticker)).map(player => (
                  <FutCard
                    key={player.id}
                    player={player}
                    onAddToPortfolio={()=>{
                      setNewAssetTicker(player.ticker);
                      setShowAddModal(true);
                    }}
                    onAddToWatchlist={toggleWatchlist}
                    isInWatchlist={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'club' && (
          <div className="space-y-4 animate-in fade-in">
            {/* ETF Target */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-xl border border-white/10">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Tactique ETF</h3>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-2xl font-black text-white">{stats.etfRatio.toFixed(0)}%</span>
                  <span className="text-xs text-slate-500 ml-1">Actuel</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">Objectif: {etfPercentage}%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={etfPercentage}
                onChange={(e)=>setEtfPercentage(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Positions */}
            <div className="space-y-2">
              {portfolio.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">🎯 Portefeuille vide</div>
              ) : (
                portfolio.map(pos => {
                  const live = playersData.find(p => p.ticker === pos.ticker);
                  const price = live?.price || pos.currentPrice;
                  const val = pos.qty * price;

                  return (
                    <div key={pos.id} className="bg-slate-800/50 border border-white/5 rounded-xl p-3 flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {pos.ticker.substring(0,3)}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{pos.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {pos.qty} × {pos.avgPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{val.toFixed(0)} €</div>
                        <button
                          onClick={() => removePosition(pos.id)}
                          className="text-red-500 opacity-0 group-hover:opacity-100 transition text-xs"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Position Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-2xl p-5 animate-in zoom-in-95">
            <div className="flex justify-between mb-4">
              <h3 className="font-black text-lg">RECRUTEMENT</h3>
              <button onClick={()=>setShowAddModal(false)}>
                <X/>
              </button>
            </div>
            <form onSubmit={handleAddPosition} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400">JOUEUR</label>
                <div className="font-black text-xl text-white">{newAssetTicker}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400">QTÉ</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full bg-slate-800 rounded p-2 text-white font-bold"
                    value={newQty}
                    onChange={e=>setNewQty(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">PRU €</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="w-full bg-slate-800 rounded p-2 text-white font-bold"
                    value={newPru}
                    onChange={e=>setNewPru(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl mt-2 hover:bg-emerald-500">
                ✅ VALIDER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
