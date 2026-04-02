import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./ProductListPage.css";

const categoryMap = {
    all: "전체",
    digital: "디지털기기",
    fashion: "의류/잡화",
    furniture: "가구/인테리어",
    life: "생활/가전",
    hobby: "취미/도서",
    sports: "스포츠/레저",
    ticket: "티켓/교환권",
};

const categoryOptions = [
    { key: "all", label: "전체" },
    { key: "digital", label: "디지털기기" },
    { key: "fashion", label: "의류/잡화" },
    { key: "furniture", label: "가구/인테리어" },
    { key: "life", label: "생활/가전" },
    { key: "hobby", label: "취미/도서" },
    { key: "sports", label: "스포츠/레저" },
    { key: "ticket", label: "티켓/교환권" },
];

function formatPrice(price) {
    return Number(price || 0).toLocaleString();
}

export default function ProductListPage() {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [keyword, setKeyword] = useState("");
    const [sortType, setSortType] = useState("latest");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/products", {
                    method: "GET",
                });

                if (!response.ok) {
                    throw new Error("상품 목록을 불러오지 못했습니다.");
                }

                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error("상품 목록 조회 실패:", err);
                setError("상품 목록을 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        const lowerKeyword = keyword.trim().toLowerCase();

        let result = products.filter((product) => {
            const matchCategory =
                selectedCategory === "all" || product.category === selectedCategory;

            const matchKeyword =
                lowerKeyword === "" ||
                (product.title && product.title.toLowerCase().includes(lowerKeyword)) ||
                (product.location &&
                    product.location.toLowerCase().includes(lowerKeyword));

            return matchCategory && matchKeyword;
        });

        if (sortType === "priceAsc") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortType === "priceDesc") {
            result.sort((a, b) => b.price - a.price);
        } else {
            result.sort((a, b) => b.productId - a.productId);
        }

        return result;
    }, [products, selectedCategory, keyword, sortType]);

    return (
        <div className="product-list-page">
            <div className="product-list-inner">
                <section className="product-list-hero">
                    <div className="product-list-badge">환승마켓 상품 둘러보기</div>
                    <h1>지금 올라온 상품을 한눈에 확인해보세요</h1>
                    <p>
                        최신 등록순으로 상품을 보고, 카테고리와 검색으로 원하는 물건을
                        빠르게 찾을 수 있어요.
                    </p>
                </section>

                <section className="product-list-toolbar">
                    <div className="toolbar-left">
                        <input
                            type="search"
                            placeholder="상품명이나 지역으로 검색"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="product-search-input"
                        />
                    </div>

                    <div className="toolbar-right sort-button-group">
                        <button
                            type="button"
                            className={sortType === "latest" ? "sort-btn active" : "sort-btn"}
                            onClick={() => setSortType("latest")}
                        >
                            최신순
                        </button>

                        <button
                            type="button"
                            className={sortType === "priceAsc" ? "sort-btn active" : "sort-btn"}
                            onClick={() => setSortType("priceAsc")}
                        >
                            낮은가격
                        </button>

                        <button
                            type="button"
                            className={sortType === "priceDesc" ? "sort-btn active" : "sort-btn"}
                            onClick={() => setSortType("priceDesc")}
                        >
                            높은가격
                        </button>
                    </div>
                </section>

                <section className="product-category-tabs">
                    {categoryOptions.map((category) => (
                        <button
                            key={category.key}
                            type="button"
                            className={
                                selectedCategory === category.key
                                    ? "category-tab active"
                                    : "category-tab"
                            }
                            onClick={() => setSelectedCategory(category.key)}
                        >
                            {category.label}
                        </button>
                    ))}
                </section>

                <section className="product-list-summary">
                    <strong>{filteredProducts.length}</strong>개의 상품이 있어요
                </section>

                {loading && (
                    <div className="product-list-state">
                        <p>상품 목록 불러오는 중...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="product-list-state error">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && filteredProducts.length === 0 && (
                    <div className="product-list-state empty">
                        <p>조건에 맞는 상품이 아직 없어요.</p>
                    </div>
                )}

                {!loading && !error && filteredProducts.length > 0 && (
                    <section className="product-grid">
                        {filteredProducts.map((product) => (
                            <Link
                                to={`/products/${product.productId}`}
                                key={product.productId}
                                className="product-card"
                            >
                                <div className="product-thumb">
                                    {product.thumbnailUrl ? (
                                        <img src={product.thumbnailUrl} alt={product.title} />
                                    ) : (
                                        <div className="product-thumb-empty">
                                            <span>환승마켓</span>
                                        </div>
                                    )}
                                </div>

                                <div className="product-card-body">
                                    <div className="product-card-top">
                                        <span className="product-category-chip">
                                            {categoryMap[product.category] || product.category}
                                        </span>
                                    </div>

                                    <h3 className="product-title">{product.title}</h3>

                                    <p className="product-price">
                                        {formatPrice(product.price)}원
                                    </p>

                                    <div className="product-meta">
                                        <span>{product.location}</span>
                                        <span className="dot">•</span>
                                        <span>{product.sellerId}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
}