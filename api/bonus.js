import { getHasUsedPromo, getFirstDepositBonus, getTotalDeposits, getVipBlocked, claimFirstDepositBonus, getBonusEligible, clearBonusEligible, setHasUsedPromo, setVipBlocked } from '../lib/storage.js'
import { withValidation } from '../lib/withValidation.js'

const handlers = {
    async status(req, res) {
        const { userId } = req.query
        if (!userId) return res.status(400).json({ error: 'Missing userId' })
        const [hasUsedPromo, bonus, totalDeposits, vipBlocked, eligible] = await Promise.all([
            getHasUsedPromo(userId),
            getFirstDepositBonus(userId),
            getTotalDeposits(userId),
            getVipBlocked(userId),
            getBonusEligible(userId),
        ])
        return res.json({ hasUsedPromo, hasUsedBonus: !!bonus, totalDeposits, vipBlocked, claimed: !!bonus, eligible })
    },
    async claim(req, res) {
        const { userId } = req.body
        if (!userId) return res.status(400).json({ error: 'Missing userId' })
        const claimed = await claimFirstDepositBonus(userId)
        if (!claimed) return res.status(409).json({ error: 'Bonus already claimed' })
        await clearBonusEligible(userId)
        return res.json({ claimed: true })
    },
    async markUsed(req, res) {
        const { userId, vipBlock } = req.body
        if (!userId) return res.status(400).json({ error: 'Missing userId' })
        if (vipBlock) {
            await setVipBlocked(userId)
        } else {
            await setHasUsedPromo(userId)
        }
        return res.json({ success: true })
    },
}

async function handler(req, res) {
    if (req.method === 'GET') return handlers.status(req, res)
    if (req.method === 'POST') {
        const { action } = req.body
        if (!action || !handlers[action]) return res.status(400).json({ error: 'Invalid action' })
        return handlers[action](req, res)
    }
    return res.status(405).json({ error: 'Method not allowed' })
}

export default withValidation(handler)
