import { useState, useCallback } from 'react';
import { Routes, Route,useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Layout from './pages/MyPage/MyPageLayout.jsx';
import MainPage from './pages/MainPage';
import ProductCreatePage from "./pages/Product/ProductCreatePage";
import ProductDetailPage from './pages/Product/ProductDetailPage.jsx';
import ProductListPage from "./pages/Product/ProductListPage";
import ProductEditPage from "./pages/Product/ProductEditPage";
import AuthPage from './pages/Auth/AuthPage.jsx';
import AdminChatManager from './pages/Chat/AdminChatManager.jsx';
import TradeChatTest from './pages/Chat/TradeChatTest.jsx';
import MyPage from './pages/MyPage/MyPage.jsx';
import Sales from './pages/MyPage/Sales';
import Purchase from './pages/MyPage/Purchase';
import Wishlist from './pages/MyPage/Wishlist';
import './index.css';
import AdminPage from './pages/Admin/AdminPage.jsx';
import SplashScreen from './components/SplashScreen';
import FloatingChat from './pages/Chat/FloatingChat.jsx';


function App() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login';
    const isAdminPage = location.pathname === '/admin/adminpage';
    const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });

    const handleSplashFinish = useCallback(() => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
    }, []);

    if (showSplash) {
        return <SplashScreen onFinish={handleSplashFinish} />;
    }

    return (
        // 전체 레이아웃을 flex로 잡아서 컨텐츠가 적어도 Footer가 항상 바닥에 붙어있게 만듭니다.
        <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

            {!(isAuthPage || isAdminPage) && <Header />}
            <main style={{ flexGrow: 1 }}>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/products/create" element={<ProductCreatePage />} />
                    <Route path="/products/:productId" element={<ProductDetailPage />} />
                    <Route path="/products" element={<ProductListPage />} />
                    <Route path="/products/:productId/edit" element={<ProductEditPage />} />


                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/admin/adminpage" element={<AdminPage/>} />
                    <Route path="/admin/chat" element={<AdminChatManager />} />
                    <Route path="/test-product" element={<TradeChatTest />} />
                    <Route element={<Layout />}>
                        {/* 각 독립적인 경로 설정 */}
                        <Route path="/mypage" element={<MyPage />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/purchase" element={<Purchase />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                    </Route>
        </Routes>
      </main>
      {!(isAuthPage || isAdminPage) && <Footer />}

      {!(isAuthPage || isAdminPage) && <FloatingChat />}
      
    </div>
  );
}

export default App;