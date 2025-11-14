import { useState } from "react";
import AccountSidebar from "../components/Account/AccountSidebar";
import ProfileTab from "../components/Account/ProfileTab";
import Header from "../components/Header";
import { HiX } from "react-icons/hi";
import { HiOutlineBars3BottomLeft } from "react-icons/hi2";

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;
      case "payment":
        return <div className="p-6">Phương thức thanh toán (Coming soon)</div>;
      case "auctions":
        return <div className="p-6">Đấu giá (Coming soon)</div>;
      case "my-auctions":
        return <div className="p-6">Đấu giá của tôi (Coming soon)</div>;
      case "watchlist":
        return <div className="p-6">My Watchlist (Coming soon)</div>;
      case "permissions":
        return <div className="p-6">Quyền hạn tài (Coming soon)</div>;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">My Account</span>
        </div>

        {/* Mobile header with menu button */}
        <div className="flex items-center justify-between lg:hidden mb-4">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
          >
            <HiOutlineBars3BottomLeft className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <AccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${
          mobileOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
        aria-modal={mobileOpen}
        role="dialog"
        inert={!mobileOpen}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        {/* Panel */}
        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transition-transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="rounded-md p-2 hover:bg-gray-100"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>
          <div className="p-2">
            <AccountSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onItemClick={() => setMobileOpen(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
