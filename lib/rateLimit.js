import { Redis } from '@upstash/redis'
const kv = Redis.fromEnv()

export async function rateLimit(key, maxRequests, windowSeconds = 60) {
    const redisKey = `ratelimit:${key}`
    const current = await kv.incr(redisKey)
    if (current === 1) {
        await kv.expire(redisKey, windowSeconds)
    }
    return current <= maxRequests
}