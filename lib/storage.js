import { Redis } from '@upstash/redis'

const kv = Redis.fromEnv()

const BALANCES_PREFIX = 'balances:'
const DEPOSIT_PREFIX = 'deposit:'
const BONUS_PREFIX = 'bonus:first_deposit:'

const DEFAULT_COINS = { btc: 0, eth: 0, ton: 0, ltc: 0, sol: 0, usdt: 0 }

export async function getBalances(userId) {
    const key = `${BALANCES_PREFIX}${userId}`
    const val = await kv.get(key)
    if (val) {
        try {
            return typeof val === 'string' ? JSON.parse(val) : val
        } catch { /* fall through */ }
    }
    return null
}

export async function setBalances(userId, balances) {
    const key = `${BALANCES_PREFIX}${userId}`
    const rounded = {}
    for (const [coin, amount] of Object.entries(balances)) {
        rounded[coin] = parseFloat(parseFloat(amount).toFixed(2))
    }
    await kv.set(key, JSON.stringify(rounded))
    return rounded
}

export async function initBalances(userId) {
    return setBalances(userId, { ...DEFAULT_COINS })
}

export async function addCoinBalance(userId, coin, amount) {
    let balances = await getBalances(userId)
    if (!balances) {
        balances = { ...DEFAULT_COINS }
    }
    const amt = parseFloat(amount)
    if (!balances[coin]) balances[coin] = 0
    balances[coin] = parseFloat((balances[coin] + amt).toFixed(2))
    return setBalances(userId, balances)
}

export async function deductCoinBalance(userId, coin, amount) {
    let balances = await getBalances(userId)
    if (!balances) {
        balances = { ...DEFAULT_COINS }
    }
    const amt = parseFloat(amount)
    if (!balances[coin]) balances[coin] = 0
    if (amt > balances[coin]) throw new Error('Insufficient balance')
    balances[coin] = parseFloat((balances[coin] - amt).toFixed(2))
    return setBalances(userId, balances)
}

export async function getDepositAddress(userId, currency) {
    const key = `${DEPOSIT_PREFIX}${userId}:${currency}`
    return kv.get(key)
}

export async function setDepositAddress(userId, currency, address, paymentId) {
    const key = `${DEPOSIT_PREFIX}${userId}:${currency}`
    await kv.set(key, JSON.stringify({ address, paymentId, createdAt: Date.now() }))
}

export async function getFirstDepositBonus(userId) {
    const key = `${BONUS_PREFIX}${userId}`
    const val = await kv.get(key)
    if (val) return val
    return null
}

export async function claimFirstDepositBonus(userId) {
    const key = `${BONUS_PREFIX}${userId}`
    const existing = await kv.get(key)
    if (existing) return false
    await kv.set(key, { claimed: true, claimedAt: Date.now() })
    return true
}

// Leaderboard
const LEADERBOARD_KEY = 'lb:deposits'
const USER_META_PREFIX = 'umeta:'
const TOTAL_DEPOSITS_PREFIX = 'totalDeposits:'

export async function updateLeaderboardScore(userId, totalUsd) {
    await kv.zadd(LEADERBOARD_KEY, { score: totalUsd, member: userId })
}

export async function getLeaderboard(limit = 100) {
    const results = await kv.zrange(LEADERBOARD_KEY, 0, limit - 1, { rev: true, withScores: true })
    const entries = []
    for (let i = 0; i < results.length; i += 2) {
        entries.push({ userId: String(results[i]), score: parseFloat(results[i + 1]) || 0 })
    }
    return entries
}

export async function getUserRankAndScore(userId) {
    const [rank, score] = await Promise.all([
        kv.zrevrank(LEADERBOARD_KEY, userId),
        kv.zscore(LEADERBOARD_KEY, userId),
    ])
    if (rank === null || rank === undefined) return null
    return { rank: rank + 1, score: parseFloat(score) || 0 }
}

export async function saveUserMetadata(userId, data) {
    await kv.set(`${USER_META_PREFIX}${userId}`, JSON.stringify(data))
}

export async function getUserMetadata(userId) {
    const raw = await kv.get(`${USER_META_PREFIX}${userId}`)
    if (!raw) return null
    try { return typeof raw === 'string' ? JSON.parse(raw) : raw } catch { return null }
}

export async function getTotalDeposits(userId) {
    const val = await kv.get(`${TOTAL_DEPOSITS_PREFIX}${userId}`)
    return val ? parseFloat(val) : 0
}

export async function setTotalDeposits(userId, amount) {
    await kv.set(`${TOTAL_DEPOSITS_PREFIX}${userId}`, parseFloat(amount).toFixed(2))
}

export async function incrementTotalDeposits(userId, amount) {
    const current = await getTotalDeposits(userId)
    const newTotal = parseFloat((current + parseFloat(amount)).toFixed(2))
    await setTotalDeposits(userId, newTotal)
    await updateLeaderboardScore(userId, newTotal)
    return newTotal
}

export async function clearFakeLeaderboardUsers() {
    const results = await kv.zrange(LEADERBOARD_KEY, 0, -1)
    const fakeMembers = results.filter(m => typeof m === 'string' && m.startsWith('fake_'))
    if (fakeMembers.length > 0) {
        await kv.zrem(LEADERBOARD_KEY, ...fakeMembers)
    }
    return fakeMembers.length
}
