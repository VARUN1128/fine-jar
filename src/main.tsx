import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FineTrackProvider } from './context/FineTrackContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <FineTrackProvider>
        <App />
      </FineTrackProvider>
    </AuthProvider>
  </React.StrictMode>
);
