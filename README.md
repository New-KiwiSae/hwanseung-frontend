# 🛒 환승마켓 (HwanSeung Market) — Frontend

> WebSocket 기반 실시간 채팅 중고거래 플랫폼 — 프론트엔드

<br>

## 📌 프로젝트 소개

환승마켓은 판매자와 구매자가 **실시간 채팅**으로 빠르게 소통하고 거래할 수 있는 중고거래 서비스입니다.
Google 소셜 로그인, 카카오 지도 기반 내 근처 거래, 아임포트 자체 페이 시스템,
관리자 대시보드까지 실서비스 수준의 UI를 갖추었습니다.

<br>

## 🔗 관련 링크

| 구분 | 링크 |
|---|---|
| 배포 서버 | [https://hsmarket.duckdns.org](https://hsmarket.duckdns.org) |
| 백엔드 저장소 | [Backend Repository](https://github.com/effortdev/hwanseung-backend) |

<br>

## 🛠 기술 스택

### Frontend
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_v7-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=flat-square&logo=bootstrap&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=flat-square)

### 실시간 & 인증
![WebSocket](https://img.shields.io/badge/WebSocket_STOMP-010101?style=flat-square)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Google OAuth2](https://img.shields.io/badge/Google_OAuth2-4285F4?style=flat-square&logo=google&logoColor=white)

### 외부 연동
![아임포트](https://img.shields.io/badge/Iamport-FF6B00?style=flat-square)
![Kakao Maps](https://img.shields.io/badge/Kakao_Maps-FFCD00?style=flat-square&logo=kakao&logoColor=black)
![Daum Postcode](https://img.shields.io/badge/Daum_Postcode-FFCD00?style=flat-square&logo=kakao&logoColor=black)

### Infra & DevOps
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)

<br>

## ✨ 주요 기능

### 👤 회원 인증
- 이메일 로그인 / 로그아웃
- Google 소셜 로그인 및 소셜 내 정보 수정
- 회원가입 / 내 정보 조회·수정 / 회원탈퇴
- 동네 인증

### 💬 실시간 채팅
- **WebSocket(STOMP)** 기반 1:1 실시간 채팅 UI
- 채팅 수신 시 실시간 알림 표시
- 관리자 채팅 모니터링 페이지

### 🛍 상품 거래
- 상품 등록 / 수정 / 삭제 (다중 이미지 업로드)
- 상품 목록 / 상세 페이지
- 키워드 검색 및 카테고리 필터
- 인기 검색어 표시
- 찜 목록 (위시리스트)
- 내 판매내역 / 구매내역 조회
- 내 근처 상품 보기 (카카오 지도)

### 💳 환승 페이 (자체 포인트 결제)
- 아임포트(Iamport)를 통한 포인트 충전 UI
- 충전된 포인트로 상품 구매

### 🔔 알림
- 채팅·거래 관련 실시간 알림 목록

### 🛡 관리자 페이지
- 대시보드: 주요 지표 요약 및 주간 트렌드
- 통계: 회원 / 상품 / 거래 / 검색 키워드 / 신고 차트 (Recharts)
- 회원 관리 / 상품 관리 / 거래 관리
- 카테고리 관리 / 신고·정지 관리
- 공지사항 / 문의 관리 / 자주 묻는 질문
- 채팅 관리 / 관리자 계정 관리
- 전용 사이드바 네비게이션

<br>

## 🏗 시스템 아키텍처

```
[Browser]
    │  HTTP REST / WebSocket(STOMP)
    ▼
[Docker — Nginx :80]
    ├── /          → React SPA (정적 빌드)
    ├── /api/*     → Proxy → Backend :8080
    └── /ws-chat/* → WebSocket Proxy → Backend :8080
```

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
│   │   ├── AdminStatistics.jsx
│   │   ├── AdminProducts.jsx
│   │   ├── AdminTransactions.jsx
│   │   ├── AdminCategories.jsx
│   │   ├── AdminReports.jsx
│   │   ├── AdminInquiries.jsx
│   │   └── ...
│   ├── Auth/               # 로그인 / 소셜 인증
│   ├── Chat/               # 실시간 채팅
│   ├── Product/            # 상품 목록, 상세, 등록, 수정
│   ├── MyPage/             # 마이페이지 (판매·구매·위시리스트)
│   ├── Notice/             # 공지사항
│   ├── Inquiry/            # 1:1 문의
│   ├── Notification/       # 알림
│   └── Report/             # 신고
├── App.jsx
├── UserContext.jsx
└── main.jsx
```

<br>

## ⚙️ 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 값을 설정하세요.

| 변수명 | 설명 |
|---|---|
| `VITE_IAMPORT_CODE` | 아임포트 가맹점 식별 코드 |
| `VITE_KAKAO_KEY` | 카카오 Maps / 우편번호 API 키 |

```env
VITE_IAMPORT_CODE=your_iamport_code
VITE_KAKAO_KEY=your_kakao_api_key
```

> ⚠️ 모든 환경 변수는 반드시 `VITE_` 접두사로 시작해야 합니다.

<br>

## 🚀 실행 방법

### 사전 요건
- Node.js 22+
- 실행 중인 백엔드 서버 (`http://localhost:8080`)

### 로컬 개발 환경

```bash
git clone https://github.com/{your-username}/hsmarket-frontend.git
cd hsmarket-frontend

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
docker build -t hsmarket-frontend .

# 컨테이너 실행
docker run -p 80:80 hsmarket-frontend
```

### Docker Compose (권장)

```bash
# docker-compose.yml에 환경 변수 설정 후
docker-compose up -d --build frontend
```

<br>

## 🔗 API 프록시 설정

| 경로 | 대상 | 설명 |
|---|---|---|
| `/api/*` | `http://backend:8080` | 백엔드 REST API |
| `/ws-chat/*` | `http://backend:8080` | WebSocket 채팅 서버 |

로컬 개발 시 `vite.config.js`의 `API_TARGET` 환경 변수로 백엔드 주소를 변경할 수 있습니다.

<br>

## 🔄 CI/CD

`main` 브랜치 push 시 GitHub Actions가 자동으로 배포합니다.

```
1. 소스 코드 체크아웃
2. SCP로 GCP 서버에 코드 전송
3. SSH로 GCP 서버 접속 → Docker 컨테이너 재빌드 및 재시작
```

<br>

## 👥 팀원 소개

> 전원 풀스택으로 프론트엔드와 백엔드를 함께 담당했습니다.

| 이름 | 담당 기능 |
|------|-----------|
| **강태준** | 채팅 기능, 알림 기능, 관리자 채팅 관리 페이지, 서버 배포 (CI/CD) |
| **송은설** | 로그인/로그아웃, 회원가입, 내 정보 조회·수정, 회원탈퇴, 소셜 로그인·소셜 내 정보 수정 |
| **김민석** | 내 근처 목록, 판매내역·관심목록, 동네 인증, 결제 기능 |
| **강석영** | 상품 등록·목록·상세·수정, 신고 기능 |
| **김태헌** | 헤더 검색·인기 검색어, 관리자 대시보드·통계·상품·거래·카테고리·사용자·신고·관리 페이지, 사이드바 |
| **김덕식** | 공지사항, 자주 묻는 질문 |

<details>
<summary>📋 상세 역할 분담 보기</summary>

### 공통
| 작업 | 담당 |
|------|------|
| 메인 index 페이지 | 팀 전원 |
| Github 작업 세팅 | 팀 전원 |
| WBS / 테이블 명세서 / 요구사항 정의서 | 팀 전원 |

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

### 인프라
| 작업 | 담당 |
|------|------|
| 서버 배포 (CI/CD 자동화) | 강태준 |

</details>

<br>

## 📄 라이선스

본 프로젝트는 팀 프로젝트 학습 목적으로 제작되었습니다.
