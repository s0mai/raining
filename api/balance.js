import { getBalances, initBalances, getTotalDeposits } from '../lib/storage.js'

export default async function handler(req, res) {
    const { userId } = req.query
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId query parameter' })
    }

    try {
        let balances = await getBalances(userId)
        if (!balances) {
            balances = await initBalances(userId)
        }
        const total = Object.values(balances).reduce((s, v) => s + v, 0)
        const totalDeposits = await getTotalDeposits(userId)
        res.json({ balances, total, totalDeposits })
    } catch (error) {
        console.error('Balance fetch error:', error)
        res.status(500).json({ error: 'Failed to fetch balance' })
    }
}
