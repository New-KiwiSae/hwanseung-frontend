import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DaumPostcode from "react-daum-postcode";
import "./ProductCreatePage.css";
import { useUser } from "../../UserContext";

export default function ProductEditPage() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const { userInfo } = useUser();

    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);
    const geocoderInstance = useRef(null);

    const [form, setForm] = useState({
        title: "",
        category: "",
        price: "",
        location: "",
        content: "",
    });

    const [loading, setLoading] = useState(true);
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

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

    const handleComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = "";

        if (data.addressType === "R") {
            if (data.bname !== "") extraAddress += data.bname;
            if (data.buildingName !== "") {
                extraAddress += extraAddress !== ""
                    ? `, ${data.buildingName}`
                    : data.buildingName;
            }
            fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
        }

        setIsPostcodeOpen(false);

        setForm((prev) => ({
            ...prev,
            location: fullAddress,
        }));

        const geocoder = geocoderInstance.current;
        const map = mapInstance.current;
        const marker = markerInstance.current;

        if (geocoder && map && marker) {
            geocoder.addressSearch(fullAddress, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                    map.setCenter(coords);
                    marker.setPosition(coords);
                }
            });
        }
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
        if (loading || !window.kakao || !window.kakao.maps) return;

        window.kakao.maps.load(() => {
            const mapContainer = mapRef.current;
            if (!mapContainer) return;

            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoderInstance.current = geocoder;

            const initialAddress = form.location || userInfo?.address || "경기도 안양시";

            geocoder.addressSearch(initialAddress, (result, status) => {
                let coords;

                if (status === window.kakao.maps.services.Status.OK) {
                    coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                } else {
                    coords = new window.kakao.maps.LatLng(37.3943, 126.9568);
                }

                const map = new window.kakao.maps.Map(mapContainer, {
                    center: coords,
                    level: 4,
                });
                mapInstance.current = map;

                const marker = new window.kakao.maps.Marker({
                    position: coords,
                    map: map,
                });
                markerInstance.current = marker;

                if (!form.location && userInfo?.address) {
                    setForm((prev) => ({
                        ...prev,
                        location: userInfo.address,
                    }));
                }

                window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
                    const clickedLatLng = mouseEvent.latLng;
                    marker.setPosition(clickedLatLng);

                    geocoder.coord2RegionCode(
                        clickedLatLng.getLng(),
                        clickedLatLng.getLat(),
                        (regionResult, regionStatus) => {
                            if (regionStatus === window.kakao.maps.services.Status.OK) {
                                const addressName = regionResult[0].address_name;
                                setForm((prev) => ({
                                    ...prev,
                                    location: addressName,
                                }));
                            }
                        }
                    );
                });
            });
        });
    }, [loading, userInfo, form.location]);

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
            {isPostcodeOpen && (
                <>
                    <div
                        className="postcode-overlay"
                        onClick={() => setIsPostcodeOpen(false)}
                    />
                    <div className="postcode-modal">
                        <div className="postcode-header">
                            <span>거래 장소 검색</span>
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
                            className="postcode-body"
                        />
                    </div>
                </>
            )}

            <div className="product-create-inner">
                <section className="product-create-hero">
                    <span className="product-create-badge">상품 수정</span>
                    <h1>상품 정보 수정</h1>
                    <p>
                        기존 상품 정보를 수정해주세요.
                        <br />
                        제목, 가격, 거래 희망 장소, 설명을 다시 입력할 수 있어요.
                    </p>
                </section>

                <form className="product-create-form" onSubmit={handleSubmit}>
                    <div className="product-create-top">
                        <section className="product-create-card info-card product-full-column">
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

                            <div className="form-group product-full-column">
                                <label htmlFor="location">거래 희망 장소</label>

                                <div className="location-search-row">
                                    <input
                                        id="location"
                                        name="location"
                                        type="text"
                                        value={form.location}
                                        readOnly
                                        className="location-readonly-input"
                                        placeholder="주소 검색 버튼을 눌러 거래 장소를 선택하세요."
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="address-search-btn"
                                        onClick={() => setIsPostcodeOpen(true)}
                                    >
                                        주소 찾기
                                    </button>
                                </div>

                                <div className="location-map-help">
                                    주소를 검색한 뒤 지도를 클릭해서 위치를 조금 더 정확하게 조정할 수 있어요.
                                </div>

                                <div ref={mapRef} className="location-map-box" />
                            </div>
                        </section>
                    </div>

                    <section className="product-create-card detail-card">
                        <div className="section-head">
                            <h2>상품 설명</h2>
                        </div>

                        <div className="form-group">
                            <textarea
                                id="content"
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                rows="8"
                                placeholder="상품 상태, 사용 기간, 거래 방법 등을 자세히 적어주세요."
                                required
                            />
                        </div>
                    </section>

                    <div className="product-create-submit">
                        <p>수정한 내용은 저장 후 바로 상품 상세페이지에 반영돼요.</p>

                        <div className="submit-buttons">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => navigate(`/products/${productId}`)}
                            >
                                취소
                            </button>
                            <button type="submit" className="submit-btn">
                                상품 수정하기
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}