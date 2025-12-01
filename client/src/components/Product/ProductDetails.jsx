import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Star, User, Clock } from "lucide-react";
import ProductDetailsInformation from "./ProductDetailsInformation";
import ProductDetailsAuction from "./ProductDetailsAuction";
import ProductDetailsANA from "./ProductDetailsANA";
import ProductImage from "../ProductImage";

import ProductCardP from "../Product/ProductCardP";

import useAuth from "../../hooks/useAuth";

import useAxiosPrivate from "../../hooks/useAxiosPrivate";

import {
  getProductBasicDetails,
  getProductAuction,
  getProductDescription,
  getAuctionHistory,
  getProductQA,
} from "../../api/productService";

const ProductDetails = () => {
  const { auth } = useAuth();
  const [currentUserId, setCurrentUserId] = useState(null);

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    let isMounted = true;
    if (!auth) {
      return;
    }
    setCurrentUserId(auth.id);
    return () => {
      isMounted = false;
    };
  }, [auth]);

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

  const { id } = useParams();
  const productId = id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productInfoData, setProductInfoData] = useState(null);
  const [productAuctionData, setProductAuctionData] = useState(null);
  const [productDescData, setProductDescData] = useState(null);
  const [productAuctHisData, setProductAuctHisData] = useState(null);
  const [productQAData, setProductQAData] = useState(null);

  const temp = ["1", "2", "3", "4", "5"];

  const [selectedImage, setSelectedImage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const mainImageRef = useRef(null);
  const thumbsRef = useRef(null);

  // for public axios
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        const basicBata = await getProductBasicDetails(productId);
        const auctionData = await getProductAuction(productId);
        const descData = await getProductDescription(productId);
        const qaData = await getProductQA(productId);

        setProductInfoData(basicBata);
        setProductAuctionData(auctionData);
        setProductDescData(descData);
        setProductQAData(qaData);
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

  // for private axios
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (auth?.accessToken) {
          const aucHisData = await getAuctionHistory(productId, axiosPrivate);
          setProductAuctHisData(aucHisData);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (productId && auth?.accessToken) {
      console.log("Fetching private data for user:", auth.id);
      fetchProductData();
    }
  }, [auth, productId, axiosPrivate]);

  const maskBidderName = (name) => {
    if (!name || name.length <= 4) return name;
    return name.substring(0, 4) + "***";
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN");
  };

  const calculateTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) {
      return "Đã kết thúc";
    }

    const days = Math.floor(
      (diff % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)
    );
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days} ngày ${hours} giờ ${minutes} phút`;
  };

  const handleSaveDescription = async (newDescription) => {
    try {
      setProductDescData(newDescription);
      alert("Cập nhật mô tả thành công!");
    } catch (error) {
      console.error("Có lỗi xảy ra khi cập nhật", error);
      alert("Có lỗi xảy ra khi cập nhật.");
    }
  };

  let images = [];
  let sellerId = "";
  let timeRemaining = "";

  if (productInfoData && productAuctionData) {
    images = productInfoData.detail?.images || [];
    sellerId = productInfoData.detail.sellerId._id;
    timeRemaining = calculateTimeRemaining(productAuctionData.auction.endTime);
  }

  const isOwner = currentUserId === sellerId;

  return (
    <>
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="animate-pulse text-blue-600 text-2xl font-bold"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Đang tải...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-20 text-red-500">Error: {error}</div>
      )}
      {!loading && !error && productInfoData && productAuctionData && (
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

          <h1 className="text-2xl lg:text-3xl font-bold mb-3 lg:mb-4 pb-4">
            {productInfoData.detail.name}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Side - Images */}
            <div className="flex flex-col lg:flex-row gap-4 order-1 items-center">
              {/* Thumbnail Images */}
              <div
                ref={thumbsRef}
                className="flex lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-y-auto overflow-y-hidden lg:overflow-x-hidden pb-2 lg:pb-0 lg:pr-2 hide-scrollbar order-2 lg:order-1 max-h-28 lg:max-h-[400px]"
                style={{ minWidth: "auto" }}
              >
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 lg:w-24 lg:h-24 border-2 rounded-lg cursor-pointer overflow-hidden shrink-0 ${
                      selectedImage === idx ? "border-black" : "border-gray-200"
                    }`}
                  >
                    <ProductImage url={img} />
                  </div>
                ))}
              </div>

              {/* Main Image */}
              <div
                ref={mainImageRef}
                className="w-full lg:flex-1 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center order-1 lg:order-2"
                style={{ aspectRatio: "1 / 1", minHeight: 240 }}
              >
                <div
                  className="product-main-image w-full h-full object-contain cursor-zoom-in"
                  onClick={() => setModalOpen(true)}
                >
                  <ProductImage url={images[selectedImage]} />
                </div>
              </div>
            </div>

            {/* Right Side - Product Info */}
            <div className="order-2">
              {/* Seller Info */}
              <div className="flex items-center gap-2 mb-3 lg:mb-4">
                <span className="text-sm lg:text-base text-gray-600">
                  Seller: @{productInfoData.detail.sellerId.fullName}
                </span>
                <div className="flex items-center gap-1 ml-4">
                  <span className="font-semibold text-sm lg:text-base">
                    {productInfoData.detail.sellerId.feedBackAsSeller.point}
                  </span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>

              {/* Date Range */}
              <div className="text-sm lg:text-base text-gray-700 mb-3 lg:mb-4">
                <div className="space-y-1 sm:space-y-0">
                  <span className="block sm:inline">
                    Bắt đầu:{" "}
                    {new Date(
                      productAuctionData.auction.startTime
                    ).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="block sm:inline sm:ml-2">
                    - Kết thúc:{" "}
                    {new Date(
                      productAuctionData.auction.endTime
                    ).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 lg:gap-6 mb-4 lg:mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  <span className="text-sm lg:text-base text-red-400 font-semibold">
                    {productAuctionData.auction.bidders} người đấu giá
                  </span>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-gray-50 p-3 lg:p-4 rounded-lg mb-4 lg:mb-6">
                {/* Highest Bid */}
                <div className="mb-4 pb-4">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0 sm:grid sm:grid-cols-3 sm:gap-4">
                    <div className="text-sm lg:text-base text-gray-600">
                      Ra giá cao nhất:
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-red-500">
                      {formatPrice(productAuctionData.auction.currentPrice)}đ
                    </div>
                    {productAuctionData.auction.highestBidderId && (
                      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-xs lg:text-sm text-gray-600">
                          bởi: @
                          {maskBidderName(
                            productAuctionData.auction.highestBidderId.fullName
                          )}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <span className="text-xs lg:text-sm font-semibold">
                            {
                              productAuctionData.auction.highestBidderId
                                .feedBackAsBidder.point
                            }
                          </span>
                          <Star className="w-3 h-3 lg:w-4 lg:h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Mobile: Bidder info on separate row */}
                  {productAuctionData.auction.highestBidderId && (
                    <div className="flex items-center gap-2 mt-2 sm:hidden">
                      <span className="text-xs text-gray-600">
                        bởi: @
                        {formatPrice(
                          productAuctionData.auction.highestBidderId.fullName
                        )}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <span className="text-xs font-semibold">
                          {
                            productAuctionData.auction.highestBidderId
                              .feedBackAsBidder.point
                          }
                        </span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Buy Now */}
                <div className="mb-4 pb-4">
                  <div className="flex items-center gap-2 sm:grid sm:grid-cols-3 sm:gap-4">
                    <div className="text-sm lg:text-base text-gray-600">
                      Mua ngay với giá:
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-green-500">
                      {formatPrice(productAuctionData.auction.buyNowPrice)}đ
                    </div>
                  </div>
                </div>

                {/* Countdown */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  <span className="text-sm lg:text-base text-red-500 font-semibold">
                    {timeRemaining}
                  </span>
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
                  productId={productId}
                  description={productDescData}
                  isOwner={isOwner}
                  onSave={handleSaveDescription}
                />
              )}
              {activeTab === "auction" && (
                <ProductDetailsAuction
                  productId={productId}
                  auctionData={productAuctionData}
                  auctionHistoryData={productAuctHisData}
                  authUser={auth}
                />
              )}
              {activeTab === "qa" && (
                <ProductDetailsANA
                  productId={productId}
                  qaData={productQAData}
                  sellerId={productInfoData.detail.sellerId}
                  authUser={auth}
                />
              )}
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-12 items-center justify-center flex flex-wrap">
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
              <div
                className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <ProductImage
                  url={images[selectedImage]}
                  defaultWidth="75%"
                  defaultHeight="75%"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProductDetails;
