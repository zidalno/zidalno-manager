// api/index.js
import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  const { symbols } = req.query;
  
  if (!symbols) {
    return res.status(400).json({ error: 'Symbols parameter is required' });
  }

  try {
    // On supprime les suppressions de log pour éviter les warnings
    yahooFinance.suppressNotices(['yahooSurvey']);

    const tickers = symbols.split(',');
    
    // On utilise la méthode quoteCombine qui est plus robuste pour les listes
    const results = await yahooFinance.quote(tickers);
    
    const quotes = Array.isArray(results) ? results : [results];
    
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json(quotes);

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      error: 'Failed to fetch data', 
      details: error.message 
    });
  }
}
