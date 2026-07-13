import { getBalances, initBalances, getTotalDeposits, getStarsUsdRate, getReferrer, setReferrer, getReferralBonus, getReferralCount } from '../lib/storage.js'
import { withValidation } from '../lib/withValidation.js'
import { rateLimit } from '../lib/rateLimit.js'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return await withValidation(async (req, res) => {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
            const { userId, referrerId } = body
            if (!userId || !referrerId) {
                return res.status(400).json({ error: 'Missing userId or referrerId' })
            }
            if (userId === referrerId) {
                return res.status(400).json({ error: 'Cannot self-refer' })
            }
            const allowed = await rateLimit(`referral:${referrerId}`, 20, 60)
            if (!allowed) {
                return res.status(429).json({ error: 'Too many requests. Try again later.' })
            }
            try {
                const existing = await getReferrer(userId)
                if (existing) {
                    return res.json({ ok: true, alreadyRegistered: true })
                }
                await setReferrer(userId, referrerId)
                res.json({ ok: true })
            } catch (error) {
                console.error('Referral register error:', error)
                res.status(500).json({ error: 'Failed to register referral' })
            }
        })(req, res)
    }

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
        const starsUsdRate = await getStarsUsdRate()
        const refBonus = await getReferralBonus(userId)
        const refCount = await getReferralCount(userId)
        res.json({ balances, total, totalDeposits, starsUsdRate, refBonus, refCount })
    } catch (error) {
        console.error('Balance fetch error:', error)
        res.status(500).json({ error: 'Failed to fetch balance' })
    }
}
