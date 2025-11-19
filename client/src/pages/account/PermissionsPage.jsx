import { useState } from "react";
import { Button } from "flowbite-react";
import { HiShieldCheck, HiClock } from "react-icons/hi";

export default function PermissionsPage() {
  // Mock data - replace with API data later
  const [isSeller, setIsSeller] = useState(true); // Change to true to test seller view
  const [sellerSince, setSellerSince] = useState("2025-11-15"); // Date when user became seller
  const [requestPending, setRequestPending] = useState(false);

  // Calculate days remaining if user is seller
  const calculateDaysRemaining = () => {
    if (!isSeller) return 0;
    const startDate = new Date(sellerSince);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7); // 7 days from seller start date
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = calculateDaysRemaining();

  const handleRequestSeller = () => {
    // Handle request to become seller
    console.log("Requesting seller permission...");
    setRequestPending(true);
    // In real app, send API request here
  };

  return (
    <div className="p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Current Role (approx 25%) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quyền hiện tại
            </h2>

            {/* Role Badge */}
            <div className="space-y-3">
              {/* Seller Badge */}
              <div
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSeller
                    ? "bg-amber-50 border-amber-400"
                    : "bg-gray-50 border-gray-200 opacity-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <HiShieldCheck
                    className={`text-2xl ${
                      isSeller ? "text-amber-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-bold text-lg ${
                      isSeller ? "text-amber-700" : "text-gray-500"
                    }`}
                  >
                    Seller
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Có thể tạo và quản lý đấu giá
                </p>
              </div>

              {/* Bidder Badge */}
              <div
                className={`p-4 rounded-lg border-2 transition-all ${
                  !isSeller
                    ? "bg-blue-50 border-blue-400"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <HiShieldCheck
                    className={`text-2xl ${
                      !isSeller ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-bold text-lg ${
                      !isSeller ? "text-blue-700" : "text-gray-500"
                    }`}
                  >
                    Bidder
                  </span>
                </div>
                <p className="text-xs text-gray-600">Có thể tham gia đấu giá</p>
              </div>
            </div>

            {isSeller && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 font-medium">
                  ✓ Bạn đang có quyền Seller
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Status/Actions */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {isSeller ? (
              // Seller view - show days remaining
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Thời gian còn lại với quyền Seller
                </h3>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-8 text-center">
                  <HiClock className="text-6xl text-amber-500 mx-auto mb-4" />
                  <div className="mb-2">
                    <span className="text-6xl font-extrabold text-amber-600">
                      {daysRemaining}
                    </span>
                    <span className="text-2xl text-gray-700 ml-2">ngày</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {daysRemaining > 1
                      ? `Quyền Seller của bạn sẽ hết hạn sau ${daysRemaining} ngày.`
                      : "Quyền Seller của bạn sẽ hết hạn sau hôm nay."}
                  </p>
                  <div className="w-full max-w-md mx-auto h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                      style={{ width: `${(daysRemaining / 7) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Ngày bắt đầu:{" "}
                    {new Date(sellerSince).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Lưu ý quan trọng
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Quyền Seller có hiệu lực trong 7 ngày</li>
                    <li>
                      Sau khi hết hạn, bạn cần gửi yêu cầu mới để tiếp tục
                    </li>
                    <li>
                      Các đấu giá đang diễn ra sẽ không bị ảnh hưởng khi hết hạn
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              // Bidder view - show request button
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Nâng cấp lên Seller
                </h3>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-xl p-8">
                  <div className="text-center mb-6">
                    <HiShieldCheck className="text-6xl text-blue-500 mx-auto mb-4" />
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      Trở thành Seller
                    </h4>
                    <p className="text-gray-600 max-w-xl mx-auto">
                      Với quyền Seller, bạn có thể tạo và quản lý các phiên đấu
                      giá của riêng mình. Quyền Seller có hiệu lực trong 7 ngày
                      và cần được admin phê duyệt.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 mb-6">
                    <h5 className="font-semibold text-gray-900 mb-3">
                      Quyền lợi của Seller:
                    </h5>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Tạo và quản lý phiên đấu giá</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Đăng sản phẩm lên hệ thống</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Theo dõi và quản lý người đấu giá</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Nhận thông báo về các hoạt động đấu giá</span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-center">
                    {requestPending ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 font-medium">
                          ⏳ Yêu cầu của bạn đang chờ admin phê duyệt
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Chúng tôi sẽ thông báo khi yêu cầu được xử lý
                        </p>
                      </div>
                    ) : (
                      <Button
                        size="lg"
                        className="bg-sky-600 hover:bg-sky-700"
                        onClick={handleRequestSeller}
                      >
                        Gửi yêu cầu trở thành Seller
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Lưu ý</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Yêu cầu cần được admin phê duyệt</li>
                    <li>Thời gian xử lý thường từ 1-3 ngày làm việc</li>
                    <li>Quyền Seller có hiệu lực trong 7 ngày</li>
                    <li>Bạn có thể gửi yêu cầu mới sau khi hết hạn</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
