import { getPendingDeposit, markDepositProcessed, addCoinBalance, incrementTotalDeposits, setBonusEligible, getReferrer, addReferralBonus, incrementReferralCount } from '../lib/storage.js'

const API_KEY = process.env.NOWPAYMENTS_API_KEY

const COIN_MAP = {
    btc: 'btc', bitcoin: 'btc',
    eth: 'eth', ethereum: 'eth',
    ton: 'ton', theopenetwork: 'ton',
    ltc: 'ltc', litecoin: 'ltc',
    sol: 'sol', solana: 'sol',
    usdt: 'usdt', usdtt: 'usdt', usdttrc20: 'usdt', usdterc20: 'usdt', usdtbep20: 'usdt', tether: 'usdt',
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { paymentId, userId } = req.query
    if (!paymentId) {
        return res.status(400).json({ error: 'Missing paymentId' })
    }

    if (!API_KEY) {
        return res.status(500).json({ error: 'NowPayments API key not configured' })
    }

    try {
        const pending = await getPendingDeposit(paymentId)
        if (!pending) {
            return res.json({ status: 'unknown', message: 'No pending deposit found for this payment ID' })
        }

        if (pending.processed) {
            return res.json({ status: 'finished', message: 'Already credited' })
        }

        const npResp = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
            headers: { 'x-api-key': API_KEY },
        })

        if (!npResp.ok) {
            const errText = await npResp.text()
            console.error(`NowPayments API error for payment ${paymentId}:`, errText)
            return res.json({ status: 'error', message: 'Failed to check payment status' })
        }

        const paymentData = await npResp.json()
        const npStatus = paymentData.payment_status

        if (npStatus === 'finished') {
            const coin = COIN_MAP[(paymentData.pay_currency || '').toLowerCase()] || pending.coin || 'btc'
            const amount = parseFloat(paymentData.actually_paid_usd || paymentData.actually_paid || pending.usdAmount || 0)

            if (amount > 0) {
                await addCoinBalance(pending.userId, coin, amount)
                await incrementTotalDeposits(pending.userId, amount)
                await setBonusEligible(pending.userId)

                const referrerId = await getReferrer(pending.userId)
                if (referrerId) {
                    const refBonus = parseFloat((amount * 0.2).toFixed(2))
                    if (refBonus > 0) {
                        await addCoinBalance(referrerId, coin, refBonus)
                        await addReferralBonus(referrerId, refBonus)
                        await incrementReferralCount(referrerId)
                    }
                }

                await markDepositProcessed(paymentId)

                return res.json({
                    status: 'finished',
                    amount,
                    coin,
                    pay_amount: paymentData.pay_amount,
                    pay_currency: paymentData.pay_currency,
                })
            }
        }

        return res.json({
            status: npStatus || 'waiting',
            pay_amount: paymentData.pay_amount,
            pay_currency: paymentData.pay_currency,
            created_at: paymentData.created_at,
            expiration_estimate_date: paymentData.expiration_estimate_date,
        })
    } catch (error) {
        console.error('check-deposit error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
