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

    const sideBarhandler = () => {
        let classNameList = document.querySelector('.sidebar').classList;
        if(classNameList.length === 1 ) document.querySelector('.sidebar').classList.add('toggle');
        else document.querySelector('.sidebar').classList.remove('toggle');        
    };

    if (loading) return <div className="mypage-body">로딩 중...</div>;

    return (
        <>
            <div className="mypage-body">
                <div className="web-sidebar-layout">
                    <Sidebar userInfo={userInfo} />

                    <main className="main-viewport">
                        <Outlet context={{ userInfo }} />
                    </main>
                </div>
                
                <div className='floatMyMenuIcon' onClick={sideBarhandler}><i className="fas fa-align-justify"></i></div>
            </div>
        </>
    );
}