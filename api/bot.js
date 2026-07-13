const BASE = 'https://rainbets.vercel.app'
const WELCOME_IMG = BASE + '/images/start.jpg?v=2'
const MINI_APP_URL = BASE

const WELCOME_TEXTS = {
    en: 'Play at Rainbet, online crypto games and fast withdrawals.\nEnjoy a welcome bonus, code "WELCOME" to get $1000.',
    hi: 'Rainbet पर खेलें, ऑनलाइन क्रिप्टो गेम्स और तेज़ निकासी।\n"WELCOME" कोड डालकर $1000 का वेलकम बोनस पाएं।',
    ru: 'Играйте в Rainbet — онлайн крипто-игры и быстрый вывод средств.\nПолучите приветственный бонус $1000 по коду "WELCOME".',
    id: 'Bermain di Rainbet, game kripto online dan penarikan cepat.\nNikmati bonus sambutan, kode "WELCOME" untuk mendapatkan $1000.',
    pt: 'Jogue no Rainbet, jogos de cripto online e saques rápidos.\nGanhe um bônus de boas-vindas, código "WELCOME" para receber $1000.',
    de: 'Spiele bei Rainbet, Online-Crypto-Spiele und schnelle Auszahlungen.\nSichere dir einen Willkommensbonus, Code "WELCOME" für $1000.',
    fr: 'Jouez sur Rainbet, jeux crypto en ligne et retraits rapides.\nProfitez d\'un bonus de bienvenue, code "WELCOME" pour obtenir 400$.',
    es: 'Juega en Rainbet, juegos crypto online y retiros rápidos.\nDisfruta un bono de bienvenida, código "WELCOME" para obtener $1000.',
    uz: 'Rainbet\'da o\'ynang, onlayn kripto o\'yinlari va tez yechib olish.\n"WELCOME" kodi bilan $1000 miqdorida xush kelibsiz bonusiga ega bo\'ling.',
    uk: 'Грайте в Rainbet — онлайн крипто-ігри та швидке виведення.\nОтримайте вітальний бонус $1000 за кодом "WELCOME".',
    fil: 'Maglaro sa Rainbet, online crypto games at mabilis na withdrawal.\nMakuha ang welcome bonus, code "WELCOME" para sa $1000.',
    ur: 'Rainbet پر کھیلیں، آن لائن کرپٹو گیمز اور تیز نکاسی۔\n"WELCOME" کوڈ استعمال کر کے $1000 کا خوش آمدید بونس حاصل کریں۔',
    ar: 'العب في Rainbet، ألعاب الكريبتو عبر الإنترنت والسحب السريع.\nاستمتع بمكافأة ترحيبية، الكود "WELCOME" للحصول على $1000.',
    fa: 'در Rainbet بازی کنید، بازی‌های کریپتو آنلاین و برداشت سریع.\nاز پاداش خوش‌آمدگویی با کد "WELCOME" به ارزش 400 دلار بهره‌مند شوید.',
    kk: 'Rainbet-те ойнаңыз, онлайн крипто ойындары және жылдам алу.\n"WELCOME" коды арқылы $1000 қарсы алу бонусын алыңыз.',
}

function detectLang(code) {
    const map = {
        en: 'en', hi: 'hi', ru: 'ru', id: 'id',
        pt: 'pt', 'pt-br': 'pt', 'pt-pt': 'pt',
        de: 'de', fr: 'fr', es: 'es',
        uz: 'uz', uk: 'uk', fil: 'fil', tl: 'fil',
        ur: 'ur', ar: 'ar', fa: 'fa', kk: 'kk',
    }
    return map[code] || 'en'
}

async function sendWelcome(token, chatId, lang = 'en') {
    await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            photo: WELCOME_IMG,
            caption: WELCOME_TEXTS[lang] || WELCOME_TEXTS.en,
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Play 🎮', web_app: { url: MINI_APP_URL } }],
                    [{ text: 'Support 💬', url: 'https://t.me/RainbetOriginal' }],
                ],
            },
        }),
    })
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end('Send POST')

    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) return res.status(500).json({ error: 'Bot token not configured' })

    const update = req.body
    const msg = update?.message
    if (!msg?.text) return res.status(200).json({ ok: true })

    const text = msg.text.trim()
    const chatId = msg.chat.id

    if (text.startsWith('/start')) {
        const lang = detectLang(msg.from?.language_code)
        await sendWelcome(token, chatId, lang)
    }

    return res.status(200).json({ ok: true })
}
