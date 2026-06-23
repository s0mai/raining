import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { WalletProvider } from './context/WalletContext'
import { TelegramThemeProvider } from './hooks/useTelegram'
import App from './App'
import './styles/index.css'

// Telegram theme adaptation
const tg = window.Telegram?.WebApp
const isDark = tg?.colorScheme !== 'light'

// Custom dark theme for Stake
const stakeTheme = {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
        colorPrimary: '#00e701',
        colorBgBase: tg?.themeParams?.bg_color || '#0f212e',
        colorBgContainer: tg?.themeParams?.secondary_bg_color || '#1a2c38',
        colorBgElevated: '#2f4553',
        colorBorder: '#2f4553',
        colorText: tg?.themeParams?.text_color || '#ffffff',
        colorTextSecondary: '#b1bad3',
        colorSuccess: '#00e701',
        colorWarning: '#f7931a',
        colorError: '#ed4245',
        colorInfo: '#1475e1',
        borderRadius: 8,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    components: {
        Button: {
            primaryColor: '#000000',
            colorPrimaryHover: '#00c700',
        },
        Input: {
            colorBgContainer: '#0f212e',
            colorBorder: '#2f4553',
            activeBorderColor: '#1475e1',
        },
        InputNumber: {
            colorBgContainer: '#0f212e',
            colorBorder: '#2f4553',
        },
        Tabs: {
            colorBgContainer: '#0f212e',
            itemSelectedColor: '#ffffff',
            itemColor: '#b1bad3',
        },
        Card: {
            colorBgContainer: '#1a2c38',
            colorBorderSecondary: '#2f4553',
        },
        Slider: {
            colorPrimaryBorderHover: '#00e701',
            handleColor: '#00e701',
            trackBg: '#00e701',
            trackHoverBg: '#00c700',
        },
        Tooltip: {
            colorBgSpotlight: '#2f4553',
        },
    },
}

document.getElementById('loadingScreen')?.classList.add('hidden')

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
            <TelegramThemeProvider>
                <ConfigProvider theme={stakeTheme}>
                    <BrowserRouter>
                        <WalletProvider>
                            <App />
                        </WalletProvider>
                    </BrowserRouter>
                </ConfigProvider>
            </TelegramThemeProvider>
        </TonConnectUIProvider>
    </React.StrictMode>
)
