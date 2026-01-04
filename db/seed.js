require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Import Models
// Lưu ý: Đảm bảo đường dẫn trỏ đúng tới thư mục models của bạn
const User = require("../server/models/User");
const Product = require("../server/models/Product");
const SystemSetting = require("../server/models/System");

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
];

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
            { subCategoryName: "Quần áo nữ", slug: "quan-ao-nu" },
            { subCategoryName: "Giày dép", slug: "giay-dep" },
            { subCategoryName: "Quần áo nam", slug: "quan-ao-nam" },
            { subCategoryName: "Túi xách", slug: "tui-xach" },
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
      ],
    };

    const createdSystem = await SystemSetting.create(systemData);
    const mainCategory = createdSystem.categories[0]; // Lấy category Thời trang để dùng cho Product
    const subCats = mainCategory.subCategories;

    // 4. Tạo Users (Hash password)
    console.log("👤 Đang tạo Users...");
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10); // Pass mặc định: test1234

    const users = await User.create([
      {
        email: "admin@gmail.com",
        password: hashedPassword,
        fullName: "Super Admin",
        address: "HCMC, Vietnam",
        roles: [ROLES_LIST.Admin, ROLES_LIST.Bidder],
        isVerified: true,
      },
      {
        email: "seller@gmail.com",
        password: hashedPassword,
        fullName: "Uy Tin Seller",
        address: "Hanoi, Vietnam",
        roles: [ROLES_LIST.Seller, ROLES_LIST.Bidder],
        isVerified: true,
        sellerRequest: { status: "approved", startDate: new Date() },
      },
      {
        email: "bidder1@gmail.com",
        password: hashedPassword,
        fullName: "Nguyen Van Bidder",
        address: "Danang, Vietnam",
        roles: [ROLES_LIST.Bidder],
        isVerified: true,
      },
      {
        email: "bidder2@gmail.com",
        password: hashedPassword,
        fullName: "Le Thi Mua Hang",
        address: "Cantho, Vietnam",
        roles: [ROLES_LIST.Bidder],
        isVerified: true,
      },
    ]);

    const sellerUser = users[1]; // Seller user

    // 5. Tạo 20 Products
    console.log("📦 Đang tạo 20 Products...");
    const products = [];
    const now = new Date();

    for (let i = 1; i <= 20; i++) {
      let startTime, endTime, status;
      const randomSubCat = subCats[Math.floor(Math.random() * subCats.length)];

      // Logic chia trạng thái sản phẩm để test
      if (i <= 10) {
        // 10 SP Đang đấu giá (Active)
        // Bắt đầu: 1-2 ngày trước. Kết thúc: 1-5 ngày tới
        startTime = new Date(
          now.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000
        );
        endTime = new Date(
          now.getTime() + (Math.random() * 5 + 1) * 24 * 60 * 60 * 1000
        );
        status = "active";
      } else if (i <= 15) {
        // 5 SP Đã kết thúc (Ended)
        // Bắt đầu: 5 ngày trước. Kết thúc: 1 ngày trước
        startTime = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
        endTime = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
        status = "ended";
      } else {
        // 5 SP Sắp diễn ra (Active nhưng chưa đến giờ start - tuỳ logic hiển thị frontend)
        // Hoặc Status = Pending (Chờ duyệt)
        startTime = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // Bắt đầu ngày mai
        endTime = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
        status = "active"; // Vẫn active nhưng chưa bid được vì chưa đến giờ
      }

      // Random 3 ảnh từ list
      const productImages = [
        SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)],
        SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)],
        SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)],
      ];

      products.push({
        detail: {
          sellerId: sellerUser._id,
          name: `Sản phẩm mẫu ${i} - ${randomSubCat.subCategoryName}`,
          category: mainCategory._id,
          subCategory: randomSubCat._id,
          description: `Mô tả chi tiết cho sản phẩm số ${i}. Hàng chính hãng, chất lượng cao, bảo hành đầy đủ.`,
          images: productImages,
          followers: Math.floor(Math.random() * 10),
        },
        auction: {
          startPrice: 100000 + i * 50000, // Giá khởi điểm tăng dần
          stepPrice: 50000,
          currentPrice: 100000 + i * 50000,
          buyNowPrice: 5000000 + i * 100000,
          startTime: startTime,
          endTime: endTime,
          status: status,
          autoExtend: true,
          allowNewBidders: true,
        },
      });
    }

    await Product.create(products);

    console.log("✅ SEED DATA THÀNH CÔNG!");
    console.log("------------------------------------------------");
    console.log(`Admin:   admin@gmail.com   | Pass: test1234`);
    console.log(`Seller:  seller@gmail.com  | Pass: test1234`);
    console.log(`Bidder:  bidder1@gmail.com | Pass: test1234`);
    console.log("------------------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi Seed Data:", error);
    process.exit(1);
  }
};

seedData();
