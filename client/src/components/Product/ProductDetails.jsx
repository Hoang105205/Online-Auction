import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Star, User, Clock } from "lucide-react";
import { Card } from "flowbite-react";
import ProductDetailsInformation from "./ProductDetailsInformation";
import ProductDetailsAuction from "./ProductDetailsAuction";
import ProductDetailsANA from "./ProductDetailsANA";
import ProductImage from "../ProductImage";

import ProductCardP from "../Product/ProductCardP";

import useAuth from "../../hooks/useAuth";

import {
  getProductBasicDetails,
  getProductAuction,
  getProductDescription,
  getAuctionHistory,
  getProductQA,
} from "../../api/productService";

const ProductDetails = () => {
  const { auth } = useAuth();
  const [currentUserId, setCurrentUserId] = useState(
    "6922ec91a628dffaa2414479"
  );

  // useEffect(() => {
  //   let isMounted = true;

  //   if (!auth) return;

  //   setCurrentUserId(auth.id);

  //   return () => {
  //     isMounted = false;
  //   }
  // }, [auth]);

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

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        const basicBata = await getProductBasicDetails(productId);
        const auctionData = await getProductAuction(productId);
        const descData = await getProductDescription(productId);
        const aucHisData = await getAuctionHistory(productId);
        const qaData = await getProductQA(productId);

        console.log("Fetched QA data:", qaData);

        setProductInfoData(basicBata);
        setProductAuctionData(auctionData);
        setProductDescData(descData);
        setProductAuctHisData(aucHisData);
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
                    <ProductImage url={img} />
                  </div>
                ))}
              </div>

              {/* Main Image */}
              <div
                ref={mainImageRef}
                className="flex-1 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
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
                {new Date(
                  productAuctionData.auction.startTime
                ).toLocaleDateString("vi-VN")}{" "}
                - Kết thúc:{" "}
                {new Date(
                  productAuctionData.auction.endTime
                ).toLocaleDateString("vi-VN")}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span>{productAuctionData.auction.bidders}</span>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Ra giá cao nhất:</span>
                  <span className="text-3xl font-bold text-red-500">
                    ${productAuctionData.auction.currentPrice}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">
                      bởi: @
                      {productAuctionData.auction.highestBidderId.fullName}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">
                        {
                          productAuctionData.auction.highestBidderId
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
                  <span className="text-red-500 font-semibold">
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
                />
              )}
              {activeTab === "qa" && (
                <ProductDetailsANA
                  productId={productId}
                  qaData={productQAData}
                />
              )}
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
