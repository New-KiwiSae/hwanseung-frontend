import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './near-me.css';

const NearMePage = () => {
    const [searchParams] = useSearchParams();
    const mapRef = useRef(null);
    const kakaoMapRef = useRef(null); // 🌟 지도 인스턴스를 ref로 보관

    const [products, setProducts] = useState([]);
    const [isMapReady, setIsMapReady] = useState(false); // 🌟 지도 준비 완료 상태

    const homeLat = parseFloat(searchParams.get('lat'));
    const homeLng = parseFloat(searchParams.get('lng'));

    const [currentLoc, setCurrentLoc] = useState({ lat: null, lng: null });
    const [isLoadingLoc, setIsLoadingLoc] = useState(true);

    // 1️⃣ 매물 데이터 가져오기
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
        fetchNearbyProducts();
    }, []);

    // 2️⃣ GPS 현재 위치 추적
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLoc({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setIsLoadingLoc(false);
                },
                (error) => {
                    console.error("GPS 오류:", error);
                    setCurrentLoc(
                        homeLat && homeLng
                            ? { lat: homeLat, lng: homeLng }
                            : { lat: 37.5665, lng: 126.9780 }
                    );
                    setIsLoadingLoc(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setCurrentLoc(
                homeLat && homeLng
                    ? { lat: homeLat, lng: homeLng }
                    : { lat: 37.5665, lng: 126.9780 }
            );
            setIsLoadingLoc(false);
        }
    }, []);

    // 3️⃣ 🌟 지도 초기화 - GPS 로딩 완료되면 딱 1번만 실행
    useEffect(() => {
        console.log("🗺️ 지도 useEffect 진입");
        console.log("isLoadingLoc:", isLoadingLoc);
        console.log("currentLoc:", currentLoc);
        console.log("mapRef.current:", mapRef.current);
        console.log("kakao:", window.kakao);
        console.log("kakao.maps:", window.kakao?.maps);


        if (isLoadingLoc || !currentLoc.lat || !mapRef.current) {
            console.log("🚫 조기 return - 조건 불충족");
            return;
        }


        const { kakao } = window;
        if (!kakao || !kakao.maps) {
            console.log("🚫 kakao 또는 kakao.maps 없음!");
            return;
        }

        console.log("✅ kakao.maps.load 호출 직전");

        kakao.maps.load(() => {
            console.log("✅ kakao.maps.load 콜백 진입!");
            
            const mapOptions = {
                center: new kakao.maps.LatLng(currentLoc.lat, currentLoc.lng),
                level: 5
            };
            const map = new kakao.maps.Map(mapRef.current, mapOptions);
            kakaoMapRef.current = map; // 🌟 인스턴스 저장

            // 현재 내 위치 오버레이
            new kakao.maps.CustomOverlay({
                position: new kakao.maps.LatLng(currentLoc.lat, currentLoc.lng),
                content: `<div style="background:#ff6f0f;color:white;padding:6px 12px;border-radius:20px;font-weight:bold;font-size:13px;box-shadow:0 4px 10px rgba(0,0,0,0.2);border:2px solid white;transform:translateY(-50%);">📍 현재 내 위치</div>`,
                map: map
            });

            // 우리 집 오버레이
            if (homeLat && homeLng && (homeLat !== currentLoc.lat || homeLng !== currentLoc.lng)) {
                new kakao.maps.CustomOverlay({
                    position: new kakao.maps.LatLng(homeLat, homeLng),
                    content: `<div style="background:#00d26a;color:white;padding:6px 12px;border-radius:20px;font-weight:bold;font-size:13px;box-shadow:0 4px 10px rgba(0,0,0,0.2);border:2px solid white;transform:translateY(-50%);">🏠 우리 집</div>`,
                    map: map
                });
            }

            setIsMapReady(true); // 🌟 지도 준비 완료 신호
        });
    }, [isLoadingLoc, currentLoc]); // GPS 완료 후 1번만

    // 4️⃣ 🌟 매물 핀 찍기 - 지도와 매물 데이터 둘 다 준비됐을 때만 실행
    useEffect(() => {
        if (!isMapReady || products.length === 0) return;

        const { kakao } = window;
        const map = kakaoMapRef.current;
        if (!kakao || !map) return;

        const geocoder = new kakao.maps.services.Geocoder();

        products.forEach((product) => {
            if (!product.location) return;

            geocoder.addressSearch(product.location, (result, status) => {
                if (status !== kakao.maps.services.Status.OK) return;

                const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                const marker = new kakao.maps.Marker({ map, position: coords });

                const hoverWindow = new kakao.maps.InfoWindow({
                    content: `<div class="hover-info-window">🛍️ ${product.title}</div>`
                });

                const detailWindow = new kakao.maps.InfoWindow({
                    content: `
                        <div class="info-window-wrap">
                            <div class="info-title">🛍️ ${product.title}</div>
                            <div class="info-address">
                                📍 ${product.location}<br/>
                                <span>(정확한 위치는 채팅으로 문의하세요)</span>
                            </div>
                            <div class="info-bottom">
                                <span class="info-price">${product.price?.toLocaleString() ?? 0}원</span>
                                <a href="/products/${product.productId ?? product.id}" class="info-link">상세보기 ></a>
                            </div>
                        </div>
                    `,
                    removable: true
                });

                kakao.maps.event.addListener(marker, 'mouseover', () => {
                    if (!detailWindow.getMap()) hoverWindow.open(map, marker);
                });
                kakao.maps.event.addListener(marker, 'mouseout', () => hoverWindow.close());
                kakao.maps.event.addListener(marker, 'click', () => {
                    hoverWindow.close();
                    detailWindow.getMap() ? detailWindow.close() : detailWindow.open(map, marker);
                });
            });
        });
    }, [isMapReady, products]); // 🌟 둘 다 준비됐을 때만

    return (
        <div className="near-me-container">
            <h2 className="near-me-title">📍 내 주변 매물</h2>
            <p className="near-me-desc">현재 위치를 중심으로 환승 가능한 물건들을 확인해보세요.</p>

            {isLoadingLoc && (
                <div style={{ textAlign: 'center', padding: '50px', color: '#888', fontWeight: 'bold' }}>
                    현재 접속하신 위치의 GPS를 찾고 있습니다... 🛰️
                </div>
            )}

            <div
                ref={mapRef}
                className="near-me-map"
                style={{ display: isLoadingLoc ? 'none' : 'block' }}
            />
        </div>
    );
};

export default NearMePage;