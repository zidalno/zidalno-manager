import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Trophy, Flame, Wallet, ArrowRight, Users, Briefcase, ArrowUpRight, ArrowDownRight, AlertCircle, PlusCircle, X, BookOpen, ShieldCheck, TrendingUp, Banknote, RefreshCw, Trash2, Clock, Eye, EyeOff, Filter, Zap, Target, Layers, Activity } from 'lucide-react';

// --- CONFIGURATION ---
// 🔴 COLLEZ VOTRE URL APPS SCRIPT ICI (Celle qui finit par /exec)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzrgvjtdo6nYqYd0yiYqO5TeRW27e4hxedmn1zYLhUtJnqFL4claDEYB22vawOWDRgA/exec";

const APP_CONFIG = {
  title: "ZIDALNO MANAGER",
  version: "V26 • Google API",
  lastUpdate: "Live Sheets"
};

// --- COMPOSANT CARTE JOUEUR ---
const FutCard = ({ player, onAddToPortfolio, onAddToWatchlist, isInWatchlist }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Style dynamique selon le score (OVR)
  const getCardStyle = (ovr) => {
    if (ovr >= 90) return "bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 text-slate-900 border-yellow-400 shadow-yellow-500/50";
    if (ovr >= 80) return "bg-gradient-to-b from-emerald-600 via-emerald-800 to-emerald-950 text-white border-emerald-500";
    if (ovr <= 70) return "bg-gradient-to-b from-red-900 via-red-950 to-black text-red-100 border-red-700";
    return "bg-gradient-to-b from-blue-600 via-blue-800 to-blue-950 text-white border-blue-500";
  };
  
  const style = getCardStyle(player.ovr);
  const textColor = style.includes("text-slate-900") ? "text-slate-900" : "text-white";
  const labelColor = style.includes("text-slate-900") ? "text-slate-700" : "text-slate-300";
  const buySignal = player.signal === "ACHAT";

  // Détection devise (Si le ticker contient .PA ou .AS c'est souvent €)
  const currency = (player.ticker && (player.ticker.includes('.PA') || player.ticker.includes('EPA:'))) ? '€' : '$';

  return (
    <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full aspect-[2/3] rounded-[1.5rem] p-1 shadow-xl cursor-pointer transform transition hover:scale-[1.02] duration-300 ${style} border group perspective`}>
      <div className="h-full w-full border border-white/20 rounded-[1.3rem] p-2 flex flex-col relative overflow-hidden backdrop-blur-sm">
        
        {/* Badges Signal / Moat */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-sm z-20 ${buySignal ? 'bg-white text-black animate-pulse' : 'bg-black/30 text-white'}`}>
          {buySignal ? <Target size={10}/> : <Activity size={10}/>} {player.signal || "NEUTRE"}
        </div>
        {player.moat && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black px-1.5 py-0.5 rounded text-[8px] font-black flex items-center gap-1 z-20 shadow-sm">
            <ShieldCheck size={10}/> MOAT
          </div>
        )}

        {!isFlipped ? (
          /* --- FACE AVANT --- */
          <>
            <div className="mt-6 flex justify-between items-start relative z-10 px-1">
              <div className="flex flex-col items-center">
                <span className={`text-4xl font-black leading-none ${textColor}`}>{player.ovr}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${textColor}`}>{player.type}</span>
              </div>
              <div className="flex flex-col items-end mt-1">
                 <span className={`font-bold text-[10px] opacity-80 ${textColor}`}>{player.broker || "ND"}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-0 my-2">
               <h2 className={`text-xl sm:text-2xl font-black tracking-tighter text-center leading-none ${textColor} drop-shadow-md break-words w-full px-1`}>
                 {player.name}
               </h2>
               <div className={`text-[9px] font-bold mt-1 px-2 py-0.5 rounded bg-black/20 ${textColor}`}>
                 {player.ticker}
               </div>
            </div>

            <div className="relative z-10 border-t border-black/10 pt-2 mt-auto">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs px-1">
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats?.pac || 0}</span><span className={`font-medium ${labelColor} text-[9px]`}>QUALITÉ</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats?.sho || 0}</span><span className={`font-medium ${labelColor} text-[9px]`}>CROISS.</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats?.pas || 0}</span><span className={`font-medium ${labelColor} text-[9px]`}>DIVID.</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats?.phy || 0}</span><span className={`font-medium ${labelColor} text-[9px]`}>VALO.</span></div>
              </div>
            </div>

            <div className="mt-3 text-center bg-black/20 rounded py-1 flex justify-center items-center gap-2 mx-1">
              <span className={`font-bold text-sm ${textColor}`}>
                {player.price ? player.price.toFixed(2) : "---"} {currency}
              </span>
              <span className={`text-[10px] font-bold ${player.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {player.change > 0 ? '+' : ''}{player.change ? (player.change * 100).toFixed(2) : '0.00'}%
              </span>
            </div>
          </>
        ) : (
          /* --- FACE ARRIERE (Détails) --- */
          <div className="flex flex-col h-full relative z-10 p-2 animate-in fade-in duration-200 text-white">
            <div className="text-center text-[10px] font-black uppercase mb-2 opacity-70 tracking-widest">RAPPORT SCOUT</div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
               <div className="bg-black/20 rounded p-2 mb-2 border border-white/10">
                 <div className="flex justify-between text-[10px] mb-1"><span>Juste Valeur</span><span className="font-bold text-emerald-400">{player.fairValue || "?"} {currency}</span></div>
               </div>
               <p className="text-[10px] italic leading-snug text-slate-200 bg-white/5 p-2 rounded border border-white/5">
                  "{player.comment || "Pas de données."}"
               </p>
            </div>
            <div className="mt-auto pt-2 border-t border-white/10 w-full flex gap-2 justify-center">
              <button onClick={(e) => { e.stopPropagation(); onAddToPortfolio(player); }} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition shadow-lg hover:scale-105">
                <PlusCircle size={10}/> Recruter
              </button>
              <button onClick={(e) => { e.stopPropagation(); onAddToWatchlist(player.ticker); }} className={`${isInWatchlist ? 'bg-yellow-600' : 'bg-slate-600'} hover:opacity-90 text-white px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition shadow-lg`}>
                {isInWatchlist ? <EyeOff size={10}/> : <Eye size={10}/>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- APPLICATION PRINCIPALE ---
export default function ZidalnoManagerApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('market'); 
  const [playersData, setPlayersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  const [search, setSearch] = useState('');
  const [mercatoFilter, setMercatoFilter] = useState('all');
  
  // Persistance
  const safeJSONParse = (key, fallback) => { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : fallback; } catch (e) { return fallback; } };
  const [portfolio, setPortfolio] = useState(() => safeJSONParse('zidalno_portfolio', []));
  const [watchlist, setWatchlist] = useState(() => safeJSONParse('zidalno_watchlist', []));
  const [etfPercentage, setEtfPercentage] = useState(() => { const saved = localStorage.getItem('zidalno_target_etf'); return saved ? parseInt(saved) : 80; });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [newQty, setNewQty] = useState('');
  const [newPru, setNewPru] = useState('');

  useEffect(() => { localStorage.setItem('zidalno_portfolio', JSON.stringify(portfolio)); }, [portfolio]);
  useEffect(() => { localStorage.setItem('zidalno_watchlist', JSON.stringify(watchlist)); }, [watchlist]);
  
  const handleHardReset = () => { if (confirm("Effacer tout ?")) { localStorage.clear(); window.location.reload(); } };

  // --- CHARGEMENT DES DONNEES VIA APPS SCRIPT ---
  const loadData = useCallback(async () => {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("VOTRE_URL")) {
      console.warn("URL API manquante");
      return;
    }
    setIsLoading(true);
    try {
      // Appel direct à votre API Google
      const response = await fetch(APPS_SCRIPT_URL);
      const data = await response.json();
      
      // Les données arrivent déjà formatées par le script doGet() !
      // On ajoute juste des ID uniques si besoin
      const formattedData = data.map((p, idx) => ({
        ...p,
        id: p.ticker || `item_${idx}`,
        // Sécurité pour les valeurs numériques
        price: Number(p.price) || 0,
        change: Number(p.change) || 0,
        ovr: Number(p.ovr) || 75
      }));

      setPlayersData(formattedData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erreur Chargement:", error);
      alert("Impossible de charger les données. Vérifiez l'URL de déploiement Google.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Gestion Portefeuille
  const removePosition = (id) => setPortfolio(portfolio.filter(pos => pos.id !== id));
  const toggleWatchlist = (ticker) => { if (watchlist.includes(ticker)) setWatchlist(watchlist.filter(t => t !== ticker)); else setWatchlist([...watchlist, ticker]); };
  
  const handlePortfolioAdd = (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setPortfolio([...portfolio, {
      id: Date.now().toString(),
      ticker: selectedAsset.ticker,
      name: selectedAsset.name,
      qty: Number(newQty),
      avgPrice: Number(newPru),
      currentPrice: selectedAsset.price,
      type: selectedAsset.type
    }]);
    setShowAddModal(false); setNewQty(''); setNewPru('');
  };

  // Calculs Stats
  const stats = useMemo(() => {
    let totalVal = 0, totalCost = 0, etfVal = 0;
    portfolio.forEach(pos => {
      const live = playersData.find(p => p.ticker === pos.ticker);
      const price = live?.price || pos.currentPrice || 0;
      const val = (pos.qty || 0) * price; 
      totalVal += val;
      totalCost += (pos.qty || 0) * (pos.avgPrice || 0);
      if (pos.type === 'ETF' || (pos.ticker && pos.ticker.includes('ETF'))) etfVal += val;
    });
    return { totalVal, gain: totalVal - totalCost, gainPct: totalCost ? ((totalVal - totalCost)/totalCost)*100 : 0, etfRatio: totalVal ? (etfVal/totalVal)*100 : 0 };
  }, [portfolio, playersData]);

  const filteredPlayers = useMemo(() => {
    let res = playersData.filter(p => 
      (p.name && p.name.toLowerCase().includes(search.toLowerCase())) || 
      (p.ticker && p.ticker.toLowerCase().includes(search.toLowerCase()))
    );
    if (mercatoFilter === 'buy') res = res.filter(p => p.signal === "ACHAT");
    if (mercatoFilter === 'goat') res = res.filter(p => p.ovr >= 90);
    return res.sort((a, b) => b.ovr - a.ovr);
  }, [playersData, search, mercatoFilter]);

  if (!isAuthenticated) return ( <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans text-white"> <Trophy className="w-16 h-16 text-yellow-500 mb-6 animate-bounce" /> <h1 className="text-4xl font-black italic tracking-tighter mb-8 text-center">ZIDALNO<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">MANAGER</span></h1> <form onSubmit={(e) => { e.preventDefault(); if(passwordInput.toLowerCase() === 'zidalno') setIsAuthenticated(true); }} className="w-full max-w-xs space-y-4"> <input type="password" placeholder="PASSWORD" className="w-full bg-white/10 border border-white/20 rounded-xl py-4 text-center text-xl font-bold tracking-[0.5em] outline-none focus:border-yellow-500 transition" value={passwordInput} onChange={(e)=>setPasswordInput(e.target.value)}/> <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl transition transform hover:scale-105 shadow-lg shadow-yellow-500/20">START SEASON</button> </form> </div> );

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-24">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex justify-between items-center shadow-lg">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-black text-lg border border-white/20 shadow-lg">Z</div>
            <div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CLUB VALUE</div><div className="font-black text-lg leading-none">{stats.totalVal.toLocaleString()} €</div></div>
         </div>
         <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-lg text-xs font-bold ${stats.gain >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{stats.gain >= 0 ? '+' : ''}{stats.gainPct.toFixed(1)}%</div>
            <button onClick={handleHardReset} className="p-2 hover:bg-white/10 rounded-full transition"><Trash2 size={16} className="text-slate-500"/></button>
         </div>
      </div>

      {/* REFRESH BAR */}
      <div className="bg-black/40 border-b border-white/5 px-4 py-1.5 flex justify-center items-center gap-3">
          <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-ping' : 'bg-green-500'}`}></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{isLoading ? `CONNEXION API GOOGLE...` : "MARCHÉ LIVE"}</span>
          </div>
          <button onClick={loadData} className="text-slate-400 hover:text-white transition"><RefreshCw size={12} className={isLoading ? 'animate-spin' : ''}/></button>
      </div>

      {/* TABS */}
      <div className="p-4 pb-0">
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
            {['market', 'club', 'watchlist'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-2 transition ${activeTab === tab ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
                    {tab === 'market' && <Flame size={14} className={activeTab === tab ? 'text-orange-500' : ''}/>}
                    {tab === 'club' && <Briefcase size={14} className={activeTab === tab ? 'text-purple-500' : ''}/>}
                    {tab === 'watchlist' && <Eye size={14} className={activeTab === tab ? 'text-blue-500' : ''}/>}
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="p-4 space-y-6">
          
          {/* MARKET */}
          {activeTab === 'market' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4"/>
                        <input type="text" placeholder="Rechercher..." className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 outline-none transition" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button onClick={() => setMercatoFilter('buy')} className={`px-3 rounded-xl border border-white/10 flex items-center justify-center transition ${mercatoFilter === 'buy' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-400'}`}><Target size={18}/></button>
                </div>

                {isLoading && playersData.length === 0 ? (
                   <div className="text-center py-20 text-slate-500 animate-pulse">Chargement des données Google...</div>
                ) : (
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredPlayers.map((player, i) => (
                          <FutCard 
                              key={player.id || i} 
                              player={player}
                              onAddToPortfolio={(p) => { setSelectedAsset(p); setShowAddModal(true); }}
                              onAddToWatchlist={toggleWatchlist}
                              isInWatchlist={watchlist.includes(player.ticker)}
                          />
                      ))}
                   </div>
                )}
             </div>
          )}

          {/* CLUB */}
          {activeTab === 'club' && (
             <div className="animate-in fade-in space-y-3">
                 {portfolio.length === 0 ? (
                     <div className="text-center py-20 text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                         <Users className="w-10 h-10 mx-auto mb-2 opacity-50"/>
                         <p className="text-xs font-bold">EFFECTIF VIDE</p>
                     </div>
                 ) : (
                     portfolio.map(pos => {
                         const live = playersData.find(d => d.ticker === pos.ticker);
                         const price = live?.price || pos.currentPrice;
                         const val = pos.qty * price;
                         return (
                             <div key={pos.id} className="bg-slate-800 border border-white/5 p-3 rounded-xl flex justify-between items-center shadow-sm">
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center font-black text-xs">{pos.ticker.substring(0,3)}</div>
                                     <div><div className="font-bold text-sm leading-none mb-1">{pos.name}</div><div className="text-[10px] text-slate-400 font-mono">{pos.qty} x {price.toFixed(2)}</div></div>
                                 </div>
                                 <div className="text-right"><div className="font-black text-sm">{val.toFixed(0)} €</div><button onClick={() => removePosition(pos.id)} className="text-[10px] text-red-500 opacity-50 hover:opacity-100 mt-1"><Trash2 size={10}/></button></div>
                             </div>
                         )
                     })
                 )}
             </div>
          )}
          
          {/* WATCHLIST */}
          {activeTab === 'watchlist' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in">
                  {playersData.filter(p => watchlist.includes(p.ticker)).map((player, i) => (
                      <FutCard 
                          key={i} 
                          player={player}
                          onAddToPortfolio={(p) => { setSelectedAsset(p); setShowAddModal(true); }}
                          onAddToWatchlist={toggleWatchlist}
                          isInWatchlist={true}
                      />
                  ))}
              </div>
          )}

      </div>

      {/* MODAL */}
      {showAddModal && selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
              <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                  <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X/></button>
                  <div className="text-center mb-6"><h2 className="text-2xl font-black italic">{selectedAsset.name}</h2></div>
                  <form onSubmit={handlePortfolioAdd} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Quantité</label><input type="number" className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-center font-bold outline-none focus:border-blue-500 transition" value={newQty} onChange={e => setNewQty(e.target.value)} required /></div>
                          <div><label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Prix Achat</label><input type="number" className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-center font-bold outline-none focus:border-blue-500 transition" value={newPru} onChange={e => setNewPru(e.target.value)} required /></div>
                      </div>
                      <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg">CONFIRMER</button>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
}