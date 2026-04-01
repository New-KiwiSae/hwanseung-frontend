import DaumPostcode from 'react-daum-postcode';
import { useState, useEffect, useCallback } from "react"; // 🚩 useEffect, useCallback 추가 확인!
import { login, signUp } from "../api/AuthAPI";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css"; 

export default function AuthPage() {
    const navigate = useNavigate();
    const [isSignUpActive, setIsSignUpActive] = useState(false);
    const [errors, setErrors] = useState({});
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  
    const [signUpValues, setSignUpValues] = useState({
        userid: "", username: "", password: "", nickname: "",
        email: "", contact: "", zipCode: "", address: "",
        detailAddress: "", birthday: "", gender: "MALE",
    });

    const [signInValues, setSignInValues] = useState({
        userid: "",
        password: "",
    });

    // 🚩 1. 유효성 검사 함수를 상단으로 올리고 useCallback으로 감쌉니다.
    const validateSignUp = useCallback(() => {
        const newErrors = {};

        // 아이디: 값이 있을 때만 검사 (글자 수가 모자라면 즉시 에러)
        if (signUpValues.userid && signUpValues.userid.length < 4) {
            newErrors.userid = "아이디는 4자 이상이어야 합니다.";
        }
        
        if (signUpValues.password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(signUpValues.password)) {
            newErrors.password = "대/소문자, 숫자, 특수문자 포함 8자 이상이어야 합니다.";
        }
    }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (signUpValues.email && !emailRegex.test(signUpValues.email)) {
            newErrors.email = "올바른 이메일 형식이 아닙니다.";
        }

        const contactRegex = /^[0-9]{10,11}$/;
        if (signUpValues.contact && !contactRegex.test(signUpValues.contact)) {
            newErrors.contact = "연락처는 숫자 10~11자리여야 합니다.";
        }

        if (signUpValues.nickname && (signUpValues.nickname.length < 2 || signUpValues.nickname.length > 8)) {
            newErrors.nickname = "닉네임은 2자에서 8자 사이로 입력해주세요.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [signUpValues]); // signUpValues가 변할 때만 함수 재생성

    // 🚩 2. 실시간 감시 useEffect
    useEffect(() => {
        const hasValues = Object.values(signUpValues).some(val => val !== "");
        if (!hasValues) {
            setErrors({});
            return;
        }

        validateSignUp();
    }, [signUpValues, validateSignUp]); // 의존성 배열에 포함

    // 핸들러 함수들
    const handleSignUpChange = (e) => {
        const { id, value, name } = e.target;
        const targetId = id || name;
        setSignUpValues(prev => ({ ...prev, [targetId]: value }));
    };

    const handleSignInChange = (e) => {
        setSignInValues(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const onSignInSubmit = async (e) => {
        e.preventDefault();
        login(signInValues).then((response) => {
            localStorage.setItem('tokenType', response.data.tokenType);
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            navigate("/", { replace: true });
        }).catch((error) => {
            alert("로그인 정보가 올바르지 않습니다.");
        });
    };

    const onSignUpSubmit = async (e) => {
        e.preventDefault();
        if (!validateSignUp()) {
            alert("입력 정보를 다시 확인해주세요.");
            return;
        }

        signUp(signUpValues).then(() => {
            alert("회원가입이 완료되었습니다!");
            setIsSignUpActive(false);
        }).catch((error) => {
            alert("가입 중 오류가 발생했습니다.");
        });
    };

    const handleComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            }
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        // 기존 signUpValues 상태 업데이트
        setSignUpValues({
            ...signUpValues,
            zipCode: data.zonecode, // 우편번호
            address: fullAddress,   // 기본 주소
        });

        setIsPostcodeOpen(false); // 검색 완료 후 팝업 닫기
    };

    return (
        <div className="auth-page-wrapper">
            {isPostcodeOpen && (
                <>
                    <div className="postcode-overlay" onClick={() => setIsPostcodeOpen(false)} />
                    <div className="postcode-modal">
                        <div className="postcode-header">
                            <span>주소 검색</span>
                            <button 
                                type="button" 
                                className="postcode-close-btn" 
                                onClick={() => setIsPostcodeOpen(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <DaumPostcode 
                            onComplete={handleComplete} 
                            style={{ width: "100%", height: "500px" }} 
                        />
                    </div>
                </>
            )}
            <div className={`container ${isSignUpActive ? "right-panel-active" : ""}`} id="container">
                <div className="form-container sign-up-container">
                    <form onSubmit={onSignUpSubmit} className="scrollable-form">
                        <h2>회원가입</h2>
                        <div className="social-login">
                            <a href="#" className="social-btn"><i className="fab fa-google"></i></a>
                            <a href="#" className="social-btn"><b>K</b></a>
                            <a href="#" className="social-btn"><i className="fab fa-apple"></i></a>
                        </div>
                        <span className="sub-text">기본 정보 입력</span>
                        
                        <div className="input-group">
                            <input type="text" id="userid" placeholder="아이디" onChange={handleSignUpChange} value={signUpValues.userid} required />
                            <i className="fas fa-id-badge"></i>
                            {errors.userid && <span className="error-msg">{errors.userid}</span>}
                        </div>

                        <div className="input-group">
                            <input type="text" id="username" placeholder="이름(실명)" onChange={handleSignUpChange} value={signUpValues.username} required />
                            <i className="fas fa-user"></i>
                        </div>

                        <div className="input-group">
                            <input type="password" id="password" placeholder="비밀번호" onChange={handleSignUpChange} value={signUpValues.password} required />
                            <i className="fas fa-lock"></i>
                            {errors.password && <span className="error-msg">{errors.password}</span>}
                        </div>

                        <div className="input-group">
                            <input type="text" id="nickname" placeholder="닉네임" onChange={handleSignUpChange} value={signUpValues.nickname} maxLength={8} required />
                            <i className="fas fa-smile"></i>
                            {errors.nickname && <span className="error-msg">{errors.nickname}</span>}
                        </div>

                        <div className="input-group">
                            <input type="email" id="email" placeholder="이메일" onChange={handleSignUpChange} value={signUpValues.email} required />
                            <i className="fas fa-envelope"></i>
                            {errors.email && <span className="error-msg">{errors.email}</span>}
                        </div>
                        
                        <div className="input-group with-btn">
                            <div className="input-wrapper">
                                <input type="tel" id="contact" placeholder="연락처 (숫자만)" onChange={handleSignUpChange} value={signUpValues.contact} required />
                                <i className="fas fa-phone"></i>
                                {errors.contact && <span className="error-msg">{errors.contact}</span>}
                            </div>
                            <button type="button" className="btn small-btn outline-btn">본인인증</button>
                        </div>

                        <div className="address-group">
                            <div className="input-group with-btn">
                                <div className="input-wrapper">
                                    <input type="text" id="zipCode" placeholder="우편번호" value={signUpValues.zipCode} readOnly required />
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <button type="button" className="btn small-btn" onClick={() => setIsPostcodeOpen(true)}>주소검색</button>
                            </div>
                            <div className="input-group">
                                <input type="text" id="address" placeholder="주소" value={signUpValues.address} readOnly required />
                                <i className="fas fa-home"></i>
                            </div>
                            <div className="input-group">
                                <input type="text" id="detailAddress" placeholder="상세주소" onChange={handleSignUpChange} value={signUpValues.detailAddress} required />
                                <i className="fas fa-building"></i>
                            </div>
                        </div>

                        <div className="input-group">
                            <input type="date" id="birthday" onChange={handleSignUpChange} value={signUpValues.birthday} required />
                        </div>

                        <div className="gender-group">
                            <label className="gender-radio">
                                <input type="radio" name="gender" value="MALE" checked={signUpValues.gender === "MALE"} onChange={handleSignUpChange} /> 남성
                            </label>
                            <label className="gender-radio">
                                <input type="radio" name="gender" value="FEMALE" checked={signUpValues.gender === "FEMALE"} onChange={handleSignUpChange} /> 여성
                            </label>
                        </div>

                        <button type="submit" className="btn primary-btn">가입하기</button>
                    </form>
                </div>

                {/* 로그인 영역 */}
                <div className="form-container sign-in-container">
                    <form onSubmit={onSignInSubmit}>
                        <div className="logo"><i className="fas fa-sync-alt"></i></div>
                        <h2>로그인</h2>
                        <div className="social-login">
                            <a href="#" className="social-btn"><i className="fab fa-google"></i></a>
                            <a href="#" className="social-btn"><b>K</b></a>
                            <a href="#" className="social-btn"><i className="fab fa-apple"></i></a>
                        </div>
                        <span className="sub-text">또는 이메일 계정으로 로그인하세요</span>
                        
                        <div className="input-group">
                            <input type="text" id="userid" placeholder="아이디" onChange={handleSignInChange} value={signInValues.userid} required />
                            <i className="fas fa-id-badge"></i>
                        </div>
                        <div className="input-group">
                            <input type="password" id="password" placeholder="비밀번호" onChange={handleSignInChange} value={signInValues.password} required />
                            <i className="fas fa-lock"></i>
                        </div>
                        <a href="#" className="footer-link">비밀번호를 잊으셨나요?</a>
                        <button type="submit" className="btn primary-btn" style={{ marginTop: "20px" }}>로그인</button>
                    </form>
                </div>

                {/* 오버레이 */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>다시 찾아주셔서 <br/>감사합니다!</h1>
                            <p>쓰던 물건을 가치 있게,<br/>새로운 주인에게 환승하세요.</p>
                            <button className="btn ghost" onClick={() => setIsSignUpActive(false)}>로그인</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>처음이신가요?</h1>
                            <p>안전하고 빠른 중고거래 플랫폼,<br/>환승마켓에 가입해보세요.</p>
                            <button className="btn ghost" onClick={() => setIsSignUpActive(true)}>회원가입</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}