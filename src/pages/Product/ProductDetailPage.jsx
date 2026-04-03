import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ProductDetailPage.css";

function formatPrice(price) {
    return Number(price || 0).toLocaleString();
}

const categoryMap = {
    digital: "디지털기기",
    fashion: "의류/잡화",
    furniture: "가구/인테리어",
    life: "생활/가전",
    hobby: "취미/도서",
    sports: "스포츠/레저",
    ticket: "티켓/교환권",
};

export default function ProductDetailPage() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // 🚨 내 아이디 (나중에 로그인 정보에서 가져오도록 수정 필요)
    // const currentUser = "es"; 
    // const token = localStorage.getItem("accessToken");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`/api/products/${productId}`, {
                    method: "GET",
                });

                if (!response.ok) {
                    throw new Error("상품 상세 정보를 불러오지 못했습니다.");
                }

                const data = await response.json();
                setProduct(data);
                setSelectedImageIndex(0);
            } catch (err) {
                console.error("상품 상세 조회 실패:", err);
                setError("상품 상세 정보를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);


    const currentUser = sessionStorage.getItem("username");

    // 🚀 [추가] 채팅방 생성 및 열기 함수
    const startChat = async () => {
        // 1. 내 물건에 내가 채팅 거는 것 방지!
        if (currentUser === product.sellerId) {
            alert("본인이 등록한 상품에는 채팅을 걸 수 없습니다.");
            return;
        }

        const currentToken = sessionStorage.getItem("accessToken");

        console.log("🔥 채팅할 때 쏘는 토큰:", currentToken);

        try {
            // 2. 백엔드에 중고거래 방 생성 (또는 기존 방 조회) 요청
            const res = await axios.post('http://localhost/api/chat/room/trade', {
                itemId: product.productId, // 백엔드는 itemId를 기다립니다
                sellerId: product.sellerId
            }, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });

            const realRoomId = res.data.roomId;

            // 3. 플로팅 채팅창(FloatingChat)에게 "방 열어!" 하고 이벤트 발송!
            window.dispatchEvent(new CustomEvent('openTradeChat', {
                detail: {
                    roomId: realRoomId,
                    buyerId: product.sellerNickname, // 대화 상대방 이름 표시용
                    sellerId: product.sellerId,
                    itemName: product.title        // 어떤 물건인지 표시용
                }
            }));

        } catch (error) {
            console.error("채팅방 생성/입장 실패:", error);
            alert("채팅방을 여는 데 실패했습니다. 다시 시도해주세요.");
        }
    };


    const productImages = product?.productImages || [];
    const hasImages = productImages.length > 0;
    const selectedImage =
        hasImages && productImages[selectedImageIndex]
            ? productImages[selectedImageIndex].imagePath
            : null;

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-inner">
                    <div className="product-detail-state">상품 정보를 불러오는 중...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-inner">
                    <div className="product-detail-state error">{error}</div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-inner">
                    <div className="product-detail-state">상품 정보가 없습니다.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-detail-page">
            <div className="product-detail-inner">
                <div className="detail-top-bar">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← 목록으로 돌아가기
                    </button>
                </div>

                <section className="product-detail-main">
                    <div className="product-detail-image-section">
                        <div className="product-detail-image-wrap">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt={product.title}
                                    className="product-detail-image"
                                />
                            ) : (
                                <div className="product-detail-image-empty">
                                    <span>환승마켓</span>
                                </div>
                            )}
                        </div>

                        {hasImages && (
                            <div className="product-thumbnail-list">
                                {productImages.map((image, index) => (
                                    <button
                                        type="button"
                                        key={image.productImageId ?? index}
                                        className={
                                            selectedImageIndex === index
                                                ? "product-thumbnail-btn active"
                                                : "product-thumbnail-btn"
                                        }
                                        onClick={() => setSelectedImageIndex(index)}
                                    >
                                        <img
                                            src={image.imagePath}
                                            alt={`${product.title} 썸네일 ${index + 1}`}
                                            className="product-thumbnail-image"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="product-detail-info-card">
                        <div className="detail-chip-row">
                            <span className="detail-chip">
                                {categoryMap[product.category] || product.category}
                            </span>
                            <span className="detail-chip outline">{product.location}</span>
                        </div>

                        <h1 className="detail-title">{product.title}</h1>

                        <div className="detail-price">{formatPrice(product.price)}원</div>

                        <div className="detail-info-list">
                            <div className="detail-info-item">
                                <span className="label">판매자</span>
                                <span style={{ display: 'none' }} className="value">{product.sellerId}</span>
                                <span className="value">{product.sellerNickname}</span>
                            </div>

                            <div className="detail-info-item">
                                <span className="label">거래지역</span>
                                <span className="value">{product.location}</span>
                            </div>

                            <div className="detail-info-item">
                                <span className="label">카테고리</span>
                                <span className="value">
                                    {categoryMap[product.category] || product.category}
                                </span>
                            </div>
                        </div>

                        <div className="detail-action-buttons">
                            <button type="button" className="btn-like">
                                찜하기
                            </button>

                            <button type="button" className="btn-chat" onClick={startChat}>
                                채팅하기
                            </button>
                        </div>

                        <div className="detail-sub-buttons">
                            <Link to="/products" className="btn-list-link">
                                목록 보기
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="product-detail-description-card">
                    <div className="section-title-wrap">
                        <h2>상품 설명</h2>
                        <p>판매자가 작성한 상품 상세 설명이에요.</p>
                    </div>

                    <div className="detail-description">
                        {product.content ? product.content : "등록된 설명이 없습니다."}
                    </div>
                </section>
            </div>
        </div>
    );
}