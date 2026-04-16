import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../UserContext';

const StatusGuard = () => {
    const { user, loading } = useUser();

    if (loading) return null;

    if (user && user.status === 'PENDING') {
        return <Navigate to="/social-signup-extra" replace />;
    }

    return <Outlet />;
};

export default StatusGuard;