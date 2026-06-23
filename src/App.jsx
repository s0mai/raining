import { Routes, Route } from 'react-router-dom'
import { App as AntApp } from 'antd'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CrashPage from './pages/CrashPage'
import PlinkoPage from './pages/PlinkoPage'
import DicePage from './pages/DicePage'
import LimboPage from './pages/LimboPage'
import MinesPage from './pages/MinesPage'
import DepositPage from './pages/DepositPage'
import RouteLoadingOverlay from './components/RouteLoadingOverlay'

function App() {
    return (
        <AntApp>
            <RouteLoadingOverlay />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="crash" element={<CrashPage />} />
                    <Route path="plinko" element={<PlinkoPage />} />
                    <Route path="dice" element={<DicePage />} />
                    <Route path="limbo" element={<LimboPage />} />
                    <Route path="mines" element={<MinesPage />} />
                </Route>
                <Route path="/deposit" element={<DepositPage />} />
            </Routes>
        </AntApp>
    )
}

export default App


