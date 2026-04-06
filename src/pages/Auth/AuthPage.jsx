import DaumPostcode from 'react-daum-postcode';
import { useState, useEffect, useCallback } from "react";
import { login, signUp } from "../../api/AuthAPI";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuthPage.css";
import { useUser } from "../../UserContext";

export default function AuthPage() {
    const navigate = useNavigate();
    const { fetchUser } = useUser();

    const [isSignUpActive, setIsSignUpActive] = useState(false);
    const [errors, setErrors] = useState({});
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
    
    const [isIdChecked, setIsIdChecked] = useState(false);
    const [isNicknameChecked, setIsNicknameChecked] = useState(false);
    const [isEmailChecked, setIsEmailChecked] = useState(false);

    const [signUpValues, setSignUpValues] = useState({
        username: "",
        name: "",
        password: "",
        nickname: "",
        email: "",
        contact: "",
        zipCode: "",
        address: "",
        detailAddress: "",
        birthday: "",
        gender: "MALE",
    });

    const [signInValues, setSignInValues] = useState({
        username: "",
        password: "",
    });

    // --- 유효성 검사 (useCallback으로 최적화) ---
    const validateSignUp = useCallback(() => {
        const newErrors = {};

        if (signUpValues.username && signUpValues.username.length < 4) {
            newErrors.username = "아이디는 4자 이상이어야 합니다.";
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
            newErrors.nickname = "닉네임은 2자에서 8자 사이입니다.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [signUpValues]);

    // 실시간 유효성 감시
    useEffect(() => {
        const hasValues = Object.values(signUpValues).some(val => val !== "");
        if (!hasValues) {
            setErrors({});
            return;
        }
        validateSignUp();
    }, [signUpValues, validateSignUp]);

    // --- 핸들러 함수들 ---

    // 중복 확인 버튼 클릭 이벤트
    const handleDuplicateCheck = async (type, value) => {
        if (!value || errors[type]) {
            alert("입력 형식이 올바르지 않습니다.");
            return;
        }

        try {
            // 백엔드 API 호출 (설계된 엔드포인트에 맞춰 수정)
            const response = await axios.get(`/api/auth/check-${type}`, { params: { [type]: value } });

            if (response.data.isDuplicate) {
                alert(`이미 사용 중인 ${type === 'username' ? '아이디' : type}입니다.`);
            } else {
                alert(`사용 가능한 ${type === 'username' ? '아이디' : type}입니다!`);
                if (type === 'username') setIsIdChecked(true);
                if (type === 'nickname') setIsNicknameChecked(true);
                if (type === 'email') setIsEmailChecked(true);
            }
        } catch (error) {
            alert("중복 체크 연결에 실패했습니다.");
        }
    };

    const handleSignUpChange = (e) => {
        const { id, value, name } = e.target;
        const targetId = id || name;
        setSignUpValues(prev => ({ ...prev, [targetId]: value }));

        // 값이 변경되면 중복 확인 상태 초기화 (다시 확인하도록 유도)
        if (targetId === 'username') setIsIdChecked(false);
        if (targetId === 'nickname') setIsNicknameChecked(false);
        if (targetId === 'email') setIsEmailChecked(false);
    };

    const handleSignInChange = (e) => {
        setSignInValues(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const onSignInSubmit = async (e) => {
        e.preventDefault();
        login(signInValues).then((response) => {
            sessionStorage.setItem('tokenType', response.data.tokenType);
            sessionStorage.setItem('accessToken', response.data.accessToken);
            sessionStorage.setItem('refreshToken', response.data.refreshToken);
            sessionStorage.setItem('username', signInValues.username);
            window.location.href = "/";
            navigate("/", { replace: true });
        }).catch(() => {
            alert("로그인 정보가 올바르지 않습니다.");
        });
    };

    const onSignUpSubmit = async (e) => {
        e.preventDefault();

        if (!validateSignUp()) {
            alert("입력 정보를 다시 확인해주세요.");
            return;
        }

        // 아이디, 닉네임은 필수이므로 체크
        if (!isIdChecked || !isNicknameChecked) {
            alert("아이디와 닉네임 중복 확인을 완료해주세요.");
            return;
        }

        // 이메일은 입력했을 때만 중복 확인 체크
        if (signUpValues.email && !isEmailChecked) {
            alert("입력하신 이메일의 중복 확인을 완료해주세요.");
            return;
        }

        signUp(signUpValues).then(() => {
            alert("회원가입이 완료되었습니다!");
            setIsSignUpActive(false);
        }).catch(() => {
            alert("가입 중 오류가 발생했습니다.");
        });
    };

    const handleComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        setSignUpValues({
            ...signUpValues,
            zipCode: data.zonecode,
            address: fullAddress,
        });

        setIsPostcodeOpen(false);
    };

    return (
        <div className="auth-page-wrapper">
            {/* 주소 검색 모달 */}
            {isPostcodeOpen && (
                <>
                    <div className="postcode-overlay" onClick={() => setIsPostcodeOpen(false)} />
                    <div className="postcode-modal">
                        <div className="postcode-header">
                            <span>주소 검색</span>
                            <button type="button" className="postcode-close-btn" onClick={() => setIsPostcodeOpen(false)}>&times;</button>
                        </div>
                        <DaumPostcode onComplete={handleComplete} style={{ width: "100%", height: "500px" }} />
                    </div>
                </>
            )}

            <div className={`container ${isSignUpActive ? "right-panel-active" : ""}`} id="container">

                {/* 회원가입 영역 */}
                <div className="form-container sign-up-container">
                    <form onSubmit={onSignUpSubmit} className="scrollable-form">
                        <h2>회원가입</h2>
                        <div className="social-login">
                            <a href="#" className="social-btn"><i className="fab fa-google"></i></a>
                            <a href="#" className="social-btn"><b>K</b></a>
                            <a href="#" className="social-btn"><i className="fab fa-apple"></i></a>
                        </div>
                        <span className="sub-text">기본 정보 입력</span>

                        {/* 아이디 + 중복확인 */}
                        <div className="input-group with-btn">
                            <div className="input-wrapper">
                                <input type="text" id="username" placeholder="아이디" onChange={handleSignUpChange} value={signUpValues.username} required />
                                <i className="fas fa-id-badge"></i>
                                {errors.username && <span className="error-msg">{errors.username}</span>}
                            </div>
                            <button
                                type="button"
                                className={`btn small-btn ${isIdChecked ? 'success-btn' : 'outline-btn'}`}
                                onClick={() => handleDuplicateCheck('username', signUpValues.username)}
                            >
                                {isIdChecked ? "확인됨" : "중복확인"}
                            </button>
                        </div>
                        <div className="input-group">
                            <input type="password" id="password" placeholder="비밀번호" onChange={handleSignUpChange} value={signUpValues.password} required />
                            <i className="fas fa-lock"></i>
                            {errors.password && <span className="error-msg">{errors.password}</span>}
                        </div>

                        <div className="input-group">
                            <input type="text" id="name" placeholder="이름(실명)" onChange={handleSignUpChange} value={signUpValues.name} required />
                            <i className="fas fa-user"></i>
                        </div>


                        {/* 닉네임 + 중복확인 */}
                        <div className="input-group with-btn">
                            <div className="input-wrapper">
                                <input type="text" id="nickname" placeholder="닉네임" onChange={handleSignUpChange} value={signUpValues.nickname} maxLength={8} required />
                                <i className="fas fa-smile"></i>
                                {errors.nickname && <span className="error-msg">{errors.nickname}</span>}
                            </div>
                            <button
                                type="button"
                                className={`btn small-btn ${isNicknameChecked ? 'success-btn' : 'outline-btn'}`}
                                onClick={() => handleDuplicateCheck('nickname', signUpValues.nickname)}
                            >
                                {isNicknameChecked ? "확인됨" : "중복확인"}
                            </button>
                        </div>
                        <div className="input-group with-btn">
                            <div className="input-wrapper">
                                <input type="tel" id="contact" placeholder="연락처 (숫자만)" onChange={handleSignUpChange} value={signUpValues.contact} required />
                                <i className="fas fa-phone"></i>
                                {errors.contact && <span className="error-msg">{errors.contact}</span>}
                            </div>
                            <button type="button" className="btn small-btn outline-btn">본인인증</button>
                        </div>

                        {/* 이메일 + 중복확인 */}
                        <div className="input-group with-btn">
                            <div className="input-wrapper">
                                <input type="email" id="email" placeholder="이메일" onChange={handleSignUpChange} value={signUpValues.email} />
                                <i className="fas fa-envelope"></i>
                                {errors.email && <span className="error-msg">{errors.email}</span>}
                            </div>
                            <button
                                type="button"
                                className={`btn small-btn ${isEmailChecked ? 'success-btn' : 'outline-btn'}`}
                                onClick={() => handleDuplicateCheck('email', signUpValues.email)}
                            >
                                {isEmailChecked ? "확인됨" : "중복확인"}
                            </button>
                        </div>

                        <span className="sub-text">선택 정보 입력</span>

                        <div className="address-group">
                            <div className="input-group with-btn">
                                <div className="input-wrapper">
                                    <input type="text" id="zipCode" placeholder="우편번호" value={signUpValues.zipCode} readOnly />
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <button type="button" className="btn small-btn" onClick={() => setIsPostcodeOpen(true)}>주소검색</button>
                            </div>
                            <div className="input-group">
                                <input type="text" id="address" placeholder="주소" value={signUpValues.address} readOnly />
                                <i className="fas fa-home"></i>
                            </div>
                            <div className="input-group">
                                <input type="text" id="detailAddress" placeholder="상세주소" onChange={handleSignUpChange} value={signUpValues.detailAddress} />
                                <i className="fas fa-building"></i>
                            </div>
                        </div>

                        <div className="input-group">
                            <input type="date" id="birthday" onChange={handleSignUpChange} value={signUpValues.birthday} />
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
                            <input type="text" id="username" placeholder="아이디" onChange={handleSignInChange} value={signInValues.username} required />
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

                {/* 오버레이 영역 */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>다시 찾아주셔서 <br />감사합니다!</h1>
                            <p>쓰던 물건을 가치 있게,<br />새로운 주인에게 환승하세요.</p>
                            <button className="btn ghost" onClick={() => setIsSignUpActive(false)}>로그인</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>처음이신가요?</h1>
                            <p>안전하고 빠른 중고거래 플랫폼,<br />환승마켓에 가입해보세요.</p>
                            <button className="btn ghost" onClick={() => setIsSignUpActive(true)}>회원가입</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}