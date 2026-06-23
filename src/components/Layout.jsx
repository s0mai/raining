import { Outlet, NavLink } from 'react-router-dom'
import Header from './Header'

const bottomNav = [
  { icon: 'crash', label: 'Crash', path: '/crash' },
  { icon: 'dice', label: 'Dice', path: '/dice' },
  { icon: 'limbo', label: 'Limbo', path: '/limbo' },
  { icon: 'plinko', label: 'Plinko', path: '/plinko' },
  { icon: 'mines', label: 'Mines', path: '/mines' },
]

function Layout() {

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
