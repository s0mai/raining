const CACHE_TTL = 3600 * 1000
let cache = { rates: null, timestamp: 0 }

async function fetchRates() {
    const resp = await fetch('https://open.er-api.com/v6/latest/USD')
    if (!resp.ok) throw new Error('Failed to fetch rates')
    const data = await resp.json()
    if (data.result !== 'success') throw new Error('API returned non-success')
    return data.rates
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const now = Date.now()
    if (cache.rates && now - cache.timestamp < CACHE_TTL) {
        return res.json({ rates: cache.rates, cached: true })
    }

    try {
        const rates = await fetchRates()
        cache = { rates, timestamp: now }
        res.json({ rates })
    } catch (e) {
        if (cache.rates) {
            return res.json({ rates: cache.rates, cached: true, stale: true })
        }
        res.status(502).json({ error: 'Failed to fetch exchange rates' })
    }
}
