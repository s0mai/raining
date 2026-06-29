import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { App as AntApp } from 'antd'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import RouteLoadingOverlay from './components/RouteLoadingOverlay'
import WelcomeBonusPopup from './components/WelcomeBonusPopup'
import { useWallet } from './context/WalletContext'
const HomePage = lazy(() => import('./pages/HomePage'))
const CrashPage = lazy(() => import('./pages/CrashPage'))
const PlinkoPage = lazy(() => import('./pages/PlinkoPage'))
const DicePage = lazy(() => import('./pages/DicePage'))
const LimboPage = lazy(() => import('./pages/LimboPage'))
const MinesPage = lazy(() => import('./pages/MinesPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const DepositPage = lazy(() => import('./pages/DepositPage'))

function App() {
    const { activeLang } = useWallet()
    return (
        <AntApp>
            <WelcomeBonusPopup />
            <ErrorBoundary lang={activeLang}>
                <RouteLoadingOverlay />
                <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Suspense fallback={null}><HomePage /></Suspense>} />
                    <Route path="crash" element={<Suspense fallback={null}><CrashPage /></Suspense>} />
                    <Route path="plinko" element={<Suspense fallback={null}><PlinkoPage /></Suspense>} />
                    <Route path="dice" element={<Suspense fallback={null}><DicePage /></Suspense>} />
                    <Route path="limbo" element={<Suspense fallback={null}><LimboPage /></Suspense>} />
                    <Route path="mines" element={<Suspense fallback={null}><MinesPage /></Suspense>} />
                    <Route path="profile" element={<Suspense fallback={null}><ProfilePage /></Suspense>} />
                    <Route path="leaderboard" element={<Suspense fallback={null}><LeaderboardPage /></Suspense>} />
                </Route>
                <Route path="/deposit" element={<Suspense fallback={null}><DepositPage /></Suspense>} />
            </Routes>
            </ErrorBoundary>
        </AntApp>
    )
}

export default App


