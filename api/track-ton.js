import { getBalances, setBalances, incrementTotalDeposits } from '../lib/storage.js'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { userId, expectedAmount } = body || {}
    if (!userId || !expectedAmount) {
        return res.status(400).json({ error: 'Missing userId or expectedAmount' })
    }

    const platformWallet = process.env.PLATFORM_TON_WALLET
    const apiKey = process.env.TONCENTER_API_KEY
    const baseUrl = 'https://toncenter.com/api/v2'

    async function getTonUsdPrice() {
        try {
            const resp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd')
            const data = await resp.json()
            return data['the-open-network']?.usd || 6.5
        } catch {
            return 6.5
        }
    }

    try {
        const tonPrice = await getTonUsdPrice()
        const maxAttempts = 20
        for (let i = 0; i < maxAttempts; i++) {
            const url = `${baseUrl}/getTransactions?address=${platformWallet}&limit=20&archival=false${apiKey ? `&api_key=${apiKey}` : ''}`
            const resp = await fetch(url)
            const data = await resp.json()

            if (data.ok && data.result) {
                for (const tx of data.result) {
                    if (tx.in_msg && tx.in_msg.source && tx.in_msg.value) {
                        const value = parseFloat(tx.in_msg.value) / 1e9
                        if (Math.abs(value - parseFloat(expectedAmount)) < 0.001) {
                            const currentBalance = await getBalances(userId)
                            const usdValue = value * tonPrice
                            const newBalances = { ...(currentBalance || {}), ton: (currentBalance?.ton || 0) + usdValue }
                            await setBalances(userId, newBalances)
                            await incrementTotalDeposits(userId, usdValue)
                            return res.json({
                                confirmed: true,
                                amount: value,
                                usdAmount: usdValue,
                                txHash: tx.transaction_id?.hash || tx.hash,
                            })
                        }
                    }
                }
            }

            if (i < maxAttempts - 1) {
                await new Promise(r => setTimeout(r, 3000))
            }
        }

        res.json({ confirmed: false, message: 'Transaction not confirmed within timeout' })
    } catch (error) {
        console.error('TON track error:', error)
        res.status(500).json({ error: 'Failed to track transaction' })
    }
}
