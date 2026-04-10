import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ReportCreatePage.css";

function ReportCreatePage() {
    const { productId } = useParams();
    const navigate = useNavigate();

    // 신고 유형 옵션 (데이터 기반)
    const REPORT_REASON_OPTIONS = [
        { value: "FRAUD", label: "사기 의심" },
        { value: "SPAM", label: "스팸 / 광고" },
        { value: "ABUSIVE", label: "욕설 / 비방" },
        { value: "INAPPROPRIATE", label: "부적절한 상품" },
        { value: "COUNTERFEIT", label: "가품 / 위조품 의심" },
        { value: "PROHIBITED", label: "거래 금지 품목" },
        { value: "OTHER", label: "기타" },

    ];

    const [reason, setReason] = useState("");
    const [content, setContent] = useState("");

    // 선택된 신고 유형 라벨
    const getReasonLabel = (value) => {
        const found = REPORT_REASON_OPTIONS.find(
            (option) => option.value === value
        );
        return found ? found.label : value;
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
        alert("신고 유형을 선택해주세요.");
        return;
    }

    try {
        const token = sessionStorage.getItem("accessToken");

        const response = await fetch(`/api/reports/products/${productId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                reasonCategory: reason,   // 신고 유형 코드값
                reason: content.trim(),   // 상세 내용
            }),
        });

        const text = await response.text();
        let result = {};

        if (text) {
            result = JSON.parse(text);
        }

        if (!response.ok) {
            throw new Error(result.message || "신고 등록 실패");
        }

        alert(result.message || "신고가 접수되었습니다.");
        navigate(`/products/${productId}`);
    } catch (err) {
        console.error("신고 실패:", err);
        alert(err.message || "신고 중 오류 발생");
    }
};

    return (
        <div className="report-page">
            <div className="report-container">
                <div className="report-card">
                    <h2 className="report-title">🚨 신고하기</h2>

                    <p className="report-subtitle">
                        문제가 있는 상품이라면 신고 유형과 사유를 입력해주세요.
                    </p>

                    <form onSubmit={handleSubmit} className="report-form">

                        {/* 신고 유형 */}
                        <div className="report-form-group">
                            <label className="report-label">신고 유형</label>

                            <select
                                className="report-select"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            >
                                <option value="">신고 유형 선택</option>

                                {REPORT_REASON_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 선택된 유형 표시 */}
                        {reason && (
                            <p className="report-preview">
                                선택한 신고 유형:{" "}
                                <strong>{getReasonLabel(reason)}</strong>
                            </p>
                        )}

                        {/* 상세 내용 */}
                        <div className="report-form-group">
                            <label className="report-label">상세 내용</label>

                            <textarea
                                className="report-textarea"
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="신고 사유를 자세히 입력해주세요."
                            />
                        </div>

                        {/* 버튼 */}
                        <div className="report-button-group">
                            <button
                                type="button"
                                className="report-cancel-btn"
                                onClick={() => navigate(-1)}
                            >
                                취소
                            </button>

                            <button
                                type="submit"
                                className="report-submit-btn"
                            >
                                신고하기
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default ReportCreatePage;