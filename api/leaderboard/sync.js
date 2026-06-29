import { getUserRankAndScore, saveUserMetadata, getTotalDeposits, updateLeaderboardScore, incrementTotalDeposits, getBalances } from '../../lib/storage.js'

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { userId, displayName, photoUrl, depositAmount } = req.body
    if (!userId) return res.status(400).json({ error: 'Missing userId' })

    if (displayName) {
        await saveUserMetadata(userId, { displayName, photoUrl: photoUrl || '' })
    }

    let totalDeposits = await getTotalDeposits(userId)
    if (totalDeposits === 0) {
        let bootstrapAmount = depositAmount || 0
        if (!bootstrapAmount) {
            const balances = await getBalances(userId)
            if (balances) {
                bootstrapAmount = Object.values(balances).reduce((s, v) => s + v, 0)
            }
        }
        if (bootstrapAmount > 0) {
            totalDeposits = await incrementTotalDeposits(userId, bootstrapAmount)
        }
    } else if (totalDeposits > 0) {
        await updateLeaderboardScore(userId, totalDeposits)
    }

    const rankData = totalDeposits > 0 ? await getUserRankAndScore(userId) : null

    res.json({
        rank: rankData?.rank || 0,
        score: rankData?.score || totalDeposits || 0,
        verified: (rankData?.score || totalDeposits || 0) >= 1000,
    })
}