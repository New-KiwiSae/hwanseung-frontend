import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SocialSignupExtra.css';

const SocialSignupExtra = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [smsCode, setSmsCode] = useState('');
    const [isSmsSent, setIsSmsSent] = useState(false);
    const [isContactVerified, setIsContactVerified] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);

    useEffect(() => {
        let timer;
        if (isTimerActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsTimerActive(false);
        }
        return () => clearInterval(timer);
    }, [isTimerActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setPhone(value);
    };

    const handleSendSms = async () => {
        if (phone.length < 10) {
            alert("올바른 연락처를 입력해주세요.");
            return;
        }

        try {
            await axios.post('/api/auth/sms/send-code', { phoneNumber: phone });
            alert('인증번호가 발송되었습니다.');

            setTimeLeft(180);
            setIsTimerActive(true);
            setIsSmsSent(true);
            setError('');
        } catch (err) {
            alert(err.response?.data?.message || "발송 실패. 잠시 후 다시 시도해주세요.");
        }
    };

    const handleVerifySmsCode = async () => {
        if (smsCode.length !== 6) {
            alert("인증번호 6자리를 입력해주세요.");
            return;
        }

        try {

            setIsContactVerified(true);
            setIsTimerActive(false);
            alert('인증되었습니다.');
        } catch (err) {
            alert("인증번호가 일치하지 않습니다.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = sessionStorage.getItem('accessToken');

        if (!token) {
            alert("인증 정보가 없습니다. 다시 로그인 해주세요.");
            return;
        }

        try {
            const response = await axios.post(
                '/api/user/social-signup-extra',
                { contact: phone },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                const newAccessToken = response.data;

                sessionStorage.setItem('accessToken', newAccessToken);
                sessionStorage.setItem('status', 'ACTIVE');

                alert('정보 저장이 완료되었습니다! 이제 서비스를 이용하실 수 있습니다.');

                window.location.href = '/';
            }
        } catch (error) {
            console.error("에러 발생:", error.response);
            if (error.response && error.response.status === 403) {
                alert("접근 권한이 없습니다. 관리자에게 문의하세요.");
            } else {
                alert("저장 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div className="extra-info-container">
            <div className="extra-info-box">
                <h2>추가 정보 입력</h2>
                <p className="description">
                    서비스 이용을 위해 <strong>연락처 인증</strong>을 진행해주세요.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="phone">연락처</label>
                        <div className="input-with-btn">
                            <input
                                type="tel"
                                id="phone"
                                placeholder="01012345678"
                                value={phone}
                                onChange={handlePhoneChange}
                                maxLength="11"
                                disabled={isContactVerified}
                                required
                            />
                            <button
                                type="button"
                                className={`verify-request-btn ${isContactVerified ? 'success' : ''}`}
                                onClick={handleSendSms}
                                disabled={isContactVerified}
                            >
                                {isContactVerified ? '인증완료' : isSmsSent ? '재발송' : '번호발송'}
                            </button>
                        </div>
                    </div>

                    {isSmsSent && !isContactVerified && (
                        <div className="input-group sms-verify-group">
                            <label>인증번호</label>
                            <div className="input-with-btn">
                                <div className="sms-input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="6자리 입력"
                                        value={smsCode}
                                        onChange={(e) => setSmsCode(e.target.value.replace(/[^0-9]/g, ''))}
                                        maxLength="6"
                                    />
                                    <span className={`timer ${timeLeft < 30 ? 'warning' : ''}`}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="verify-confirm-btn"
                                    onClick={handleVerifySmsCode}
                                    disabled={timeLeft === 0}
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    )}

                    {error && <p className="error-message">{error}</p>}

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading || !isContactVerified}
                    >
                        {loading ? '저장 중...' : '서비스 시작하기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SocialSignupExtra;