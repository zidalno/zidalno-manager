// api/index.js

// Utilisation de la syntaxe 'require' pour une meilleure compatibilité Vercel
const yahooFinance = require('yahoo-finance2').default;

module.exports = async (req, res) => {
  const { symbols } = req.query;
  
  if (!symbols) {
    return res.status(400).json({ error: 'Symbols parameter is required' });
  }

  try {
    const tickers = symbols.split(',');
    
    // Options pour être plus souple avec les résultats
    const queryOptions = { validateResult: false };
    
    // La méthode 'quote' de la librairie pour récupérer les données
    const results = await yahooFinance.quote(tickers, queryOptions);
    
    const quotes = Array.isArray(results) ? results : [results];
    
    // On met la réponse en cache pour 60 secondes
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json(quotes);

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      error: 'Failed to fetch data', 
      details: error.message 
    });
  }
};
