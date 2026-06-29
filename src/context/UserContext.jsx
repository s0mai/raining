import { createContext, useContext } from 'react'
import { useUser } from '../hooks/useUser'

const UserContext = createContext(null)

export function UserProvider({ children }) {
    const user = useUser()
    return <UserContext.Provider value={{ userId: user.userId, initData: user.initData, displayName: user.displayName, photoUrl: user.photoUrl }}>{children}</UserContext.Provider>
}

export function useUserId() {
    const ctx = useContext(UserContext)
    if (!ctx) throw new Error('useUserId must be used within UserProvider')
    return ctx
}

export default UserContext
