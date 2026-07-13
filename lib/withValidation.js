import { validateTelegramInitData } from './validateTelegram.js'

function getBody(req) {
    if (req.body && typeof req.body === 'object') return req.body
    if (typeof req.body === 'string') {
        try { return JSON.parse(req.body) } catch { return {} }
    }
    return {}
}

export function withValidation(handler) {
    return async (req, res) => {
        const body = getBody(req)
        const initData = req.headers['x-telegram-init-data'] || body.initData || req.query?.initData
        if (initData) {
            const user = validateTelegramInitData(initData)
            if (!user) {
                return res.status(403).json({ error: 'Invalid Telegram authentication' })
            }
            const bodyUserId = body.userId || req.query?.userId
            if (bodyUserId && String(user.id) !== String(bodyUserId)) {
                return res.status(403).json({ error: 'User ID mismatch' })
            }
        }
        return handler(req, res)
    }
}
