import { getBalance } from '../../lib/storage.js'

export default async function handler(req, res) {
    const { userId } = req.query
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' })
    }

    try {
        const balance = await getBalance(userId)
        res.json({ balance })
    } catch (error) {
        console.error('Balance fetch error:', error)
        res.status(500).json({ error: 'Failed to fetch balance' })
    }
}
