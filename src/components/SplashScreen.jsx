import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { fetchPublicCategories } from '../api/PublicCategoryAPI';
import './SplashScreen.css';

function SplashScreen({ onFinish }) {
  const [dataProgress, setDataProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const loadedCount = useRef(0);
  const totalApis = 3;

  const onApiLoaded = useCallback(() => {
    loadedCount.current += 1;
    const percent = Math.round((loadedCount.current / totalApis) * 100);
    setDataProgress(percent);

    if (loadedCount.current >= totalApis) {
      setAllLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchPublicCategories()
      .then(() => onApiLoaded())
      .catch(() => onApiLoaded());

    const token = sessionStorage.getItem('accessToken');
    fetch('/api/products/popular', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(() => onApiLoaded())
      .catch(() => onApiLoaded());

    axios.get('/api/products')
      .then(() => onApiLoaded())
      .catch(() => onApiLoaded());
  }, [onApiLoaded]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        if (!allLoaded) {
          const target = Math.max(dataProgress - 5, 0);
          if (prev < target) {
            return Math.min(prev + 1.2, target);
          }
          return prev;
        }

        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + 2.5, 100);
      });
    }, 30);

    return () => clearInterval(interval);
  }, [dataProgress, allLoaded]);

  const handleFinish = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => onFinish(), 500);
  }, [onFinish]);

  useEffect(() => {
    if (displayProgress >= 100) {
      const timer = setTimeout(() => handleFinish(), 400);
      return () => clearTimeout(timer);
    }
  }, [displayProgress, handleFinish]);

  const progress = Math.min(Math.round(displayProgress), 100);

  return (
    <div className={`splash-screen ${fadeOut ? 'splash-fade-out' : ''}`}>
      <div className="splash-logo-box">
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0, -35)">
            <path d="M 160 140 V 100 A 40 40 0 0 1 240 100 V 140"
              fill="none" stroke="#2B2D36" strokeWidth="18" strokeLinecap="round" />
            <rect x="100" y="140" width="200" height="180" rx="45"
              fill="#FFFFFF" stroke="#2B2D36" strokeWidth="18" />
            <circle cx="150" cy="200" r="14" fill="#2B2D36" />
            <circle cx="250" cy="200" r="14" fill="#2B2D36" />

            <path d="M 150 240 L 175 265 L 225 265 L 250 240"
              fill="none" stroke="#E5E7EB" strokeWidth="17"
              strokeLinejoin="round" strokeLinecap="round" />
            <circle cx="150" cy="240" r="9" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="6" />
            <circle cx="200" cy="265" r="9" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="6" />
            <circle cx="250" cy="240" r="9" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="6" />

            <path className="smile-anim"
              d="M 150 240 L 175 265 L 225 265 L 250 240"
              fill="none" stroke="#00D27A" strokeWidth="17"
              strokeLinejoin="round" strokeLinecap="round"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={100 - progress} />

            <circle className="node-anim-1" cx="150" cy="240" r="9"
              fill="#FFFFFF" stroke={progress >= 10 ? '#00D27A' : '#E5E7EB'} strokeWidth="6"
              style={{ opacity: 1 }} />
            <circle className="node-anim-2" cx="200" cy="265" r="9"
              fill="#FFFFFF" stroke={progress >= 50 ? '#00D27A' : '#E5E7EB'} strokeWidth="6"
              style={{ opacity: 1 }} />
            <circle className="node-anim-3" cx="250" cy="240" r="9"
              fill="#FFFFFF" stroke={progress >= 95 ? '#00D27A' : '#E5E7EB'} strokeWidth="6"
              style={{ opacity: 1 }} />
          </g>

          <text x="200" y="345" fontFamily="'Pretendard', sans-serif"
            fontWeight="900" fontSize="52" letterSpacing="-2"
            textAnchor="middle" fill="#2B2D36">
            환승<tspan className="text-market-anim"
              fill={progress >= 70 ? '#00D27A' : '#E5E7EB'}>마켓</tspan>
          </text>
          <text x="200" y="375" fontFamily="'Pretendard', sans-serif"
            fontWeight="700" fontSize="16" letterSpacing="4"
            textAnchor="middle" fill="#8C92A0">
            NEXT STATION
          </text>
        </svg>
      </div>

      <div className="splash-gauge-wrapper">
        <div className="splash-train-icon" style={{ left: `calc(${progress}% - 20px)` }}>
          <svg width="40" height="18" viewBox="0 0 52 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 5 Q4 1, 8 1 L34 1 Q36 1, 38 2 L44 4.5 Q48 6, 48 10 L48 18 L4 18 Q4 18, 4 5 Z" fill="#00D27A" />
            <path d="M48 18 L51 16 Q52 14, 51 12 L48 10 Z" fill="#00B569" />
            <path d="M4 14.5 L48 14.5 L51 15 L51 16 L48 17 L4 17 Z" fill="#00B569" />
            <path d="M36 11 L36 5.5 Q37 5, 38 5.5 L42 7 Q43 7.5, 46 9.5 L46 11 Z" fill="#C8F5DF" />
            <path d="M44.5 9.5 L45.5 10 L45.5 11 L44.5 11 Z" fill="#FFFFFF" opacity="0.4" />
            <rect x="8" y="4" width="6" height="5.5" rx="1.2" fill="#C8F5DF" />
            <rect x="16.5" y="4" width="6" height="5.5" rx="1.2" fill="#C8F5DF" />
            <rect x="25" y="4" width="6" height="5.5" rx="1.2" fill="#C8F5DF" />
            <rect x="12.5" y="4.5" width="1.2" height="4.5" rx="0.5" fill="#FFFFFF" opacity="0.4" />
            <rect x="21" y="4.5" width="1.2" height="4.5" rx="0.5" fill="#FFFFFF" opacity="0.4" />
            <rect x="29.5" y="4.5" width="1.2" height="4.5" rx="0.5" fill="#FFFFFF" opacity="0.4" />
            <ellipse cx="49.5" cy="13" rx="1" ry="1.2" fill="#FFD700" />
            <rect x="3" y="12" width="1.5" height="3" rx="0.5" fill="#FF6B6B" />
            <rect x="4" y="18" width="45" height="2" rx="1" fill="#2B2D36" />
          </svg>
        </div>

        <div className="splash-gauge-track">
          <div className="splash-gauge-fill" style={{ width: `${progress}%` }} />
          <div className="splash-rail-ties">
            {Array.from({ length: 20 }, (_, i) => (
              <span key={i} className="splash-tie" />
            ))}
          </div>
        </div>

        <div className="splash-status-row">
          <span className="splash-status-text">
            {progress < 33
              ? '카테고리 불러오는 중...'
              : progress < 66
                ? '인기 매물 불러오는 중...'
                : progress < 100
                  ? '상품 데이터 준비 중...'
                  : '환승 준비 완료!'}
          </span>
          <span className="splash-percent">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
