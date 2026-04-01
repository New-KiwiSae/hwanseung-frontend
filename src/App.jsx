import { useState, useCallback } from 'react';
import { Routes, Route,useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import ProductCreatePage from "./pages/Product/ProductCreatePage";
import AuthPage from './pages/AuthPage.jsx';
import './index.css';
import Sidebar from './components/Sidebar'
import SplashScreen from './components/SplashScreen';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';
  const isSidebar = location.pathname === '/sidebar';
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  if (showSplash) {
      return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    // 전체 레이아웃을 flex로 잡아서 컨텐츠가 적어도 Footer가 항상 바닥에 붙어있게 만듭니다.
    <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {!(isAuthPage || isSidebar) && <Header />}
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/products/create" element={<ProductCreatePage />} />

          <Route path="/login" element={<AuthPage />} />
          <Route path="/sidebar" element={<Sidebar />} />
        </Routes>
      </main>
      {!(isAuthPage || isSidebar) && <Footer />}
      
    </div>
  );
}

export default App;