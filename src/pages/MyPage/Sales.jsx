import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import '../MyPage.css';
import './my-sales.css'; 
import MyPageSidebar from './MyPageSidebar';
import { useUser } from '../../UserContext';

export default function Sales() {
    const { userInfo } = useUser();
    const navigate = useNavigate();
    
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMySales = async () => {
            const token = sessionStorage.getItem("accessToken");
            
            if (!token) {
                alert("로그인이 필요한 서비스입니다.");
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get('/api/products/my-sales', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setMyProducts(response.data);
            } catch (error) {
                console.error("판매 내역을 불러오지 못했습니다.", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMySales();
    }, [navigate]);

    return (
        <div className="main-viewport">
            <div className="content-view">
                
                <h2 className="sales-title">
                    <i className="fas fa-box-open"></i> 내 판매 내역
                </h2>

                {loading && <p style={{ textAlign: 'center', padding: '50px' }}>데이터를 불러오는 중입니다...</p>}

                {!loading && myProducts.length === 0 && (
                    <div className="sales-empty-state">
                        <i className="fas fa-ghost"></i>
                        <p>아직 판매 등록한 상품이 없습니다.</p>
                        <button className="sales-first-btn" onClick={() => navigate('/products/create')}>
                            첫 상품 판매하기
                        </button>
                    </div>
                )}

                {!loading && myProducts.length > 0 && (
                    <div className="sales-list-container">
                        {myProducts.map((product) => (
                            <div 
                                key={product.productId} 
                                className="sales-list-item"
                                onClick={() => navigate(`/products/${product.productId}`)}
                            >
                                <div className="sales-item-thumb">
                                    {product.thumbnailUrl ? (
                                        <img src={product.thumbnailUrl} alt="상품 썸네일" />
                                    ) : (
                                        <span>No Image</span>
                                    )}
                                </div>

                                <div className="sales-item-info">
                                    <div className="sales-item-category">{product.category}</div>
                                    <div className="sales-item-title">{product.title}</div>
                                    <div className="sales-item-price">{product.price.toLocaleString()}원</div>
                                </div>

                                <div>
                                    <span className={`sales-status-badge ${product.saleStatus === 'SOLD_OUT' ? 'sold-out' : 'selling'}`}>
                                        {product.saleStatus === 'SOLD_OUT' ? '판매완료' : '판매중'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}