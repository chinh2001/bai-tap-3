// ========== Data ==========
// Product catalog: products-data.js

let activeCategory = 'Tất cả';

const defaultReviews = [
    {
        name: "Nguyễn Văn A",
        rating: 5,
        comment: "Sản phẩm chất lượng tốt, giao hàng nhanh, đóng gói cẩn thận. Rất hài lòng!",
        date: "2026-05-28"
    },
    {
        name: "Trần Thị B",
        rating: 5,
        comment: "Mua lần 2 rồi, vẫn rất ưng ý. Shop phục vụ tận tình, giá hợp lý.",
        date: "2026-05-30"
    },
    {
        name: "Lê Văn C",
        rating: 4,
        comment: "Sản phẩm đúng như mô tả, nhưng giao hàng hơi chậm 1 ngày. Tổng thể tốt.",
        date: "2026-06-01"
    }
];

// ========== State ==========
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let reviews = JSON.parse(localStorage.getItem('reviews')) || [...defaultReviews];
const REVIEW_SUBMITTED_KEY = 'hasSubmittedReview';
const REVIEWS_PAGE_SIZE = 6;
let reviewVisibleCount = REVIEWS_PAGE_SIZE;
let reviewsExpanded = false;

// ========== Supabase ==========
const supabaseClient = (typeof SUPABASE_URL !== 'undefined'
    && typeof SUPABASE_ANON_KEY !== 'undefined'
    && SUPABASE_URL !== 'YOUR_SUPABASE_URL'
    && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
    && window.supabase)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

function isSupabaseConfigured() {
    return supabaseClient !== null;
}

async function saveOrderToSupabase({ name, phone, address, note }) {
    const { error } = await supabaseClient.rpc('create_order', {
        p_customer_name: name,
        p_phone: phone,
        p_address: address,
        p_note: note || null,
        p_total_amount: getCartTotal(),
        p_items: cart.map(item => ({
            product_id: item.id,
            product_name: item.name,
            price: item.price,
            quantity: item.qty,
            line_total: item.price * item.qty
        }))
    });

    if (error) throw error;
}

async function saveContactToSupabase({ name, phone, email, message }) {
    const { error } = await supabaseClient
        .from('contacts')
        .insert({
            name,
            phone,
            email: email || null,
            message
        });

    if (error) throw error;
}

// ========== Utility ==========
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function saveReviews() {
    localStorage.setItem('reviews', JSON.stringify(reviews));
}

// ========== Products ==========
function getCategories() {
    return ['Tất cả', ...new Set(products.map(p => p.category))];
}

function renderCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;

    filter.innerHTML = getCategories().map(cat => `
        <button type="button" class="category-btn${cat === activeCategory ? ' active' : ''}"
            onclick="filterProducts('${cat}')">${cat}</button>
    `).join('');
}

function filterProducts(category) {
    activeCategory = category;
    renderCategoryFilter();
    renderProducts();
}

function renderProductCard(product) {
    const p = enrichProduct(product);
    const discount = getDiscountPercent(p.price, p.oldPrice);

    return `
        <a class="product-card" href="${getProductUrl(p.id)}">
            <div class="product-image">
                ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
                <img src="${p.image}" alt="${p.name}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-category">${p.category}</span>
                <h3 class="product-name">${p.name}</h3>
                <p class="product-desc">${p.desc}</p>
                <div class="product-meta">
                    <span class="stock-badge ${p.inStock ? 'in-stock' : 'out-stock'}">
                        ${p.inStock ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                    <span class="sold-count">Đã bán ${p.sold}</span>
                </div>
                <div class="product-footer">
                    <div class="product-price">
                        ${formatPrice(p.price)}
                        ${p.oldPrice > p.price ? `<span class="old-price">${formatPrice(p.oldPrice)}</span>` : ''}
                    </div>
                </div>
                <div class="product-actions">
                    <button type="button" class="btn btn-buy-now" onclick="event.preventDefault(); event.stopPropagation(); buyNow(${p.id})">
                        Mua ngay
                    </button>
                    <button type="button" class="add-to-cart" onclick="event.preventDefault(); event.stopPropagation(); addToCart(${p.id})" aria-label="Thêm vào giỏ">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </a>
    `;
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const filtered = activeCategory === 'Tất cả'
        ? products
        : products.filter(p => p.category === activeCategory);

    grid.innerHTML = filtered.length
        ? filtered.map(renderProductCard).join('')
        : '<p class="products-empty">Không có sản phẩm trong danh mục này.</p>';
}

function buyNow(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    cart = [{ ...product, qty: 1 }];
    saveCart();
    updateCartUI();
    checkout();
}

function initFlashSaleTimer() {
    const hEl = document.getElementById('timerH');
    const mEl = document.getElementById('timerM');
    const sEl = document.getElementById('timerS');
    if (!hEl || !mEl || !sEl) return;

    function tick() {
        const now = new Date();
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        if (end <= now) end.setDate(end.getDate() + 1);

        const diff = end - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        hEl.textContent = String(h).padStart(2, '0');
        mEl.textContent = String(m).padStart(2, '0');
        sEl.textContent = String(s).padStart(2, '0');
    }

    tick();
    setInterval(tick, 1000);
}

// ========== Cart ==========
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    saveCart();
    updateCartUI();
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQty(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    updateCartUI();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = getCartCount();

    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Giỏ hàng trống</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"></div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="cart-item-qty">
                        <button onclick="updateQty(${item.id}, -1)">−</button>
                        <span>${item.qty}</span>
                        <button onclick="updateQty(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    const cartTotal = document.getElementById('cartTotal');
    if (cartTotal) cartTotal.textContent = formatPrice(getCartTotal());
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
}

// ========== Checkout ==========
function checkout() {
    if (cart.length === 0) {
        showToast('Giỏ hàng trống! Vui lòng chọn sản phẩm.');
        return;
    }

    // Show order summary
    const summaryItems = document.getElementById('orderSummaryItems');
    summaryItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.name} × ${item.qty}</span>
            <span>${formatPrice(item.price * item.qty)}</span>
        </div>
    `).join('');
    document.getElementById('orderTotalPrice').textContent = formatPrice(getCartTotal());

    toggleCart();
    document.getElementById('checkoutModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function completeCheckout(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    const name = document.getElementById('checkoutName').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();
    const note = document.getElementById('checkoutNote').value.trim();

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý...';
    }

    try {
        if (isSupabaseConfigured()) {
            await saveOrderToSupabase({ name, phone, address, note });
        } else {
            console.warn('Supabase chưa cấu hình — đơn hàng chỉ được log tạm.');
            console.log('=== NEW ORDER ===', { name, phone, address, note, items: cart, total: getCartTotal() });
        }

        cart = [];
        saveCart();
        updateCartUI();
        closeModal('checkoutModal');
        document.getElementById('checkoutForm').reset();

        setTimeout(() => {
            document.getElementById('successModal').classList.add('active');
        }, 200);
    } catch (err) {
        console.error('Lỗi lưu đơn hàng:', err.message || err);
        showToast(err.message?.includes('create_order')
            ? 'Chưa cấu hình database. Chạy supabase-fix-orders.sql trên Supabase.'
            : 'Không thể đặt hàng. Vui lòng thử lại sau.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    }
}

// ========== Reviews ==========
function renderStars(rating) {
    return '⭐'.repeat(rating);
}

function renderReviewCard(review, index) {
    const initial = review.name.charAt(0).toUpperCase();
    const dateLabel = review.date ? `<div class="review-date">${review.date}</div>` : '';
    return `
        <div class="review-card" data-review-index="${index}">
            <div class="review-header">
                <div class="review-avatar">${initial}</div>
                <div>
                    <div class="review-name">${review.name}</div>
                    <div class="review-stars">${renderStars(review.rating)}</div>
                    ${dateLabel}
                </div>
            </div>
            <p class="review-text">${review.comment}</p>
        </div>
    `;
}

function updateReviewsActions() {
    const wrap = document.getElementById('reviewsActions');
    const pill = document.getElementById('reviewsTogglePill');
    const loadMoreBtn = document.getElementById('reviewsLoadMoreBtn');
    const collapseBtn = document.getElementById('reviewsCollapseBtn');
    if (!wrap || !pill || !loadMoreBtn || !collapseBtn) return;

    const remaining = reviews.length - reviewVisibleCount;
    const canLoadMore = remaining > 0;

    if (reviews.length <= REVIEWS_PAGE_SIZE) {
        wrap.hidden = true;
        return;
    }

    wrap.hidden = false;
    loadMoreBtn.hidden = !canLoadMore;
    collapseBtn.hidden = !reviewsExpanded;

    pill.classList.toggle('is-expanded', reviewsExpanded);
    pill.classList.toggle('collapse-only', reviewsExpanded && !canLoadMore);

    if (canLoadMore) {
        const nextBatch = Math.min(remaining, REVIEWS_PAGE_SIZE);
        loadMoreBtn.textContent = nextBatch === remaining && remaining <= REVIEWS_PAGE_SIZE
            ? `Xem thêm (${remaining} đánh giá)`
            : `Xem thêm ${nextBatch} đánh giá`;
    }
}

function loadMoreReviews() {
    reviewVisibleCount = Math.min(reviewVisibleCount + REVIEWS_PAGE_SIZE, reviews.length);
    reviewsExpanded = true;
    renderReviews();
}

function collapseReviews() {
    reviewVisibleCount = REVIEWS_PAGE_SIZE;
    reviewsExpanded = false;
    renderReviews();
    document.getElementById('reviewsGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderReviews() {
    const grid = document.getElementById('reviewsGrid');
    if (reviews.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--gray-400);grid-column:1/-1;">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>';
        updateReviewsActions();
        return;
    }

    const visibleReviews = reviews.slice(0, reviewVisibleCount);
    grid.innerHTML = visibleReviews.map((review, index) => renderReviewCard(review, index)).join('');
    updateReviewsActions();
}

function hasSubmittedReview() {
    return localStorage.getItem(REVIEW_SUBMITTED_KEY) === 'true';
}

function lockReviewForm() {
    const form = document.getElementById('reviewForm');
    const message = document.getElementById('reviewLimitMessage');
    if (!form) return;

    form.querySelectorAll('input, select, textarea, button').forEach(field => {
        field.disabled = true;
    });

    if (message) {
        message.hidden = false;
    }
}

function addReview(e) {
    e.preventDefault();

    if (hasSubmittedReview()) {
        lockReviewForm();
        showToast('Bạn đã đánh giá rồi. Mỗi người chỉ được đánh giá 1 lần.');
        return;
    }

    const name = document.getElementById('reviewName').value.trim();
    const rating = parseInt(document.getElementById('reviewRating').value);
    const comment = document.getElementById('reviewComment').value.trim();

    if (!name || !rating || !comment) {
        showToast('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    reviews.unshift({
        name,
        rating,
        comment,
        date: new Date().toISOString().split('T')[0]
    });

    saveReviews();
    localStorage.setItem(REVIEW_SUBMITTED_KEY, 'true');
    reviewVisibleCount = REVIEWS_PAGE_SIZE;
    reviewsExpanded = false;
    renderReviews();

    const newReview = document.querySelector('#reviewsGrid .review-card');
    if (newReview) {
        newReview.classList.add('review-card-new');
        newReview.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => newReview.classList.remove('review-card-new'), 2500);
    }

    document.getElementById('reviewForm').reset();
    lockReviewForm();
    showToast('Cảm ơn bạn đã đánh giá! Đánh giá của bạn đã hiển thị ở trên.');
}

// ========== Contact ==========
async function submitContact(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi...';
    }

    try {
        if (isSupabaseConfigured()) {
            await saveContactToSupabase({ name, phone, email, message });
        } else {
            console.warn('Supabase chưa cấu hình — tin nhắn chỉ được log tạm.');
            console.log('=== CONTACT FORM ===', { name, phone, email, message });
        }

        showToast('Tin nhắn đã được gửi! Chúng tôi sẽ liên hệ sớm.');
        document.getElementById('contactForm').reset();
    } catch (err) {
        console.error('Lỗi gửi tin nhắn:', err);
        showToast('Không thể gửi tin nhắn. Vui lòng thử lại sau.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    }
}

function subscribeNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    console.log('Newsletter subscribe:', email);
    showToast('Đăng ký thành công! Cảm ơn bạn.');
    e.target.reset();
}

// ========== Modal ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on click outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ========== Mobile Menu ==========
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('overlay');
    if (!menu || !overlay) return;
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
}

const overlayEl = document.getElementById('overlay');
if (overlayEl) {
    overlayEl.addEventListener('click', () => {
        document.getElementById('cartSidebar')?.classList.remove('active');
        document.getElementById('mobileMenu')?.classList.remove('active');
        overlayEl.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// ========== Contact links ==========
function initContactLinks() {
    const links = {
        zalo: typeof ZALO_LINK !== 'undefined' ? ZALO_LINK : '',
        facebook: typeof FACEBOOK_LINK !== 'undefined' ? FACEBOOK_LINK : ''
    };

    document.querySelectorAll('[data-contact]').forEach(el => {
        const channel = el.dataset.contact;
        const url = links[channel];
        if (url && url !== 'YOUR_ZALO_LINK' && url !== 'YOUR_FACEBOOK_LINK') {
            el.href = url;
        }
    });
}

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('categoryFilter')) {
        renderCategoryFilter();
        renderProducts();
    }
    if (document.getElementById('reviewsGrid')) {
        renderReviews();
        if (hasSubmittedReview()) lockReviewForm();
    }
    updateCartUI();
    initContactLinks();
    initFlashSaleTimer();
    if (typeof initProductPage === 'function') initProductPage();
});
