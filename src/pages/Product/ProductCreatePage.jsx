import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCreatePage.css";

export default function ProductCreatePage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        category: "",
        price: "",
        location: "",
        content: "",
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

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

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) {
            setImageFiles([]);
            setPreviewUrls([]);
            return;
        }

        if (files.length > 5) {
            alert("이미지는 최대 5장까지 선택할 수 있습니다.");
            e.target.value = "";
            setImageFiles([]);
            setPreviewUrls([]);
            return;
        }

        setImageFiles(files);
        setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const accessToken = sessionStorage.getItem("accessToken");

            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("category", form.category);
            formData.append("price", Number(form.price));
            formData.append("location", form.location);
            formData.append("content", form.content);

            imageFiles.forEach((file) => {
                formData.append("images", file); // ✅ 백엔드 List<MultipartFile> images 와 이름 맞춤
            });

            const response = await fetch("/api/products", {
                method: "POST",
                headers: {
                    Authorization: accessToken ? `Bearer ${accessToken}` : "",
                },
                body: formData,
            });

            let result = {};
            const text = await response.text();
            if (text) {
                result = JSON.parse(text);
            }

            if (!response.ok) {
                alert(result.message || "상품 등록 실패");
                return;
            }

            console.log("등록 성공:", result);
            alert("상품이 등록되었습니다.");
            navigate("/");

        } catch (error) {
            console.error(error);
            alert("서버 오류가 발생했습니다.");
        }
    };

    return (
        <main className="product-create-page">
            <div className="product-create-inner">
                <section className="product-create-hero">
                    <span className="product-create-badge">판매 등록</span>
                    <h1>새 상품 등록</h1>
                    <p>
                        환승마켓에 판매할 상품 정보를 입력해주세요.
                        <br />
                        제목과 가격, 설명만 깔끔하게 적어도 충분히 보기 좋아요.
                    </p>
                </section>

                <form className="product-create-form" onSubmit={handleSubmit}>
                    <div className="product-create-top">
                        <section className="product-create-card image-card">
                            <div className="section-head">
                                <div>
                                    <h2>상품 이미지</h2>
                                    <p>최대 5장까지 업로드 가능</p>
                                </div>
                            </div>

                            <label className="image-upload-box">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                />
                                <div className="image-upload-content">
                                    <div className="image-upload-plus">+</div>
                                    <strong>이미지 업로드</strong>
                                    <span>JPG, PNG 파일을 최대 5장까지 올려주세요</span>

                                    {imageFiles.length > 0 && (
                                        <p className="image-file-name">
                                            선택 파일: {imageFiles.length}장
                                        </p>
                                    )}

                                    {previewUrls.length > 0 && (
                                        <div className="image-preview-list">
                                            {previewUrls.map((url, index) => (
                                                <div className="image-preview" key={index}>
                                                    <img src={url} alt={`상품 미리보기 ${index + 1}`} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </label>
                        </section>

                        <section className="product-create-card info-card">
                            <div className="section-head">
                                <div>
                                    <h2>기본 정보</h2>
                                    <p>상품 기본 정보를 입력해주세요</p>
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
                                <label htmlFor="location">거래 지역</label>
                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="예: 서울 강남구"
                                    required
                                />
                            </div>
                        </section>
                    </div>

                    <section className="product-create-card detail-card">
                        <div className="section-head">
                            <div>
                                <h2>상품 설명</h2>
                                <p>상품 상태, 사용감, 거래 방법 등을 적어주세요</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="content">상세 설명</label>
                            <textarea
                                id="content"
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                placeholder={`예:
- 구매 시기
- 사용감 여부
- 하자 유무
- 직거래 / 택배 가능 여부`}
                                required
                            />
                        </div>
                    </section>

                    <div className="product-create-submit">
                        <p>입력한 내용을 확인한 뒤 상품을 등록해주세요.</p>
                        <div className="submit-buttons">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => navigate("/")}
                            >
                                취소
                            </button>
                            <button type="submit" className="submit-btn">
                                상품 등록하기
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}