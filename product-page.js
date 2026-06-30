// ========== Product detail page ==========
function setMetaContent(selector, content) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('content', content);
}

function updateProductSocialMeta(product) {
    const siteUrl = typeof SITE_URL !== 'undefined' ? SITE_URL : 'https://www.nhavuishop.io.vn';
    const pageUrl = `${siteUrl}/product.html?id=${product.id}`;
    const title = `${product.name} | NhaVuiShop`;
    const description = `${product.desc} — Giá ${formatPrice(product.price)}. Giao hàng toàn quốc tại NhaVuiShop.`;
    const image = product.image || `${siteUrl}/og-image.png`;

    document.title = title;
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[property="og:url"]', pageUrl);
    setMetaContent('meta[property="og:image"]', image);
    setMetaContent('meta[name="twitter:title"]', title);
    setMetaContent('meta[name="twitter:description"]', description);
    setMetaContent('meta[name="twitter:image"]', image);
}

function initProductPage() {
    const container = document.getElementById('productPageContent');
    if (!container) return;

    const raw = findProductFromParams();
    if (!raw) {
        renderProductNotFound(container);
        return;
    }

    const product = enrichProduct(raw);
    updateProductSocialMeta(product);
    renderProductPage(container, product);
    renderRelatedProducts(product);
    initProductPageTimer();
}

function renderProductNotFound(container) {
    document.title = 'Không tìm thấy sản phẩm | NhaVuiShop';
    container.innerHTML = `
        <div class="product-not-found">
            <i class="fas fa-box-open"></i>
            <h1>Sản phẩm không tồn tại</h1>
            <p>Liên kết có thể đã hết hạn hoặc sản phẩm đã ngừng kinh doanh.</p>
            <a href="index.html#products" class="btn btn-primary">
                <i class="fas fa-arrow-left"></i> Quay lại cửa hàng
            </a>
        </div>
    `;
}

function renderProductPage(container, product) {
    const discount = getDiscountPercent(product.price, product.oldPrice);
    const categoryLink = `index.html#products`;

    container.innerHTML = `
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Trang chủ</a>
            <span>/</span>
            <a href="${categoryLink}">${product.category}</a>
            <span>/</span>
            <span class="breadcrumb-current">${product.name}</span>
        </nav>

        <div class="product-page-layout">
            <div class="product-page-gallery">
                ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
                <img src="${product.image}" alt="${product.name}" id="productMainImage">
            </div>

            <div class="product-page-buybox">
                <span class="product-category">${product.category}</span>
                <h1 class="product-page-title">${product.name}</h1>
                <div class="product-page-rating">
                    <span class="stars">${'★'.repeat(5)}</span>
                    <span>5.0 · Đã bán ${product.sold}</span>
                </div>
                <div class="product-detail-price">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${product.oldPrice > product.price
                        ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>`
                        : ''}
                    ${discount > 0 ? `<span class="save-badge">Tiết kiệm ${formatPrice(product.oldPrice - product.price)}</span>` : ''}
                </div>
                <div class="product-meta">
                    <span class="stock-badge ${product.inStock ? 'in-stock' : 'out-stock'}">
                        ${product.inStock ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                </div>
                <p class="product-page-short-desc">${product.desc}</p>

                <div class="product-page-flash" id="productFlashTimer">
                    <i class="fas fa-fire"></i>
                    <span>Flash sale kết thúc sau</span>
                    <strong id="productTimerH">00</strong>:<strong id="productTimerM">00</strong>:<strong id="productTimerS">00</strong>
                </div>

                <div class="product-page-actions">
                    <button type="button" class="btn btn-primary btn-lg" onclick="buyNow(${product.id})">
                        <i class="fas fa-bolt"></i> Mua ngay
                    </button>
                    <button type="button" class="btn btn-secondary btn-lg" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                    </button>
                </div>

                <div class="product-page-trust">
                    <div><i class="fas fa-shield-halved"></i> Chính hãng 100%</div>
                    <div><i class="fas fa-truck"></i> Giao 2–5 ngày</div>
                    <div><i class="fas fa-rotate-left"></i> Đổi trả 7 ngày</div>
                </div>

                ${product.promos.length ? `
                    <div class="product-page-promos-box">
                        <h3><i class="fas fa-gift"></i> Khuyến mãi</h3>
                        <ol>${product.promos.map(p => `<li>${p}</li>`).join('')}</ol>
                    </div>
                ` : ''}
            </div>
        </div>

        <div class="product-page-tabs">
            <div class="product-tabs-nav">
                <button type="button" class="product-tab-btn active" data-tab="highlights">Điểm nổi bật</button>
                <button type="button" class="product-tab-btn" data-tab="specs">Thông số</button>
                <button type="button" class="product-tab-btn" data-tab="desc">Mô tả</button>
            </div>
            <div class="product-tabs-panels">
                <div class="product-tab-panel active" id="tab-highlights">
                    ${product.highlights.length
                        ? `<ul class="highlights-list">${product.highlights.map(h => `<li><i class="fas fa-check"></i> ${h}</li>`).join('')}</ul>`
                        : '<p>Thông tin đang cập nhật.</p>'}
                </div>
                <div class="product-tab-panel" id="tab-specs">
                    ${Object.keys(product.specs).length
                        ? `<dl class="specs-table">${Object.entries(product.specs).map(([k, v]) =>
                            `<div><dt>${k}</dt><dd>${v}</dd></div>`
                        ).join('')}</dl>`
                        : '<p>Thông tin đang cập nhật.</p>'}
                </div>
                <div class="product-tab-panel" id="tab-desc">
                    <p>${product.desc}</p>
                    <p class="product-desc-note">Hình ảnh và thông tin chỉ mang tính minh họa. Chi tiết thực tế có thể thay đổi tùy lô hàng.</p>
                </div>
            </div>
        </div>
    `;

    initProductTabs();
}

function initProductTabs() {
    document.querySelectorAll('.product-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.product-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.product-tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${tab}`)?.classList.add('active');
        });
    });
}

function renderRelatedProducts(product) {
    const section = document.getElementById('relatedProducts');
    if (!section) return;

    const related = getRelatedProducts(product.id);
    if (!related.length) {
        section.style.display = 'none';
        return;
    }

    section.innerHTML = `
        <div class="container">
            <h2 class="related-title">Sản phẩm tương tự</h2>
            <div class="related-grid">
                ${related.map(p => {
                    const item = enrichProduct(p);
                    const discount = getDiscountPercent(item.price, item.oldPrice);
                    return `
                        <a href="${getProductUrl(item.id)}" class="related-card">
                            <div class="related-image">
                                ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
                                <img src="${item.image}" alt="${item.name}" loading="lazy">
                            </div>
                            <div class="related-info">
                                <h3>${item.name}</h3>
                                <div class="related-price">
                                    ${formatPrice(item.price)}
                                    ${item.oldPrice > item.price
                                        ? `<span class="old-price">${formatPrice(item.oldPrice)}</span>`
                                        : ''}
                                </div>
                            </div>
                        </a>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function initProductPageTimer() {
    const hEl = document.getElementById('productTimerH');
    const mEl = document.getElementById('productTimerM');
    const sEl = document.getElementById('productTimerS');
    if (!hEl || !mEl || !sEl) return;

    function tick() {
        const now = new Date();
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        if (end <= now) end.setDate(end.getDate() + 1);

        const diff = end - now;
        hEl.textContent = String(Math.floor(diff / 3600000)).padStart(2, '0');
        mEl.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        sEl.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    }

    tick();
    setInterval(tick, 1000);
}
