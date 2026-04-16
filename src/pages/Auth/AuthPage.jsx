import DaumPostcode from 'react-daum-postcode';
import { useState, useEffect, useCallback } from "react";
import { login, signUp } from "../../api/AuthAPI";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuthPage.css";
import { useUser } from "../../UserContext";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

export default function AuthPage() {
    const navigate = useNavigate();
    const { fetchUser } = useUser();

    const [isSignUpActive, setIsSignUpActive] = useState(false);
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    const [isIdChecked, setIsIdChecked] = useState(false);
    const [isNicknameChecked, setIsNicknameChecked] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [errors, setErrors] = useState({});
    const [isContactVerified, setIsContactVerified] = useState(false);
    const [smsCode, setSmsCode] = useState("");
    const [isSmsSent, setIsSmsSent] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isSocialSignup, setIsSocialSignup] = useState(false);



    const [signUpValues, setSignUpValues] = useState({
        username: "",
        name: "",
        password: "",
        confirmPassword: "",
        nickname: "",
        email: "",
        contact: "",
        zipCode: "",
        address: "",
        detailAddress: "",
        birthday: "",
        gender: null,
    });

    const [signInValues, setSignInValues] = useState({
        username: "",
        password: "",
    });

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

        if (signUpValues.confirmPassword && signUpValues.password !== signUpValues.confirmPassword) {
            newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
        }

        if (signUpValues.name) {
            const nameRegex = /^[가-힣a-zA-Z]{2,20}$/;
            if (!nameRegex.test(signUpValues.name)) {
                newErrors.name = "이름은 한글 또는 영문 2자~20자 이내여야 합니다.";
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (signUpValues.email && !emailRegex.test(signUpValues.email)) {
            newErrors.email = "올바른 이메일 형식이 아닙니다.";
        }

        const contactRegex = /^[0-9]{11}$/;
        if (signUpValues.contact && !contactRegex.test(signUpValues.contact)) {
            newErrors.contact = "연락처는 숫자 11자리여야 합니다.";
        }

        if (signUpValues.nickname && !/^[가-힣a-zA-Z0-9_]{2,8}$/.test(signUpValues.nickname)) {
            newErrors.nickname = "닉네임 형식이 올바르지 않습니다. (2~8자, 언더바 허용)";
        }

        if (signUpValues.birthday) {
            const selectedDate = new Date(signUpValues.birthday);
            const today = new Date();

            today.setHours(23, 59, 59, 999);

            if (selectedDate > today) {
                newErrors.birthday = "생년월일은 미래 날짜를 선택할 수 없습니다.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [signUpValues]);

    useEffect(() => {
        const hasValues = Object.values(signUpValues).some(val => val !== "");
        if (!hasValues) {
            setErrors({});
            return;
        }
        validateSignUp();
    }, [signUpValues, validateSignUp]);


    const handleDuplicateCheck = async (type, value) => {
        if (!value || errors[type]) {
            alert("입력 형식이 올바르지 않습니다.");
            return;
        }

        const typeNames = {
            username: "아이디",
            nickname: "닉네임",
            email: "이메일"
        };
        const displayName = typeNames[type] || type;

        try {
            const response = await axios.get(`/api/auth/check-${type}`, { params: { [type]: value } });

            if (response.data.isDuplicate) {
                alert(`이미 사용 중인 ${displayName}입니다.`);
            } else {
                alert(`사용 가능한 ${displayName}입니다!`);

                if (type === 'username') setIsIdChecked(true);
                if (type === 'nickname') setIsNicknameChecked(true);
            }
        } catch (error) {
            alert(`${displayName} 중복 체크 연결에 실패했습니다.`);
        }
    };

    const handleSignUpChange = (e) => {
        const { id, value, name } = e.target;
        const targetId = id || name;

        let finalValue = value;
        if (targetId === "gender" && value === "") {
            finalValue = null;
        }

        setSignUpValues(prev => ({ ...prev, [targetId]: finalValue }));

        if (targetId === 'username') setIsIdChecked(false);
        if (targetId === 'nickname') setIsNicknameChecked(false);
    };

    const handleSendVerification = async () => {
        if (!signUpValues.email || errors.email) {
            alert("올바른 이메일 형식을 입력해주세요.");
            return;
        }
        try {
            const response = await axios.post('/api/auth/email/send-code', {
                email: signUpValues.email
            });
            alert("인증번호가 발송되었습니다. 메일함을 확인해주세요.");
            setIsEmailSent(true); 
        } catch (error) {
            if (error.response?.status === 409) {
                setErrors({ ...errors, email: "이미 사용 중인 이메일입니다." });
            } else {
                alert("메일 발송에 실패했습니다.");
            }
        }

    };

    const handleVerifyCode = async () => {
        try {
            await axios.post('/api/auth/verify-code', {
                key: signUpValues.email,
                code: verificationCode
            });
            setIsEmailVerified(true);
            alert("이메일 인증이 성공했습니다.");
        } catch (error) {
            setErrors({ ...errors, verificationCode: "인증번호가 일치하지 않습니다." });
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    useEffect(() => {
        let timer;
        if (isTimerActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsTimerActive(false);
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isTimerActive, timeLeft]);

    const handleSendSms = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!signUpValues.contact || errors.contact) {
            alert("올바른 연락처를 입력해주세요.");
            return;
        }
        try {
            await axios.post('/api/auth/sms/send-code', {
                phoneNumber: signUpValues.contact
            });

            setTimeLeft(180);
            setIsTimerActive(true);
            setIsSmsSent(true);
            alert("인증번호가 발송되었습니다.");
        } catch (error) {
            const errorMsg = error.response?.data || "발송 실패. 잠시 후 다시 시도해주세요.";
            alert(errorMsg);
            return;
        }

    };

    const handleVerifySmsCode = async () => {
        try {
            await axios.post('/api/auth/verify-code', {
                key: signUpValues.contact,
                code: smsCode
            });
            setIsContactVerified(true);
            alert("휴대폰 인증이 완료되었습니다.");
        } catch (error) {
            alert("인증번호가 일치하지 않습니다.");
        }
    };

    const handleSignInChange = (e) => {
        setSignInValues(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const onSignInSubmit = async (e) => {
        e.preventDefault();
        login(signInValues).then(async (response) => {
            sessionStorage.setItem('tokenType', response.data.tokenType);
            sessionStorage.setItem('accessToken', response.data.accessToken);
            sessionStorage.setItem('refreshToken', response.data.refreshToken);
            sessionStorage.setItem('username', signInValues.username);

            await fetchUser(); 

            window.location.href = "/";
        }).catch((error) => {
            const errorMessage = error.response?.data?.message || "로그인 정보가 올바르지 않습니다.";

            alert(errorMessage);
            console.error("에러 발생:", error.response?.data);
        });
    };

    const onSignUpSubmit = async (e) => {
        e.preventDefault();

        if (!validateSignUp()) {
            alert("입력 정보를 다시 확인해주세요.");
            return;
        }

        if (signUpValues.password !== signUpValues.confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (!isIdChecked || !isNicknameChecked) {
            alert("아이디와 닉네임 중복 확인을 완료해주세요.");
            return;
        }

        if (!isEmailVerified) {
            alert("이메일 인증을 완료해주세요.");
            return;
        }

        if (!isContactVerified) {
            alert("휴대폰 본인인증을 완료해주세요.");
            return;
        }

        signUp(signUpValues).then(() => {
            alert("회원가입이 완료되었습니다!");

            setSignUpValues({
                username: "",
                name: "",
                password: "",
                confirmPassword: "",
                nickname: "",
                email: "",
                contact: "",
                zipCode: "",
                address: "",
                detailAddress: "",
                birthday: "",
                gender: null,
            });

            setIsIdChecked(false);
            setIsNicknameChecked(false);
            setIsEmailVerified(false);
            setIsContactVerified(false);
            setVerificationCode("");
            setSmsCode("");
            setIsSmsSent(false);
            setErrors({});
            setIsSignUpActive(false);
            setIsEmailSent(false);
            setIsSocialSignup(false);

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

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            sessionStorage.clear();

            const response = await axios.post("/api/auth/google", {
                token: credentialResponse.credential
            }, {
                headers: {
                    'Authorization': '',
                    'REFRESH_TOKEN': ''
                }
            });

            const { accessToken, refreshToken, status, tokenType } = response.data;

            const decoded = jwtDecode(accessToken);
            const usernameFromToken = decoded.sub || decoded.username;

            sessionStorage.setItem('accessToken', accessToken);
            sessionStorage.setItem('refreshToken', refreshToken);
            sessionStorage.setItem('username', usernameFromToken);
            sessionStorage.setItem('status', status);
            sessionStorage.setItem('tokenType', tokenType || 'Bearer');

            await fetchUser();

            if (status === "PENDING") {
                alert("추가 정보 입력이 필요합니다.");
                navigate("/social-signup-extra");
            } else {
                navigate("/");
            }

        } catch (error) {
            console.error("구글 로그인 처리 중 에러:", error);
            const errorMsg = error.response?.data?.message || "로그인에 실패했습니다.";
            alert(errorMsg);
        }
    };

    return (
        <div className="auth-page-wrapper">
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

                <div className={`form-container sign-up-container ${isSignUpActive ? "active" : ""}`}>
                    <form onSubmit={(e) => e.preventDefault()}>

                        <div className="mobile-overlay-header">
                            <h1>처음이신가요?</h1>
                            <p>환승마켓에 가입해보세요.</p>
                            <button type="button" className="btn ghost-green" onClick={() => setIsSignUpActive(false)}>로그인으로 이동</button>
                        </div>
                        <div className="scrollable-form">
                            <h2>회원가입</h2>
                            <div className="social-login">
                                <div className="social-login" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => console.log('Login Failed')}
                                        type="icon"
                                        shape="circle"
                                        theme="outline"
                                        size="large"
                                    />
                                </div>
                            </div>
                            <span className="sub-text">기본 정보 입력</span>

                            <div className="input-group with-btn">
                                <div className="input-wrapper">
                                    <input type="text" id="username" placeholder="아이디" onChange={handleSignUpChange} value={signUpValues.username} required />
                                    <i className="fas fa-id-badge"></i>
                                </div>
                                <button
                                    type="button"
                                    className={`btn small-btn ${isIdChecked ? 'success-btn' : 'outline-btn'}`}
                                    onClick={() => handleDuplicateCheck('username', signUpValues.username)}
                                >
                                    {isIdChecked ? "확인됨" : "중복확인"}
                                </button>
                                {errors.username && <span className="error-msg">{errors.username}</span>}
                            </div>

                            <div className="input-group">
                                <div className="input-wrapper">
                                    <input type="password" id="password" placeholder="비밀번호" onChange={handleSignUpChange} value={signUpValues.password} required />
                                    <i className="fas fa-lock"></i>
                                </div>
                                {errors.password && <span className="error-msg">{errors.password}</span>}
                            </div>

                            <div className="input-group">
                                <div className="input-wrapper">
                                    <input type="password" id="confirmPassword" placeholder="비밀번호 재확인"
                                        onChange={handleSignUpChange} value={signUpValues.confirmPassword} required />
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
                            </div>

                            <div className="input-group">
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        id="name"
                                        placeholder="이름(실명)"
                                        onChange={handleSignUpChange}
                                        value={signUpValues.name}
                                        maxLength={20}
                                        required
                                    />
                                    <i className="fas fa-user"></i>
                                </div>
                                {errors.name && <span className="error-msg">{errors.name}</span>}
                            </div>

                            <div className="input-group with-btn">
                                <div className="input-wrapper">
                                    <input type="text" id="nickname" placeholder="닉네임" onChange={handleSignUpChange} value={signUpValues.nickname} maxLength={8} required />
                                    <i className="fas fa-smile"></i>
                                </div>
                                <button
                                    type="button"
                                    className={`btn small-btn ${isNicknameChecked ? 'success-btn' : 'outline-btn'}`}
                                    onClick={() => handleDuplicateCheck('nickname', signUpValues.nickname)}
                                >
                                    {isNicknameChecked ? "확인됨" : "중복확인"}
                                </button>
                                {errors.nickname && <span className="error-msg">{errors.nickname}</span>}
                            </div>

                            <div className="input-group with-btn">
                                <div className="input-wrapper">
                                    <input type="tel" id="contact" placeholder="연락처 (숫자만)" onChange={handleSignUpChange} value={signUpValues.contact} disabled={isContactVerified} required />
                                    <i className="fas fa-phone"></i>
                                </div>
                                <button
                                    type="button"
                                    className={`btn small-btn ${isContactVerified ? 'success-btn' : 'outline-btn'}`}
                                    onClick={(e) => {
                                        handleSendSms(e);
                                        return false;
                                    }}
                                    disabled={isContactVerified}
                                >
                                    {isContactVerified ? "인증완료" : "인증번호발송"}
                                </button>
                                {errors.contact && <span className="error-msg">{errors.contact}</span>}
                            </div>

                            {isSmsSent && !isContactVerified && (
                                <div className="input-group-container">
                                    <div className="input-group with-btn">
                                        <div className="input-wrapper">
                                            <input
                                                type="text"
                                                placeholder="인증번호 6자리"
                                                onChange={(e) => setSmsCode(e.target.value)}
                                                value={smsCode}
                                            />
                                            <i className="fas fa-key"></i>
                                            <span className={`timer-text ${timeLeft < 30 ? 'warning' : ''}`}>
                                                {formatTime(timeLeft)}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn small-btn primary-btn"
                                            onClick={handleVerifySmsCode}
                                            disabled={timeLeft === 0}
                                        >
                                            확인
                                        </button>
                                    </div>

                                    <div className="resend-wrapper">
                                        <span>번호를 받지 못하셨나요?</span>
                                        <button type="button" className="resend-btn" onClick={handleSendSms}>
                                            재전송하기
                                        </button>
                                    </div>
                                </div>
                            )}


                            <div className="input-group with-btn">
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="이메일 주소"
                                        onChange={handleSignUpChange}
                                        value={signUpValues.email}
                                        disabled={isEmailVerified}
                                        required
                                    />
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <button
                                    type="button"
                                    className={`btn small-btn ${isEmailVerified ? 'success-btn' : 'outline-btn'}`}
                                    onClick={handleSendVerification}
                                    disabled={isEmailVerified}
                                >
                                    {isEmailVerified ? "인증완료" : "인증번호발송"}
                                </button>
                                {errors.email && <span className="error-msg">{errors.email}</span>}
                            </div>

                            {isEmailSent && !isEmailVerified && (
                                <div className="input-group with-btn">
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            id="verificationCode"
                                            placeholder="인증번호 6자리"
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            value={verificationCode} />
                                        <i className="fas fa-key"></i>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn small-btn primary-btn"
                                        onClick={handleVerifyCode} > 확인
                                    </button>
                                    {errors.verificationCode && <span className="error-msg">{errors.verificationCode}</span>}
                                </div>
                            )}

                            <hr className="gray-line" />
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
                                    <div className="input-wrapper">
                                        <input type="text" id="address" placeholder="주소" value={signUpValues.address} readOnly />
                                        <i className="fas fa-home"></i>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <div className="input-wrapper">
                                        <input type="text" id="detailAddress" placeholder="상세주소" onChange={handleSignUpChange} value={signUpValues.detailAddress} disabled={!signUpValues.address} className={!signUpValues.address ? "disabled-input" : ""} />
                                        <i className="fas fa-building"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="input-group">
                                <input type="date" id="birthday" onChange={handleSignUpChange} value={signUpValues.birthday} max={new Date().toISOString().split("T")[0]} />
                            </div>

                            <div className="gender-group">
                                <label className="gender-radio">
                                    <input type="radio" name="gender" value="" checked={signUpValues.gender === "" || signUpValues.gender === null} onChange={handleSignUpChange} /> 선택안함
                                </label>
                                <label className="gender-radio">
                                    <input type="radio" name="gender" value="MALE" checked={signUpValues.gender === "MALE"} onChange={handleSignUpChange} /> 남성
                                </label>
                                <label className="gender-radio">
                                    <input type="radio" name="gender" value="FEMALE" checked={signUpValues.gender === "FEMALE"} onChange={handleSignUpChange} /> 여성
                                </label>
                            </div>
                        </div>
                        <button type="button" className="btn primary-btn" onClick={onSignUpSubmit}>가입하기</button>
                    </form>
                </div>

                <div className={`form-container sign-in-container ${isSignUpActive ? "" : "active"}`}>
                    <form onSubmit={onSignInSubmit}>

                        <div className="mobile-overlay-header">
                            <h1>다시 오셨군요!</h1>
                            <p>가치 있는 환승을 시작하세요.</p>
                            <button type="button" className="btn ghost-green" onClick={() => setIsSignUpActive(true)}>회원가입으로 이동</button>
                        </div>

                        <div className="logo"><i className="fas fa-sync-alt"></i></div>
                        <h2>로그인</h2>
                        <div className="social-login">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => console.log('Login Failed')}
                                type="icon"
                                shape="circle"
                                theme="outline"
                                size="large"
                            />
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
                        <button type="submit" className="btn primary-btn" style={{ marginTop: "20px" }}>로그인</button>
                    </form>
                </div>

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