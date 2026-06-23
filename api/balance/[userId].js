import { getBalance, setBalance } from '../../lib/storage.js'

const INITIAL_BALANCE = 1000.00

export default async function handler(req, res) {
    const { userId } = req.query
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' })
    }

    try {
        let balance = await getBalance(userId)
        if (balance === 0) {
            await setBalance(userId, INITIAL_BALANCE)
            balance = INITIAL_BALANCE
        }
        res.json({ balance })
    } catch (error) {
        console.error('Balance fetch error:', error)
        res.status(500).json({ error: 'Failed to fetch balance' })
    }
}
