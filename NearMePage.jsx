import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

const NearMePage = () => {
    const [searchParams] = useSearchParams();
    const mapRef = useRef(null);

    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));

    useEffect(() => {
        // 🌟 핵심: 카카오 지도 라이브러리가 로드될 때까지 기다렸다가 실행합니다.
        const { kakao } = window;
        
        if (!kakao || !kakao.maps) {
            console.error("카카오 지도 SDK가 로드되지 않았습니다.");
            return;
        }

        kakao.maps.load(() => {
            if (!mapRef.current) return;

            // 1. 지도 생성
            const mapOptions = {
                center: new kakao.maps.LatLng(lat, lng),
                level: 3
            };
            const map = new kakao.maps.Map(mapRef.current, mapOptions);

            // 2. 내 위치 마커 생성
            const markerPosition = new kakao.maps.LatLng(lat, lng);
            const marker = new kakao.maps.Marker({
                position: markerPosition
            });
            marker.setMap(map);

            // 3. 내 위치임을 알리는 말풍선(선택 사항)
            const iwContent = '<div style="padding:5px; font-size:12px; text-align:center;">여기에 계시군요!</div>';
            const infowindow = new kakao.maps.InfoWindow({
                content: iwContent
            });
            infowindow.open(map, marker);
        });
    }, [lat, lng]);

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