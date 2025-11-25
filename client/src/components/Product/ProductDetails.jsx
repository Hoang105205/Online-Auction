import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Star, User, Clock } from "lucide-react";
import { Card } from "flowbite-react";
import ProductDetailsInformation from "./ProductDetailsInformation";
import ProductDetailsAuction from "./ProductDetailsAuction";
import ProductDetailsANA from "./ProductDetailsANA";

import ProductCardP from "../Product/ProductCardP";

import { getProductBasicDetails } from "../../api/productService";

const ProductDetails = () => {
  const products = [
    {
      id: 1,
      name: "Vintage Camera Canon AE-1 Program",
      image: "/img/image1.jpg",
      currentPrice: 2500000,
      buyNowPrice: 3500000,
      highestBidder: "NguyenVanA",
      postedDate: "2025-11-10",
      endDate: "2025-11-25",
      bidCount: 15,
    },
    {
      id: 2,
      name: "MacBook Pro 2023 M3 Chip 16GB RAM",
      image: "/img/image2.jpg",
      currentPrice: 35000000,
      buyNowPrice: 42000000,
      highestBidder: "TranThiB",
      postedDate: "2025-11-12",
      endDate: "2025-11-22",
      bidCount: 28,
    },
    {
      id: 3,
      name: "Đồng hồ Rolex Submariner Date",
      image: "/img/image3.jpg",
      currentPrice: 180000000,
      buyNowPrice: null,
      highestBidder: "LeVanC",
      postedDate: "2025-11-08",
      endDate: "2025-11-30",
      bidCount: 42,
    },
    {
      id: 4,
      name: "iPhone 15 Pro Max 256GB Natural Titanium",
      image: "/img/image4.jpg",
      currentPrice: 28000000,
      buyNowPrice: 32000000,
      highestBidder: "PhamThiD",
      postedDate: "2025-11-15",
      endDate: "2025-11-20",
      bidCount: 35,
    },
    {
      id: 5,
      name: "Sony PlayStation 5 Console + 2 Controllers",
      image: "/img/image5.jpg",
      currentPrice: 12000000,
      buyNowPrice: 15000000,
      highestBidder: "HoangVanE",
      postedDate: "2025-11-05",
      endDate: "2025-11-18",
      bidCount: 22,
    },
  ];

  const productInfo = {
    _id: "69248889c9c9c0080231cd7f",
    detail: {
      sellerId: {
        _id: "6922ec91a628dffaa2414479",
        fullName: "Nguyễn Văn A",
        email: "seller@example.com",
        feedBackAsSeller: {
          point: 3.6,
          count: 152,
        },
      },
      name: "MSI RED T1 jacket",
      category: "Fashion",
      subCategory: "Áo khoác",
      description: `
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
    `,
      images: [
        "/img/image1h.jpg",
        "/img/image2h.jpg",
        "/img/image3h.jpg",
        "/img/image4h.jpg",
        "/img/image5h.jpg",
      ],
      followers: 363,
    },
    auction: {
      startPrice: 100,
      stepPrice: 5,
      buyNowPrice: 500,
      currentPrice: 360,
      highestBidderId: {
        _id: "bidder123",
        fullName: "Trần Thị B",
        feedBackAsBidder: {
          point: 3.6,
          count: 89,
        },
      },
      startTime: new Date("2025-03-06T00:00:00Z"),
      endTime: new Date("2025-06-03T23:59:59Z"),
      autoExtend: false,
      status: "active",
      bidders: 45,
    },
    auctionHistory: {
      numberOfBids: 52,
      historyList: [
        {
          _id: "bid001",
          bidderId: {
            _id: "bidder123",
            fullName: "Trần Thị B",
          },
          bidPrice: 360,
          bidTime: new Date("2025-11-19T18:15:00Z"),
        },
        {
          _id: "bid002",
          bidderId: {
            _id: "bidder456",
            fullName: "Lê Văn C",
          },
          bidPrice: 355,
          bidTime: new Date("2025-11-18T16:00:00Z"),
        },
        {
          _id: "bid003",
          bidderId: {
            _id: "bidder789",
            fullName: "Phạm Thị D",
          },
          bidPrice: 350,
          bidTime: new Date("2025-11-17T14:45:00Z"),
        },
        {
          _id: "bid004",
          bidderId: {
            _id: "bidder012",
            fullName: "Hoàng Văn E",
          },
          bidPrice: 345,
          bidTime: new Date("2025-11-16T12:30:00Z"),
        },
        {
          _id: "bid005",
          bidderId: {
            _id: "bidder345",
            fullName: "Vũ Thị F",
          },
          bidPrice: 340,
          bidTime: new Date("2025-11-15T10:00:00Z"),
        },
      ],
    },
    chat: [
      {
        _id: "chat001",
        type: "public",
        sendId: {
          _id: "user456",
          fullName: "Nguyễn Thị G",
        },
        receiveId: {
          _id: "user123",
          fullName: "Nguyễn Văn A",
        },
        message:
          "Hello, I am interested in your product. Is it still available?",
        time: new Date("2025-11-18T08:10:00Z"),
        replies: [
          {
            _id: "reply001",
            sendId: {
              _id: "user123",
              fullName: "Nguyễn Văn A",
            },
            message:
              "Yes, the product is still available. Let me know if you have any questions.",
            time: new Date("2025-11-18T08:12:00Z"),
          },
        ],
      },
      {
        _id: "chat002",
        type: "public",
        sendId: {
          _id: "user456",
          fullName: "Nguyễn Thị G",
        },
        receiveId: {
          _id: "user123",
          fullName: "Nguyễn Văn A",
        },
        message:
          "Great! Can you provide more details about its condition and any accessories included?",
        time: new Date("2025-11-18T08:15:00Z"),
        replies: [
          {
            _id: "reply002",
            sendId: {
              _id: "user123",
              fullName: "Nguyễn Văn A",
            },
            message:
              "The product is in excellent condition with all accessories.",
            time: new Date("2025-11-18T08:20:00Z"),
          },
        ],
      },
    ],
    views: 3600, // Thêm field views (có thể lưu trong DB sau)
    createdAt: new Date("2025-03-06T00:00:00Z"),
    updatedAt: new Date("2025-11-19T18:15:00Z"),
  };

  const { id } = useParams();
  const productId = id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productInfoData, setProductInfoData] = useState(null);

  const temp = ["1", "2", "3", "4", "5"];

  const [selectedImage, setSelectedImage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const mainImageRef = useRef(null);
  const thumbsRef = useRef(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        const basicBata = await getProductBasicDetails(productId);
        console.log("Fetched product data:", basicBata);
        setProductInfoData(basicBata);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

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
  }, [productInfoData, selectedImage]);

  const [productDescription, setProductDescription] = useState(
    productInfo.detail.description
  );

  const calculateTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) {
      return "Đã kết thúc";
    }

    const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    const days = Math.floor(
      (diff % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)
    );
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${weeks} tuần ${days} ngày ${hours} giờ ${minutes} phút`;
  };

  const handleSaveDescription = async (newDescription) => {
    try {
      setProductDescription(newDescription);
      alert("Cập nhật mô tả thành công!");
    } catch (error) {
      console.error("Có lỗi xảy ra khi cập nhật", error);
      alert("Có lỗi xảy ra khi cập nhật.");
    }
  };

  let images = [];
  let sellerId = "";
  let timeRemaining = "";

  if (productInfoData) {
    images = productInfoData.detail?.images || [];
    sellerId = productInfoData.detail.sellerId._id;
    timeRemaining = calculateTimeRemaining(productInfoData.auction.endTime);
  }

  // const images = useMemo(
  //   () => productInfoData.detail?.images || [],
  //   [productInfoData]
  // );
  // const sellerId = useMemo(
  //   () => productInfoData.detail.sellerId._id,
  //   [productInfoData]
  // );
  // const timeRemaining = useMemo(
  //   () => calculateTimeRemaining(productInfoData.auction.endTime),
  //   [productInfoData]
  // );

  const currentUserId = "6922ec91a628dffaa2414479";
  const isOwner = currentUserId === sellerId;

  return (
    <>
      {loading && <div className="text-center py-20">Loading...</div>}
      {error && (
        <div className="text-center py-20 text-red-500">Error: {error}</div>
      )}
      {!loading && !error && productInfoData && (
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
              <h1 className="text-3xl font-bold mb-4">
                {productInfoData.detail.name}
              </h1>

              {/* Seller Info */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-600">
                  Seller: @{productInfoData.detail.sellerId.fullName}
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">
                    {productInfoData.detail.sellerId.feedBackAsSeller.point}
                  </span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>

              {/* Date Range */}
              <div className="text-gray-700 mb-4">
                Bắt đầu:{" "}
                {new Date(productInfoData.auction.startTime).toLocaleDateString(
                  "vi-VN"
                )}{" "}
                - Kết thúc:{" "}
                {new Date(productInfoData.auction.endTime).toLocaleDateString(
                  "vi-VN"
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span>{productInfoData.auction.bidders}</span>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Ra giá cao nhất:</span>
                  <span className="text-3xl font-bold text-red-500">
                    ${productInfoData.auction.currentPrice}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">
                      bởi: @{productInfoData.auction.highestBidderId.fullName}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">
                        {
                          productInfoData.auction.highestBidderId
                            .feedBackAsBidder.point
                        }
                      </span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                </div>

                {/* Countdown */}
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5" />
                  <span>{timeRemaining}</span>
                </div>
              </div>

              {/* Bid Button */}
              <button
                className="w-full bg-black text-white py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors mb-8"
                onClick={() => setActiveTab("auction")}
              >
                Đấu Giá Ngay!
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-3">
              {products.map((product, i) => (
                <ProductCardP key={i} product={product} />
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
      )}
    </>
  );
};

export default ProductDetails;
