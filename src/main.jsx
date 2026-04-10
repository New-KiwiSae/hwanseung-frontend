import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "970476509867-7l2au3i2f5qhsv69bi7hm7cicbbeebl5.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. GoogleOAuthProvider로 전체를 감싸줍니다 */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
)
