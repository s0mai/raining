import { Redis } from '@upstash/redis'

const kv = Redis.fromEnv()

const BALANCES_PREFIX = 'balances:'
const DEPOSIT_PREFIX = 'deposit:'
const BONUS_PREFIX = 'bonus:first_deposit:'

const DEFAULT_COINS = { btc: 0, eth: 0, ton: 0, ltc: 0, sol: 0, usdt: 0, stars: 0 }

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

const ADD_SCRIPT = `
local raw = redis.call('GET', KEYS[1])
local balances = {}
if raw then balances = cjson.decode(raw) end
local coin = ARGV[1]
local amount = tonumber(ARGV[2])
local current = (balances[coin] or 0)
current = math.floor((current + amount) * 100 + 0.5) / 100
balances[coin] = current
redis.call('SET', KEYS[1], cjson.encode(balances))
return cjson.encode(balances)
`

const DEDUCT_SCRIPT = `
local raw = redis.call('GET', KEYS[1])
if not raw then return '{"error":"no_balance"}' end
local balances = cjson.decode(raw)
local coin = ARGV[1]
local amount = tonumber(ARGV[2])
local current = (balances[coin] or 0)
if current < amount then return '{"error":"insufficient"}' end
current = math.floor((current - amount) * 100 + 0.5) / 100
balances[coin] = current
redis.call('SET', KEYS[1], cjson.encode(balances))
return cjson.encode(balances)
`

export async function addCoinBalance(userId, coin, amount) {
    const key = `${BALANCES_PREFIX}${userId}`
    const result = await kv.eval(ADD_SCRIPT, [key], [coin, String(amount)])
    return JSON.parse(result)
}

export async function deductCoinBalance(userId, coin, amount) {
    const key = `${BALANCES_PREFIX}${userId}`
    const result = await kv.eval(DEDUCT_SCRIPT, [key], [coin, String(amount)])
    const parsed = JSON.parse(result)
    if (parsed.error === 'insufficient') throw new Error('Insufficient balance')
    if (parsed.error === 'no_balance') throw new Error('Insufficient balance')
    return parsed
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

const INCR_DEPOSITS_SCRIPT = `
local current = tonumber(redis.call('GET', KEYS[1])) or 0
local amount = tonumber(ARGV[1])
local newTotal = math.floor((current + amount) * 100 + 0.5) / 100
redis.call('SET', KEYS[1], tostring(newTotal))
redis.call('ZADD', KEYS[2], newTotal, ARGV[2])
return tostring(newTotal)
`

export async function incrementTotalDeposits(userId, amount) {
    const totalKey = `${TOTAL_DEPOSITS_PREFIX}${userId}`
    const result = await kv.eval(INCR_DEPOSITS_SCRIPT, [totalKey, LEADERBOARD_KEY], [String(amount), userId])
    return parseFloat(result)
}

const PROMO_USED_PREFIX = 'has_used_promo:'

export async function setHasUsedPromo(userId) {
    await kv.set(`${PROMO_USED_PREFIX}${userId}`, '1')
}

export async function getHasUsedPromo(userId) {
    const val = await kv.get(`${PROMO_USED_PREFIX}${userId}`)
    return !!val
}

const VIP_BLOCKED_PREFIX = 'vip_blocked:'

export async function setVipBlocked(userId) {
    await kv.set(`${VIP_BLOCKED_PREFIX}${userId}`, '1')
}

export async function getVipBlocked(userId) {
    const val = await kv.get(`${VIP_BLOCKED_PREFIX}${userId}`)
    return val === '1'
}

const BONUS_ELIGIBLE_PREFIX = 'bonus_eligible:'

export async function setBonusEligible(userId) {
    await kv.set(`${BONUS_ELIGIBLE_PREFIX}${userId}`, '1')
}

export async function getBonusEligible(userId) {
    const val = await kv.get(`${BONUS_ELIGIBLE_PREFIX}${userId}`)
    return val === '1'
}

export async function clearBonusEligible(userId) {
    await kv.del(`${BONUS_ELIGIBLE_PREFIX}${userId}`)
}

const STARS_PENDING_PREFIX = 'stars_pending:'

export async function setStarsPending(payload, data) {
    await kv.set(`${STARS_PENDING_PREFIX}${payload}`, JSON.stringify(data), { ex: 3600 })
}

export async function getStarsPending(payload) {
    const raw = await kv.get(`${STARS_PENDING_PREFIX}${payload}`)
    if (!raw) return null
    try { return typeof raw === 'string' ? JSON.parse(raw) : raw } catch { return null }
}

export async function delStarsPending(payload) {
    await kv.del(`${STARS_PENDING_PREFIX}${payload}`)
}

const STARS_USD_RATE_KEY = 'config:stars_usd_rate'

export async function getStarsUsdRate() {
    const val = await kv.get(STARS_USD_RATE_KEY)
    if (val !== null && val !== undefined) {
        return parseFloat(val)
    }
    return 0.025
}

export async function setStarsUsdRate(rate) {
    await kv.set(STARS_USD_RATE_KEY, parseFloat(rate).toString())
}

// Referral system
const REFERRAL_PREFIX = 'referral:'
const REFERRAL_BONUS_PREFIX = 'ref_bonus:'
const REFERRAL_COUNT_PREFIX = 'ref_count:'

export async function setReferrer(userId, referrerId) {
  await kv.set(`${REFERRAL_PREFIX}${userId}`, referrerId)
}

export async function getReferrer(userId) {
  return kv.get(`${REFERRAL_PREFIX}${userId}`)
}

export async function addReferralBonus(referrerId, amount) {
  const key = `${REFERRAL_BONUS_PREFIX}${referrerId}`
  const current = parseFloat(await kv.get(key)) || 0
  const newTotal = parseFloat((current + amount).toFixed(2))
  await kv.set(key, newTotal.toString())
  return newTotal
}

export async function getReferralBonus(referrerId) {
  const val = await kv.get(`${REFERRAL_BONUS_PREFIX}${referrerId}`)
  return parseFloat(val) || 0
}

export async function incrementReferralCount(referrerId) {
  await kv.incr(`${REFERRAL_COUNT_PREFIX}${referrerId}`)
}

export async function getReferralCount(referrerId) {
  const val = await kv.get(`${REFERRAL_COUNT_PREFIX}${referrerId}`)
  return parseInt(val) || 0
}

// Pending deposit tracking for polling-based verification
const PENDING_DEPOSIT_PREFIX = 'pending_deposit:'

export async function setPendingDeposit(paymentId, data) {
    await kv.set(`${PENDING_DEPOSIT_PREFIX}${paymentId}`, JSON.stringify(data), { ex: 86400 })
}

export async function getPendingDeposit(paymentId) {
    const raw = await kv.get(`${PENDING_DEPOSIT_PREFIX}${paymentId}`)
    if (!raw) return null
    try { return typeof raw === 'string' ? JSON.parse(raw) : raw } catch { return null }
}

export async function markDepositProcessed(paymentId) {
    await kv.del(`${PENDING_DEPOSIT_PREFIX}${paymentId}`)
}

export async function clearFakeLeaderboardUsers() {
    const results = await kv.zrange(LEADERBOARD_KEY, 0, -1)
    const fakeMembers = results.filter(m => typeof m === 'string' && m.startsWith('fake_'))
    if (fakeMembers.length > 0) {
        await kv.zrem(LEADERBOARD_KEY, ...fakeMembers)
    }
    return fakeMembers.length
}
