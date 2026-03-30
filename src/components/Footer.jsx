import './Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="content">
        <div className="top">
          <div className="logo-details">
            <i className="fas fa-sync-alt"></i>
            <span className="logo_name">환승마켓</span>
          </div>
          <div className="media-icons">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-linkedin-in"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
        
        <div className="link-boxes">
          <ul className="box">
            <li className="link_name">환승마켓</li>
            <li><a href="#">회사소개</a></li>
            <li><a href="#">인재채용</a></li>
            <li><a href="#">제휴제안</a></li>
            <li><a href="#">이용약관</a></li>
          </ul>
          <ul className="box">
            <li className="link_name">고객센터</li>
            <li><a href="#">공지사항</a></li>
            <li><a href="#">자주하는 질문</a></li>
            <li><a href="#">1:1 문의</a></li>
            <li><a href="#">신고안내</a></li>
          </ul>
          <ul className="box">
            <li className="link_name">주요 서비스</li>
            <li><a href="#">중고거래</a></li>
            <li><a href="#">동네정보</a></li>
            <li><a href="#">환승페이</a></li>
            <li><a href="#">비즈니스</a></li>
          </ul>
          <ul className="box">
            <li className="link_name">정책</li>
            <li><a href="#">운영정책</a></li>
            <li><a href="#">개인정보처리방침</a></li>
            <li><a href="#">청소년보호정책</a></li>
            <li><a href="#">가이드라인</a></li>
          </ul>
          <ul className="box input-box">
            <li className="link_name">뉴스레터 구독</li>
            <li><input type="text" placeholder="이메일 주소 입력" /></li>
            <li><input type="button" value="구독하기" /></li>
          </ul>
        </div>
      </div>
      
      <div className="bottom-details">
        <div className="bottom_text">
          <span className="copyright_text">Copyright © 2026 <a href="#">환승마켓 </a>All rights reserved</span>
          <span className="policy_terms">
            <a href="#">개인정보처리방침</a>
            <a href="#">이용약관</a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;