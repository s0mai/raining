import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import './RouteLoadingOverlay.css'

function RouteLoadingOverlay() {
    const location = useLocation()
    const elRef = useRef(null)
    const prevPath = useRef(location.pathname)
    const timers = useRef([])

    useEffect(() => {
        if (location.pathname !== prevPath.current) {
            prevPath.current = location.pathname
            timers.current.forEach(clearTimeout)
            timers.current = []

            const el = elRef.current
            if (!el) return

            el.classList.remove('exit')
            el.classList.add('visible')

            const t1 = setTimeout(() => el.classList.add('logo-visible'), 200)
            const t2 = setTimeout(() => {
                el.classList.remove('visible')
                el.classList.add('exit')
            }, 1200)
            const t3 = setTimeout(() => {
                el.classList.remove('exit', 'logo-visible')
            }, 1500)

            timers.current = [t1, t2, t3]
        }
    }, [location.pathname])

    return (
        <div ref={elRef} className="route-loading-overlay">
            <img src="/images/loadingrainbet.webp" alt="Rainbet" className="route-loading-logo" />
        </div>
    )
}

export default RouteLoadingOverlay
