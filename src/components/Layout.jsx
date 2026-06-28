import { Outlet, NavLink } from 'react-router-dom'
import Header from './Header'
import { useWallet } from '../context/WalletContext'

function Layout() {
    const { t } = useWallet()
    const bottomNav = [
        { icon: 'games', label: t('nav.games'), path: '/' },
        { icon: 'user', label: t('nav.profile'), path: '/profile' },
    ]

    return (
        <div className="app-layout">
            <div className="app-main-wrapper">
                <Header />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
            {bottomNav.length > 0 && (
                <nav className="bottom-nav">
                    {bottomNav.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <img src={`/images/${item.icon}.svg`} alt={item.label} className="bottom-nav-icon" />
                            <span className="bottom-nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            )}
        </div>
    )
}

export default Layout
