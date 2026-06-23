export default function handler(req, res) {
    const platformWallet = process.env.PLATFORM_TON_WALLET
    if (!platformWallet) {
        return res.status(500).json({ error: 'Platform wallet not configured' })
    }
    res.json({ address: platformWallet })
}
