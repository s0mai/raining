import { createHmac } from 'crypto'

export function validateTelegramInitData(initData) {
    if (!initData) return null
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) return null

    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    if (!hash) return null
    params.delete('hash')

    const sorted = [...params.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('\n')

    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
    const expectedHash = createHmac('sha256', secretKey).update(sorted).digest('hex')

    if (expectedHash !== hash) return null

    const authDate = parseInt(params.get('auth_date'), 10)
    if (!authDate || Date.now() / 1000 - authDate > 86400) {
        return null
    }

    const userStr = params.get('user')
    if (!userStr) return null
    try {
        return JSON.parse(userStr)
    } catch {
        return null
    }
}
