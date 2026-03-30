import { useEffect, useRef } from 'react';
import './MainPage.css';

const MainPage = () => {
  const cardsRef = useRef([]);

  useEffect(() => {
    // 스크롤 등장 애니메이션
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    cardsRef.current.forEach(card => {
      if (card) observer.observe(card);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="main-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container center-text">
          <div className="hero-badge">🚀 실시간 1,248건의 새로운 물건이 환승 중!</div>
          <h2 className="hero-title">
            쓰던 물건을 가치 있게,<br/>
            새로운 주인에게 <span className="highlight">환승하세요.</span>
          </h2>
          <p className="hero-desc">믿을 수 있는 이웃과 함께하는 중고 거래 플랫폼.</p>
          <div className="hero-buttons">
            <button className="btn-primary">내 물건 팔러가기</button>
            <button className="btn-secondary">최근 매물 구경하기</button>
          </div>
        </div>
      </section>

      {/* Item Grid Section */}
      <section className="items-section">
        <div className="container">
          <h3 className="section-title">실시간 인기 매물 🔥</h3>
          <div className="item-grid">
            {/* 아이템 카드 1 */}
            <div className="item-card" ref={el => cardsRef.current[0] = el}>
              <div className="card-image-wrap">
                {/* 리액트 인라인 스타일 문법 적용 */}
                <div className="card-image" style={{ backgroundImage: "url('https://picsum.photos/seed/p1/600/600')" }}></div>
              </div>
              <div className="card-content">
                <span className="card-category">디지털기기</span>
                <h4 className="card-title">에어팟 프로 2세대 미개봉 새상품 팝니다</h4>
                <p className="card-price">245,000원</p>
              </div>
            </div>
            {/* 나머지 카드들 반복... */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainPage;