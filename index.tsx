import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// CRITICAL FIX: Unregister any existing Service Workers safely
// We wrap this in a load event listener and try-catch to prevent "document invalid state" errors
// causing the white screen of death before React even mounts.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
        navigator.serviceWorker.getRegistrations()
            .then(function(registrations) {
                for(let registration of registrations) {
                    registration.unregister()
                        .catch(err => console.warn("SW unregister error", err));
                }
            })
            .catch(function(err) {
                console.warn("SW getRegistrations error", err);
            });
    } catch (e) {
        console.warn("ServiceWorker cleanup exception", e);
    }
  });
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary to catch crashes
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: '#F5F7FD', 
          color: '#1F2937',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <circle cx="12" cy="12" r="10"></circle>
               <line x1="12" y1="8" x2="12" y2="12"></line>
               <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>App Failed to Load</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', maxWidth: '300px' }}>
            We encountered a technical issue. Please try clearing your cache or reloading.
          </p>
          <button 
            onClick={() => {
                localStorage.clear();
                window.location.reload();
            }}
            style={{
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            Reload App
          </button>
          {this.state.error && (
            <div style={{ marginTop: '30px', padding: '10px', background: '#FEE2E2', borderRadius: '4px', border: '1px solid #FECACA', maxWidth: '100%', overflow: 'auto' }}>
               <code style={{ fontSize: '10px', color: '#DC2626' }}>{this.state.error.toString()}</code>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);