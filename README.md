# 🔄 환승 (Hwanseung) — 중고거래 플랫폼 프론트엔드

> 안심하고 거래하세요. 환승은 안전 결제와 실시간 채팅을 지원하는 중고거래 플랫폼입니다.

<br>

## 📌 프로젝트 소개

**환승**은 중고 물품을 사고팔 수 있는 웹 기반 중고거래 서비스입니다.  
사용자는 상품을 등록하고, 실시간 채팅으로 거래를 협의하며, 안심결제 시스템을 통해 안전하게 거래를 완료할 수 있습니다.  
관리자 전용 대시보드를 통해 회원, 상품, 거래, 신고, 통계를 통합 관리할 수 있습니다.

<br>

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| **프레임워크** | React 19, Vite 8 |
| **라우팅** | React Router DOM v7 |
| **상태 관리** | React Context API |
| **HTTP 통신** | Axios |
| **실시간 채팅** | STOMP.js + SockJS |
| **인증** | JWT Decode, Google OAuth2 |
| **결제** | iamport (아임포트) |
| **지도** | Kakao Maps API |
| **주소 검색** | react-daum-postcode |
| **차트** | Recharts |
| **UI 라이브러리** | Bootstrap 5, React Bootstrap, React Icons |
| **컨테이너** | Docker (Node 22 + Nginx) |

<br>

## 📁 프로젝트 구조

```
src/
├── api/                    # API 호출 모듈
│   ├── AuthAPI.jsx
│   ├── UserAPI.jsx
│   ├── AdminProductsAPI.jsx
│   ├── AdminTransactionsAPI.jsx
│   ├── InquiriesAPI.jsx
│   ├── NoticeAPI.jsx
│   ├── ReportsAPI.jsx
│   ├── StatisticsAPI.jsx
│   └── ...
├── components/             # 공통 컴포넌트
│   ├── Header.jsx
│   ├── Footer.jsx
│   └── SplashScreen.jsx
├── pages/
│   ├── Admin/              # 관리자 페이지
│   │   ├── AdminDashBoard.jsx
│   │   ├── AdminProducts.jsx
│   │   ├── AdminStatistics.jsx
│   │   ├── AdminReports.jsx
│   │   ├── AdminTransactions.jsx
│   │   ├── AdminCategories.jsx
│   │   ├── AdminInquiries.jsx
│   │   └── ...
│   ├── Auth/               # 로그인 / 소셜 인증
│   ├── Chat/               # 실시간 채팅
│   ├── Product/            # 상품 목록, 상세, 등록, 수정
│   ├── MyPage/             # 마이페이지 (판매/구매/위시리스트)
│   ├── Notice/             # 공지사항
│   ├── Inquiry/            # 1:1 문의
│   ├── Notification/       # 알림
│   └── Report/             # 신고
├── App.jsx
├── UserContext.jsx
└── main.jsx
```

<br>

## ✨ 주요 기능

### 👤 사용자
- 이메일 로그인 / Google 소셜 로그인
- 상품 등록, 수정, 삭제
- 상품 검색 및 카테고리 필터링
- 위시리스트 (찜하기)
- 구매 / 판매 내역 조회
- 아임포트 안심결제
- 실시간 1:1 채팅 (WebSocket)
- 1:1 문의 및 신고
- 공지사항, 알림 조회
- 내 주변 상품 보기 (카카오 지도)

### 🛡 관리자
- 대시보드 (주요 지표 한눈에)
- 회원 관리 (정지, 탈퇴 등)
- 상품 관리 및 카테고리 관리
- 거래 내역 조회
- 신고 처리
- 문의 답변
- 통계 차트 (Recharts)
- 공지사항 작성 / 수정
- 실시간 채팅 관리

<br>

## ⚙️ 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 값을 설정하세요.

```env
VITE_IAMPORT_CODE=your_iamport_code
VITE_KAKAO_KEY=your_kakao_api_key
```

> ⚠️ 모든 환경 변수는 반드시 `VITE_` 접두사로 시작해야 합니다.

<br>

## 🚀 시작하기

### 로컬 개발 환경

```bash
# 패키지 설치
npm install

# 개발 서버 실행 (port 80)
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
npm run preview
```

### Docker로 실행

```bash
# 이미지 빌드
docker build -t hwanseung-frontend .

# 컨테이너 실행
docker run -p 80:80 hwanseung-frontend
```

> Docker 환경에서는 Nginx가 `/api`, `/ws-chat` 요청을 백엔드(`backend:8080`)로 프록시합니다.

<br>

## 🔗 API 프록시 설정

| 경로 | 대상 |
|------|------|
| `/api/*` | 백엔드 REST API (`http://localhost:8080`) |
| `/ws-chat/*` | WebSocket 채팅 서버 |

로컬 개발 시 `vite.config.js`의 `API_TARGET` 환경 변수로 백엔드 주소를 변경할 수 있습니다.

<br>

## 👥 팀원 소개

| 이름 | 역할 |
|------|------|
| **강태준** | 서버 배포 및 CI/CD 자동화, 채팅 기능, 알림 기능, 관리자 채팅 관리, DB(chat·notification 테이블) |
| **송은설** | 로그인/로그아웃, 회원가입, 내 정보 조회·수정, 회원탈퇴, 소셜 로그인·소셜 내 정보 수정, DB(user·auth 테이블) |
| **김민석** | 내 근처 목록, 판매내역·관심목록, 동네 인증, 결제 기능, DB(Pay 관련 테이블) |
| **강석영** | 상품 등록·목록·상세·수정, 신고 기능, DB(Product 관련 테이블) |
| **김태헌** | 헤더 검색·인기 검색어, 관리자 대시보드·통계·상품·거래·카테고리·사용자·신고·관리 페이지 및 사이드바, DB(categories·reports 관련 테이블) |
| **김덕식** | 공지사항, 자주 묻는 질문 |

<details>
<summary>📋 상세 역할 분담 보기</summary>

### 공통 작업
| 작업 | 담당 |
|------|------|
| 데이터베이스 구상 및 구축 | 팀 전원 |
| Github 작업 세팅 | 팀 전원 |
| 머리 싸매고 고민하기 | 팀 전원 |
| WBS / 테이블 명세서 / 요구사항 정의서 | 팀 전원 |
| 메인 index 페이지 | 팀 전원 |

### 회원 기능
| 작업 | 담당 |
|------|------|
| 로그인 / 로그아웃 | 송은설 |
| 회원가입 | 송은설 |
| 내 정보 조회 및 수정 | 송은설 |
| 회원탈퇴 | 송은설 |
| 소셜 로그인 / 소셜 내 정보 수정 | 송은설 |
| 내 근처 목록 | 김민석 |
| 판매내역 / 관심목록 | 김민석 |
| 동네 인증 | 김민석 |
| 결제 기능 | 김민석 |
| 채팅 기능 | 강태준 |
| 알림 기능 | 강태준 |
| 상품 등록 | 강석영 |
| 상품 목록 | 강석영 |
| 상품 상세 | 강석영 |
| 상품 수정 | 강석영 |
| 신고 기능 | 강석영 |
| 헤더 검색 기능, 인기 검색어 | 김태헌 |

### 관리자 페이지
| 작업 | 담당 |
|------|------|
| 관리자 대시보드 페이지 | 김태헌 |
| 관리자 통계 페이지 | 김태헌 |
| 관리자 상품 관리 페이지 | 김태헌 |
| 관리자 거래 관리 페이지 | 김태헌 |
| 관리자 카테고리 관리 페이지 | 김태헌 |
| 관리자 사용자 관리 페이지 | 김태헌 |
| 관리자 신고/정지 관리 페이지 | 김태헌 |
| 관리자 채팅 관리 페이지 | 강태준 |
| 관리자 관리 페이지 | 김태헌 |
| 관리자 페이지 사이드바 | 김태헌 |
| 공지사항 | 김덕식 |
| 자주 묻는 질문 | 김덕식 |

### 데이터베이스
| 테이블 | 담당 |
|--------|------|
| user 테이블 | 송은설 |
| auth 테이블 | 송은설 |
| Pay 관련 테이블 | 김민석 |
| chat 관련 테이블 | 강태준 |
| Product 관련 테이블 | 강석영 |
| notification 테이블 | 강태준 |
| categories 테이블 | 김태헌 |
| reports 테이블 | 김태헌 |
| reports_history 테이블 | 김태헌 |
| search_keywords 테이블 | 김태헌 |

### 인프라
| 작업 | 담당 |
|------|------|
| 서버 배포 (CI/CD 자동화) | 강태준 |

</details>

<br>

## 📄 라이선스

본 프로젝트는 팀 프로젝트 학습 목적으로 제작되었습니다.
