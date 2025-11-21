import React, { useState, useRef, useEffect } from "react";
import { Star, User, Eye, Clock } from "lucide-react";
import { Carousel, Card } from "flowbite-react";
import ProductDetailsInformation from "./ProductDetailsInformation";
import ProductDetailsAuction from "./ProductDetailsAuction";
import ProductDetailsANA from "./ProductDetailsANA";

const ProductDetails = () => {
  const temp = ["1", "2", "3", "4", "5"];

  const [selectedImage, setSelectedImage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const mainImageRef = useRef(null);
  const thumbsRef = useRef(null);

  const images = [
    "/img/image1.jpg",
    "/img/image2.jpg",
    "/img/image3.jpg",
    "/img/image4.jpg",
    "/img/image5.jpg",
  ];

  const [productDescription, setProductDescription] = useState(`
    <p>
      Áo khoác <strong>MSI RED T1</strong> là sự kết hợp bùng nổ giữa nhà sản xuất
      phần cứng gaming hàng đầu thế giới <strong>MSI (Micro-Star
      International)</strong> và đội tuyển Esports huyền thoại <strong>T1</strong>. Được
      thiết kế dành riêng cho những nhà vô địch và fan hâm mộ cuồng
      nhiệt, chiếc áo này không chỉ là một trang phục mà còn là biểu
      tượng rực lửa của tinh thần "Dare to win". Tông màu <strong>Đen</strong> mạnh
      mẽ làm nền, kết hợp hài hòa với các chi tiết <strong>Đỏ (RED)</strong> đặc
      trưng, tạo nên vẻ ngoài cực kỳ nổi bật và cuốn hút.
    </p>
    <br />
    <p>
      Về chất liệu, áo được chế tạo từ <strong>Vải dù cao cấp
      (Polyester/Nylon)</strong> có khả năng chống thấm nước nhẹ và chắn gió
      hiệu quả, đảm bảo sự thoải mái trong mọi điều kiện thời tiết. Đặc
      biệt, lớp lót lưới <strong>(Mesh lining)</strong> bên trong tăng cường khả năng
      thoáng khí và thấm hút mồ hôi, giữ cho cơ thể luôn khô ráo và mát
      mẻ trong các hoạt động năng động hay những trận chiến căng thẳng.
      Logo Rồng MSI uy dũng và logo T1 được thêu/in ấn tượng, khẳng định
      đẳng cấp và phong cách của người mặc. Đây là món đồ không thể
      thiếu để thể hiện niềm đam mê Esports và phong cách đường phố mạnh
      mẽ.
    </p>
    <br />
    <p>
      電源入り撮影出来ましたが細部の機能までは確認していません。
      不得意ジャンルの買い取り品の為細かい確認出来る知識がありません、ご了承ください。
      簡単な確認方法が有れば確認しますので方法等質問欄からお願いします、終了日の質問には答えられない場合があります。
      付属品、状態は画像でご確認ください。
      当方詳しくありませんので高度な質問には答えられない場合がありますがご了承ください。
      発送は佐川急便元払いを予定しています、破損防止の為梱包サイズが大きくなる事がありますがご了承下さい。 
      中古品の為NC/NRでお願いします。<br/>

      ✏️ 31/10/2025 <br/>

      - が大きくなる事がありますがご了承下さい。 <br/>

      ✏️ 5/11/2025 <br/>

      - 不得意ジャンルの買い取り品の為細かい確認出来る知識がありません、ご了承ください。 <br/>
    </p>
  `);

  const currentUserId = "user123";
  const sellerId = "user123";
  const isOwner = currentUserId === sellerId;

  const handleSaveDescription = async (newDescription) => {
    try {
      setProductDescription(newDescription);
      alert("Cập nhật mô tả thành công!");
    } catch (error) {
      console.error("Có lỗi xảy ra khi cập nhật", error);
      alert("Có lỗi xảy ra khi cập nhật.");
    }
  };

  useEffect(() => {
    const VISIBLE_THUMBS = 4;
    const THUMB_PX = 96;
    const GAP_PX = 16;
    const MAX_THUMBS_HEIGHT =
      VISIBLE_THUMBS * THUMB_PX + (VISIBLE_THUMBS - 1) * GAP_PX;

    const updateThumbsHeight = () => {
      if (mainImageRef.current && thumbsRef.current) {
        const mainH = mainImageRef.current.clientHeight;
        const target = Math.min(mainH, MAX_THUMBS_HEIGHT);
        thumbsRef.current.style.height = `${target}px`;
        thumbsRef.current.style.maxHeight = `${MAX_THUMBS_HEIGHT}px`;
      }
    };

    updateThumbsHeight();
    window.addEventListener("resize", updateThumbsHeight);

    const imgs = document.querySelectorAll(
      ".product-main-image, .product-thumb-image"
    );
    imgs.forEach((img) => img.addEventListener("load", updateThumbsHeight));

    return () => {
      window.removeEventListener("resize", updateThumbsHeight);
      imgs.forEach((img) =>
        img.removeEventListener("load", updateThumbsHeight)
      );
    };
  }, [images, selectedImage]);

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
          <div
            ref={thumbsRef}
            className="flex flex-col gap-4 overflow-y-auto pr-2 hide-scrollbar"
            style={{ minWidth: 96 }}
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-24 h-24 border-2 rounded-lg cursor-pointer overflow-hidden shrink-0 ${
                  selectedImage === idx ? "border-black" : "border-gray-200"
                }`}
              >
                <img
                  src={img}
                  alt={`Product ${idx + 1}`}
                  className="product-thumb-image w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div
            ref={mainImageRef}
            className="flex-1 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
            style={{ aspectRatio: "1 / 1", minHeight: 240 }}
          >
            <img
              src={images[selectedImage]}
              alt="Product"
              className="product-main-image w-full h-full object-contain cursor-zoom-in"
              onClick={() => setModalOpen(true)}
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
              <span className="text-3xl font-bold text-red-500">$360</span>
              <div className="flex items-center gap-3">
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
          <button
            className="w-full bg-black text-white py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors mb-8"
            onClick={() => setActiveTab("auction")}
          >
            Ra Giá Ngay!
          </button>
        </div>
      </div>

      {/* Below Side */}
      <div>
        {/* Tabs */}
        <div className="mt-12">
          <div className="grid grid-cols-3 gap-8 border-b">
            <button
              onClick={() => setActiveTab("details")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === "details"
                  ? "border-black text-black"
                  : "border-transparent text-gray-600 hover:text-black"
              }`}
            >
              Chi Tiết Sản Phẩm
            </button>
            <button
              onClick={() => setActiveTab("auction")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === "auction"
                  ? "border-black text-black"
                  : "border-transparent text-gray-600 hover:text-black"
              }`}
            >
              Bắt đầu đấu giá
            </button>
            <button
              onClick={() => setActiveTab("qa")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === "qa"
                  ? "border-black text-black"
                  : "border-transparent text-gray-600 hover:text-black"
              }`}
            >
              Hỏi Đáp
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === "details" && (
            <ProductDetailsInformation
              description={productDescription}
              isOwner={isOwner}
              onSave={handleSaveDescription}
            />
          )}
          {activeTab === "auction" && <ProductDetailsAuction />}
          {activeTab === "qa" && <ProductDetailsANA />}
        </div>
      </div>

      <div className="mt-12 items-center justify-center">
        <h1 className="text-2xl font-bold mr-6 text-center">
          Sản Phẩm Liên Quan
        </h1>
        <div className="mt-12 flex overflow-x-auto items-center justify-center">
          {temp.map((t, i) => (
            <Card
              key={i}
              className="max-w-[300px] shadow-none"
              imgAlt="Apple Watch Series 7 in colors pink, silver, and black"
              imgSrc="/img/image1.jpg"
            >
              <a href="#">
                <h5 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                  Apple Watch Series 7 GPS, Aluminium Case, Starlight Sport
                </h5>
              </a>
              <div className="flex items-center">
                <span className="ml-3 mr-2 rounded bg-cyan-100 px-2.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-200 dark:text-cyan-800">
                  5.0
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  $599
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal / Lightbox */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setModalOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white bg-black/50 rounded-full p-2"
            onClick={() => setModalOpen(false)}
          >
            ✕
          </button>
          <img
            src={images[selectedImage]}
            alt="Full"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
