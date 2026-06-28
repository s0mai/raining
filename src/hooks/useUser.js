import { useState } from 'react'

export function useUser() {
    const [userData] = useState(() => {
        const tg = window.Telegram?.WebApp
        const user = tg?.initDataUnsafe?.user
        return {
            userId: user?.id?.toString() || 'dev_user',
            initData: tg?.initDataRaw || '',
            displayName: user?.first_name
                ? user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.first_name
                : 'Player',
            photoUrl: user?.photo_url || null,
        }
    })
    return userData
}
