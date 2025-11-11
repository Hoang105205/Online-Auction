import React, { useState } from "react";
import { Star, User, Eye, Clock } from "lucide-react";

const ProductDetails = () => {
  const [selectedImage, setSelectedImage] = useState(0);

  const images = ["/img/image1.jpg", "/img/image2.jpg", "/img/image3.jpg"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <span>Home</span>
        <span>›</span>
        <span>Shop</span>
        <span>›</span>
        <span>Men</span>
        <span>›</span>
        <span className="text-black font-medium">T-shirts</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side - Images */}
        <div className="flex gap-4">
          {/* Thumbnail Images */}
          <div className="flex flex-col gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-24 h-24 border-2 rounded-lg cursor-pointer overflow-hidden ${
                  selectedImage === idx ? "border-black" : "border-gray-200"
                }`}
              >
                <img
                  src={img}
                  alt={`Product ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={images[selectedImage]}
              alt="Product"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Side - Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">MSI RED T1 jacket</h1>

          {/* Seller Info */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-gray-600">Seller: @popcnhakhoi</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold">3.6</span>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>

          {/* Date Range */}
          <div className="text-gray-700 mb-4">
            Bắt đầu: 3/6/2025 - Kết thúc: 6/3/2025
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <span>363</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-600" />
              <span>3.6k</span>
            </div>
          </div>

          {/* Price Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Ra giá cao nhất:</span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-red-500">$360</span>
                <span className="text-gray-600">bởi: @bidderxxxx</span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">3.6</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5" />
              <span>1 tuần 6 ngày 7 giờ 12 phút</span>
            </div>
          </div>

          {/* Bid Button */}
          <button className="w-full bg-black text-white py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors mb-8">
            Ra Giá Ngay!
          </button>

          {/* Tabs */}
          <div className="border-t">
            <div className="flex gap-8 border-b">
              <button className="py-4 px-2 border-b-2 border-black font-medium">
                Chi Tiết Sản Phẩm
              </button>
              <button className="py-4 px-2 text-gray-600 hover:text-black">
                Bắt đầu đấu giá
              </button>
              <button className="py-4 px-2 text-gray-600 hover:text-black">
                Hỏi Đáp
              </button>
            </div>

            {/* Product Description */}
            <div className="py-6 text-gray-700 leading-relaxed">
              <p>
                Trải nghiệm phong cách tự do và năng động cùng ONE LIFE GRAPHIC
                T-SHIRT — chiếc áo thun được thiết kế cho những ai luôn muốn thể
                hiện cá tính riêng trong từng khoảnh khắc. Lấy cảm hứng từ tinh
                thần "Sống hết mình – One Life", sản phẩm mang thông điệp tích
                cực, khuyến khích bạn sống chân thực và đầy đam mê.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
