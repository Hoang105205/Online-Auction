import { Card } from "flowbite-react";
import ProductCarousel from "./ProductCarousel"

const HomeContent = () => {
  const temp = ["1", "2", "3", "4", "5"];
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <div className="max-w-[380px] sm:max-w-[500px] lg:max-w-[675px] mx-auto">
        <ProductCarousel />
      </div>
      <div>
        <div className="mt-8 grid grid-cols-1 md:flex md:flex-wrap md:overflow-x-auto md:justify-center">
          {temp.map((t, i) => (
            <Card
              key={i}
              className="max-w-[300px] shadow-none"
              imgAlt="Apple Watch Series 7 in colors pink, silver, and black"
              imgSrc="/img/image1.jpg"
            >
              {/* Tên sản phẩm */}
              <a href="#">
                <h5 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                  Apple Watch Series 7 GPS, Aluminium Case, Starlight Sport
                </h5>
              </a>

              {/* Seller + Upvote/Downvote */}
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>@John Doe</span>

                {/* Upvote */}
                <span className="flex items-center gap-1 px-2 py-0.5 border border-green-200 rounded text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="w-4 h-4"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 1l3 6H5l3-6zm0 14l-3-6h6l-3 6z" />
                  </svg>
                  120
                </span>

                {/* Downvote */}
                <span className="flex items-center gap-1 px-2 py-0.5 border border-red-200 rounded text-red-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="w-4 h-4 rotate-180"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 1l3 6H5l3-6zm0 14l-3-6h6l-3 6z" />
                  </svg>
                  5
                </span>
              </div>

              <div className="flex items-center mt-1">
                <span className={i <= 2 ? "text-xl font-bold text-red-600 animate-pulse" : "text-xl font-bold text-gray-900 dark:text-white"}>
                  100.000 đ
                </span>
              </div>
            </Card>
          ))}
      </div>
      <div className="mt-8 grid grid-cols-1 md:flex md:flex-wrap md:overflow-x-auto md:justify-center">
          {temp.map((t, i) => (
            <Card
              key={i}
              className="max-w-[300px] shadow-none"
              imgAlt="Apple Watch Series 7 in colors pink, silver, and black"
              imgSrc="/img/image1.jpg"
            >
              {/* Tên sản phẩm */}
              <a href="#">
                <h5 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                  Apple Watch Series 7 GPS, Aluminium Case, Starlight Sport
                </h5>
              </a>

              {/* Seller + Upvote/Downvote */}
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>@John Doe</span>

                {/* Upvote */}
                <span className="flex items-center gap-1 px-2 py-0.5 border border-green-200 rounded text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="w-4 h-4"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 1l3 6H5l3-6zm0 14l-3-6h6l-3 6z" />
                  </svg>
                  120
                </span>

                {/* Downvote */}
                <span className="flex items-center gap-1 px-2 py-0.5 border border-red-200 rounded text-red-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="w-4 h-4 rotate-180"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 1l3 6H5l3-6zm0 14l-3-6h6l-3 6z" />
                  </svg>
                  5
                </span>
              </div>

              <div className="flex items-center mt-1">
                <span className={i <= 2 ? "text-xl font-bold text-red-600 animate-pulse" : "text-xl font-bold text-gray-900 dark:text-white"}>
                  10 lượt ra giá
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
