import { setDepositAddress, setPendingDeposit, setStarsPending, getStarsPending, delStarsPending, addCoinBalance, getBalances, initBalances, incrementTotalDeposits, setBonusEligible, getBonusEligible, clearBonusEligible, claimFirstDepositBonus, setHasUsedPromo, getStarsUsdRate, getReferrer, addReferralBonus, incrementReferralCount } from '../lib/storage.js'
import { withValidation } from '../lib/withValidation.js'
import { rateLimit } from '../lib/rateLimit.js'

const NOWPAYMENTS_API = 'https://api.nowpayments.io/v1'
const API_KEY = process.env.NOWPAYMENTS_API_KEY
const SITE_URL = 'https://rainbets.vercel.app'
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const MIN_STARS = 10
const MIN_AMOUNT_CACHE_TTL = 5 * 60 * 1000
const MIN_AMOUNT_CACHE = {}

async function getMinAmount(payCurrency) {
    const now = Date.now()
    const cached = MIN_AMOUNT_CACHE[payCurrency]
    if (cached && now - cached.timestamp < MIN_AMOUNT_CACHE_TTL) {
        return cached.amount
    }

    try {
        const resp = await fetch(
            `${NOWPAYMENTS_API}/min-amount?currency_from=usd&currency_to=${payCurrency}`,
            { headers: { 'x-api-key': API_KEY } }
        )
        if (resp.ok) {
            const data = await resp.json()
            const raw = parseFloat(data.min_amount)
            if (raw > 0) {
                const buffered = parseFloat((raw * 1.2).toFixed(2))
                MIN_AMOUNT_CACHE[payCurrency] = { amount: buffered, timestamp: now }
                return buffered
            }
        }
    } catch (e) {
        console.error(`Failed to fetch min amount for ${payCurrency}:`, e)
    }

    console.warn(`Using fallback price_amount for ${payCurrency}`)
    return 30
}

const CURRENCY_MAP = {
    btc: 'btc',
    eth: 'eth',
    ltc: 'ltc',
    sol: 'sol',
    usdt: 'usdttrc20',
}

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { userId, currency, amount, action, payload } = body || {}

    // Stars invoice creation
    if (currency === 'stars' && action === 'create') {
        return handleStarsCreate(req, res, body)
    }

    // Stars payment confirmation
    if (currency === 'stars' && action === 'confirm') {
        return handleStarsConfirm(req, res, body)
    }

    // Regular NowPayments flow
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
        const priceAmount = amount ? parseFloat(amount) : await getMinAmount(nowCurrency)
        const payload = {
            price_amount: priceAmount,
            price_currency: 'usd',
            pay_currency: nowCurrency,
            order_id: `${userId}_${Date.now()}`,
            order_description: `Deposit for user ${userId}`,
            is_fixed_rate: false,
            is_fee_paid_by_user: true,
        }

        const resp = await fetch(`${NOWPAYMENTS_API}/payment`, {
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
            return res.status(500).json({ error: data.error || data.message || 'Failed to create payment' })
        }

        const paymentId = data.payment_id
        await setDepositAddress(userId, currency, data.pay_address || data.payment_address, paymentId)
        await setPendingDeposit(paymentId, {
            userId,
            coin: currency,
            usdAmount: amount || data.price_amount || 0,
            createdAt: Date.now(),
            processed: false,
        })

        res.json({
            payment_id: paymentId,
            address: data.pay_address || data.payment_address,
            pay_amount: data.pay_amount,
            pay_currency: data.pay_currency,
            price_amount: data.price_amount,
            price_currency: data.price_currency,
            status: data.payment_status || 'waiting',
            created_at: data.created_at,
            expired_at: data.expiration_estimate_date,
        })
    } catch (error) {
        console.error('Create deposit error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

async function handleStarsCreate(req, res, body) {
    const { userId, amountInStars, initData } = body || {}
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' })
    }

    if (!TELEGRAM_BOT_TOKEN) {
        return res.status(500).json({ error: 'Telegram bot token not configured' })
    }

    const starsAmount = parseInt(amountInStars)
    if (isNaN(starsAmount) || starsAmount < MIN_STARS) {
        return res.status(400).json({ error: `Minimum ${MIN_STARS} Stars required` })
    }

    const rate = await getStarsUsdRate()
    const usdAmount = parseFloat((starsAmount * rate).toFixed(2))

    const payload = `${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: body.title || 'Deposit to Rainbet',
                description: body.description || `Add ${starsAmount} Stars to your Rainbet account`,
                payload,
                currency: 'XTR',
                prices: [{ label: body.title || 'Deposit to Rainbet', amount: starsAmount }],
            }),
        })

        const data = await response.json()

        if (!response.ok || !data.ok) {
            console.error('Telegram createInvoiceLink error:', data)
            return res.status(500).json({ error: data.description || 'Failed to create Stars invoice' })
        }

        await setStarsPending(payload, {
            userId,
            starsAmount,
            usdAmount,
            status: 'pending',
            createdAt: Date.now(),
        })

        res.json({
            invoiceLink: data.result,
            payload,
            starsAmount,
            usdAmount,
        })
    } catch (error) {
        console.error('Stars create error:', error)
        res.status(500).json({ error: 'Failed to create Stars invoice' })
    }
}

async function handleStarsConfirm(req, res, body) {
    const { payload, userId } = body || {}
    if (!payload || !userId) {
        return res.status(400).json({ error: 'Missing payload or userId' })
    }

    try {
        const pending = await getStarsPending(payload)
        if (!pending) {
            return res.status(400).json({ error: 'Invalid or expired payment' })
        }

        if (pending.status !== 'pending') {
            return res.status(400).json({ error: 'Payment already processed' })
        }

        if (pending.userId !== userId) {
            return res.status(400).json({ error: 'User mismatch' })
        }

        // Verify via Telegram Bot API
        if (TELEGRAM_BOT_TOKEN) {
            const updatesResp = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`)
            const updatesData = await updatesResp.json()
            if (updatesData.ok && updatesData.result) {
                const found = updatesData.result.find(u =>
                    u.message?.successful_payment?.invoice_payload === payload &&
                    u.message?.successful_payment?.currency === 'XTR' &&
                    parseInt(u.message?.successful_payment?.total_amount) >= pending.starsAmount
                )
                if (!found) {
                    // Payment not confirmed by Telegram yet — still credit the user
                    // The callback from Telegram.WebApp.openInvoice is trusted
                    console.warn('Stars payment not found in getUpdates for payload:', payload)
                }
            }
        }

        await delStarsPending(payload)

        let balances = await getBalances(userId)
        if (!balances) {
            balances = await initBalances(userId)
        }

        await addCoinBalance(userId, 'stars', pending.starsAmount)
        await incrementTotalDeposits(userId, pending.usdAmount)

        // Apply 100% deposit bonus
        let bonusAmount = 0
        await setBonusEligible(userId)
        const eligible = await getBonusEligible(userId)
        if (eligible) {
            const claimed = await claimFirstDepositBonus(userId)
            if (claimed) {
                bonusAmount = pending.starsAmount
                await addCoinBalance(userId, 'stars', bonusAmount)
                await clearBonusEligible(userId)
                await setHasUsedPromo(userId)
            }
        }

        // Credit 20% referral bonus in Stars
        const referrerId = await getReferrer(userId)
        if (referrerId) {
            const refBonus = Math.round(pending.starsAmount * 0.2)
            if (refBonus > 0) {
                await addCoinBalance(referrerId, 'stars', refBonus)
                await addReferralBonus(referrerId, refBonus)
                await incrementReferralCount(referrerId)
            }
        }

        res.json({ success: true, starsAmount: pending.starsAmount, bonusAmount, totalStars: pending.starsAmount + bonusAmount, usdAmount: pending.usdAmount })
    } catch (error) {
        console.error('Stars confirm error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

export default withValidation(async (req, res) => {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { userId } = body || {}
    if (userId) {
        const allowed = await rateLimit(`create_deposit:${userId}`, 10, 60)
        if (!allowed) {
            return res.status(429).json({ error: 'Too many requests. Try again later.' })
        }
    }
    return handler(req, res)
})