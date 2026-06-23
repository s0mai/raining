import { Component } from 'react'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { error: null }
    }

    static getDerivedStateFromError(error) {
        return { error }
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error.message, info.componentStack)
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: 24,
                    background: '#0f212e',
                    color: '#b1bad3',
                    fontFamily: "'Inter', sans-serif",
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚠</div>
                    <h2 style={{ color: '#fff', margin: '0 0 8px' }}>Something went wrong</h2>
                    <p style={{ margin: '0 0 24px', fontSize: 14, maxWidth: 400, lineHeight: 1.5 }}>
                        {this.state.error.message}
                    </p>
                    <button
                        onClick={() => { this.setState({ error: null }); window.location.reload() }}
                        style={{
                            background: '#00e701',
                            color: '#000',
                            border: 'none',
                            padding: '12px 32px',
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        Reload
                    </button>
                    {this.state.error.message && (
                        <pre style={{
                            marginTop: 24,
                            padding: 16,
                            background: '#1a2c38',
                            borderRadius: 8,
                            fontSize: 11,
                            maxWidth: '100%',
                            overflow: 'auto',
                            textAlign: 'left',
                        }}>
                            {this.state.error.stack}
                        </pre>
                    )}
                </div>
            )
        }
        return this.props.children
    }
}
