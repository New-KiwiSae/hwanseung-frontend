import { useState, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Layout from './pages/MyPage/MyPageLayout.jsx';
import MainPage from './pages/MainPage';
import ProductCreatePage from "./pages/Product/ProductCreatePage";
import ProductDetailPage from './pages/Product/ProductDetailPage.jsx';
import ProductListPage from "./pages/Product/ProductListPage";
import ProductEditPage from "./pages/Product/ProductEditPage";
import ReportCreatePage from './pages/Report/ReportCreatePage.jsx';
import ScrollToTop from "./components/ScrollToTop";
import AuthPage from './pages/Auth/AuthPage.jsx';
import MyPage from './pages/MyPage/MyPage.jsx';
import Wishlist from './pages/MyPage/Wishlist';
import Payments from './pages/MyPage/Payments';
import TrustScoreHistory from './pages/MyPage/TrustScoreHistory.jsx'; // 신규 임포트
import './index.css';
import SplashScreen from './components/SplashScreen';
import FloatingChat from './pages/Chat/FloatingChat.jsx';
import NearMePage from '../NearMePage.jsx';
import { UserProvider } from './UserContext';
import Sales from './pages/MyPage/Sales.jsx';
import InfoPage from '../InfoPage.jsx';

import AdminLayout from './pages/Admin/AdminLayout.jsx';
import AdminDashBoard from './pages/Admin/AdminDashBoard.jsx';
import AdminStatistics from './pages/Admin/AdminStatistics.jsx';
import AdminReports from './pages/Admin/AdminReports.jsx';
import AdminUsers from './pages/Admin/AdminUsers.jsx';
import AdminProducts from './pages/Admin/AdminProducts.jsx';
import AdminTransactions from './pages/Admin/AdminTransactions.jsx';
import AdminCategories from './pages/Admin/AdminCategories.jsx';
import AdminChatManage from './pages/Admin/AdminChatManage.jsx';
import AdminChatManager from './pages/Chat/AdminChatManager.jsx';
import AdminAnnouncements from './pages/Admin/AdminAnnouncements.jsx';
import StatusGuard from './pages/Auth/StatusGuard';
import SocialSignupExtra from './pages/Auth/SocialSignupExtra';
import AdminManage from './pages/Admin/AdminManage.jsx';

import AdminInquiries from './pages/Admin/AdminInquiries';
import NoticeDetailPage from "./pages/Notice/NoticeDetailPage";
import NoticeListPage from "./pages/Notice/NoticeListPage";
import Inquiries from "./pages/Inquiry/Inquiries";

import NotificationListPage from "./pages/Notification/NotificationListPage";


function App() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login';
    const isExtraInfoPage = location.pathname === '/social-signup-extra';
    const isAdminPage = location.pathname.startsWith('/admin');
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
        <UserProvider>
            <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {!(isAuthPage || isAdminPage || isExtraInfoPage) && <Header />}
                <main style={{ flexGrow: 1 }}>
                    <ScrollToTop />
                    <Routes>
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/social-signup-extra" element={<SocialSignupExtra />} />

                        <Route path="/" element={<MainPage />} />
                        
                        <Route element={<StatusGuard />}>
                            
                            <Route path="/near-me" element={<NearMePage />} />
                            <Route path="/products" element={<ProductListPage />} />
                            <Route path="/products/:productId" element={<ProductDetailPage />} />
                            <Route path="/products/create" element={<ProductCreatePage />} />
                            <Route path="/products/:productId/edit" element={<ProductEditPage />} />
                            <Route path="/reports/create/:productId" element={<ReportCreatePage />} />
                            <Route path="/info" element={<InfoPage />} />

                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<AdminDashBoard />} />
                                <Route path="dashboard" element={<AdminDashBoard />} />
                                <Route path="statistics" element={<AdminStatistics />} />
                                <Route path="products" element={<AdminProducts />} />
                                <Route path="transactions" element={<AdminTransactions />} />
                                <Route path="categories" element={<AdminCategories />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="reports" element={<AdminReports />} />
                                <Route path="/admin/admin-manage" element={<AdminManage />} />
                                <Route path="chat" element={<AdminChatManager />} />
                                <Route path="announcements" element={<AdminAnnouncements />} />
                                <Route path="inquiries" element={<AdminInquiries />} />
                            </Route>

                            <Route element={<Layout />}>
                                <Route path="/mypage" element={<MyPage />} />
                                <Route path="/sales" element={<Sales />} />
                                <Route path="/payments" element={<Payments />} />
                                <Route path="/wishlist" element={<Wishlist />} />
                                <Route path="trust-score" element={<TrustScoreHistory />} />
                                <Route path="/notices/:id" element={<NoticeDetailPage handler={null} value={null} />} />
                                <Route path="/notices" element={<NoticeListPage />} />
                                <Route path="inquiries" element={<Inquiries />} />
                                <Route path="/notifications" element={<NotificationListPage />} />
                            </Route>

                        </Route>
                    </Routes>
                </main>
                {!(isAuthPage || isAdminPage || isExtraInfoPage) && <Footer />}

                {!(isAuthPage || isAdminPage || isExtraInfoPage) && <FloatingChat />}

            </div>
        </UserProvider>
    );

}
export default App;