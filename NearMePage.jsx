import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const NearMePage = () => {
    const [searchParams] = useSearchParams();
    const mapRef = useRef(null);

    // 🌟 서버에서 가져온 '진짜 매물'들을 담아둘 바구니입니다.
    const [products, setProducts] = useState([]);

    // URL에서 내 위치(위도, 경도) 꺼내기
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));

    // 1️⃣ [백엔드 통신] 내 근처 매물 데이터 가져오기
    useEffect(() => {
        const fetchNearbyProducts = async () => {
            try {
                // 학생분이 Spring Boot에 만들어둔 주소로 요청을 보냅니다!
               // 🌟 임시 수정: 반경 필터링(nearby)을 빼고 전체 상품(/api/products)을 다 가져옵니다!
                const response = await axios.get(`/api/products`);

                console.log("📦 서버에서 받은 매물 목록:", response.data);
                
                setProducts(response.data); // 가져온 데이터를 바구니에 쏙 담습니다.
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

            // 주소 번역기 준비 (글자 주소 -> 숫자 좌표)
            const geocoder = new kakao.maps.services.Geocoder();

            // 🌟 서버에서 가져온 매물들을 하나씩 지도에 올리기
            products.forEach((product) => {
                // DB에 저장된 주소(location)가 없으면 건너뜁니다.
                if (!product.location) return;

                // 매물의 '글자 주소'(예: 안양시 동안구)를 검색해서 지도용 좌표로 바꿉니다.
                geocoder.addressSearch(product.location, (result, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                        // 매물 위치에 마커 찍기
                        const marker = new kakao.maps.Marker({
                            map: map,
                            position: coords
                        });

                        // 마커에 올릴 예쁜 말풍선 만들기
                        const infowindow = new kakao.maps.InfoWindow({
                            content: `
                                <div style="padding:10px; min-width:150px; border-radius:8px;">
                                    <div style="font-weight:bold; font-size:13px; margin-bottom:5px;">🛍️ ${product.title}</div>
                                    <div style="color:#ff6f0f; font-weight:bold; font-size:12px;">${product.price ? product.price.toLocaleString() : 0}원</div>
                                    <a href="/products/${product.productId || product.id}" style="display:block; margin-top:8px; font-size:11px; color:#0056b3; text-decoration:none;">상세보기 ></a>
                                </div>
                            `
                        });

                        // 마우스 올리면 말풍선 열기
                        kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(map, marker));
                        // 마우스 내리면 말풍선 닫기
                        kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
                    }
                });
            });
        });
    }, [lat, lng, products]); // 🌟 바구니(products)에 매물이 들어오면 지도를 다시 그립니다.

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