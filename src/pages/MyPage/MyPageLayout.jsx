    import React, { useState, useEffect } from 'react';
    import { Outlet } from 'react-router-dom';
    import { fetchUser } from '../../api/UserAPI';
    import Sidebar from './MyPageSidebar';
    import './MyPageLayout.css';

    export default function MyPageLayout() {
        const [userInfo, setUserInfo] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetchUser().then(res => {
                setUserInfo(res.data);
                setLoading(false);
            }).catch(() => setLoading(false));
        }, []);

        if (loading) return <div className="mypage-body">로딩 중...</div>;

        return (
            <div className="mypage-body">
                <div className="web-sidebar-layout">
                    {/* 분리한 사이드바 호출 */}
                    <Sidebar userInfo={userInfo} />

                    {/* 우측 메인 콘텐츠 영역 (App.js에서 설정한 Route들이 여기에 뜹니다) */}
                    <main className="main-viewport">
                        <Outlet context={{ userInfo }} /> 
                    </main>
                </div>
            </div>
        );
    }