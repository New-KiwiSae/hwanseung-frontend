import { useEffect, useRef, useState, useCallback } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import { fetchPublicCategories } from '../api/PublicCategoryAPI';
import axios from 'axios';

const products = [
    { id: 1, title: '아이폰 15 Pro 256GB 블루', price: 1250000, location: '서울 강남구', time: '2분 전', badge: '안심결제', likes: 45, chats: 12, img: '📱', color: '#f0f4ff' },
    { id: 2, title: '맥북 에어 M2 13인치 스페이스그레이', price: 1100000, location: '경기 성남시', time: '5분 전', badge: null, likes: 32, chats: 8, img: '💻', color: '#f0f0ff' },
    { id: 3, title: '소니 WH-1000XM5 노이즈캔슬링', price: 320000, location: '서울 송파구', time: '12분 전', badge: '안심결제', likes: 21, chats: 5, img: '🎧', color: '#f5f5f5' },
    { id: 4, title: '캠핑용 릴렉스 체어 2개 세트', price: 45000, location: '인천 연수구', time: '18분 전', badge: null, likes: 15, chats: 14, img: '⛺', color: '#fff8f0' },
    { id: 5, title: '닌텐도 스위치 OLED 화이트', price: 280000, location: '대구 수성구', time: '30분 전', badge: null, likes: 38, chats: 9, img: '🎮', color: '#fff0f0' },
    { id: 6, title: '파타고니아 레트로X 자켓 (L)', price: 150000, location: '부산 해운대구', time: '45분 전', badge: null, likes: 28, chats: 6, img: '🧥', color: '#f0fff4' },
    { id: 7, title: '다이슨 에어랩 멀티 스타일러', price: 420000, location: '서울 마포구', time: '1시간 전', badge: '안심결제', likes: 52, chats: 15, img: '💇', color: '#fff0f8' },
    { id: 8, title: '나이키 조던 1 레트로 하이 OG', price: 210000, location: '광주 북구', time: '2시간 전', badge: null, likes: 67, chats: 22, img: '👟', color: '#f5f5f0' },
];

const DEFAULT_STATS = [
    { label: '누적 거래액', value: 0, suffix: '억+', icon: 'fas fa-chart-line' },
    { label: '오늘의 환승', value: 0, suffix: '건', icon: 'fas fa-exchange-alt' },
    { label: '안전 결제 비중', value: 98.4, suffix: '%', icon: 'fas fa-shield-alt' },
];

function useCountUp(target, duration = 2000, startCounting = false) {
    const [value, setValue] = useState(0);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!startCounting) return;

        let start = null;

        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            setValue(eased * target);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(step);
            }
        };

        rafRef.current = requestAnimationFrame(step);

        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration, startCounting]);

    return value;
}

// 닉네임 두 번째 글자만 마스킹
const maskNickname = (nickname) => {
    const safeNickname = String(nickname || '').trim();
    return safeNickname[0] + '*' + safeNickname.slice(2);
};

const MainPage = () => {
    const [visibleCards, setVisibleCards] = useState(new Set());
    const [statsVisible, setStatsVisible] = useState(false);
    const [liveFeedItems, setLiveFeedItems] = useState([]);
    const [darkFeedItems, setDarkFeedItems] = useState([]);
    const [heroVisible, setHeroVisible] = useState(false);
    const [products, setProducts] = useState([]);
    const [imageErrorMap, setImageErrorMap] = useState({});

    // 통계 데이터 (API에서 받아온 실제 값)
    const [statsData, setStatsData] = useState(DEFAULT_STATS);

    const cardsRef = useRef([]);
    const statsRef = useRef(null);

    const navigate = useNavigate();

    // 카테고리 상태 관리
    const [fetchedCategories, setFetchedCategories] = useState([]);
    const [showAllCategories, setShowAllCategories] = useState(false);

    // 숫자 롤링
    const statValues = statsData.map(s => useCountUp(s.value, 2200, statsVisible));

    // 동적 카테고리 로드
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchPublicCategories();
                // 백엔드에서 반환된 data 배열에서 active가 true인 것만 필터링
                const activeOnly = data.filter(c => c.active);
                setFetchedCategories(activeOnly);
            } catch (err) {
                console.error('메인 카테고리 로드 실패:', err);
            }
        };
        loadCategories();
    }, []);

    // 공개 통계 데이터 로드 (누적 거래액, 오늘 거래 수)
    useEffect(() => {
        const fetchPublicStats = async () => {
            try {
                const res = await axios.get('/api/public/statistics');
                const { totalGMV, dailyTransactions } = res.data;

                setStatsData(prev => [
                    { ...prev[0], value: totalGMV ? Math.round(totalGMV / 100000000) : 0 },
                    { ...prev[1], value: dailyTransactions || 0 },
                    { ...prev[2] }, // 안전 결제 비중은 기존 값 유지
                ]);
            } catch (err) {
                console.error('메인 통계 로드 실패:', err);
                // 실패 시 기본값 유지
            }
        };
        fetchPublicStats();
    }, []);

    // 화면에 보여줄 카테고리 분리 연산
    const VISIBLE_LIMIT = 7;
    const mainCategories = fetchedCategories.slice(0, VISIBLE_LIMIT);
    const extraCategoriesList = fetchedCategories.slice(VISIBLE_LIMIT);
    const hasMore = fetchedCategories.length > VISIBLE_LIMIT;

    // 인기 매물 조회
    useEffect(() => {
        const fetchPopularProducts = async () => {
            try {
                const token = sessionStorage.getItem('accessToken');

                const response = await fetch('/api/products/popular', {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {},
                });

                if (!response.ok) {
                    throw new Error('인기 매물 조회 실패');
                }

                const data = await response.json();
                setProducts(Array.isArray(data) ? data : []);
                setImageErrorMap({});
            } catch (error) {
                console.error('인기 매물 조회 실패:', error);
                setProducts([]);
                setImageErrorMap({});
            }
        };

        fetchPopularProducts();
    }, []);

    // 최신 상품 기반 LIVE 피드 가져오기
    useEffect(() => {
        const fetchLatestLiveFeed = async () => {
            try {
                // 🔥 최신 상품 + 인기 상품을 함께 가져오기
                const [latestResponse, popularResponse] = await Promise.all([
                    axios.get('/api/products'),
                    axios.get('/api/products/popular'),
                ]);

                const latestData = Array.isArray(latestResponse.data) ? latestResponse.data : [];
                const popularData = Array.isArray(popularResponse.data) ? popularResponse.data : [];

                // 최신 상품 6개 추출
                const latestProducts = [...latestData]
                    .filter(product => !product.deletedAt && product.saleStatus === "SALE")
                    .sort((a, b) => {
                        const aTime = new Date(a.createdAt || 0).getTime();
                        const bTime = new Date(b.createdAt || 0).getTime();
                        return bTime - aTime;
                    })
                    .slice(0, 6);

                // 인기 상품 3개 추출
                const popularProducts = [...popularData]
                    .filter(product => !product.deletedAt && product.saleStatus === "SALE")
                    .slice(0, 3);

                // 최신2개 + 인기1개 패턴으로 섞기
                const mixedProducts = [];
                let popularIndex = 0;

                for (let i = 0; i < latestProducts.length; i += 2) {
                    // 최신 상품
                    if (latestProducts[i]) {
                        mixedProducts.push({
                            ...latestProducts[i],
                            type: 'latest',
                        });
                    }

                    if (latestProducts[i + 1]) {
                        mixedProducts.push({
                            ...latestProducts[i + 1],
                            type: 'latest',
                        });
                    }

                    // 인기 상품
                    if (popularProducts.length > 0) {
                        mixedProducts.push({
                            ...popularProducts[popularIndex % popularProducts.length],
                            type: 'popular',
                        });
                        popularIndex += 1;
                    }
                }

                const latestProductsForFeed = mixedProducts.map((product, index) => ({
                    id: `${product.productId}-${index}`,
                    type: product.type,
                    user: `${maskNickname(product.sellerNickname || product.nickname || product.sellerId)}님`,
                    item: product.title,
                    icon: ['fas fa-star', 'fas fa-bolt', 'fas fa-gift', 'fas fa-fire', 'fas fa-handshake'][index % 5],
                }));

                setLiveFeedItems(latestProductsForFeed);
                setDarkFeedItems(latestProductsForFeed);
            } catch (error) {
                console.error('실시간 피드 조회 실패:', error);
                setLiveFeedItems([]);
            }
        };

        fetchLatestLiveFeed();
    }, []);

    // Hero 등장 애니메이션
    useEffect(() => {
        const timer = setTimeout(() => setHeroVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // 카드 스크롤 등장
    useEffect(() => {
        if (!products.length) return;

        setVisibleCards(new Set());

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const idx = Number(entry.target.dataset.index);
                    setVisibleCards((prev) => new Set(prev).add(idx));
                }
            });
        }, { threshold: 0.1 });

        cardsRef.current.forEach((card) => {
            if (card) observer.observe(card);
        });

        return () => observer.disconnect();
    }, [products]);

    // Stats 영역 진입 감지
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setStatsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.3 });

        if (statsRef.current) observer.observe(statsRef.current);

        return () => observer.disconnect();
    }, []);

    // 실시간 피드 자동 순환
    useEffect(() => {
        if (darkFeedItems.length <= 1) return;

        const interval = setInterval(() => {
            setDarkFeedItems((prev) => {
                if (prev.length <= 1) return prev;
                return [...prev.slice(1), prev[0]];
            });
        }, 4000);

        return () => clearInterval(interval);
    }, [darkFeedItems.length]);

    const formatPrice = useCallback((price) => {
        return Number(price || 0).toLocaleString();
    }, []);

    const formatStat = useCallback((value, suffix) => {
        if (suffix === '%') return value.toFixed(1) + suffix;
        return Math.floor(value).toLocaleString() + suffix;
    }, []);

    return (
        <div className="main-page">
            <section className="hero-section">
                <div className="hero-bg-decoration">
                    <div className="hero-circle hero-circle-1"></div>
                    <div className="hero-circle hero-circle-2"></div>
                </div>

                <div className={`hero-content container ${heroVisible ? 'visible' : ''}`}>
                    <div className="hero-text">
                        <div className="hero-badge">
                            <i className="fas fa-rocket"></i>
                            <span>실시간 1,248건의 새로운 물건이 환승 중!</span>
                        </div>

                        <h1 className="hero-title">
                            쓰던 물건을 가치 있게,
                            <br />
                            새로운 주인에게 <span className="hero-highlight">환승하세요.</span>
                        </h1>

                        <p className="hero-desc">
                            믿을 수 있는 이웃과 함께하는 중고 거래 플랫폼.
                            <br />
                            환승페이로 사기 걱정 없이 안전하게 거래하세요.
                        </p>

                        <div className="hero-buttons">
                            <button className="btn-primary" onClick={() => navigate('/products')}>
                                <i className="fas fa-arrow-right"></i>
                                거래 시작하기
                            </button>
                            <button className="btn-secondary" onClick={() => navigate("/info")} >
                                <i className="fas fa-book-open"></i>
                                서비스 안내
                            </button>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-card-stack">
                            <div className="hero-float-card card-1">
                                <div className="float-card-icon">📱</div>
                                <div className="float-card-info">
                                    <div className="float-card-title">아이폰 14</div>
                                    <div className="float-card-status">
                                        <i className="fas fa-check-circle"></i> 방금 환승 완료!
                                    </div>
                                </div>
                            </div>

                            <div className="hero-float-card card-2">
                                <div className="float-card-icon">🎧</div>
                                <div className="float-card-info">
                                    <div className="float-card-title">소니 헤드셋</div>
                                    <div className="float-card-status">
                                        <i className="fas fa-handshake"></i> 거래 성사!
                                    </div>
                                </div>
                            </div>

                            <div className="hero-float-card card-3">
                                <div className="float-card-icon">🏕️</div>
                                <div className="float-card-info">
                                    <div className="float-card-title">캠핑 텐트</div>
                                    <div className="float-card-status">
                                        <i className="fas fa-clock"></i> 10분 전 환승
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="category-section">
                <div className="container">
                    <div className="category-grid">
                        {mainCategories.map((cat) => (
                            <button
                                type="button"
                                key={cat.id}
                                className="category-item"
                                onClick={() => {
                                    if (cat.key === 'all') {
                                        setShowAllCategories((prev) => !prev);
                                        return;
                                    }

                                    navigate(`/products?category=${cat.key}`);
                                }}
                            >
                                <div className="category-icon-wrap">
                                    <span className="category-emoji">
                                        {cat.emoji || '📦'}
                                    </span>
                                </div>
                                <span className="category-label">
                                    {cat.displayName}
                                </span>
                            </button>
                        ))}

                        {hasMore && (
                            <button
                                type="button"
                                className="category-item"
                                onClick={() => setShowAllCategories(prev => !prev)}
                            >
                                <div className="category-icon-wrap">
                                    <span className="category-emoji">✨</span>
                                </div>
                                <span className="category-label">
                                    {showAllCategories ? '접기' : '전체보기'}
                                </span>
                            </button>
                        )}

                        {showAllCategories && extraCategoriesList.map((cat) => (
                            <button
                                type="button"
                                key={`extra-${cat.id}`}
                                className="category-item"
                                onClick={() => navigate(`/products?category=${cat.key}`)}
                            >
                                <div className="category-icon-wrap">
                                    <span className="category-emoji">
                                        {cat.emoji || '📦'}
                                    </span>
                                </div>
                                <span className="category-label">
                                    {cat.displayName}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="live-marquee-section">
                <div className="marquee-track">
                    <div className="marquee-content">
                        {[...liveFeedItems, ...liveFeedItems].map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="marquee-item">
                                <span className="marquee-live-dot">
                                    <i className="fas fa-circle"></i> LIVE
                                </span>
                                <span className="marquee-text">
                                    {item.type === 'popular'
                                        ? `${item.item}이(가) 현재 인기 급상승 중입니다.`
                                        : `${item.user}이 ${item.item}을(를) 방금 업로드했습니다.`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="products-section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">
                                실시간 인기 매물 <i className="fas fa-fire" style={{ color: '#ef4444' }}></i>
                            </h2>
                            <p className="section-subtitle">지금 이순간, 가장 많이 찾는 상품들이에요.</p>
                        </div>
                        <span
                            className="view-all-link"
                            onClick={() => navigate('/products?filter=popular')}
                            style={{ cursor: 'pointer' }}
                        >
                            전체보기 <i className="fas fa-chevron-right"></i>
                        </span>
                    </div>

                    <div className="main-popular-grid">
                        {products.map((product, idx) => (
                            <article
                                key={product.productId}
                                className={`main-popular-card ${visibleCards.has(idx) ? 'visible' : ''}`}
                                ref={(el) => (cardsRef.current[idx] = el)}
                                data-index={idx}
                                style={{ transitionDelay: `${0.08}s` }}
                                onClick={() => navigate(`/products/${product.productId}`)}
                            >
                                <div className="main-popular-image">
                                    {product.thumbnailUrl && !imageErrorMap[product.productId] ? (
                                        <img
                                            src={product.thumbnailUrl}
                                            alt=""
                                            className="main-popular-thumb"
                                            onError={() => {
                                                setImageErrorMap((prev) => ({
                                                    ...prev,
                                                    [product.productId]: true,
                                                }));
                                            }}
                                        />
                                    ) : (
                                        <div className="main-popular-no-image">
                                            <span className="product-emoji">📦</span>
                                        </div>
                                    )}

                                    <span className="product-badge">
                                        <i className="fas fa-fire"></i> 인기
                                    </span>
                                </div>

                                <div className="main-popular-info">
                                    <h4 className="main-popular-title">{product.title}</h4>
                                    <div className="main-popular-price">{formatPrice(product.price)}원</div>

                                    <div className="main-popular-meta">
                                        <span className="main-popular-location">
                                            <i className="fas fa-map-marker-alt"></i>
                                            {product.location}
                                        </span>

                                        <div className="main-popular-stats">
                                            <span><i className="far fa-heart"></i> {product.likeCount}</span>
                                            <span><i className="far fa-comment"></i> {product.chatCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ Transit Insight (다크 섹션) ═══ */}
            <section className="insight-section" ref={statsRef}>
                <div className="insight-bg-glow"></div>

                <div className="container insight-container">
                    <div className="insight-left">
                        <div className="insight-label">
                            <i className="fas fa-chart-bar"></i> Transit Insight
                        </div>

                        <h2 className="insight-title">
                            데이터로 증명하는
                            <br />
                            <span>가장 안전한 환승</span>
                        </h2>

                        <div className="stats-grid">
                            {statsData.map((stat, idx) => (
                                <div
                                    key={idx}
                                    className={`stat-card ${statsVisible ? 'visible' : ''}`}
                                    style={{ transitionDelay: '0.08s' }}
                                >
                                    <div className="stat-icon">
                                        <i className={stat.icon}></i>
                                    </div>
                                    <div className="stat-label">{stat.label}</div>
                                    <div className="stat-value">
                                        {formatStat(statValues[idx], stat.suffix)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="insight-right">
                        <div className="live-feed-card">
                            <h4 className="live-feed-title">
                                <span className="live-ping"></span>
                                실시간 환승 현황
                            </h4>

                            <div className="live-feed-list">
                                {darkFeedItems.slice(0, 3).map((item, idx) => (
                                    <div
                                        key={`${item.id}-${idx}`}
                                        className="live-feed-item"
                                        style={{ animationDelay: `${idx * 0.1}s` }}
                                    >
                                        <div className="feed-item-icon">
                                            <i className={item.icon}></i>
                                        </div>

                                        <div className="feed-item-text">
                                            {item.type === 'popular' ? (
                                                <>
                                                    <span className="feed-item-highlight">{item.item}</span>이(가) 현재 인기 급상승 중입니다.
                                                </>
                                            ) : (
                                                <>
                                                    <strong>{item.user}</strong>이 <span className="feed-item-highlight">{item.item}</span>을(를) 업로드했습니다.
                                                </>
                                            )}
                                        </div>

                                        <span className="feed-item-status">NEW</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="safety-section">
                <div className="container">
                    <div className="safety-banner">
                        <div className="safety-icon-wrap">
                            <i className="fas fa-shield-alt"></i>
                        </div>

                        <div className="safety-content">
                            <h3 className="safety-title">환승Pay로 안전하게 거래하세요</h3>
                            <p className="safety-desc">
                                구매 확정 전까지 결제 대금을 환승마켓이 안전하게 보관합니다.
                                외부 결제 링크는 절대 클릭하지 마세요!
                            </p>

                            <div className="safety-tags">
                                <span className="safety-tag">
                                    <i className="fas fa-check"></i> 사기 계좌 100% 차단
                                </span>
                                <span className="safety-tag">
                                    <i className="fas fa-check"></i> 결제 수수료 0원
                                </span>
                                <span className="safety-tag">
                                    <i className="fas fa-check"></i> 24시간 모니터링
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 신뢰 지표 ═══ */}
            <section className="trust-section">
                <div className="container">
                    <h2 className="trust-title">안심하세요. 환승마켓은 24시간 가동 중입니다.</h2>

                    <div className="trust-grid">
                        <div className="trust-card">
                            <div className="trust-card-icon">
                                <i className="fas fa-user-shield"></i>
                            </div>
                            <h4>사기 방지 시스템</h4>
                            <p>AI 기반의 실시간 모니터링으로 의심 거래를 즉시 차단합니다.</p>
                        </div>

                        <div className="trust-card">
                            <div className="trust-card-icon">
                                <i className="fas fa-credit-card"></i>
                            </div>
                            <h4>100% 안심 결제</h4>
                            <p>구매가 확정될 때까지 결제 대금을 안전하게 보호합니다.</p>
                        </div>

                        <div className="trust-card">
                            <div className="trust-card-icon">
                                <i className="fas fa-headset"></i>
                            </div>
                            <h4>24/7 고객 지원</h4>
                            <p>언제 어디서든 문제 발생 시 즉각적으로 대응해 드립니다.</p>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default MainPage;