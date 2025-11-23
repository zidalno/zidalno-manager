// api/proxy.js
export default async function handler(req, res) {
  const { symbols } = req.query;

  if (!symbols) {
    return res.status(400).json({ error: 'Symbols parameter is required' });
  }

  try {
    // On appelle directement l'API Yahoo V7 (la plus stable)
    const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' // On se fait passer pour un navigateur
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // Cache de 60 secondes pour être rapide
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(data.quoteResponse?.result || []);

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: 'Failed to fetch data from Yahoo Finance' });
  }
}
