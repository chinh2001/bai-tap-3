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

function completeCheckout(e) {
    e.preventDefault();

    const name = document.getElementById('checkoutName').value;
    const phone = document.getElementById('checkoutPhone').value;
    const address = document.getElementById('checkoutAddress').value;

    // In real app, send to server/backend
    console.log('=== NEW ORDER ===');
    console.log('Customer:', name, '| Phone:', phone, '| Address:', address);
    console.log('Items:', cart);
    console.log('Total:', formatPrice(getCartTotal()));

    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();

    // Close checkout modal
    closeModal('checkoutModal');

    // Show success
    setTimeout(() => {
        document.getElementById('successModal').classList.add('active');
    }, 200);

    // Reset form
    document.getElementById('checkoutForm').reset();
}

// ========== Reviews ==========
function renderStars(rating) {
    return '⭐'.repeat(rating);
}

function renderReviews() {
    const grid = document.getElementById('reviewsGrid');
    if (reviews.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--gray-400);grid-column:1/-1;">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>';
        return;
    }

    grid.innerHTML = reviews.map((review, index) => {
        const initial = review.name.charAt(0).toUpperCase();
        return `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-avatar">${initial}</div>
                    <div>
                        <div class="review-name">${review.name}</div>
                        <div class="review-stars">${renderStars(review.rating)}</div>
                    </div>
                </div>
                <p class="review-text">${review.comment}</p>
            </div>
        `;
    }).join('');
}

function addReview(e) {
    e.preventDefault();

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
    renderReviews();

    document.getElementById('reviewForm').reset();
    showToast('Cảm ơn bạn đã đánh giá!');
}

// ========== Contact ==========
function submitContact(e) {
    e.preventDefault();

    const name = document.getElementById('contactName').value;
    const phone = document.getElementById('contactPhone').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;

    // In real app, send to backend/email service
    console.log('=== CONTACT FORM ===');
    console.log('Name:', name);
    console.log('Phone:', phone);
    console.log('Email:', email);
    console.log('Message:', message);

    showToast('Tin nhắn đã được gửi! Chúng tôi sẽ liên hệ sớm.');
    document.getElementById('contactForm').reset();
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

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderReviews();
    updateCartUI();
});
