import React, { useState, useMemo } from 'react';
import { Search, Calculator, ChevronDown, Trophy, Flame, Wallet, RotateCw, ArrowRight, Users, Briefcase, ArrowUpRight, ArrowDownRight, AlertCircle, PlusCircle, X, BookOpen, ShieldCheck, TrendingUp, Banknote, RefreshCw } from 'lucide-react';

// --- CONFIGURATION ---
const APP_CONFIG = {
  title: "ZIDALNO MANAGER",
  version: "V9 • Market Leaders",
  lastUpdate: "Live Simulation"
};

// --- DONNÉES DE RÉFÉRENCE (DATABASE) ---
const ETF_DB = [
  { id: 'wpea', ticker: 'WPEA', name: 'iShares MSCI World', price: 5.25, currency: '€', type: 'ETF' },
  { id: 'ese', ticker: 'ESE', name: 'BNP S&P 500', price: 22.40, currency: '€', type: 'ETF' },
  { id: 'cw8', ticker: 'CW8', name: 'Amundi MSCI World', price: 495.00, currency: '€', type: 'ETF' },
  { id: 'paeem', ticker: 'PAEEM', name: 'Amundi MSCI Emerging', price: 23.50, currency: '€', type: 'ETF' },
  { id: 'etz', ticker: 'ETZ', name: 'BNP Stoxx 600', price: 19.80, currency: '€', type: 'ETF' },
  { id: 'nas', ticker: 'PUST', name: 'Amundi Nasdaq-100', price: 68.50, currency: '€', type: 'ETF' }
];

// --- LISTE MASSIVE ACTIONS (Simulées réalistes) ---
const PLAYERS_DATA = [
  // --- SECTEUR LUXE (FR) ---
  { id: 1, ticker: 'MC', name: 'LVMH', price: 715, currency: '€', ovr: 91, position: 'LUXE', stats: { pac: 82, sho: 85, pas: 94, dri: 78, def: 88, phy: 70 }, broker: 'LCL (PEA)', country: 'FR', rarity: 'gold', comment: "Le Roi du CAC40. Indétrônable sur le long terme." },
  { id: 4, ticker: 'RMS', name: 'HERMÈS', price: 2200, currency: '€', ovr: 92, position: 'LUXE', stats: { pac: 85, sho: 40, pas: 99, dri: 88, def: 98, phy: 50 }, broker: 'LCL (PEA)', country: 'FR', rarity: 'gold', comment: "L'excellence absolue. Valorisation toujours extrême." },
  { id: 6, ticker: 'OR', name: 'L\'ORÉAL', price: 445, currency: '€', ovr: 86, position: 'CONS', stats: { pac: 70, sho: 75, pas: 90, dri: 65, def: 85, phy: 72 }, broker: 'LCL (PEA)', country: 'FR', rarity: 'gold', comment: "La valeur fond de portefeuille. Un peu lent actuellement." },
  { id: 20, ticker: 'KER', name: 'KERING', price: 360, currency: '€', ovr: 75, position: 'LUXE', stats: { pac: 50, sho: 70, pas: 65, dri: 40, def: 60, phy: 85 }, broker: 'LCL (PEA)', country: 'FR', rarity: 'common', comment: "En difficulté (Gucci). Attention, c'est un pari 'Turnaround'." },

  // --- SECTEUR TECH (US/EU) ---
  { id: 3, ticker: 'MSFT', name: 'MICROSOFT', price: 415, currency: '$', ovr: 93, position: 'TECH', stats: { pac: 88, sho: 60, pas: 98, dri: 85, def: 95, phy: 75 }, broker: 'IBKR (CTO)', country: 'US', rarity: 'icon', comment: "Le Cloud + l'IA. L'entreprise la plus solide du monde." },
  { id: 10, ticker: 'AAPL', name: 'APPLE', price: 225, currency: '$', ovr: 90, position: 'TECH', stats: { pac: 75, sho: 55, pas: 96, dri: 80, def: 85, phy: 70 }, broker: 'IBKR (CTO)', country: 'US', rarity: 'gold', comment: "Machine à cash (Buybacks). Croissance molle mais sûre." },
  { id: 11, ticker: 'NVDA', name: 'NVIDIA', price: 135, currency: '$', ovr: 94, position: 'CHIP', stats: { pac: 99, sho: 10, pas: 90, dri: 98, def: 85, phy: 55 }, broker: 'IBKR (CTO)', country: 'US', rarity: 'toty', comment: "Le moteur de l'IA. Volatilité extrême mais croissance folle." },
  { id: 12, ticker: 'GOOGL', name: 'ALPHABET', price: 175, currency: '$', ovr: 89, position: 'TECH', stats: { pac: 80, sho: 20, pas: 95, dri: 85, def: 92, phy: 85 }, broker: 'IBKR (CTO)', country: 'US', rarity: 'if', comment: "Sous-valorisée par rapport à ses pairs. Monopole Search." },
  { id: 2, ticker: 'ASML', name: 'ASML', price: 880, currency: '€', ovr: 94, position: 'TECH', stats: { pac: 96, sho: 45, pas: 99, dri: 90, def: 92, phy: 65 }, broker: 'IBKR (CTO)', country: 'NL', rarity: 'toty', comment: "Monopole technologique européen vital pour le monde." },

  // --- SECTEUR INDUSTRIE & ÉNERGIE (FR) ---
  { id: 9, ticker: 'AI', name: 'AIR LIQUIDE', price: 175, currency: '€', ovr: 89, position: 'IND', stats: { pac: 65, sho: 85, pas: 95, dri: 60, def: 90, phy: 80 }, broker: 'LCL (PEA)', country: 'FR', rarity: 'icon', comment: "L'action préférée des français. Actions gratuites = Magie." },
  { id: 8, ticker: 'SU', name: 'SCHNEIDER', price: 240, currency: '€', ovr: 90, position: 'ELEC', stats: { pac: 88, sho: 65, pas: 88, dri: 82, def: 80, phy: 60 }, broker: 'LCL (PEA)', country: 'FR', rarity: 'if', comment: "Au cœur de l'électrification mondiale. Très cher payé." },
  { id: 13, ticker: 'TTE', name: 'TOTAL', price: 62, currency: '€', ovr: 82, position: 'NRJ', stats: { pac: 50, sho: 95, pas: 80, dri: 60, def: 75, phy: 90 }, broker: 'LCL (PEA)', country: 'FR', rarity: 'gold', comment: "La machine à dividendes. Peu de croissance, mais du rendement." },
  { id: 14, ticker: 'SAF', name: 'SAFRAN', price: 210, currency: '€', ovr: 87, position: 'AERO', stats: { pac: 85, sho: 40, pas: 92, dri: 80, def: 80, phy: 75 }, broker: 'LCL (PEA)', country: 'FR', rarity: 'if', comment: "Rentes sur les moteurs d'avions. Cycle très porteur." },
  { id: 15, ticker: 'AIR', name: 'AIRBUS', price: 145, currency: '€', ovr: 84, position: 'AERO', stats: { pac: 70, sho: 45, pas: 90, dri: 65, def: 85, phy: 80 }, broker: 'LCL (PEA)', country: 'FR', rarity: 'gold', comment: "Carnet de commandes plein pour 10 ans. Problèmes de supply chain." },

  // --- SECTEUR SANTÉ & CONSO (US/EU) ---
  { id: 11, ticker: 'NOVO', name: 'NOVO NORDISK', price: 110, currency: '€', ovr: 95, position: 'MED', stats: { pac: 98, sho: 40, pas: 95, dri: 92, def: 90, phy: 60 }, broker: 'IBKR (CTO)', country: 'DK', rarity: 'toty', comment: "Le roi de l'anti-obésité (Wegovy). Marges colossales." },
  { id: 16, ticker: 'SAN', name: 'SANOFI', price: 95, currency: '€', ovr: 78, position: 'MED', stats: { pac: 40, sho: 88, pas: 70, dri: 45, def: 75, phy: 85 }, broker: 'LCL (PEA)', country: 'FR', rarity: 'common', comment: "Décevant en croissance, mais dividende solide." },
  { id: 17, ticker: 'KO', name: 'COCA-COLA', price: 65, currency: '$', ovr: 83, position: 'CONS', stats: { pac: 40, sho: 90, pas: 98, dri: 50, def: 80, phy: 85 }, broker: 'IBKR (CTO)', country: 'US', rarity: 'gold', comment: "Le gardien de but. Ça ne bouge pas, ça paie des dividendes." },
  
  // --- SECTEUR FINANCE (US/FR) ---
  { id: 5, ticker: 'KNSL', name: 'KINSALE', price: 380, currency: '$', ovr: 89, position: 'FIN', stats: { pac: 99, sho: 20, pas: 85, dri: 95, def: 90, phy: 80 }, broker: 'IBKR (CTO)', country: 'US', rarity: 'if', comment: "Pépite assurance de niche. Croissance à 2 chiffres." },
  { id: 18, ticker: 'V', name: 'VISA', price: 280, currency: '$', ovr: 92, position: 'FIN', stats: { pac: 75, sho: 60, pas: 99, dri: 70, def: 95, phy: 75 }, broker: 'IBKR (CTO)', country: 'US', rarity: 'icon', comment: "Le péage de l'économie mondiale. Marges > 50%." },
  { id: 19, ticker: 'BNP', name: 'BNP PARIBAS', price: 65, currency: '€', ovr: 76, position: 'BANK', stats: { pac: 45, sho: 92, pas: 60, dri: 50, def: 65, phy: 95 }, broker: 'LCL (PEA)', country: 'FR', rarity: 'common', comment: "Pas cher, gros rendement, mais secteur bancaire risqué." },
  { id: 21, ticker: 'TSLA', name: 'TESLA', price: 240, currency: '$', ovr: 85, position: 'AUTO', stats: { pac: 95, sho: 0, pas: 70, dri: 99, def: 75, phy: 60 }, broker: 'IBKR (CTO)', country: 'US', rarity: 'if', comment: "Quitte ou double. Plus une boite tech/robotique qu'auto." }
];

const ALL_ASSETS = [...ETF_DB, ...PLAYERS_DATA.map(p => ({ ...p, type: 'Action' }))];

// --- COMPOSANTS UI ---
const FutCard = ({ player }) => {
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
  const style = getCardStyle(player.rarity);
  const textColor = ['icon', 'gold', 'common'].includes(player.rarity) ? 'text-slate-900' : 'text-white';
  const labelColor = ['icon', 'gold', 'common'].includes(player.rarity) ? 'text-slate-700' : 'text-slate-300';

  return (
    <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full aspect-[2/3] rounded-[1.5rem] p-1 shadow-xl cursor-pointer transform transition hover:scale-[1.02] ${style} border`}>
      <div className="h-full w-full border border-white/20 rounded-[1.3rem] p-2 flex flex-col relative overflow-hidden">
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
          <div className="flex flex-col h-full text-center justify-center gap-2 animate-in fade-in">
            <div className={`text-[10px] font-bold uppercase opacity-70 ${textColor}`}>Scout Report</div>
            <p className={`text-[10px] font-medium leading-tight ${textColor}`}>"{player.comment}"</p>
            <div className="bg-white/90 text-black rounded py-1 text-xs font-bold mt-2">{player.broker}</div>
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
  
  const [portfolio, setPortfolio] = useState([
    { id: 'p1', ticker: 'WPEA', name: 'iShares MSCI World', qty: 100, avgPrice: 4.90, currentPrice: 5.25, type: 'ETF' }
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssetTicker, setNewAssetTicker] = useState('MC');
  const [newQty, setNewQty] = useState('');
  const [newPru, setNewPru] = useState('');

  const [investmentAmount, setInvestmentAmount] = useState(500);
  const [etfPercentage, setEtfPercentage] = useState(80);
  const [search, setSearch] = useState('');

  const handleAddPosition = (e) => {
    e.preventDefault();
    const assetData = ALL_ASSETS.find(a => a.ticker === newAssetTicker);
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
  };

  const portfolioStats = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;
    let etfValue = 0;
    let stockValue = 0;

    portfolio.forEach(pos => {
      const val = pos.qty * pos.currentPrice;
      const cost = pos.qty * pos.avgPrice;
      totalValue += val;
      totalCost += cost;
      if(pos.type === 'ETF') etfValue += val;
      else stockValue += val;
    });

    const currentEtfRatio = totalValue > 0 ? (etfValue / totalValue) * 100 : 0;
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return { totalValue, totalGain, totalGainPercent, currentEtfRatio, etfValue, stockValue };
  }, [portfolio]);

  const coachAdvice = useMemo(() => {
    const targetEtfVal = portfolioStats.totalValue * (etfPercentage / 100);
    const diff = targetEtfVal - portfolioStats.etfValue;
    
    if (portfolioStats.totalValue === 0) return { action: 'Débutant', msg: "Le club est vide. Commencez par recruter !", color: 'text-slate-400' };
    if (Math.abs(diff) < (portfolioStats.totalValue * 0.05)) return { action: 'Tactique Parfaite', msg: "L'équilibre Socle/Pépites est respecté. Continuez ainsi.", color: 'text-emerald-400' };
    if (diff > 0) return { action: 'Renforcer la Défense', msg: `Votre socle (ETF) est trop faible. Il manque environ ${diff.toFixed(0)}€ d'ETF pour respecter le ratio.`, color: 'text-blue-400' };
    return { action: 'Attaque Trop Lourde', msg: `Vous avez trop d'actions individuelles (${(100-portfolioStats.currentEtfRatio).toFixed(0)}%). Calmez le stock picking ou renforcez le socle.`, color: 'text-orange-400' };
  }, [portfolioStats, etfPercentage]);

  const filteredPlayers = PLAYERS_DATA.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.ovr - a.ovr);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm text-center">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-black italic text-white mb-1 tracking-tighter">ZIDALNO MANAGER</h1>
          <p className="text-slate-500 text-xs mb-8 uppercase font-bold tracking-widest">Portfolio & Scouting OS</p>
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
            <div className="font-black text-sm text-white">{portfolioStats.totalValue.toLocaleString()} €</div>
          </div>
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded ${portfolioStats.totalGain >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {portfolioStats.totalGain >= 0 ? '+' : ''}{portfolioStats.totalGainPercent.toFixed(1)}%
        </div>
      </div>

      <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-1 text-[10px] text-yellow-500 font-bold text-center flex items-center justify-center gap-2">
        <RefreshCw size={10} /> DONNÉES SIMULÉES (V9)
      </div>

      <div className="flex p-2 bg-slate-800 mx-4 mt-4 rounded-xl border border-white/5">
        <button onClick={() => setActiveTab('market')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-2 transition ${activeTab === 'market' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
          <Flame size={14} /> Marché
        </button>
        <button onClick={() => setActiveTab('club')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-2 transition ${activeTab === 'club' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
          <Briefcase size={14} /> Mon Club
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
                <div className="bg-black/30 rounded-xl p-3 flex justify-between items-center text-xs border border-white/5">
                  <div>
                    <span className="text-slate-400 block mb-1 font-bold">MA COMPOSITION</span>
                    <span className="font-black text-white text-lg">{portfolioStats.currentEtfRatio.toFixed(0)} / {(100 - portfolioStats.currentEtfRatio).toFixed(0)}</span>
                    <span className="text-[10px] text-slate-500 block">Socle / Pépites</span>
                  </div>
                  <ArrowRight size={14} className="text-slate-600" />
                  <div className="text-right">
                    <span className="text-slate-400 block mb-1 font-bold">CIBLE (TARGET)</span>
                    <span className="font-black text-emerald-400 text-lg">{etfPercentage} / {100 - etfPercentage}</span>
                    <span className="text-[10px] text-slate-500 block">
                        <button onClick={() => setEtfPercentage(etfPercentage === 80 ? 90 : 80)} className="underline hover:text-white">Modifier</button>
                    </span>
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
                    const gain = (pos.currentPrice - pos.avgPrice) * pos.qty;
                    const gainPct = ((pos.currentPrice - pos.avgPrice) / pos.avgPrice) * 100;
                    return (
                      <div key={pos.id} className="bg-slate-800/50 border border-white/5 rounded-xl p-3 flex justify-between items-center hover:bg-slate-800 transition">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border ${pos.type === 'ETF' ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' : 'bg-purple-900/20 text-purple-400 border-purple-500/30'}`}>{pos.ticker}</div>
                          <div>
                            <div className="font-bold text-sm text-white">{pos.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{pos.qty} parts • PRU: {pos.avgPrice}€</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">{(pos.qty * pos.currentPrice).toLocaleString()}€</div>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black italic text-white flex items-center gap-2"><Flame className="text-orange-500" size={18} /> PÉPITES QGDV</h2>
                <div className="relative w-28">
                  <Search className="absolute left-2 top-1.5 text-slate-500 w-3 h-3" />
                  <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-800 rounded-lg py-1 pl-7 text-[10px] text-white border border-slate-700 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredPlayers.map(player => <FutCard key={player.id} player={player} />)}
              </div>
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
                    <optgroup label="Pépites (Actions)">{PLAYERS_DATA.map(p => <option key={p.id} value={p.ticker}>{p.name} ({p.ticker})</option>)}</optgroup>
                    <optgroup label="Socle (ETF)">{ETF_DB.map(e => <option key={e.id} value={e.ticker}>{e.name} ({e.ticker})</option>)}</optgroup>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Quantité</label><input type="number" required className="w-full bg-slate-800 text-white font-bold py-3 px-3 rounded-xl border border-slate-700 outline-none focus:border-emerald-500" placeholder="Ex: 10" value={newQty} onChange={(e) => setNewQty(e.target.value)} /></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">PRU (Prix d'achat)</label><input type="number" required className="w-full bg-slate-800 text-white font-bold py-3 px-3 rounded-xl border border-slate-700 outline-none focus:border-emerald-500" placeholder="Ex: 450" value={newPru} onChange={(e) => setNewPru(e.target.value)} /></div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl shadow-lg shadow-emerald-900/50 transition active:scale-95 mt-2">VALIDER LE TRANSFERT</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}