import { saveUserMetadata, updateLeaderboardScore, getUserMetadata } from '../../lib/storage.js'
import { Redis } from '@upstash/redis'

const kv = Redis.fromEnv()

const TOP_SCORE = 420000
const BOTTOM_SCORE = 200
const RATIO = TOP_SCORE / BOTTOM_SCORE

function randomScore(base, variance = 0.3) {
    const min = base * (1 - variance)
    const max = base * (1 + variance)
    const raw = min + Math.random() * (max - min)
    return parseFloat(raw.toFixed(2))
}

const NAMES = [
    'Riot', 'Fell', 'SignLTC', 'Cryptoking', 'Luna',
    'Staker99', 'Bitwhale', 'Ethmaxi', 'Plinkopro', 'Dicedegen',
    'Apple', 'Banana', 'Cat', 'Dog', 'Elephant',
    'Forest', 'Garden', 'House', 'Island', 'Jungle',
    'Kitchen', 'Lemon', 'Mountain', 'Ocean', 'Piano',
    'Queen', 'River', 'Sunset', 'Tiger', 'Umbrella',
    'Valley', 'Window', 'Yacht', 'Zero', 'Acorn',
    'Bridge', 'Cloud', 'Diamond', 'Eagle', 'Flower',
    'Guitar', 'Harbor', 'Icicle', 'Jigsaw', 'Kettle',
    'Lantern', 'Meadow', 'Noodle', 'Orange', 'Puzzle',
]

const PFPS = [
    '06911cf69a14ef77db008f1c70180ea9.webp',
    '09fd3f71219e1775a94de410cbea2aff.jpg',
    '0c22db63a3ba65ebf045f5317ed6e989.webp',
    '0cbbf8cf7ed369f0ebeabbc84b82d6a5.webp',
    '128dcecbc3ad301389d6a99af28c5680.webp',
    '12dfbefee9f0933e38c607d983613ebd.webp',
    '151f2d9e7234bac68f4d5f43491c8ef4.webp',
    '174797d378259935f56743f781f04323.webp',
    '1ac504f7316bf43c1a9e9c09af2dde82.webp',
    '1fd9d740515fa7365e07b3e40a95a3d0.webp',
    '2103667b1678fdd167b49fd4f7219fe9.jpg',
    '25003b2155c82481124f95bbd8c09599.webp',
    '28e71e129b120b121e5b79676bab8866.webp',
    '2a6ccfd97d683fd1db4ce6a885a3f713.jpg',
    '2afa912eee5074d2f3ae318b2ea147f3.webp',
    '315e4aebfae1e01a2aa8ee9850d56eac.jpg',
    '3a127ea2a4575ebd90bfd7da495d1809.jpg',
    '3ab53646bd1d294a2750bc5bc47a0acc.webp',
    '3df8833f0adf9e9f59b30da257d17580.webp',
    '4154a65083998a85e753190472cea42e.jpg',
    '43e91bddefb752eb55ba24f218f2474c.webp',
    '499c88ec3769ecd66be408a6fed07767.jpg',
    '4db23482da80c8873a0ae5896d39e967.webp',
    '51a7b11ae5504d67e890409638a89c9e.webp',
    '58e3975e38a003ad56b2ccf7bd4a1d62.webp',
    '5b1d7649639e666cead857409fb3cd8d.jpg',
    '5f1bed792edab12273f2f86f82307339.webp',
    '61444890cb52bb4b8a0c45946a877bc3.webp',
    '693ba2cc11a9a6b7f5c94fe94df9adc6.webp',
    '69a5789bd1f3be4bd631b85707518226.webp',
    '6dcf14394122350d0c338b3010c4e313.jpg',
    '6f5f027fa89e2bca86332b6be9206541.webp',
    '7343ff84cdf96a7d141193c8244ec043.jpg',
    '7601f57a17473be024d6638225cd2d90.webp',
    '7ce7209e259618f3256f273646c77d18.webp',
    '7f59d3651ffcb134c91c7643b19809e8.webp',
    '8292d7783cec70bd9e0671f9230eb1c0.webp',
    '835e52aab18e96ccd9ae11325ee80ca1.jpg',
    '87c8af2c8c37809342bbf7506e7e4cf7.webp',
    '912642539226a7047a5efbea4ef56df2.webp',
    '9910d2d4ef6600c680e52a12097d7406.webp',
    'a04519fb16589b2ba07cf0ced168e8a8.webp',
    'a1a66e43c032bd6c8545a16931e5017b.webp',
    'a3d051250208d0f2075d9f9c09a7d89f.webp',
    'ab0c62b535f71e9477a60dd9e6d55283.jpg',
    'ab17c2864077305a3e7611ff9821b0ba.webp',
    'ac628e15ed690930e0aa3d8325182fd0.jpg',
    'ad5aa2510be99f3303b3cb542cb9554e.jpg',
    'adf59bebe54b8eda0bd08fe96c452ff3.webp',
    'af683fe59a5c624c827b7c2bc2bfb960.webp',
]

export default async function handler(req, res) {
    const LEADERBOARD_KEY = 'lb:deposits'

    const allMembers = await kv.zrange(LEADERBOARD_KEY, 0, -1)
    const fakeMembers = allMembers.filter(m => typeof m === 'string' && m.startsWith('fake_'))

    let pfpIndex = 0
    for (const member of fakeMembers) {
        const meta = await getUserMetadata(member)
        const pfpFile = PFPS[pfpIndex % PFPS.length]
        pfpIndex++
        await saveUserMetadata(member, {
            displayName: meta?.displayName || member.replace('fake_', ''),
            photoUrl: `/images/pfps/1 time use/${pfpFile}`,
        })
    }

    const results = []
    const n = NAMES.length
    for (let i = 0; i < n; i++) {
        const name = NAMES[i]
        const userId = `fake_${name.toLowerCase()}`
        const t = (n - 1 - i) / (n - 1)
        const base = BOTTOM_SCORE * Math.pow(RATIO, t)
        const score = randomScore(base, 0.2 + t * 0.15)
        const photoUrl = `/images/pfps/1 time use/${PFPS[i]}`
        await saveUserMetadata(userId, { displayName: name, photoUrl })
        await updateLeaderboardScore(userId, score)
        results.push(name)
    }

    res.json({
        updatedPfp: fakeMembers.length,
        seeded: results.length,
        users: results,
    })
}
