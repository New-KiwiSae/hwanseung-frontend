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

function App() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login';
    return (
        // 전체 레이아웃을 flex로 잡아서 컨텐츠가 적어도 Footer가 항상 바닥에 붙어있게 만듭니다.
        <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

            {!isAuthPage && <Header />}
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
                </Routes>
            </main>

            {!isAuthPage && <Footer />}

        </div>
    );
}

export default App;