import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import '../MyPage.css'; 
import './my-sales.css';

export default function Payments() {
    const navigate = useNavigate();

    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1); 
    const [hasMore, setHasMore] = useState(true); 
    const limitno = 5;
    
    //수정: 함수 내부에서만 쓰이는 변수가 아니라, fetch 로직에서 활용될 데이터를 위해 정의
    let allList = [];

    const fetchMySales = async (isReset = false) => {
        const token = sessionStorage.getItem("accessToken");

        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login');
            return;
        }

        //수정: 로딩 시작
        setLoading(true);

        await axios.get('/api/products/my-payments', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                allList = res.data;
                
                // 수정: 현재 페이지(isReset일 경우 1)에 맞는 데이터를 계산
                const currentPage = isReset ? 1 : page;
                const newData = allList.filter((item, index) => index < currentPage * limitno);
                
                setMyProducts(newData);

                // 데이터가 없거나 모든 데이터를 다 보여줬을 때 더보기 숨김
                if (allList.length === 0 || newData.length >= allList.length) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
                
                // 다음 호출을 위해 페이지 증가 (리셋이 아닐 때만)
                if(!isReset) setPage((prev) => prev + 1);
            })
            .catch((error) => {
                console.error("구매 내역을 불러오지 못했습니다.", error);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchMySales();
    }, []);

    const handleLoadMore = () => {
        fetchMySales();
    };

    const payHandler = async (stat, pid) => {
        if (stat === 'SOLD_OUT') {
            alert('구매완료된 상품입니다.');
        } else {
            await fetch(`/api/products/${pid}/payments`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    alert(data.message);
                    if (!data.message.includes('부족')) {
                        //수정: 초기화 시 page를 1로 맞추고 fetchMySales(true) 호출
                        setPage(2); // 다음 더보기를 위해 2로 세팅 (현재 1페이지 출력 예정이므로)
                        fetchMySales(true); 
                        window.location.reload();
                    }
                })
                .catch((err) => console.error(err));
        }
    };

    return (
        <div className="main-viewport">
            <div className="content-view">
                <h2 className="sales-title">
                    <i className="fas fa-box-open"></i> 내 구매 내역
                </h2>

                {loading && myProducts.length === 0 && <p style={{ textAlign: 'center', padding: '50px' }}>데이터를 불러오는 중입니다...</p>}

                {!loading && myProducts.length === 0 && (
                    <div className="sales-empty-state">
                        <i className="fas fa-ghost"></i>
                        <p>아직 구매한 상품이 없습니다.</p>
                    </div>
                )}

                {myProducts.length > 0 && (
                    <div className="sales-list-container">
                        {myProducts.map((product) => (
                            <div
                                key={product.productId}
                                className="sales-list-item"
                                onClick={() => { payHandler(product.saleStatus, product.productId) }}
                            >
                                <div className="sales-item-thumb">
                                    {product.thumbnailUrl ? (
                                        <img src={product.thumbnailUrl} alt="상품 썸네일" />
                                    ) : (
                                        <span>No Image</span>
                                    )}
                                </div>

                                <div className="sales-item-info">
                                    <div className="sales-item-category">no.{product.productId} {product.category}</div>
                                    <div className="sales-item-title">{product.title}</div>
                                    <div className="sales-item-price">{product.price.toLocaleString()}원</div>
                                </div>

                                <div className='sales-item-status'>
                                {product.payStatus ? (
                                    <span className="sales-status-badge sold-out">결제완료</span>
                                        ) : (
                                    <span className="sales-status-badge selling">결제하기</span>
                                )}
                                    <span className={`sales-status-badge ${product.saleStatus === 'SOLD_OUT' ? 'sold-out' : 'selling'}`}>
                                            {product.saleStatus === 'SOLD_OUT' ? '구매완료' : '예약중'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {hasMore && myProducts.length > 0 && (
                    <div className="more-btn-container">
                        <button className="notice-more-btn" onClick={handleLoadMore}>
                            더보기 <i className="fas fa-chevron-down"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}