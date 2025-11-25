import { useState } from "react";
import Category from "../Category/Category";
import { Button } from "flowbite-react";
import { ChevronRight } from "lucide-react";

const categories = [
  {
    id: "dien-tu",
    title: "Điện tử",
    items: [
      { to: "HELLO", label: "HELLO" },
      { to: "HEHE", label: "HEHE" },
      { to: "ABC", label: "ABC" },
      { to: "A", label: "AAAAAAAAAAAAA" },
    ],
  },
  {
    id: "thoi-trang",
    title: "Thời trang",
    items: [
      { to: "HELLO", label: "HELLO" },
      { to: "HEHE", label: "HEHE" },
      { to: "ABC", label: "ABC" },
      { to: "A", label: "AAAAAAAAAAAAA" },
    ],
  },
  {
    id: "nghe-thuat",
    title: "Nghệ thuật",
    items: [
      { to: "HELLO", label: "HELLO" },
      { to: "HEHE", label: "HEHE" },
      { to: "ABC", label: "ABC" },
      { to: "A", label: "AAAAAAAAAAAAA" },
    ],
  },
  {
    id: "tui-dung",
    title: "Túi đựng",
    items: [
      { to: "HELLO", label: "HELLO" },
      { to: "HEHE", label: "HEHE" },
      { to: "ABC", label: "ABC" },
      { to: "A", label: "AAAAAAAAAAAAA" },
    ],
  },
  {
    id: "noi-that",
    title: "Nội thất",
    items: [
      { to: "HELLO", label: "HELLO" },
      { to: "HEHE", label: "HEHE" },
      { to: "ABC", label: "ABC" },
      { to: "A", label: "AAAAAAAAAAAAA" },
    ],
  },
  {
    id: "trang-tri",
    title: "Trang trí",
    items: [
      { to: "HELLO", label: "HELLO" },
      { to: "HEHE", label: "HEHE" },
      { to: "ABC", label: "ABC" },
      { to: "A", label: "AAAAAAAAAAAAA" },
    ],
  },
  {
    id: "ruou-chung-cat",
    title: "Rượu chưng cất",
    items: [
      { to: "HELLO", label: "HELLO" },
      { to: "HEHE", label: "HEHE" },
      { to: "ABC", label: "ABC" },
      { to: "A", label: "AAAAAAAAAAAAA" },
    ],
  },
];

const SideBar = () => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <div onMouseLeave={() => setIsOpenMobile(false)}>
      <Button
        className="absolute md:hidden z-40 p-2 bg-gray-300 text-gray-700 rounded-full shadow-md hover:bg-gray-400 hover:text-gray-900 transition-colors duration-200"
        onClick={() => setIsOpenMobile(!isOpenMobile)}
      >
        <ChevronRight size={25} />
      </Button>
      {/* Mobile overlay (shown when sidebar is open) */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-[300px] bg-white p-4 transform transition-transform duration-300 z-40
        ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
      >
        <form className="max-w-md mx-auto">
          <label
            htmlFor="default-search"
            className="mb-2 text-sm font-medium text-gray-900 sr-only"
          >
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 end-10 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Bạn muốn tìm gì?"
              required
            />
          </div>
        </form>
        <div className="w-full mx-auto p-2">
          {categories != null &&
            categories.map((category) => (
              <Category key={category.id} category={category} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
