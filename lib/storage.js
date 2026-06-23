import { Redis } from '@upstash/redis'

const kv = Redis.fromEnv()

const BALANCE_PREFIX = 'balance:'
const DEPOSIT_PREFIX = 'deposit:'

export async function getBalance(userId) {
    const key = `${BALANCE_PREFIX}${userId}`
    const val = await kv.get(key)
    return val !== null && val !== undefined ? parseFloat(val) : 0
}

export async function setBalance(userId, amount) {
    const key = `${BALANCE_PREFIX}${userId}`
    const rounded = parseFloat(amount.toFixed(2))
    await kv.set(key, rounded.toString())
    return rounded
}

export async function addBalance(userId, amount) {
    const current = await getBalance(userId)
    const newBalance = current + parseFloat(amount)
    return setBalance(userId, newBalance)
}

export async function deductBalance(userId, amount) {
    const current = await getBalance(userId)
    const amt = parseFloat(amount)
    if (amt > current) throw new Error('Insufficient balance')
    return setBalance(userId, current - amt)
}

export async function getDepositAddress(userId, currency) {
    const key = `${DEPOSIT_PREFIX}${userId}:${currency}`
    return kv.get(key)
}

export async function setDepositAddress(userId, currency, address, paymentId) {
    const key = `${DEPOSIT_PREFIX}${userId}:${currency}`
    await kv.set(key, JSON.stringify({ address, paymentId, createdAt: Date.now() }))
}
