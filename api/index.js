import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  const { symbols } = req.query;
  
  if (!symbols) {
    return res.status(400).json({ error: 'Symbols parameter is required' });
  }

  try {
    const tickers = symbols.split(',');
    
    // Options pour éviter les erreurs strictes
    const queryOptions = { validateResult: false };
    
    // On utilise la méthode 'quote' qui accepte un tableau de symboles
    const results = await yahooFinance.quote(tickers, queryOptions);
    
    // On s'assure de toujours renvoyer un tableau
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
