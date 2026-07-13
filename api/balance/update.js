import { deductCoinBalance, addCoinBalance, incrementTotalDeposits, getStarsUsdRate } from '../../lib/storage.js'
import { withValidation } from '../../lib/withValidation.js'
import { rateLimit } from '../../lib/rateLimit.js'

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    let { userId, coin, action, amount, isDeposit, tonPrice } = req.body
    if (!userId || !coin || !action || amount == null) {
        return res.status(400).json({ error: 'Missing required fields: userId, coin, action, amount' })
    }

    const allowed = await rateLimit(`balance_update:${userId}`, 100, 60)
    if (!allowed) {
        return res.status(429).json({ error: 'Too many requests. Try again later.' })
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
        } else if (action === 'exchange_stars_to_ton') {
            const starsAmount = parseFloat(amount)
            if (isNaN(starsAmount) || starsAmount <= 0) {
                return res.status(400).json({ error: 'Invalid amount' })
            }
            if (!tonPrice || tonPrice <= 0) {
                return res.status(400).json({ error: 'Invalid TON price' })
            }
            const starsUsdRate = await getStarsUsdRate()
            const tonAmount = parseFloat(((starsAmount * starsUsdRate) / tonPrice).toFixed(6))
            if (tonAmount <= 0) {
                return res.status(400).json({ error: 'Amount too small' })
            }
            balances = await deductCoinBalance(userId, 'stars', starsAmount)
            balances = await addCoinBalance(userId, 'ton', tonAmount)
            res.json({ balances, tonAmount, starsAmount })
            return
        } else {
            return res.status(400).json({ error: 'Invalid action. Must be "bet", "win", or "exchange_stars_to_ton"' })
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

export default withValidation(handler)