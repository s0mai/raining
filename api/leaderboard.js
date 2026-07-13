import { getLeaderboard, getUserMetadata, getUserRankAndScore } from '../lib/storage.js'

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

    const limit = Math.min(parseInt(req.query.limit) || 100, 200)
    const entries = await getLeaderboard(limit)

    let leaderboard = await Promise.all(entries.map(async (entry, idx) => {
        const meta = await getUserMetadata(entry.userId) || {}
        return {
            userId: entry.userId,
            rank: idx + 1,
            score: entry.score,
            displayName: meta.displayName || 'Player',
            photoUrl: meta.photoUrl || null,
            verified: entry.score > 0,
        }
    }))

    const reqUserId = req.query.userId
    if (reqUserId) {
        const inList = leaderboard.some(e => String(e.userId) === String(reqUserId))
        if (inList) {
            leaderboard = leaderboard.map(e => ({
                ...e,
                isCurrentUser: String(e.userId) === String(reqUserId),
            }))
        } else {
            const rankData = await getUserRankAndScore(reqUserId)
            if (rankData?.score > 0) {
                const meta = await getUserMetadata(String(reqUserId)) || {}
                leaderboard.push({
                    userId: String(reqUserId),
                    rank: rankData.rank || 0,
                    score: rankData.score,
                    displayName: meta.displayName || 'Player',
                    photoUrl: meta.photoUrl || null,
                    verified: true,
                    isCurrentUser: true,
                })
            }
        }
    }

    res.json({ leaderboard })
}
