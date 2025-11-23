// api/index.js
import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  const { symbols } = req.query;
  
  if (!symbols) {
    return res.status(400).json({ error: 'Symbols parameter is required' });
  }

  try {
    // On nettoie la liste des symboles
    const tickers = symbols.split(',');
    
    // On demande les infos à Yahoo via la librairie officielle
    const results = await yahooFinance.quote(tickers);
    
    // On renvoie le résultat (un tableau d'objets)
    // Si un seul résultat, yahooFinance renvoie un objet, donc on le met dans un tableau
    const quotes = Array.isArray(results) ? results : [results];
    
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json(quotes);

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}
