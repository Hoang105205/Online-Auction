import {
  HiUser,
  HiCreditCard,
  HiShoppingBag,
  HiHeart,
  HiKey,
} from "react-icons/hi";
import { FaGavel } from "react-icons/fa";

const AccountSidebar = ({ activeTab, setActiveTab, onItemClick }) => {
  const menuItems = [
    {
      id: "account-management",
      title: "Quản lý tài khoản",
      items: [
        { id: "profile", label: "Hồ sơ cá nhân", icon: HiUser },
        { id: "payment", label: "Phương thức thanh toán", icon: HiCreditCard },
        { id: "my-payment", label: "My Payment Options", icon: HiCreditCard },
      ],
    },
    {
      id: "auctions",
      title: "Đấu giá",
      items: [
        { id: "auctions", label: "Đấu giá của tôi", icon: FaGavel },
        { id: "my-auctions", label: "Đấu giá đã tạo", icon: HiShoppingBag },
      ],
    },
    {
      id: "other",
      title: "",
      items: [
        { id: "watchlist", label: "My Watchlist", icon: HiHeart },
        { id: "permissions", label: "Quyền hạn tài", icon: HiKey },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {menuItems.map((section) => (
        <div key={section.id} className="mb-6 last:mb-0">
          {section.title && (
            <h3 className="text-sm font-semibold text-gray-900 mb-3 px-2">
              {section.title}
            </h3>
          )}
          <nav className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onItemClick) onItemClick();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-sky-50 text-sky-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-sky-600" : "text-gray-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
};

export default AccountSidebar;
