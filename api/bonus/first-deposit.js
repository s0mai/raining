import { getFirstDepositBonus, claimFirstDepositBonus } from '../../lib/storage.js'

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { userId } = req.query
        if (!userId) return res.status(400).json({ error: 'Missing userId' })
        try {
            const bonus = await getFirstDepositBonus(userId)
            return res.json({ claimed: !!bonus })
        } catch (e) {
            console.error('First deposit bonus GET error:', e)
            return res.status(500).json({ error: 'Failed to check bonus' })
        }
    }

    if (req.method === 'POST') {
        const { userId } = req.body
        if (!userId) return res.status(400).json({ error: 'Missing userId' })
        try {
            const claimed = await claimFirstDepositBonus(userId)
            if (!claimed) return res.status(409).json({ error: 'Bonus already claimed' })
            return res.json({ claimed: true })
        } catch (e) {
            console.error('First deposit bonus POST error:', e)
            return res.status(500).json({ error: 'Failed to claim bonus' })
        }
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
