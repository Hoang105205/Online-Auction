import { HiUser, HiHeart, HiKey, HiStar } from "react-icons/hi";
import { HiTrophy,HiCube  } from "react-icons/hi2";
import { FaGavel } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const sections = [
  {
    id: "account-management",
    title: "Quản lý tài khoản",
    items: [
      { to: "/account", label: "Hồ sơ cá nhân", icon: HiUser },
      { to: "/account/rating", label: "Điểm đánh giá", icon: HiStar },
    ],
  },
  {
    id: "auctions",
    title: "Đấu giá",
    items: [
      { to: "/account/auctions", label: "Đang đấu giá", icon: FaGavel },
      { to: "/account/win-auctions", label: "Đã thắng đấu giá", icon: HiTrophy },
      { to: "/account/my-products", label: "Sản phẩm đã đăng", icon: HiCube },
    ],
  },
  {
    id: "other",
    title: "Other",
    items: [
      { to: "/account/watchlist", label: "My Watchlist", icon: HiHeart },
      { to: "/account/permissions", label: "Quyền hiện tài", icon: HiKey },
    ],
  },
];

const AccountSidebar = ({ onItemClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {sections.map((section) => (
        <div key={section.id} className="mb-6 last:mb-0">
          {section.title && (
            <h3 className="text-sm font-semibold text-gray-900 mb-3 px-2">
              {section.title}
            </h3>
          )}
          <nav className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  onClick={() => onItemClick && onItemClick()}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-sky-50 text-sky-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? "text-sky-600" : "text-gray-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
};

export default AccountSidebar;
