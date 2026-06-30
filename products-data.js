// ========== Product catalog (shared) ==========
const products = [
    {
        id: 1,
        name: "Tai Nghe Bluetooth Pro",
        category: "Điện tử",
        desc: "Tai nghe không dây chất lượng cao, chống ồn ANC, pin 30h",
        price: 890000,
        oldPrice: 1290000,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop"
    },
    {
        id: 2,
        name: "Điện Thoại Smart X",
        category: "Điện tử",
        desc: "Màn hình AMOLED 120Hz, camera 108MP, pin 5000mAh",
        price: 6990000,
        oldPrice: 8490000,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop"
    },
    {
        id: 3,
        name: "Đồng Hồ Thông Minh",
        category: "Phụ kiện",
        desc: "Theo dõi sức khỏe, GPS, chống nước 5ATM, pin 7 ngày",
        price: 1590000,
        oldPrice: 2190000,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop"
    },
    {
        id: 4,
        name: "Laptop Ultra Slim",
        category: "Máy tính",
        desc: "Mỏng nhẹ 1.2kg, i7 thế hệ 13, RAM 16GB, SSD 512GB",
        price: 21990000,
        oldPrice: 26990000,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop"
    },
    {
        id: 5,
        name: "Camera Hành Trình 4K",
        category: "Điện tử",
        desc: "Quay 4K 60fps, chống rung, GPS tích hợp, màn hình xoay",
        price: 1890000,
        oldPrice: 2490000,
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=800&fit=crop"
    },
    {
        id: 6,
        name: "Bàn Phím Cơ Gaming",
        category: "Phụ kiện",
        desc: "Switch Blue, LED RGB, layout 75%, keycap PBT",
        price: 1190000,
        oldPrice: 1590000,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop"
    },
    {
        id: 7,
        name: "Chuột Gaming Pro",
        category: "Phụ kiện",
        desc: "Sensor 26K DPI, 8 nút lập trình, weight 58g",
        price: 690000,
        oldPrice: 890000,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop"
    },
    {
        id: 8,
        name: "Loa Bluetooth Mini",
        category: "Âm thanh",
        desc: "Âm thanh 360°, chống nước IPX7, pin 12h, kết nối đôi",
        price: 590000,
        oldPrice: 790000,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop"
    },
    {
        id: 9,
        name: "Quạt đứng Toshiba F-LSD10(H)VN",
        category: "Gia dụng",
        desc: "9 cánh Inverter, 26 mức gió, điều khiển từ xa, hẹn giờ 12h",
        price: 1600000,
        oldPrice: 2490000,
        image: "https://images.unsplash.com/photo-1585771724684-38269abc7b5e?w=800&h=800&fit=crop"
    }
];

const productExtras = {
    1: {
        sold: 312,
        highlights: ["Chống ồn ANC chủ động", "Pin 30 giờ, sạc nhanh USB-C", "Bluetooth 5.3, độ trễ thấp"],
        specs: { "Thương hiệu": "Pro Audio", "Bảo hành": "12 tháng", "Kết nối": "Bluetooth 5.3" },
        promos: ["Miễn phí giao hàng nội thành", "Đổi mới 7 ngày nếu lỗi NSX", "Trả góp 0% qua thẻ"]
    },
    2: {
        sold: 89,
        highlights: ["Màn AMOLED 120Hz", "Camera 108MP AI", "Pin 5000mAh sạc nhanh"],
        specs: { "RAM": "8GB", "Bộ nhớ": "256GB", "Bảo hành": "18 tháng" },
        promos: ["Tặng ốp lưng + cường lực", "Bảo hành chính hãng toàn quốc"]
    },
    3: {
        sold: 456,
        highlights: ["Theo dõi nhịp tim, SpO2", "GPS tích hợp", "Chống nước 5ATM"],
        specs: { "Màn hình": "1.4\" AMOLED", "Pin": "7 ngày", "Bảo hành": "12 tháng" },
        promos: ["Miễn phí giao hàng", "Đổi size dây miễn phí"]
    },
    4: {
        sold: 34,
        highlights: ["Intel Core i7 thế hệ 13", "RAM 16GB, SSD 512GB", "Mỏng nhẹ chỉ 1.2kg"],
        specs: { "Màn hình": "14\" FHD IPS", "Pin": "10 giờ", "Bảo hành": "24 tháng" },
        promos: ["Tặng chuột không dây", "Cài Windows bản quyền"]
    },
    5: {
        sold: 178,
        highlights: ["Quay 4K 60fps", "Chống rung EIS", "GPS + WiFi kép băng tần"],
        specs: { "Góc quay": "170°", "Màn hình": "3\" xoay", "Bảo hành": "12 tháng" },
        promos: ["Tặng thẻ nhớ 64GB", "Miễn phí giao hàng"]
    },
    6: {
        sold: 523,
        highlights: ["Switch Blue tactile", "LED RGB per-key", "Keycap PBT double-shot"],
        specs: { "Layout": "75%", "Kết nối": "USB-C", "Bảo hành": "12 tháng" },
        promos: ["Giảm thêm 5% khi mua 2", "Bảo hành chính hãng"]
    },
    7: {
        sold: 891,
        highlights: ["Sensor 26K DPI", "8 nút lập trình", "Trọng lượng 58g"],
        specs: { "Polling rate": "1000Hz", "Kết nối": "USB/Wireless", "Bảo hành": "12 tháng" },
        promos: ["Miễn phí giao hàng nội thành"]
    },
    8: {
        sold: 667,
        highlights: ["Âm thanh 360°", "Chống nước IPX7", "Pin 12 giờ"],
        specs: { "Công suất": "20W", "Bluetooth": "5.0", "Bảo hành": "6 tháng" },
        promos: ["Mua 2 giảm 10%", "Đổi trả 7 ngày"]
    },
    9: {
        sold: 42,
        highlights: [
            "9 cánh, công suất 30W làm mát hiệu quả",
            "4 chế độ gió, 26 mức tốc độ",
            "Inverter tiết kiệm tới 70% điện",
            "Chiều cao điều chỉnh 113–133 cm"
        ],
        specs: {
            "Model": "F-LSD10(H)VN",
            "Màu sắc": "Xám",
            "Công suất": "30W",
            "Số cánh": "9 cánh",
            "Bảo hành": "12 tháng"
        },
        promos: [
            "Giảm sốc hôm nay — chỉ còn 1.600.000đ",
            "Bảo hành chính hãng Toshiba toàn quốc",
            "Miễn phí giao hàng nội thành",
            "Đổi mới 7 ngày nếu lỗi NSX"
        ]
    }
};

function enrichProduct(product) {
    const extra = productExtras[product.id] || {};
    return {
        inStock: true,
        sold: 0,
        highlights: [],
        specs: {},
        promos: ["Miễn phí giao hàng nội thành", "Bảo hành chính hãng"],
        ...product,
        ...extra
    };
}

function getDiscountPercent(price, oldPrice) {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round((1 - price / oldPrice) * 100);
}

function getProductSlug(product) {
    return product.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function getProductUrl(id) {
    const product = products.find(p => p.id === id);
    if (!product) return 'index.html#products';
    return `product.html?id=${id}&slug=${getProductSlug(product)}`;
}

function findProductFromParams() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);
    if (id) {
        const found = products.find(p => p.id === id);
        if (found) return found;
    }
    const slug = params.get('slug');
    if (slug) {
        return products.find(p => getProductSlug(p) === slug) || null;
    }
    return null;
}

function getRelatedProducts(productId, limit = 4) {
    const current = products.find(p => p.id === productId);
    if (!current) return [];
    return products
        .filter(p => p.id !== productId && p.category === current.category)
        .slice(0, limit);
}
