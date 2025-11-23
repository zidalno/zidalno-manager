// api/index.js
export default async function handler(req, res) {
  // 1. Récupérer les tickers demandés (ex: MC.PA,AAPL)
  const { symbols } = req.query;
  
  if (!symbols) {
    return res.status(400).json({ error: 'Symbols parameter is required' });
  }

  try {
    // 2. Appeler Yahoo Finance via le proxy corsproxy.io
    // Astuce : On utilise corsproxy.io pour contourner les blocages CORS côté serveur aussi, c'est plus sûr.
    const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Yahoo API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    const quotes = data.quoteResponse?.result || [];

    // 3. Renvoyer les données propres au Frontend
    // On met en cache la réponse pendant 60 secondes pour être rapide
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json(quotes);

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: 'Failed to fetch data from Yahoo Finance' });
  }
}
