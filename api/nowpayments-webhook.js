import { addCoinBalance } from '../lib/storage.js'

const COIN_MAP = {
    btc: 'btc', bitcoin: 'btc',
    eth: 'eth', ethereum: 'eth',
    ton: 'ton', theopenetwork: 'ton',
    ltc: 'ltc', litecoin: 'ltc',
    sol: 'sol', solana: 'sol',
    usdt: 'usdt', usdtt: 'usdt', tether: 'usdt',
}

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return res.status(200).json({ status: 'active', endpoint: 'NowPayments IPN webhook', accepts: 'POST' })
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    const { payment_status, order_id, actually_paid_usd, actually_paid, pay_currency, pay_amount } = body || {}

    if (!order_id) {
        return res.status(400).json({ error: 'Missing order_id' })
    }

    const userId = order_id.split('_')[0]
    const coin = COIN_MAP[(pay_currency || '').toLowerCase()] || 'btc'

    if (payment_status === 'finished') {
        const amount = parseFloat(actually_paid_usd || actually_paid || pay_amount || 0)
        if (amount > 0) {
            await addCoinBalance(userId, coin, amount)
            console.log(`Credited $${amount} to user ${userId} (${coin})`)
        }
    }

    res.json({ received: true })
}
