import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../UserContext'; // UserContext 경로 확인 필요

const StatusGuard = () => {
    const { user, loading } = useUser();

    if (loading) return null; // 유저 정보 로딩 중에는 대기

    // 핵심: 로그인은 되어 있는데 status가 PENDING이면 어디를 가려든 무조건 리다이렉트
    if (user && user.status === 'PENDING') {
        return <Navigate to="/social-signup-extra" replace />;
    }

    return <Outlet />; // ACTIVE이거나 비로그인이면 통과
};

export default StatusGuard;