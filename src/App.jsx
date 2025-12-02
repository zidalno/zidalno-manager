import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Trophy, Flame, Wallet, ArrowRight, Users, Briefcase, ArrowUpRight, ArrowDownRight, AlertCircle, PlusCircle, X, BookOpen, ShieldCheck, TrendingUp, Banknote, RefreshCw, Trash2, Clock, Eye, EyeOff, Filter, TrendingDown, Target, Zap, CheckCircle, Info } from 'lucide-react';

// ⚠️ VOTRE URL GOOGLE SHEET (CSV)
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRudxcCXc1m-e0rKNVApV0KgoOlu3kvXQ_UN8wU5faNnHaJbP17-uOA8wr1RiE2anVkr3qgAv1JSo4/pub?gid=1557889646&single=true&output=csv";

const APP_CONFIG = {
  title: "ZIDALNO MANAGER",
  version: "V28 • Auto-Pilot",
  lastUpdate: "Auto"
};

// --- PARSEUR CSV INTELLIGENT ---
const parseCSV = (text) => {
  if (!text || text.length === 0) return [];
  
  const rows = text.trim().split('\n').slice(1); // Ignore la ligne de titre
  
  return rows.map((line, idx) => {
    // Gestion robuste des virgules dans les cellules (ex: "LVMH, Inc.")
    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
    
    if (cols.length < 5) return null; // Ignore les lignes vides/cassées

    // Lecture sécurisée des colonnes (A=0, B=1...)
    const ticker = cols[0];
    const price = parseFloat(cols[9]) || 0; // Col J (Price)
    
    // Nettoyage du pourcentage (Google envoie parfois "1.5%" ou "0.015")
    let changeRaw = cols[10] ? cols[10].replace('%', '').replace(',', '.') : "0";
    let change = parseFloat(changeRaw);

    // Calcul automatique du score OVR si vide (basé sur le Moat et la marge)
    let score = parseInt(cols[4]);
    if (isNaN(score)) score = 75; 

    // Génération des stats FIFA si vides (basées sur les fondamentaux réels si dispos)
    const roe = parseFloat(cols[11]) || 0;
    const margin = parseFloat(cols[12]) || 0;
    const growth = parseFloat(cols[15]) || 0; // Revenue Growth 5Y
    const yieldDiv = parseFloat(cols[17]) || 0;
    
    // Conversion auto des fondamentaux en notes FIFA (0-99)
    const stats = {
      pac: Math.min(99, Math.max(40, Math.round(50 + growth * 2))), // Croissance -> Vitesse
      sho: Math.min(99, Math.max(40, Math.round(50 + yieldDiv * 10))), // Dividende -> Tir
      pas: Math.min(99, Math.max(40, Math.round(40 + margin * 2))), // Marge -> Passe/Sûreté
      phy: Math.min(99, Math.max(40, Math.round(40 + roe * 2)))  // ROE -> Physique/Solidité
    };

    return {
      id: `stock_${idx}`,
      ticker: ticker || "N/A",
      name: cols[1] || "Inconnu",
      type: cols[2] || "Action",
      broker: cols[3] || "CTO",
      ovr: score,
      stats: stats,
      
      // Données Financières Live (Google)
      price: price,
      changePercent: change,
      currency: (ticker && ticker.includes('EPA:')) ? '€' : '$',
      
      // Fondamentaux (Finnhub via Script)
      roe: cols[11] || "-",
      margin: cols[12] || "-",
      debt: cols[13] || "-",
      growth5y: cols[15] || "-",
      div_yield: cols[17] || "-",
      per: cols[20] || "-",

      // Analyse
      fairValue: parseFloat(cols[23]) || 0, // Col X
      signal: cols[25] || "NEUTRE",         // Col Z
      moat: (cols[26] && cols[26].toLowerCase().includes("oui")),
      qualityNote: cols[27] || "",
      profil: cols[29] || "STANDARD",
      alert: cols[30] || "OK",
      comment: cols[32] || ""
    };
  }).filter(item => item !== null && item.ticker); // Filtre les erreurs
};

// --- CARTE JOUEUR (Design Amélioré) ---
const FutCard = ({ player, onAddToPortfolio, onAddToWatchlist, isInWatchlist }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const getSignal = () => {
    if (player.signal?.includes("ACHAT")) return { label: "ACHAT", color: "bg-emerald-500", icon: <Target size={10}/> };
    if (player.signal?.includes("VENDRE")) return { label: "VENDRE", color: "bg-red-500", icon: <AlertCircle size={10}/> };
    return { label: "NEUTRE", color: "bg-slate-600", icon: <Zap size={10}/> };
  };
  const signal = getSignal();
  
  const getCardStyle = (ovr) => {
    if (ovr >= 90) return "bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 text-slate-900 border-yellow-400";
    if (ovr >= 80) return "bg-gradient-to-b from-emerald-600 via-emerald-800 to-emerald-950 text-white border-emerald-500";
    if (ovr <= 70) return "bg-gradient-to-b from-red-900 via-red-950 to-black text-red-100 border-red-700";
    return "bg-gradient-to-b from-blue-600 via-blue-800 to-blue-950 text-white border-blue-500";
  };
  
  const style = getCardStyle(player.ovr);
  const textColor = style.includes("text-slate-900") ? "text-slate-900" : "text-white";
  const labelColor = style.includes("text-slate-900") ? "text-slate-700" : "text-slate-400";

  return (
    <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full aspect-[2/3] rounded-xl p-1 shadow-lg cursor-pointer transform transition hover:scale-105 duration-200 ${style} border group`}>
      <div className="h-full w-full border border-white/20 rounded-lg p-2 flex flex-col relative overflow-hidden backdrop-blur-sm">
        
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1 shadow-sm z-20 ${signal.color} text-white`}>
          {signal.icon} {signal.label}
        </div>

        {!isFlipped ? (
          <>
            <div className="mt-4 flex justify-between items-start relative z-10">
              <div className="flex flex-col items-center">
                <span className={`text-3xl font-black leading-none ${textColor}`}>{player.ovr}</span>
                <span className={`text-[9px] font-bold uppercase ${textColor}`}>{player.broker}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-0 my-1">
               <h2 className={`text-lg font-black tracking-tighter text-center leading-none ${textColor} drop-shadow-md px-1 line-clamp-2`}>{player.name}</h2>
               <span className={`text-[9px] font-bold mt-1 opacity-75 ${textColor}`}>{player.ticker}</span>
            </div>

            <div className="relative z-10 border-t border-black/10 pt-2 mt-auto">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.pac}</span><span className={labelColor}>CRO</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.sho}</span><span className={labelColor}>DIV</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.pas}</span><span className={labelColor}>MAR</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.phy}</span><span className={labelColor}>ROE</span></div>
              </div>
            </div>

            <div className="mt-2 text-center bg-black/20 rounded py-1 flex justify-center items-center gap-2">
              <span className={`font-bold text-sm ${textColor}`}>{player.price.toFixed(2)} {player.currency}</span>
              <span className={`text-[9px] font-bold ${player.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {player.changePercent > 0 ? '+' : ''}{player.changePercent.toFixed(2)}%
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full relative z-10 p-1 animate-in fade-in duration-200 text-white">
            <div className="text-center text-[9px] font-black uppercase mb-2 opacity-70">FONDAMENTAUX</div>
            
            <div className="space-y-1.5 overflow-y-auto no-scrollbar flex-1 pr-1 text-[10px]">
              <div className="bg-white/10 rounded p-1.5 flex justify-between"><span>Marge Nette</span><span className="font-mono font-bold">{player.margin}%</span></div>
              <div className="bg-white/10 rounded p-1.5 flex justify-between"><span>ROE</span><span className="font-mono font-bold">{player.roe}%</span></div>
              <div className="bg-white/10 rounded p-1.5 flex justify-between"><span>Div. Yield</span><span className="font-mono font-bold">{player.div_yield}%</span></div>
              <div className="bg-white/10 rounded p-1.5 flex justify-between"><span>PER</span><span className="font-mono font-bold">{player.per}</span></div>
              
              {player.fairValue > 0 && (
                 <div className="bg-emerald-500/20 border border-emerald-500/50 rounded p-1.5 text-center mt-2">
                    <span className="block text-[8px] text-emerald-300 uppercase">Juste Valeur</span>
                    <span className="font-bold text-emerald-400 text-sm">{player.fairValue} {player.currency}</span>
                 </div>
              )}
            </div>

            <div className="mt-auto pt-2 w-full flex gap-1 justify-center">
              <button onClick={(e) => { e.stopPropagation(); onAddToPortfolio(player.ticker); }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded text-[9px] font-bold flex items-center justify-center gap-1 transition">
                <PlusCircle size={10}/> Acheter
              </button>
              <button onClick={(e) => { e.stopPropagation(); onAddToWatchlist(player.ticker); }} className={`px-3 ${isInWatchlist ? 'bg-yellow-600' : 'bg-slate-600'} text-white py-1.5 rounded text-[9px] font-bold flex items-center justify-center transition`}>
                {isInWatchlist ? <EyeOff size={10}/> : <Eye size={10}/>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- APPLICATION ---
export default function ZidalnoManagerApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('market');
  const [playersData, setPlayersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mercatoFilter, setMercatoFilter] = useState('all');
  
  // Persistance
  const safeJSONParse = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
  const [portfolio, setPortfolio] = useState(() => safeJSONParse('zidalno_portfolio', []));
  const [watchlist, setWatchlist] = useState(() => safeJSONParse('zidalno_watchlist', []));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssetTicker, setNewAssetTicker] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newPru, setNewPru] = useState('');

  useEffect(() => { localStorage.setItem('zidalno_portfolio', JSON.stringify(portfolio)); }, [portfolio]);
  useEffect(() => { localStorage.setItem('zidalno_watchlist', JSON.stringify(watchlist)); }, [watchlist]);

  // FETCH CSV DATA
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Ajout d'un timestamp pour éviter le cache du navigateur
        const response = await fetch(`${GOOGLE_SHEET_URL}&t=${Date.now()}`);
        const text = await response.text();
        if (text.startsWith("<!DOCTYPE")) throw new Error("Lien invalide");
        
        const data = parseCSV(text);
        setPlayersData(data);
      } catch (error) {
        console.error("Erreur chargement CSV", error);
        // Pas de fallback, on laisse vide pour forcer la correction du lien
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh 1min
    return () => clearInterval(interval);
  }, []);

  const handleAddPosition = (e) => {
    e.preventDefault();
    const asset = playersData.find(p => p.ticker === newAssetTicker);
    if (!asset) return;
    setPortfolio([...portfolio, {
      id: Date.now().toString(),
      ticker: asset.ticker,
      name: asset.name,
      qty: Number(newQty),
      avgPrice: Number(newPru),
      type: asset.type,
      currency: asset.currency
    }]);
    setShowAddModal(false); setNewQty(''); setNewPru('');
  };

  const removePosition = (id) => setPortfolio(portfolio.filter(p => p.id !== id));

  const stats = useMemo(() => {
    let totalVal = 0, totalCost = 0;
    portfolio.forEach(pos => {
      const live = playersData.find(p => p.ticker === pos.ticker);
      const price = live ? live.price : (pos.currentPrice || 0);
      // Conversion basique si mélange de devises (1$ = 0.95€ approx pour affichage total)
      const rate = pos.currency === '$' ? 0.95 : 1;
      totalVal += pos.qty * price * rate;
      totalCost += pos.qty * pos.avgPrice * rate;
    });
    return { totalVal, gain: totalVal - totalCost, gainPct: totalCost ? ((totalVal - totalCost)/totalCost)*100 : 0 };
  }, [portfolio, playersData]);

  const filteredList = useMemo(() => {
    let list = playersData.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.ticker.toLowerCase().includes(search.toLowerCase()));
    if (mercatoFilter === 'buy') list = list.filter(p => p.signal === "ACHAT");
    if (mercatoFilter === 'top') list = list.filter(p => p.ovr >= 85);
    return list.sort((a, b) => b.ovr - a.ovr);
  }, [playersData, search, mercatoFilter]);

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <Trophy className="w-16 h-16 text-yellow-500 mb-6 animate-bounce" />
      <h1 className="text-3xl font-black italic text-white mb-8 tracking-tighter">ZIDALNO<br/><span className="text-yellow-500">MANAGER</span></h1>
      <form onSubmit={(e)=>{e.preventDefault(); if(passwordInput.toLowerCase()==='zidalno') setIsAuthenticated(true)}} className="w-full max-w-xs space-y-4">
        <input type="password" placeholder="MOT DE PASSE" className="w-full bg-white/10 border border-white/20 rounded-xl py-4 text-center text-white font-bold tracking-widest outline-none focus:border-yellow-500 transition" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} autoFocus/>
        <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl transition shadow-lg">ENTRER</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20 font-sans">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex justify-between items-center shadow-lg">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-black text-lg border border-white/20 shadow-lg">Z</div>
            <div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CLUB VALUE</div><div className="font-black text-lg leading-none">{stats.totalVal.toLocaleString(undefined, {maximumFractionDigits:0})} €</div></div>
         </div>
         <div className={`px-2 py-1 rounded-lg text-xs font-bold ${stats.gain >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{stats.gain >= 0 ? '+' : ''}{stats.gainPct.toFixed(1)}%</div>
      </div>

      {/* NAV */}
      <div className="p-4 pb-0">
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
            {['market', 'club', 'watchlist'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-2 transition ${activeTab === tab ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
                    {tab === 'market' && <Flame size={14} className={activeTab === tab ? 'text-orange-500' : ''}/>}
                    {tab === 'club' && <Briefcase size={14} className={activeTab === tab ? 'text-purple-500' : ''}/>}
                    {tab === 'watchlist' && <Eye size={14} className={activeTab === tab ? 'text-blue-500' : ''}/>}
                    {tab.toUpperCase()}
                </button>
            ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        {activeTab === 'market' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
             <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4"/>
                    <input type="text" placeholder="Scouter un joueur..." className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none transition" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => setMercatoFilter(mercatoFilter === 'all' ? 'buy' : 'all')} className={`px-3 rounded-xl border border-white/10 flex items-center justify-center transition ${mercatoFilter === 'buy' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-400'}`}><Target size={18}/></button>
             </div>
             
             {isLoading ? <div className="text-center py-20 text-slate-500 text-xs animate-pulse">Analyse du marché en cours...</div> : 
               filteredList.length === 0 ? <div className="text-center py-20 text-slate-500 text-xs">Aucun joueur trouvé.</div> :
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredList.map((player, i) => (
                      <FutCard key={player.id || i} player={player} onAddToPortfolio={(id)=>{setNewAssetTicker(id); setShowAddModal(true)}} onAddToWatchlist={(id)=>{watchlist.includes(id)?setWatchlist(watchlist.filter(x=>x!==id)):setWatchlist([...watchlist,id])}} isInWatchlist={watchlist.includes(player.ticker)} />
                  ))}
               </div>
             }
          </div>
        )}

        {activeTab === 'club' && (
          <div className="space-y-3 animate-in fade-in">
             {portfolio.length === 0 ? <div className="text-center py-20 text-slate-500 border-2 border-dashed border-white/5 rounded-2xl"><p className="text-xs font-bold">EFFECTIF VIDE</p></div> : 
               portfolio.map(pos => {
                  const live = playersData.find(d => d.ticker === pos.ticker);
                  const price = live ? live.price : pos.price;
                  const val = pos.qty * price;
                  return (
                      <div key={pos.id} className="bg-slate-800 border border-white/5 p-3 rounded-xl flex justify-between items-center shadow-sm relative group">
                          <div>
                              <div className="font-bold text-sm mb-1">{pos.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{pos.qty} x {pos.avgPrice} ➔ {price.toFixed(2)}</div>
                          </div>
                          <div className="text-right">
                              <div className="font-black text-sm">{val.toFixed(0)} {pos.currency}</div>
                              <button onClick={() => setPortfolio(portfolio.filter(p=>p.id!==pos.id))} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition"><X size={14}/></button>
                          </div>
                      </div>
                  )
               })
             }
          </div>
        )}
        
        {activeTab === 'watchlist' && (
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in">
              {playersData.filter(p => watchlist.includes(p.ticker)).map((player, i) => (
                  <FutCard key={i} player={player} onAddToPortfolio={(id)=>{setNewAssetTicker(id); setShowAddModal(true)}} onAddToWatchlist={(id)=>{setWatchlist(watchlist.filter(x=>x!==id))}} isInWatchlist={true} />
              ))}
           </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in zoom-in-95">
            <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-2xl p-5">
                <div className="flex justify-between mb-4"><h3 className="font-black text-lg">RECRUTEMENT</h3><button onClick={()=>setShowAddModal(false)}><X/></button></div>
                <form onSubmit={handleAddPosition} className="space-y-3">
                    <div><label className="text-[10px] font-bold text-slate-400">JOUEUR</label><div className="font-black text-xl text-white">{newAssetTicker}</div></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-[10px] font-bold text-slate-400">QUANTITÉ</label><input type="number" required className="w-full bg-slate-800 rounded p-2 text-white font-bold outline-none focus:border-blue-500" value={newQty} onChange={e=>setNewQty(e.target.value)} autoFocus/></div>
                        <div><label className="text-[10px] font-bold text-slate-400">PRIX ACHAT</label><input type="number" required className="w-full bg-slate-800 rounded p-2 text-white font-bold outline-none focus:border-blue-500" value={newPru} onChange={e=>setNewPru(e.target.value)}/></div>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black py-3 rounded-xl mt-2 shadow-lg">SIGNER LE CONTRAT</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}