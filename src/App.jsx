import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Layout from './components/MyPageLayout';
import MainPage from './pages/MainPage';
import ProductCreatePage from "./pages/Product/ProductCreatePage";
import AuthPage from './pages/AuthPage.jsx';
import AdminChatManager from './components/AdminChatManager.jsx';
import MyPage from './pages/MyPage';
import Sales from './pages/Sales';
import Purchase from './pages/Purchase';
import Wishlist from './pages/Wishlist';
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
          <Route path="/admin/chat" element={<AdminChatManager />} />
          <Route element={<Layout />}>
            {/* 각 독립적인 경로 설정 */}
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/purchase" element={<Purchase />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Route>
          <Route path="/sidebar" element={<Sidebar />} />
        </Routes>
      </main>
      {!(isAuthPage || isSidebar) && <Footer />}

    </div>
  );
}

export default App;