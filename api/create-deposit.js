import { setDepositAddress } from '../lib/storage.js'

const NOWPAYMENTS_API = 'https://api.nowpayments.io/v1'
const API_KEY = process.env.NOWPAYMENTS_API_KEY

const CURRENCY_MAP = {
    btc: 'btc',
    eth: 'eth',
    ltc: 'ltc',
    sol: 'sol',
    usdt: 'usdt',
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { userId, currency, amount } = req.body
    if (!userId || !currency) {
        return res.status(400).json({ error: 'Missing userId or currency' })
    }

    const nowCurrency = CURRENCY_MAP[currency]
    if (!nowCurrency) {
        return res.status(400).json({ error: 'Unsupported currency' })
    }

    if (!API_KEY) {
        return res.status(500).json({ error: 'NowPayments API key not configured' })
    }

    try {
        const payload = {
            price_amount: amount ? parseFloat(amount) : undefined,
            price_currency: 'usd',
            pay_currency: nowCurrency,
            ipn_callback_url: `${process.env.VERCEL_URL || 'https://stakeclassics.vercel.app'}/api/nowpayments-webhook`,
            order_id: `${userId}_${Date.now()}`,
            is_fixed_rate: false,
            is_fee_paid_by_user: true,
        }

        if (!payload.price_amount) {
            delete payload.price_amount
        }

        const resp = await fetch(`${NOWPAYMENTS_API}/invoice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
            },
            body: JSON.stringify(payload),
        })

        const data = await resp.json()

        if (!resp.ok) {
            console.error('NowPayments error:', data)
            return res.status(500).json({ error: data.message || 'Failed to create deposit' })
        }

        await setDepositAddress(userId, currency, data.pay_address, data.payment_id)

        res.json({
            payment_id: data.payment_id,
            address: data.pay_address,
            pay_amount: data.pay_amount,
            pay_currency: data.pay_currency,
            price_amount: data.price_amount,
            price_currency: data.price_currency,
            status: data.payment_status,
            created_at: data.created_at,
            expired_at: data.expiration_estimate_date,
        })
    } catch (error) {
        console.error('Create deposit error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
