import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { WalletProvider } from './context/WalletContext'
import { UserProvider } from './context/UserContext'
import { TelegramThemeProvider } from './hooks/useTelegram'
import App from './App'
import './styles/index.css'

const tg = window.Telegram?.WebApp
const isDark = tg?.colorScheme !== 'light'

const stakeTheme = {
  algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1475e1',
    colorBgBase: tg?.themeParams?.bg_color || '#0f212e',
    colorBgContainer: tg?.themeParams?.secondary_bg_color || '#1a2c38',
    colorBgElevated: '#2f4553',
    colorBorder: '#2f4553',
    colorText: tg?.themeParams?.text_color || '#ffffff',
    colorTextSecondary: '#b1bad3',
    colorSuccess: '#1475e1',
    colorWarning: '#f7931a',
    colorError: '#ed4245',
    colorInfo: '#1475e1',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Button: {
      primaryColor: '#000000',
      colorPrimaryHover: '#0f5cc0',
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
      colorPrimaryBorderHover: '#1475e1',
      handleColor: '#1475e1',
      trackBg: '#1475e1',
      trackHoverBg: '#0f5cc0',
    },
    Tooltip: {
      colorBgSpotlight: '#2f4553',
    },
  },
}

class TopLevelErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('TopLevelErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.error) {
      return React.createElement('div', {
        style: {
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', padding: 24,
          background: '#0f212e', color: '#b1bad3',
          fontFamily: "'Inter', sans-serif", textAlign: 'center'
        }
      },
        React.createElement('h2', { style: { color: '#ff4444', margin: '0 0 16px' } }, 'Error'),
        React.createElement('p', { style: { margin: '0 0 24px', fontSize: 14, maxWidth: 400 } }, this.state.error.message),
        React.createElement('pre', {
          style: { padding: 16, background: '#1a2c38', borderRadius: 8, fontSize: 11, maxWidth: '100%', overflow: 'auto', textAlign: 'left' }
        }, this.state.error.stack)
      )
    }
    return this.props.children
  }
}

document.getElementById('loadingScreen')?.classList.add('hidden')

ReactDOM.createRoot(document.getElementById('root')).render(
  <TopLevelErrorBoundary>
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={import.meta.env.VITE_MANIFEST_URL || 'https://raining-one.vercel.app/tonconnect-manifest.json'}>
      <TelegramThemeProvider>
        <ConfigProvider theme={stakeTheme}>
          <BrowserRouter>
            <UserProvider>
              <WalletProvider>
                <App />
              </WalletProvider>
            </UserProvider>
          </BrowserRouter>
        </ConfigProvider>
      </TelegramThemeProvider>
    </TonConnectUIProvider>
  </React.StrictMode>
  </TopLevelErrorBoundary>
)
