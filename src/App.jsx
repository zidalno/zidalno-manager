import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Trophy, Flame, Wallet, ArrowRight, Users, Briefcase, ArrowUpRight, ArrowDownRight, AlertCircle, PlusCircle, X, BookOpen, ShieldCheck, TrendingUp, Banknote, RefreshCw, Trash2, Clock, Eye, EyeOff, Filter, TrendingDown, Target, Zap, CheckCircle, Info, Percent } from 'lucide-react';

// ⚠️ VOTRE URL GOOGLE SHEET (CSV)
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRudxcCXc1m-e0rKNVApV0KgoOlu3kvXQ_UN8wU5faNnHaJbP17-uOA8wr1RiE2anVkr3qgAv1JSo4/pub?gid=1557889646&single=true&output=csv";

const APP_CONFIG = {
  title: "ZIDALNO MANAGER",
  version: "V29 • Compact Fixed",
  lastUpdate: "Auto"
};

// --- PARSEUR CSV INTELLIGENT ---
const parseCSV = (text) => {
  if (!text || text.length === 0) return [];
  
  const rows = text.trim().split('\n').slice(1); 
  
  return rows.map((line, idx) => {
    // Gestion robuste des virgules dans les cellules CSV
    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/"/g, '').trim());
    if (cols.length < 5) return null; 

    // MAPPING SELON VOTRE CAPTURE D'ÉCRAN
    // A:Ticker, B:Nom, C:Pays, D:Secteur, E:Score, F:Qualité, G:Croissance, H:Dividende, I:Valo, J:Prix, K:Var
    const ticker = cols[0];
    
    // Nettoyage et parsing des chiffres (gestion virgule vs point)
    const parseNum = (val) => {
      if (!val) return 0;
      // Si le chiffre contient une virgule (format FR), on remplace par point
      // On retire aussi les % et devises
      return parseFloat(val.replace(',', '.').replace('%', '').replace('€', '').replace('$', '')) || 0;
    };

    const price = parseNum(cols[9]);
    const change = parseNum(cols[10]);
    const score = parseInt(cols[4]) || 50;

    // Stats QGDV (Colonnes F, G, H, I)
    const stats = {
      pac: parseInt(cols[5]) || 50, // Qualité
      sho: parseInt(cols[6]) || 50, // Croissance
      pas: parseInt(cols[7]) || 50, // Dividende
      phy: parseInt(cols[8]) || 50  // Valorisation
    };

    // Autres données (Colonnes L et plus si vous en ajoutez)
    const roe = cols[11] || "-";
    const margin = cols[12] || "-";

    // Logique Signal & Profil
    let smartSignal = "NEUTRE";
    if (score >= 90) smartSignal = "TOP PICK";
    if (stats.phy > 80) smartSignal = "ACHAT"; // Si note valo élevée => pas cher

    let profil = "STANDARD";
    if (score >= 90) profil = "GOAT";
    else if (score >= 80) profil = "TITULAIRE";
    
    return {
      id: `stock_${idx}`,
      ticker: ticker || "N/A",
      name: cols[1] || "Inconnu",
      country: cols[2] || "MND",
      sector: cols[3] || "Divers",
      type: "Action", // Par défaut
      broker: "CTO",  // Par défaut, à affiner si colonne dédiée
      ovr: score,
      stats: stats,
      price: price,
      changePercent: change,
      currency: (ticker && ticker.includes('EPA:')) ? '€' : '$',
      
      // Data enrichie
      roe: roe,
      margin: margin,
      div_yield: "-",
      
      fairValue: 0, // À mapper si colonne dispo
      potential: 0,
      signal: smartSignal,
      profil: profil,
      alert: "OK",
      comment: ""
    };
  }).filter(item => item !== null && item.ticker && item.ticker !== "Ticker");
};

// --- CARTE COMPACTE ---
const FutCard = ({ player, onAddToPortfolio, onAddToWatchlist, isInWatchlist }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Badges dynamiques
  const getSignalBadge = () => {
    if (player.signal === "ACHAT") return { label: "ACHAT", color: "bg-emerald-500", icon: <Target size={8}/> };
    if (player.signal === "TOP PICK") return { label: "TOP", color: "bg-yellow-500 text-black", icon: <Trophy size={8}/> };
    if (player.changePercent < -3) return { label: "DIP", color: "bg-red-500 animate-pulse", icon: <TrendingDown size={8}/> };
    return null; 
  };
  const signal = getSignalBadge();
  
  const getCardStyle = (ovr) => {
    if (ovr >= 90) return "bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 text-slate-900 border-yellow-300 shadow-yellow-500/20";
    if (ovr >= 80) return "bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 text-white border-emerald-500";
    if (ovr <= 60) return "bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 text-slate-400 border-slate-600";
    return "bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 text-white border-blue-500";
  };
  
  const style = getCardStyle(player.ovr);
  const textColor = style.includes("text-slate-900") ? "text-slate-900" : "text-white";
  const labelColor = style.includes("text-slate-900") ? "text-slate-700" : "text-slate-300";

  return (
    <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full aspect-[3/4] rounded-lg p-0.5 shadow-md cursor-pointer transform transition hover:scale-105 duration-200 ${style} border group`}>
      <div className="h-full w-full border border-white/20 rounded-md p-1.5 flex flex-col relative overflow-hidden backdrop-blur-sm">
        
        {/* Badge Signal */}
        {signal && (
          <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase flex items-center gap-0.5 shadow-sm z-20 ${signal.color}`}>
            {signal.icon} {signal.label}
          </div>
        )}

        {!isFlipped ? (
          <>
            <div className="flex justify-between items-start relative z-10">
              <div className="flex flex-col items-center leading-none">
                <span className={`text-xl font-black ${textColor}`}>{player.ovr}</span>
                <span className={`text-[7px] font-bold uppercase ${textColor}`}>{player.country}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-0 -mt-1">
               <h2 className={`text-sm font-black tracking-tighter text-center leading-none ${textColor} drop-shadow-sm line-clamp-2 px-1`}>{player.name}</h2>
               <span className={`text-[7px] font-bold opacity-70 ${textColor}`}>{player.ticker.split(':')[1] || player.ticker}</span>
            </div>

            <div className="relative z-10 border-t border-black/10 pt-1 mt-auto">
              <div className="grid grid-cols-2 gap-x-1 text-[8px]">
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.pac}</span><span className={labelColor}>QUA</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.sho}</span><span className={labelColor}>CRO</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.pas}</span><span className={labelColor}>DIV</span></div>
                <div className="flex justify-between"><span className={`font-bold ${textColor}`}>{player.stats.phy}</span><span className={labelColor}>VAL</span></div>
              </div>
            </div>

            <div className="mt-1.5 text-center bg-black/20 rounded py-0.5 flex justify-between items-center px-2">
              <span className={`font-bold text-xs ${textColor}`}>{player.price.toFixed(2)} {player.currency}</span>
              <span className={`text-[8px] font-bold ${player.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {player.changePercent > 0 ? '+' : ''}{player.changePercent.toFixed(2)}%
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full text-white text-[9px]">
            <div className="font-bold mb-1 opacity-70 text-center">DÉTAILS</div>
            <div className="space-y-1 flex-1 overflow-y-auto no-scrollbar">
              <div className="flex justify-between border-b border-white/10"><span>Secteur</span><span className="font-bold">{player.sector}</span></div>
              <div className="flex justify-between border-b border-white/10"><span>Marge</span><span>{player.margin}%</span></div>
              <div className="flex justify-between border-b border-white/10"><span>ROE</span><span>{player.roe}%</span></div>
              <div className="mt-1 italic text-[8px] opacity-80 leading-tight">Données issues de votre Google Sheet.</div>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <button onClick={(e) => { e.stopPropagation(); onAddToPortfolio(player.ticker); }} className="bg-emerald-600 hover:bg-emerald-500 text-white py-1 rounded font-bold flex justify-center"><PlusCircle size={10}/></button>
              <button onClick={(e) => { e.stopPropagation(); onAddToWatchlist(player.ticker); }} className={`${isInWatchlist ? 'bg-yellow-600' : 'bg-slate-600'} text-white py-1 rounded font-bold flex justify-center`}>{isInWatchlist ? <EyeOff size={10}/> : <Eye size={10}/>}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- APP ---
export default function ZidalnoManagerApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('market');
  const [playersData, setPlayersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mercatoFilter, setMercatoFilter] = useState('all');
  const [portfolio, setPortfolio] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssetTicker, setNewAssetTicker] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newPru, setNewPru] = useState('');

  // Persistance basique
  useEffect(() => {
    const saved = localStorage.getItem('zidalno_portfolio');
    if (saved) setPortfolio(JSON.parse(saved));
    const savedW = localStorage.getItem('zidalno_watchlist');
    if (savedW) setWatchlist(JSON.parse(savedW));
  }, []);

  useEffect(() => {
    localStorage.setItem('zidalno_portfolio', JSON.stringify(portfolio));
    localStorage.setItem('zidalno_watchlist', JSON.stringify(watchlist));
  }, [portfolio, watchlist]);

  // Chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      // Ajout timestamp pour éviter cache
      fetch(GOOGLE_SHEET_URL + "&t=" + Date.now(), { mode: 'cors' }) 
        .then(r => r.text())
        .then(text => {
          const data = parseCSV(text);
          setPlayersData(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Fetch error", err);
          setIsLoading(false);
        });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddPosition = (e) => {
    e.preventDefault();
    const asset = playersData.find(p => p.ticker === newAssetTicker);
    if (!asset) return;
    setPortfolio([...portfolio, { id: Date.now().toString(), ticker: asset.ticker, name: asset.name, qty: Number(newQty), avgPrice: Number(newPru), price: asset.price }]);
    setShowAddModal(false); setNewQty(''); setNewPru('');
  };

  const filteredPlayers = useMemo(() => {
    let res = playersData.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.ticker?.toLowerCase().includes(search.toLowerCase()));
    
    if (mercatoFilter === 'buy') res = res.filter(p => p.signal === "ACHAT" || p.signal === "TOP PICK");
    if (mercatoFilter === 'drops') res = res.filter(p => p.changePercent < -2);
    if (mercatoFilter === 'goat') res = res.filter(p => p.ovr >= 90);
    
    return res.sort((a, b) => b.ovr - a.ovr);
  }, [playersData, search, mercatoFilter]);

  // Stats Portefeuille
  const stats = useMemo(() => {
     let total = 0, cost = 0;
     portfolio.forEach(p => {
       const current = playersData.find(d => d.ticker === p.ticker)?.price || p.price || 0;
       total += p.qty * current;
       cost += p.qty * p.avgPrice;
     });
     return { total, gain: total - cost, gainPct: cost ? ((total - cost)/cost)*100 : 0 };
  }, [portfolio, playersData]);

  if (!isAuthenticated) return ( <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white"> <Trophy className="w-16 h-16 text-yellow-500 mb-6 animate-bounce" /> <h1 className="text-3xl font-black tracking-tighter mb-8">ZIDALNO MANAGER</h1> <form onSubmit={(e) => { e.preventDefault(); if(passwordInput.toLowerCase() === 'zidalno') setIsAuthenticated(true); }} className="w-full max-w-xs space-y-4"> <input type="password" placeholder="PASSWORD" className="w-full bg-white/10 border border-white/20 rounded-xl py-3 text-center text-white font-bold tracking-widest outline-none focus:border-yellow-500" value={passwordInput} onChange={(e)=>setPasswordInput(e.target.value)} /> <button className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl">START</button> </form> </div> );

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20 font-sans">
      <div className="sticky top-0 z-40 bg-slate-950/95 border-b border-white/10 px-4 py-2 flex justify-between shadow-lg">
        <div>
             <div className="text-[9px] text-slate-400 font-bold">CLUB VALUE</div>
             <div className="font-black text-lg">{stats.total.toLocaleString()} €</div>
        </div>
        <div className="flex items-center gap-2">
             <span className={`text-xs font-bold ${stats.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.gainPct > 0 ? '+' : ''}{stats.gainPct.toFixed(1)}%</span>
             <button onClick={()=>{localStorage.clear();window.location.reload()}}><Trash2 size={14} className="text-slate-600 hover:text-red-500"/></button>
        </div>
      </div>

      <div className="flex p-2 bg-slate-800 mx-4 mt-2 rounded-lg gap-1">
        {['market', 'club'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {activeTab === 'market' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                 <Search className="absolute left-2.5 top-2 text-slate-500 w-3.5 h-3.5"/>
                 <input type="text" placeholder="Chercher..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full bg-slate-800 rounded-lg py-1.5 pl-8 text-xs text-white outline-none border border-slate-700 focus:border-blue-500"/>
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setMercatoFilter('all')} className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border ${mercatoFilter==='all'?'bg-slate-200 text-black border-white':'border-slate-600 text-slate-400'}`}>Tout</button>
                <button onClick={() => setMercatoFilter('goat')} className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border flex items-center gap-1 ${mercatoFilter==='goat'?'bg-yellow-500 text-black border-yellow-400':'border-slate-600 text-slate-400'}`}><Trophy size={10}/> GOAT</button>
                <button onClick={() => setMercatoFilter('drops')} className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border flex items-center gap-1 ${mercatoFilter==='drops'?'bg-red-500 text-white border-red-400':'border-slate-600 text-slate-400'}`}><TrendingDown size={10}/> Soldes (-2%)</button>
                <button onClick={() => setMercatoFilter('buy')} className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border flex items-center gap-1 ${mercatoFilter==='buy'?'bg-emerald-500 text-white border-emerald-400':'border-slate-600 text-slate-400'}`}><Target size={10}/> Achat</button>
            </div>

            {isLoading ? <div className="text-center py-10 text-slate-500 text-xs">Chargement...</div> : 
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {filteredPlayers.map((player, i) => (
                  <FutCard key={i} player={player} onAddToPortfolio={()=>{setNewAssetTicker(player.ticker); setShowAddModal(true)}} onAddToWatchlist={()=>{}} isInWatchlist={false} />
                ))}
              </div>
            }
          </div>
        )}
        
        {activeTab === 'club' && (
          <div className="space-y-2">
             {portfolio.map((pos, i) => (
                 <div key={i} className="bg-slate-800 p-3 rounded flex justify-between items-center border border-white/5">
                     <div>
                         <div className="font-bold text-sm">{pos.name}</div>
                         <div className="text-[10px] text-slate-400">{pos.qty} x {pos.avgPrice}</div>
                     </div>
                     <div className="font-bold text-sm">
                        {(pos.qty * (playersData.find(d => d.ticker === pos.ticker)?.price || pos.price)).toFixed(0)} €
                     </div>
                 </div>
             ))}
             {portfolio.length === 0 && <div className="text-center py-10 text-slate-500 text-xs">Aucun joueur.</div>}
          </div>
        )}
      </div>
      
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-xl p-4">
                <h3 className="font-bold text-center mb-4">RECRUTER {newAssetTicker}</h3>
                <form onSubmit={handleAddPosition} className="space-y-3">
                    <input type="number" placeholder="Quantité" className="w-full bg-slate-800 rounded p-2 text-white text-center font-bold outline-none" value={newQty} onChange={e=>setNewQty(e.target.value)} autoFocus/>
                    <input type="number" placeholder="Prix d'achat (PRU)" className="w-full bg-slate-800 rounded p-2 text-white text-center font-bold outline-none" value={newPru} onChange={e=>setNewPru(e.target.value)}/>
                    <button className="w-full bg-emerald-600 py-2 rounded font-bold">VALIDER</button>
                </form>
                <button onClick={()=>setShowAddModal(false)} className="w-full mt-2 py-2 text-xs text-slate-500">Annuler</button>
            </div>
        </div>
      )}
    </div>
  );
}