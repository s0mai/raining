import { deductCoinBalance, addCoinBalance, incrementTotalDeposits } from '../../lib/storage.js'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    let { userId, coin, action, amount, isDeposit } = req.body
    if (!userId || !coin || !action || amount == null) {
        return res.status(400).json({ error: 'Missing required fields: userId, coin, action, amount' })
    }

    try {
        let balances
        if (action === 'bet') {
            balances = await deductCoinBalance(userId, coin, amount)
        } else if (action === 'win') {
            balances = await addCoinBalance(userId, coin, amount)
            if (isDeposit) {
                await incrementTotalDeposits(userId, amount)
            }
        } else {
            return res.status(400).json({ error: 'Invalid action. Must be "bet" or "win"' })
        }
        const total = Object.values(balances).reduce((s, v) => s + v, 0)
        res.json({ balances, total })
    } catch (error) {
        console.error('Balance update error:', error)
        if (error.message === 'Insufficient balance') {
            return res.status(402).json({ error: 'Insufficient balance' })
        }
        res.status(500).json({ error: 'Failed to update balance' })
    }
}
