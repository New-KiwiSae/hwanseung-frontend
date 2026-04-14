import React from 'react';
import { Link } from 'react-router-dom'; // 🚨 리액트 라우터의 Link 기능 임포트!
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-container">
          {/* 상단: 로고 + 소셜 */}
          <div className="footer-top">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <i className="fas fa-exchange-alt"></i>
              </div>
              <span className="footer-logo-text">환승마켓</span>
            </div>
          </div>

          {/* 링크 그리드 */}
          <div className="footer-links">
            <span>본 사이트는 팀 프로젝트 기반의 교육용 웹 애플리케이션입니다.<br/>
              상업적 목적이 아닌 학습과 포트폴리오 용도로 제작되었습니다.
            </span>
            <div style={{textAlign: 'right'}}>
              <h1>Team Infomation</h1>
              <span style={{fontWeight: 'bold'}}> 팀명 : Next-Level </span><br/>
              <span style={{fontWeight: 'bold'}}> 팀장 : 김태헌</span><br/>
              <span style={{fontWeight: 'bold'}}> 팀원 : 강태준, 강석영, 김민석, 송은설</span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 저작권 */}
      <div className="footer-bottom">
        <div className="footer-container">
          <span className="copyright">
            &copy; 2026 환승마켓. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;