import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './near-me.css'; // 🌟 css 파일 임포트

const NearMePage = () => {
    const [searchParams] = useSearchParams();
    const mapRef = useRef(null);

    // 🌟 서버에서 가져온 '진짜 매물'들을 담아둘 바구니
    const [products, setProducts] = useState([]);

    // URL에서 내 위치(위도, 경도) 꺼내기
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));

    // 1️⃣ [백엔드 통신] 내 근처 매물 데이터 가져오기
    useEffect(() => {
        const fetchNearbyProducts = async () => {
            try {
                const response = await axios.get(`/api/products`);
                console.log("📦 서버에서 받은 매물 목록:", response.data);
                setProducts(response.data);
            } catch (error) {
                console.error("매물 가져오기 실패:", error);
            }
        };

        if (lat && lng) {
            fetchNearbyProducts();
        }
    }, [lat, lng]);

    // 2️⃣ [지도 그리기] 지도를 띄우고 매물 핀 꽂기
    useEffect(() => {
        const { kakao } = window;
        if (!kakao || !kakao.maps || !lat || !lng) return;

        kakao.maps.load(() => {
            if (!mapRef.current) return;

            // 지도 도화지 펼치기 (내 위치가 중심)
            const mapOptions = {
                center: new kakao.maps.LatLng(lat, lng),
                level: 5 // 주변을 넓게 보기 위해 5단계로 설정
            };
            const map = new kakao.maps.Map(mapRef.current, mapOptions);

            // 내 위치에 마커 찍기
            const myMarker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(lat, lng),
                map: map
            });
            
            const myInfoWindow = new kakao.maps.InfoWindow({
                content: '<div style="padding:5px; font-size:12px; font-weight:bold; color:#00d26a;">🙋‍♂️ 내 위치</div>'
            });
            myInfoWindow.open(map, myMarker);

            const geocoder = new kakao.maps.services.Geocoder();

            // 🌟 서버에서 가져온 매물들을 하나씩 지도에 올리기
            products.forEach((product) => {
                if (!product.location) return;

                geocoder.addressSearch(product.location, (result, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                        const marker = new kakao.maps.Marker({
                            map: map,
                            position: coords
                        });

                        // 🎈 1. 마우스 '호버' 시 보여줄 [작은 미리보기 창]
                        const hoverWindow = new kakao.maps.InfoWindow({
                            content: `<div style="padding:5px 10px; font-size:12px; font-weight:bold; color:#333;">🛍️ ${product.title}</div>`
                        });

                        // 🎈 2. 마커 '클릭' 시 보여줄 [상세 정보 창] 
                        const detailWindow = new kakao.maps.InfoWindow({
                            content: `
                                <div class="info-window-wrap">
                                    <div class="info-title">🛍️ ${product.title}</div>
                                    <div class="info-address">
                                        📍 ${product.location} <br/> 
                                        <span>(정확한 위치는 채팅으로 문의하세요)</span>
                                    </div>
                                    <div class="info-bottom">
                                        <span class="info-price">${product.price ? product.price.toLocaleString() : 0}원</span>
                                        <a href="/products/${product.productId || product.id}" class="info-link">상세보기 ></a>
                                    </div>
                                </div>
                            `,
                            removable: true // X 닫기 버튼 활성화
                        });

                        // 🖱️ 이벤트 1: 마우스 올렸을 때
                        kakao.maps.event.addListener(marker, 'mouseover', () => {
                            if (!detailWindow.getMap()) {
                                hoverWindow.open(map, marker);
                            }
                        });

                        // 🖱️ 이벤트 2: 마우스 내렸을 때
                        kakao.maps.event.addListener(marker, 'mouseout', () => {
                            hoverWindow.close();
                        });

                        // 🖱️ 이벤트 3: 마커를 클릭했을 때
                        kakao.maps.event.addListener(marker, 'click', () => {
                            hoverWindow.close(); // 미리보기 창 닫기

                            if (detailWindow.getMap()) {
                                detailWindow.close(); // 이미 열려있으면 닫기
                            } else {
                                detailWindow.open(map, marker); // 닫혀있으면 열기
                            }
                        });
                    }
                });
            });
        }); 
    }, [lat, lng, products]); 

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '10px' }}>📍 내 주변 매물</h2>
            <p style={{ color: '#888', marginBottom: '20px' }}>
                현재 위치를 중심으로 환승 가능한 물건들을 확인해보세요.
            </p>
            
            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '600px',
                    borderRadius: '20px',
                    border: '1px solid #eee',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                }}
            />
        </div>
    );
};

export default NearMePage;