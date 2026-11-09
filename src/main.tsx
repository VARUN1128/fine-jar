import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FineTrackProvider } from './context/FineTrackContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FineTrackProvider>
          <App />
        </FineTrackProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
