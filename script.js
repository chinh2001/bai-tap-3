// ========== Data ==========
const products = [
    {
        id: 1,
        name: "Tai Nghe Bluetooth Pro",
        category: "Điện tử",
        desc: "Tai nghe không dây chất lượng cao, chống ồn ANC, pin 30h",
        price: 890000,
        oldPrice: 1290000,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
    },
    {
        id: 2,
        name: "Điện Thoại Smart X",
        category: "Điện tử",
        desc: "Màn hình AMOLED 120Hz, camera 108MP, pin 5000mAh",
        price: 6990000,
        oldPrice: 8490000,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop"
    },
    {
        id: 3,
        name: "Đồng Hồ Thông Minh",
        category: "Phụ kiện",
        desc: "Theo dõi sức khỏe, GPS, chống nước 5ATM, pin 7 ngày",
        price: 1590000,
        oldPrice: 2190000,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"
    },
    {
        id: 4,
        name: "Laptop Ultra Slim",
        category: "Máy tính",
        desc: "Mỏng nhẹ 1.2kg, i7 thế hệ 13, RAM 16GB, SSD 512GB",
        price: 21990000,
        oldPrice: 26990000,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop"
    },
    {
        id: 5,
        name: "Camera Hành Trình 4K",
        category: "Điện tử",
        desc: "Quay 4K 60fps, chống rung, GPS tích hợp, màn hình xoay",
        price: 1890000,
        oldPrice: 2490000,
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop"
    },
    {
        id: 6,
        name: "Bàn Phím Cơ Gaming",
        category: "Phụ kiện",
        desc: "Switch Blue, LED RGB, layout 75%, keycap PBT",
        price: 1190000,
        oldPrice: 1590000,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop"
    },
    {
        id: 7,
        name: "Chuột Gaming Pro",
        category: "Phụ kiện",
        desc: "Sensor 26K DPI, 8 nút lập trình, weight 58g",
        price: 690000,
        oldPrice: 890000,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop"
    },
    {
        id: 8,
        name: "Loa Bluetooth Mini",
        category: "Âm thanh",
        desc: "Âm thanh 360°, chống nước IPX7, pin 12h, kết nối đôi",
        price: 590000,
        oldPrice: 790000,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop"
    }
];

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
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.desc}</p>
                <div class="product-footer">
                    <div class="product-price">
                        ${formatPrice(product.price)}
                        <span class="old-price">${formatPrice(product.oldPrice)}</span>
                    </div>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
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
    // Update count
    const cartCount = document.getElementById('cartCount');
    cartCount.textContent = getCartCount();

    // Update cart items
    const cartItems = document.getElementById('cartItems');
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

    // Update total
    document.getElementById('cartTotal').textContent = formatPrice(getCartTotal());
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
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
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
    document.getElementById('mobileMenu').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

// Close menu on overlay click
document.getElementById('overlay').addEventListener('click', () => {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('mobileMenu').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.style.overflow = '';
});

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
    renderProducts();
    renderReviews();
    updateCartUI();
    initContactLinks();
    if (hasSubmittedReview()) {
        lockReviewForm();
    }
});
