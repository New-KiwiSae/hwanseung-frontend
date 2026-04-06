import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductCreatePage.css";
import { useUser } from "../../UserContext";




export default function ProductEditPage() {
    
    const navigate = useNavigate();
    const { productId } = useParams();

const { userInfo } = useUser(); // 🌟 유저 정보 꺼내기
    const mapRef = useRef(null);    // 🌟 지도를 담을 도화지

    const [form, setForm] = useState({
        title: "",
        category: "",
        price: "",
        location: "",
        content: "",
    });

    const [loading, setLoading] = useState(true);

    const formatPriceWithComma = (value) => {
        if (!value) return "";
        return Number(value).toLocaleString("ko-KR");
    };

    const formatPriceToKorean = (value) => {
        const num = Number(value);
        if (!num) return "";

        const units = [
            { value: 100000000, label: "억" },
            { value: 10000, label: "만" },
        ];

        let result = "";
        let remain = num;

        for (const unit of units) {
            const unitValue = Math.floor(remain / unit.value);

            if (unitValue > 0) {
                result += `${unitValue}${unit.label} `;
                remain %= unit.value;
            }
        }

        if (remain > 0) {
            result += remain.toLocaleString("ko-KR");
        }

        return result.trim() + "원";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: name === "price" ? value.replace(/[^0-9]/g, "") : value,
        }));
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${productId}`);

                if (!response.ok) {
                    throw new Error("상품 정보를 불러오지 못했습니다.");
                }

                const data = await response.json();

                setForm({
                    title: data.title || "",
                    category: data.category || "",
                    price: data.price ? String(data.price) : "",
                    location: data.location || "",
                    content: data.content || "",
                });
            } catch (error) {
                console.error(error);
                alert(error.message || "상품 정보 조회 실패");
                navigate("/products");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, navigate]);

useEffect(() => {
        // 🌟 1번 직원이 로딩을 안 끝냈으면 돌아가서 대기!
        if (loading || !window.kakao || !window.kakao.maps) return;

        window.kakao.maps.load(() => {
            const mapContainer = mapRef.current;
            if (!mapContainer) return;

           const geocoder = new window.kakao.maps.services.Geocoder();
            
            // 💡 우선순위: 1.기존 상품위치 -> 2.가입주소 -> 3.기본값(안양시 등)
            const initialAddress = form.location || userInfo?.address || "경기도 안양시";

            // 처음 시작할 때 주소를 좌표로 바꿔서 지도를 띄웁니다.
            geocoder.addressSearch(initialAddress, (result, status) => {
                let coords;
                if (status === window.kakao.maps.services.Status.OK) {
                    coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                } else {
                    // 주소 검색 실패 시 기본 좌표
                    coords = new window.kakao.maps.LatLng(37.3943, 126.9568); 
                }

                const map = new window.kakao.maps.Map(mapContainer, {
                    center: coords,
                    level: 4 // 확대 정도
                });

                const marker = new window.kakao.maps.Marker({
                    position: coords,
                    map: map
                });

                // 만약 상품에 위치가 없었다면, 기본 주소를 form에 채워줍니다.
                if (!form.location && userInfo?.address) {
                    setForm(prev => ({ ...prev, location: userInfo.address }));
                }

                // 🌟 핵심: 지도를 '클릭'했을 때 발생하는 이벤트!
                window.kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
                    const clickedLatLng = mouseEvent.latLng;
                    marker.setPosition(clickedLatLng); // 핀을 클릭한 곳으로 이동!

                    // 클릭한 곳의 좌표를 다시 '동네 이름'으로 번역합니다. (리버스 지오코딩)
                    geocoder.coord2RegionCode(clickedLatLng.getLng(), clickedLatLng.getLat(), (regionResult, regionStatus) => {
                        if (regionStatus === window.kakao.maps.services.Status.OK) {
                            // 여러 지역 정보 중 '행정동(H)'이나 '법정동(B)' 이름을 가져옵니다.
                            const addressName = regionResult[0].address_name; 
                            
                            // 찾아낸 주소 글자를 form의 location에 쏙 넣어줍니다!
                            setForm(prev => ({ ...prev, location: addressName }));
                        }
                        });
                });
            });
        });
    }, [loading]); // 🌟 1번 직원이 loading을 false로 바꾸면 그때 딱 한 번 출동!

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const accessToken = sessionStorage.getItem("accessToken");

            const response = await fetch(`/api/products/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: accessToken ? `Bearer ${accessToken}` : "",
                },
                body: JSON.stringify({
                    title: form.title,
                    category: form.category,
                    price: Number(form.price),
                    location: form.location,
                    content: form.content,
                }),
            });

            const text = await response.text();
            let result = {};
            if (text) {
                result = JSON.parse(text);
            }

            if (!response.ok) {
                alert(result.message || "상품 수정 실패");
                return;
            }

            alert("상품이 수정되었습니다.");
            navigate(`/products/${productId}`, { replace: true });
        } catch (error) {
            console.error(error);
            alert("서버 오류가 발생했습니다.");
        }
    };

    if (loading) {
        return <div className="product-create-page">상품 정보를 불러오는 중...</div>;
    }

    return (
        <main className="product-create-page">
            <div className="product-create-inner">
                <section className="product-create-hero">
                    <span className="product-create-badge">상품 수정</span>
                    <h1>상품 정보 수정</h1>
                    <p>
                        기존 상품 정보를 수정해주세요.
                        <br />
                        제목, 가격, 설명, 거래지역을 다시 입력할 수 있어요.
                    </p>
                </section>

                <form className="product-create-form" onSubmit={handleSubmit}>
                    <div className="product-create-top">
                        <section className="product-create-card info-card" style={{ gridColumn: "1 / -1" }}>
                            <div className="section-head">
                                <div>
                                    <h2>기본 정보</h2>
                                    <p>상품 기본 정보를 수정해주세요</p>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="title">상품명</label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="예: 아이폰 14 128GB 블루"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="category">카테고리</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">카테고리 선택</option>
                                        <option value="digital">디지털기기</option>
                                        <option value="fashion">의류/잡화</option>
                                        <option value="furniture">가구/인테리어</option>
                                        <option value="life">생활/가전</option>
                                        <option value="hobby">취미/도서</option>
                                        <option value="sports">스포츠/레저</option>
                                        <option value="ticket">티켓/교환권</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="price">가격</label>
                                    <div className="price-input-wrap">
                                        <input
                                            id="price"
                                            name="price"
                                            type="text"
                                            value={formatPriceWithComma(form.price)}
                                            onChange={handleChange}
                                            placeholder="가격 입력"
                                            required
                                        />
                                        <span>원</span>
                                    </div>

                                    {form.price && (
                                        <p className="price-help-text">
                                            입력 금액: {formatPriceToKorean(form.price)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">거래 희망 장소</label>
                                <p style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
                                    지도를 클릭해서 정확한 거래 장소를 콕 찍어주세요!
                                </p>

                                {/* 🌟 지도가 그려질 도화지 */}
                                <div 
                                    ref={mapRef} 
                                    style={{ 
                                        width: '100%', 
                                        height: '250px', 
                                        borderRadius: '12px',
                                        marginBottom: '10px',
                                        border: '1px solid #ddd'
                                    }} 
                                />

                                {/* 🌟 지도에서 선택된 동네가 텍스트로 보여지는 곳 (직접 입력 금지) */}
                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={form.location}
                                    readOnly // 지도 클릭으로만 바뀌도록 막아둡니다.
                                    style={{ backgroundColor: '#f9f9f9', cursor: 'default' }}
                                    placeholder="지도를 클릭하면 주소가 자동으로 입력됩니다."
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="content">상세 설명</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={form.content}
                                    onChange={handleChange}
                                    placeholder="상품 상태, 사용 기간, 거래 방법 등을 자세히 적어주세요."
                                    rows="8"
                                    required
                                />
                            </div>
                        </section>
                    </div>

                    <div className="product-create-bottom">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate(`/products/${productId}`)}
                        >
                            취소
                        </button>
                        <button type="submit" className="submit-btn">
                            수정 완료
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}