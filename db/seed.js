require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Import Models
// Lưu ý: Đảm bảo đường dẫn trỏ đúng tới thư mục models của bạn
const User = require("./models/User");
const Product = require("./models/Product");
const SystemSetting = require("./models/System");

// Cấu hình Roles (Giả sử theo config roles_list của bạn)
const ROLES_LIST = {
  Admin: 5150,
  Seller: 1984,
  Bidder: 2001,
};

// Default Password cho tất cả user khi seed
const DEFAULT_PASSWORD = "test1234";

// Ảnh mẫu Cloudinary
const SAMPLE_IMAGES = [
  "https://res.cloudinary.com/demo/image/upload/v1688640000/cld-sample-5.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1688640000/cld-sample-4.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1688640000/cld-sample-3.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1688640000/cld-sample-2.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1688640000/cld-sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1688640000/shoes.jpg",
];

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateFakeBids = (
  startPrice,
  stepPrice,
  startTime,
  endTime,
  biddersList
) => {
  const numberOfBids = getRandomInt(5, 10);
  const history = [];
  let currentPrice = startPrice;
  let lastBidTime = new Date(startTime).getTime() + 60000; // Bid đầu tiên sau start 1 phút
  const maxTime =
    new Date(endTime).getTime() < Date.now()
      ? new Date(endTime).getTime()
      : Date.now();

  for (let k = 0; k < numberOfBids; k++) {
    // Random người bid
    const randomBidder = biddersList[getRandomInt(0, biddersList.length - 1)];
    currentPrice += stepPrice;

    // Tăng thời gian bid từ từ
    lastBidTime += getRandomInt(100000, 500000);
    if (lastBidTime >= maxTime) break;

    history.push({
      bidderId: randomBidder._id,
      bidPrice: currentPrice,
      bidTime: new Date(lastBidTime),
    });
  }

  // Đếm số người tham gia (unique)
  const uniqueBidders = new Set(history.map((b) => b.bidderId.toString())).size;

  return {
    history: history.reverse(), // Mới nhất lên đầu
    finalPrice: currentPrice,
    highestBidderId:
      history.length > 0 ? history[history.length - 1].bidderId : null,
    uniqueBidders: uniqueBidders,
    totalBids: history.length,
  };
};

const seedData = async () => {
  try {
    // 1. Kết nối Database
    await mongoose.connect(process.env.DATABASE_URI || process.env.MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB.");

    // 2. Xóa dữ liệu cũ (Reset DB)
    console.log("🔄 Đang xóa dữ liệu cũ...");
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      SystemSetting.deleteMany({}),
    ]);

    // 3. Tạo System Settings & Categories
    console.log("⚙️ Đang tạo System Settings...");
    const systemData = {
      autoExtendBefore: 8,
      autoExtendDuration: 11,
      latestProductTimeConfig: 16,
      mailingSystem: "auctify.onlineauction@gmail.com",
      categories: [
        {
          categoryName: "Thời trang",
          slug: "thoi-trang",
          subCategories: [
            { subCategoryName: "Quần áo", slug: "quan-ao" },
            { subCategoryName: "Giày dép", slug: "giay-dep" },
          ],
        },
        {
          categoryName: "Điện tử",
          slug: "dien-tu",
          subCategories: [
            { subCategoryName: "Điện thoại", slug: "dien-thoai" },
            { subCategoryName: "Laptop", slug: "laptop" },
          ],
        },
        {
          categoryName: "Đồng hồ",
          slug: "dong-ho",
          subCategories: [
            { subCategoryName: "Đồng hồ nam", slug: "dong-ho-nam" },
            { subCategoryName: "Đồng hồ cơ", slug: "dong-ho-co" },
          ],
        },
        {
          categoryName: "Nhà cửa",
          slug: "nha-cua",
          subCategories: [
            { subCategoryName: "Nội thất", slug: "noi-that" },
            { subCategoryName: "Decor", slug: "decor" },
          ],
        },
        {
          categoryName: "Sưu tầm",
          slug: "suu-tam",
          subCategories: [
            { subCategoryName: "Tem", slug: "tem" },
            { subCategoryName: "Tiền cổ", slug: "tien-co" },
          ],
        },
      ],
    };

    const createdSystem = await SystemSetting.create(systemData);
    const allCategories = createdSystem.categories; // Lấy toàn bộ danh mục để random

    // 4. Tạo Users (Hash password)
    console.log("👤 Đang tạo Users...");
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10); // Pass mặc định: test1234

    const users = await User.create([
      {
        email: "admin@gmail.com",
        password: hashedPassword,
        fullName: "Super Admin",
        address: "HCMC",
        roles: [ROLES_LIST.Admin, ROLES_LIST.Bidder],
        isVerified: true,
      },
      {
        email: "seller@gmail.com",
        password: hashedPassword,
        fullName: "Uy Tin Seller",
        address: "Hanoi",
        roles: [ROLES_LIST.Seller, ROLES_LIST.Bidder],
        isVerified: true,
        sellerRequest: { status: "approved", startDate: new Date() },
      },
      {
        email: "bidder1@gmail.com",
        password: hashedPassword,
        fullName: "Nguyen Van Bidder",
        address: "Danang",
        roles: [ROLES_LIST.Bidder],
        isVerified: true,
      },
      {
        email: "bidder2@gmail.com",
        password: hashedPassword,
        fullName: "Le Thi Mua Hang",
        address: "Cantho",
        roles: [ROLES_LIST.Bidder],
        isVerified: true,
      },
      {
        email: "bidder3@gmail.com",
        password: hashedPassword,
        fullName: "Tran Van C",
        address: "Hue",
        roles: [ROLES_LIST.Bidder],
        isVerified: true,
      },
      {
        email: "bidder4@gmail.com",
        password: hashedPassword,
        fullName: "Pham Thi D",
        address: "Haiphong",
        roles: [ROLES_LIST.Bidder],
        isVerified: true,
      },
      {
        email: "bidder5@gmail.com",
        password: hashedPassword,
        fullName: "Hoang Van E",
        address: "Vinh",
        roles: [ROLES_LIST.Bidder],
        isVerified: true,
      },
    ]);

    const sellerUser = users[1]; // Seller user
    const bidderUsers = users.slice(2); // Lấy danh sách bidder

    // 5. Tạo 20 Products
    console.log("📦 Đang tạo 20 Products...");
    const products = [];
    const now = new Date();

    for (let i = 1; i <= 20; i++) {
      let startTime, endTime, status;

      const startPrice = 100000 + i * 50000;
      const stepPrice = 50000;

      const randomCat =
        allCategories[Math.floor(Math.random() * allCategories.length)];
      const randomSubCat =
        randomCat.subCategories[
          Math.floor(Math.random() * randomCat.subCategories.length)
        ];

      // Active
      startTime = new Date(
        now.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000
      );
      endTime = new Date(
        now.getTime() + (Math.random() * 5 + 1) * 24 * 60 * 60 * 1000
      );
      status = "active";

      // Tạo lịch sử đấu giá giả
      let auctionData = {
        currentPrice: startPrice,
        history: [],
        highest: null,
        total: 0,
        distinct: 0,
      };

      const fakeResult = generateFakeBids(
        startPrice,
        stepPrice,
        startTime,
        endTime,
        bidderUsers
      );
      auctionData.currentPrice = fakeResult.finalPrice;
      auctionData.history = fakeResult.history;
      auctionData.highest = fakeResult.highestBidderId;
      auctionData.total = fakeResult.totalBids;
      auctionData.distinct = fakeResult.uniqueBidders;

      // Random 3 ảnh
      const shuffledImages = [...SAMPLE_IMAGES].sort(() => 0.5 - Math.random());
      const productImages = shuffledImages.slice(0, 3);

      products.push({
        detail: {
          sellerId: sellerUser._id,
          name: `Sản phẩm mẫu ${i} - ${randomSubCat.subCategoryName}`,
          category: randomCat._id,
          subCategory: randomSubCat._id,
          description: `Mô tả chi tiết cho sản phẩm số ${i}. Hàng chính hãng, chất lượng cao, bảo hành đầy đủ.`,
          images: productImages,
          followers: Math.floor(Math.random() * 10),
        },
        auction: {
          startPrice: startPrice,
          stepPrice: stepPrice,
          buyNowPrice: startPrice * 10,
          currentPrice: auctionData.currentPrice,
          highestBidderId: auctionData.highest,
          bidders: auctionData.distinct,
          startTime: startTime,
          endTime: endTime,
          status: status,
          autoExtend: true,
          allowNewBidders: true,
        },
        auctionHistory: {
          numberOfBids: auctionData.total,
          historyList: auctionData.history,
        },
        // Set createdAt = startTime để giả lập thời gian tạo sản phẩm
        createdAt: startTime,
        updatedAt: startTime,
      });
    }

    await Product.create(products);

    console.log("✅ SEED DATA THÀNH CÔNG!");
    console.log(`- Categories: ${allCategories.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Products: ${products.length}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi Seed Data:", error);
    process.exit(1);
  }
};

seedData();
