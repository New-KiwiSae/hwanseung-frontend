import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

const NearMePage = () => {
    const [searchParams] = useSearchParams();
    const mapRef = useRef(null); // 지도가 그려질 진짜 도화지

    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));

    

    useEffect(() => {
        const { kakao } = window;

        if (!kakao || !kakao.maps || !lat || !lng) {
            console.error("카카오 지도 SDK가 없거나 좌표가 없습니다.");
            return;
        }

        kakao.maps.load(() => {
            if (!mapRef.current) return;

            // 1. 지도 생성 (내 위치 중심)
            const mapOptions = {
                center: new kakao.maps.LatLng(lat, lng),
                level: 4 // 주변을 넓게 보기 위해 레벨을 4로 설정
            };
            const map = new kakao.maps.Map(mapRef.current, mapOptions);

            // 🌟 2. 내 위치에 특별한 마커 찍기
            const myPosition = new kakao.maps.LatLng(lat, lng);
            const myMarker = new kakao.maps.Marker({ position: myPosition });
            myMarker.setMap(map);

            // 내 위치 말풍선
            const myInfoWindow = new kakao.maps.InfoWindow({
                content: '<div style="padding:5px; font-weight:bold; color:#00d26a;">🙋‍♂️ 현재 내 위치</div>'
            });
            myInfoWindow.open(map, myMarker);

            // 🌟 3. 가짜 주변 매물 데이터 만들기 
            // (나중에는 서버(Spring)에서 API로 이 배열을 받아오면 됩니다!)
            const nearbyProducts = [
                { id: 1, title: "아이폰 15 Pro", lat: lat + 0.001, lng: lng + 0.001 },
                { id: 2, title: "캠핑 의자", lat: lat - 0.002, lng: lng + 0.0015 },
                { id: 3, title: "맥북 에어 M2", lat: lat + 0.0015, lng: lng - 0.002 },
                { id: 4, title: "자전거 팝니다", lat: lat - 0.001, lng: lng - 0.0015 }
            ];

            // 🌟 4. 주변 매물들을 지도에 핀으로 꽂기
            nearbyProducts.forEach((product) => {
                const productPosition = new kakao.maps.LatLng(product.lat, product.lng);
                
                // 마커 생성
                const productMarker = new kakao.maps.Marker({ 
                    position: productPosition 
                });
                productMarker.setMap(map);

                // 매물 이름 말풍선
                const productInfoWindow = new kakao.maps.InfoWindow({
                    content: `<div style="padding:5px; font-size:12px;">🛍️ ${product.title}</div>`
                });
                productInfoWindow.open(map, productMarker);
            });
        });
    }, [lat, lng]);

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '10px' }}>📍 내 주변 매물</h2>
            <p style={{ color: '#888', marginBottom: '20px' }}>
                현재 위치를 중심으로 환승 가능한 물건들을 확인해보세요.
            </p>

            {/* ❌ HTML식 style="width:..." 를 사용하던 <div id="map">은 지웠습니다. */}
            
            {/* ✅ 리액트가 관리하는 진짜 지도 영역 (mapRef) */}
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