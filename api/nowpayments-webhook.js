import crypto from 'crypto'
import { addBalance } from '../lib/storage.js'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET
    if (ipnSecret) {
        const signature = req.headers['x-nowpayments-sig']
        if (!signature) {
            return res.status(401).json({ error: 'Missing signature' })
        }
        const hmac = crypto.createHmac('sha512', ipnSecret)
        hmac.update(JSON.stringify(req.body))
        const expected = hmac.digest('hex')
        if (signature !== expected) {
            return res.status(401).json({ error: 'Invalid signature' })
        }
    }

    const { payment_status, order_id, actually_paid_usd, actually_paid, pay_currency, pay_amount } = req.body

    if (!order_id) {
        return res.status(400).json({ error: 'Missing order_id' })
    }

    const userId = order_id.split('_')[0]

    if (payment_status === 'finished') {
        const amount = parseFloat(actually_paid_usd || actually_paid || pay_amount || 0)
        if (amount > 0) {
            await addBalance(userId, amount)
            console.log(`Credited $${amount} USD to user ${userId}`)
        }
    }

    res.json({ received: true })
}
