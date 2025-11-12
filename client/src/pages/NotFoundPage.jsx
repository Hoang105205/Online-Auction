import { Link } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiHome } from "react-icons/hi";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Logo and App Name Header */}
      <div className="p-6">
        <Link
          to="/"
          className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity"
        >
          <img src="/logo.png" alt="Auctify Logo" className="h-10 w-10" />
          <span className="text-2xl font-bold text-black">Auctify</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Text */}
          <h1 className="text-8xl md:text-9xl font-extrabold text-sky-500 mb-4">
            404
          </h1>

          {/* Announcement */}
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3">
            Trang không tồn tại
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>

          {/* 404 Image */}
          <div className="mb-8">
            <img
              src="/404-illustration.svg"
              alt="Page not found"
              className="w-full max-w-md mx-auto"
              onError={(e) => {
                // Fallback to a simple illustration if image doesn't exist
                e.target.style.display = "none";
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="block w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700"
              >
                <HiHome className="mr-2 h-5 w-5" />
                Về trang chủ
              </Button>
            </Link>
            <Button
              size="lg"
              color="gray"
              className="w-full sm:w-auto"
              onClick={() => window.history.back()}
            >
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
