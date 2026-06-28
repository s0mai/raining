import { createContext, useContext } from 'react'
import { useUser } from '../hooks/useUser'

const UserContext = createContext(null)

export function UserProvider({ children }) {
    const { userId, initData } = useUser()
    return <UserContext.Provider value={{ userId, initData }}>{children}</UserContext.Provider>
}

export function useUserId() {
    const ctx = useContext(UserContext)
    if (!ctx) throw new Error('useUserId must be used within UserProvider')
    return ctx
}

export default UserContext
