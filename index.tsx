import React, { Component, ErrorInfo, ReactNode, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { Loader } from 'lucide-react';

// Lazy load App so that import errors are caught by ErrorBoundary
const App = lazy(() => import('./App'));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary to prevent White Screen of Death
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
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', marginTop: '50px', backgroundColor: '#FEF2F2', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ color: '#DC2626', fontSize: '24px', marginBottom: '10px' }}>Something went wrong.</h1>
          <p style={{ color: '#4B5563', marginBottom: '20px' }}>The app encountered an error while loading.</p>
          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #FECACA', maxWidth: '90%', overflow: 'auto', textAlign: 'left' }}>
            <code style={{ color: '#EF4444', fontSize: '12px' }}>
              {this.state.error && this.state.error.toString()}
            </code>
          </div>
          <button 
            onClick={() => {
                localStorage.clear(); // Clear cache as it might be the cause
                window.location.reload();
            }} 
            style={{ marginTop: '25px', padding: '12px 24px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            Clear Cache & Reload
          </button>
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
      <Suspense fallback={
        <div style={{ height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F6F8' }}>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
             <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
             <p style={{ marginTop: '15px', color: '#16a34a', fontWeight: 'bold', fontFamily: 'sans-serif' }}>Loading VegHaat...</p>
           </div>
        </div>
      }>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);