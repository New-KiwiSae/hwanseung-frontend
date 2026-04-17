import React, { useState } from 'react';
import axios from 'axios';
import './chargePay.css';

const ChargePay = ({ onClose, userInfo }) => {
    const [amount, setAmount] = useState('');
    const [displayAmount, setDisplayAmount] = useState('');

    const handleInputChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        if (!rawValue) {
            setAmount('');
            setDisplayAmount('');
            return;
        }
        const numValue = parseInt(rawValue, 10);
        setAmount(numValue);
        setDisplayAmount(numValue.toLocaleString());
    };

    const handleQuickSelect = (addValue) => {
        const currentAmount = amount || 0;
        const newAmount = currentAmount + addValue;
        setAmount(newAmount);
        setDisplayAmount(newAmount.toLocaleString());
    };

    const requestPay = () => {
        if (!amount || amount < 100) {
            alert('최소 100원 이상의 금액을 입력해 주세요.');
            return;
        }

        const { IMP } = window;
        const impCode = import.meta.env.VITE_IAMPORT_CODE;

        if (!impCode) {
            alert("포트원 식별코드를 찾을 수 없습니다. .env 파일을 확인해주세요.");
            return;
        }

        IMP.init(impCode);

        const data = {
            pg: "html5_inicis", 
            pay_method: "card",
            merchant_uid: `mid_${new Date().getTime()}`, 
            name: "환승Pay 충전",
            amount: amount, 
            buyer_email: userInfo?.email || "",
            buyer_name: userInfo?.name || userInfo?.username || "환승마켓 회원", 
            buyer_tel: userInfo?.contact || "010-0000-0000",
        };

        IMP.request_pay(data, async (response) => {
            const { success, error_msg, imp_uid, merchant_uid, paid_amount } = response;

            if (success) {
                try {
                    const token = sessionStorage.getItem('accessToken');

                    if (!token) {
                        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                        return;
                    }

                    const res = await axios.post('/api/v1/pay/verify', {
                        imp_uid: imp_uid,
                        merchant_uid: merchant_uid,
                        amount: paid_amount
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (res.data === 'success') {
                        alert('환승Pay 충전이 완료되었습니다.');
                        onClose();
                        window.dispatchEvent(new Event('updateBalance'));
                    } else {
                        alert('결제 검증에 실패했습니다.');
                    }
                } catch (err) {
                    console.error(err);
                    alert('결제는 완료되었지만 검증에 실패했습니다.');
                }
            }
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <div className="charge-container">
                    <div className="charge-card-header">
                        <h2>환승Pay 충전</h2>
                        <span className="secure-badge">안전 결제</span>
                    </div>
                    <div className="balance-box">
                        <div className="balance-label">충전하실 금액</div>
                        <div className="balance-amount-wrap">
                            <span className="balance-amount">{displayAmount || '0'}</span>
                            <span className="balance-currency">원</span>
                        </div>
                    </div>
                    <div className="input-section">
                        <label className="input-label">직접 입력</label>
                        <div className="custom-input-wrap">
                            <input
                                type="text"
                                className="amount-input"
                                value={displayAmount}
                                onChange={handleInputChange}
                                placeholder="0"
                            />
                            <span className="input-unit">원</span>
                        </div>
                    </div>
                    <div className="quick-btn-group">
                        <button className="quick-btn" onClick={() => handleQuickSelect(10000)}>+ 1만</button>
                        <button className="quick-btn" onClick={() => handleQuickSelect(30000)}>+ 3만</button>
                        <button className="quick-btn" onClick={() => handleQuickSelect(50000)}>+ 5만</button>
                        <button className="quick-btn reset-btn" onClick={() => { setAmount(''); setDisplayAmount(''); }}>초기화</button>
                    </div><br/>
                    <button className="final-charge-btn" onClick={requestPay}>
                        충전하기
                    </button>
                    <div className="charge-notice">
                        <span className="notice-icon">i</span>
                        <span>안전한 환승페이 결제 모듈을 사용합니다.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChargePay;