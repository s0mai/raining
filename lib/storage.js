import { Redis } from '@upstash/redis'

const kv = Redis.fromEnv()

const BALANCES_PREFIX = 'balances:'
const DEPOSIT_PREFIX = 'deposit:'

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
