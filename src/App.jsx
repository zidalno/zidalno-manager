import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Trophy, Flame, Wallet, ArrowRight, Users, Briefcase, ArrowUpRight, ArrowDownRight, AlertCircle, PlusCircle, X, BookOpen, ShieldCheck, TrendingUp, Banknote, RefreshCw, Trash2, Clock, Eye, EyeOff, Filter, TrendingDown, Target, Zap, CheckCircle, Info } from 'lucide-react';

// ⚠️ REMPLACE PAR TON URL EXACTE
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRudxcCXc1m-e0rKNVApV0KgoOlu3kvXQ_UN8wU5faNnHaJbP17-uOA8wr1RiE2anVkr3qgAv1JSo4/pub?gid=1557889646&single=true&output=csv";

// --- PARSEUR CSV RAPIDE ---
const parseCSV = (text) => {
  if (!text || text.length === 0) return [];
  
  const lines = text.trim().split('\n').slice(1);
  return lines
    .map((line, idx) => {
      try {
        const cols = line.split(',').map(c => c.trim());
        if (cols.length < 6) return null;
        
        return {
          id: `s_${idx}`,
          ticker: cols[0] || "N/A",
          name: cols[1] || "?",
          country: cols[2] || "FR",
          sector: cols[3] || "?",
          ovr: Math.min(100, Math.max(0, parseInt(cols[4]) || 50)),
          stats: {
            pac: parseInt(cols[5]) || 0,
            sho: parseInt(cols[6]) || 0,
            pas: parseInt(cols[7]) || 0,
            phy: parseInt(cols[8]) || 0
          },
          price: parseFloat(cols[9]) || 0,
          changePercent: parseFloat(cols[10]) || 0,
          signal: cols[25]?.includes("ACHAT") ? "ACHAT" : "SURVEILLER",
          profil: cols[29] || "TITULAIRE",
          alert: cols[30] === "OK" ? "OK" : "⚠️",
          comment: cols[32]?.substring(0, 100) || "Pas de données",
          moat: cols[26] === "Oui",
          qualityNote: cols[27] || "",
          roe: cols[11] || "-",
          margin: cols[12] || "-",
          per: cols[20] || "-",
          div_yield: cols[17] || "-",
          currency: cols[0]?.includes('.PA') ? '€' : '$'
        };
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);
};

// --- CARD COMPONENT ---
const FutCard = ({ player, onAddToPortfolio, onAddToWatchlist, isInWatchlist }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const getCardStyle = (profil) => {
    if (profil?.includes("GOAT")) return "bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 text-slate-900 border-yellow-400";
    if (profil?.includes("TITULAIRE")) return "bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 text-slate-900 border-slate-300";
    if (profil?.includes("DANGER")) return "bg-gradient-to-b from-red-900 via-red-950 to-black text-red-100 border-red-700";
    return "bg-gradient-to-b from-blue-600 via-blue-800 to-blue-950 text-white border-blue-500";
  };
  
  const style = getCardStyle(player.profil);
  const textColor = style.includes("text-slate-900") ? "text-slate-900" : "text-white";
  const labelColor = style.includes("text-slate-900") ? "text-slate-700" : "text-slate-400";

  return (
    <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full aspect-[2/3] rounded-xl p-1 shadow-lg cursor-pointer ${style} border`}>
      <div className="h-full flex flex-col p-2 relative">
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-black ${player.signal === "ACHAT" ? 'bg-emerald-500' : 'bg-slate-600'} text-white z-10`}>
          {player.signal}
        </div>

        {!isFlipped ? (
          <>
            <div className="flex justify-between items-start">
              <span className={`text-3xl font-black ${textColor}`}>{player.ovr}</span>
              <span className={`text-[9px] font-bold ${textColor}`}>{player.country}</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h2 className={`text-lg font-black text-center ${textColor} drop-shadow`}>{player.name}</h2>
            </div>
            <div className="space-y-1 border-t border-white/20 pt-2">
              <div className="flex justify-between text-xs"><span className={`font-bold ${textColor}`}>{player.stats.pac}</span><span className={labelColor}>Q</span></div>
              <div className="flex justify-between text-xs"><span className={`font-bold ${textColor}`}>{player.stats.sho}</span><span className={labelColor}>C</span></div>
              <div className="flex justify-between text-xs"><span className={`font-bold ${textColor}`}>{player.stats.pas}</span><span className={labelColor}>D</span></div>
            </div>
            <div className="mt-2 text-center text-sm font-black">{player.price.toFixed(2)} {player.currency}</div>
          </>
        ) : (
          <div className="flex flex-col h-full text-white text-xs">
            <div className="font-bold mb-2">RAPPORT</div>
            <div className="space-y-1 flex-1 overflow-y-auto text-[9px]">
              <div>ROE: {player.roe}%</div>
              <div>Marge: {player.margin}%</div>
              <div>PER: {player.per}</div>
              <div>Div: {player.div_yield}%</div>
              <div className="italic mt-2">"{player.comment.substring(0, 60)}..."</div>
            </div>
            <div className="flex gap-1 mt-2">
              <button onClick={(e) => { e.stopPropagation(); onAddToPortfolio(player.ticker); }} className="flex-1 bg-emerald-600 text-white text-[9px] font-bold py-1 rounded">Recruter</button>
              <button onClick={(e) => { e.stopPropagation(); onAddToWatchlist(player.ticker); }} className={`flex-1 ${isInWatchlist ? 'bg-yellow-600' : 'bg-slate-600'} text-white text-[9px] font-bold py-1 rounded`}>👁️</button>
            </div>
          </div>
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
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [search, setSearch] = useState('');
  const [mercatoFilter, setMercatoFilter] = useState('all');
  const [portfolio, setPortfolio] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssetTicker, setNewAssetTicker] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newPru, setNewPru] = useState('');

  // LOAD DATA - NO BLOCKING
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(GOOGLE_SHEET_URL, { mode: 'no-cors' })
        .then(r => r.text())
        .then(text => {
          const data = parseCSV(text);
          setPlayersData(data);
          setLastUpdate(new Date());
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setIsLoading(false);
          // Fallback: demo data
          setPlayersData([
            { id: 'demo1', ticker: 'EPA:AC', name: 'Accor', country: 'FR', sector: 'Hôtels', ovr: 72, stats: { pac: 14, sho: 16, pas: 13, phy: 12 }, price: 42.5, changePercent: 2.1, signal: 'SURVEILLER', profil: 'TITULAIRE', alert: 'OK', comment: 'Secteur touristique avec potentiel', moat: false, qualityNote: 'Bon', roe: '12%', margin: '8%', per: '22', div_yield: '2.4%', currency: '€' },
            { id: 'demo2', ticker: 'EPA:AI', name: 'Air Liquide', country: 'FR', sector: 'Chimie', ovr: 94, stats: { pac: 19, sho: 16, pas: 18, phy: 15 }, price: 165.8, changePercent: 0.0, signal: 'ACHAT', profil: 'GOAT', alert: 'OK', comment: 'Leader mondial de la chimie', moat: true, qualityNote: 'Excellent', roe: '14%', margin: '11%', per: '28', div_yield: '1.8%', currency: '€' },
            { id: 'demo3', ticker: 'EPA:AIR', name: 'Airbus', country: 'FR', sector: 'Aéronautique', ovr: 88, stats: { pac: 18, sho: 17, pas: 12, phy: 16 }, price: 124.3, changePercent: 1.5, signal: 'SURVEILLER', profil: 'TITULAIRE', alert: 'OK', comment: 'Géant aérospatial', moat: false, qualityNote: 'Fort', roe: '18%', margin: '6%', per: '32', div_yield: '1.9%', currency: '€' }
          ]);
        });
    }, 500); // Délai min pour ne pas bloquer UI
    return () => clearTimeout(timer);
  }, []);

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
      price: asset.price
    }]);
    
    setShowAddModal(false);
    setNewQty('');
    setNewPru('');
    setNewAssetTicker('');
  };

  const stats = useMemo(() => {
    let totalVal = 0, totalCost = 0;
    portfolio.forEach(pos => {
      const val = pos.qty * (pos.price || pos.avgPrice);
      totalVal += val;
      totalCost += pos.qty * pos.avgPrice;
    });
    return { totalVal, gain: totalVal - totalCost, gainPct: totalCost ? ((totalVal - totalCost) / totalCost) * 100 : 0 };
  }, [portfolio]);

  const filteredPlayers = useMemo(() => {
    let res = playersData.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.ticker?.toLowerCase().includes(search.toLowerCase()));
    if (mercatoFilter === 'buy') res = res.filter(p => p.signal === "ACHAT");
    if (mercatoFilter === 'goat') res = res.filter(p => p.profil?.includes("GOAT"));
    return res.sort((a, b) => b.ovr - a.ovr);
  }, [playersData, search, mercatoFilter]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <Trophy className="w-12 h-12 text-yellow-500 mb-4 animate-bounce" />
        <h1 className="text-3xl font-black text-white mb-8">ZIDALNO MANAGER</h1>
        <form onSubmit={(e) => { e.preventDefault(); if(passwordInput.toLowerCase() === 'zidalno') setIsAuthenticated(true); }} className="w-full max-w-xs space-y-4">
          <input type="password" placeholder="PASSWORD" className="w-full bg-white/10 border border-white/20 rounded-xl py-3 text-center text-white font-bold outline-none focus:border-yellow-500" value={passwordInput} onChange={(e)=>setPasswordInput(e.target.value)} autoFocus />
          <button type="submit" className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl">START</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header rapide */}
      <div className="sticky top-0 z-40 bg-slate-950/95 border-b border-white/10 px-4 py-2 flex justify-between">
        <div className="text-sm font-black">{stats.totalVal.toLocaleString(undefined, {maximumFractionDigits:0})} €</div>
        <div className={`text-xs font-bold ${stats.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.gainPct.toFixed(1)}%</div>
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-slate-800 mx-4 mt-2 rounded-lg gap-1">
        {['market', 'club'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-1 text-xs font-bold rounded ${activeTab === tab ? 'bg-blue-600' : 'bg-slate-700'}`}>
            {tab === 'market' ? '🔥' : '👜'} {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        {activeTab === 'market' && (
          <>
            {/* Search + Filters */}
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Scouter..." value={search} onChange={(e)=>setSearch(e.target.value)} className="flex-1 bg-slate-800 rounded px-3 py-2 text-xs text-white outline-none border border-slate-700 focus:border-blue-500" />
              <button onClick={() => setMercatoFilter(mercatoFilter === 'all' ? 'buy' : 'all')} className="bg-slate-700 text-white px-2 py-2 rounded text-xs font-bold">🎯</button>
            </div>

            {/* Cards */}
            {isLoading ? (
              <div className="text-center py-12 text-slate-400">⏳ Chargement...</div>
            ) : filteredPlayers.length === 0 ? (
              <div className="text-center py-12 text-slate-400">❌ Aucune action</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredPlayers.map(player => (
                  <FutCard key={player.id} player={player} onAddToPortfolio={()=>{ setNewAssetTicker(player.ticker); setShowAddModal(true); }} onAddToWatchlist={(t) => setWatchlist(watchlist.includes(t) ? watchlist.filter(x => x !== t) : [...watchlist, t])} isInWatchlist={watchlist.includes(player.ticker)} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'club' && (
          <div className="space-y-2">
            {portfolio.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Portefeuille vide</div>
            ) : (
              portfolio.map(pos => (
                <div key={pos.id} className="bg-slate-800 p-3 rounded flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm">{pos.name}</div>
                    <div className="text-[10px] text-slate-400">{pos.qty} × {pos.avgPrice.toFixed(2)}</div>
                  </div>
                  <button onClick={() => setPortfolio(portfolio.filter(p => p.id !== pos.id))} className="text-red-500 text-xs font-bold">✕</button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-lg p-4">
            <h3 className="font-black mb-4">RECRUTEMENT</h3>
            <form onSubmit={handleAddPosition} className="space-y-3">
              <div><label className="text-[10px] text-slate-400">TICKER</label><div className="font-bold">{newAssetTicker}</div></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px] text-slate-400">QTÉ</label><input type="number" required className="w-full bg-slate-800 rounded px-2 py-1 text-white text-sm" value={newQty} onChange={e=>setNewQty(e.target.value)} autoFocus /></div>
                <div><label className="text-[10px] text-slate-400">PRU</label><input type="number" required step="0.01" className="w-full bg-slate-800 rounded px-2 py-1 text-white text-sm" value={newPru} onChange={e=>setNewPru(e.target.value)} /></div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded">✅ VALIDER</button>
            </form>
            <button onClick={() => setShowAddModal(false)} className="w-full mt-2 bg-slate-700 text-white py-1 rounded text-sm">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
