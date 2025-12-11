import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  approveSellerRequest,
  getDashboardStats,
  getTimeConfigs,
} from "../../api/systemService";
import ProductImage from "../../components/ProductImage";

// Helper function to check if product is new
const checkIsNewProduct = (postedDate, latestProductTimeConfig) => {
  if (!postedDate || !latestProductTimeConfig) return false;
  const postedTime = new Date(postedDate).getTime();
  const currentTime = new Date().getTime();
  const diffInMinutes = (currentTime - postedTime) / (1000 * 60);
  return diffInMinutes <= latestProductTimeConfig;
};

function InsightStat({ label, value, helper }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-2xl font-semibold mt-1 text-slate-900">{value}</p>
      {helper && <p className="text-xs text-slate-400 mt-0.5">{helper}</p>}
    </div>
  );
}

function RecentAuctionItem({ item, timeConfig }) {
  const isNew = checkIsNewProduct(
    item.createdAt,
    timeConfig?.latestProductTimeConfig
  );

  const price = item.auction?.currentPrice
    ? `${item.auction.currentPrice.toLocaleString("vi-VN")}₫`
    : "--";

  return (
    <div className="flex items-center gap-3 p-3 border-b last:border-none relative">
      {isNew && (
        <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
          MỚI
        </span>
      )}
      {item.detail?.images?.length ? (
        <ProductImage
          url={item.detail.images[0]}
          defaultWidth="48px"
          defaultHeight="48px"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-slate-200" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-900 truncate">
          {item.detail?.name || "Sản phẩm"}
        </p>
        <p className="text-xs text-slate-500">
          {new Date(item.createdAt).toLocaleDateString("vi-VN")}
        </p>
      </div>
      <div className="text-sm font-semibold text-rose-500">{price}</div>
    </div>
  );
}

function RecentAuctionsSection({ items, timeConfig }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
        Hiện chưa có sản phẩm mới
      </div>
    );
  }

  return (
    <div className="divide-y">
      {items.map((item) => (
        <RecentAuctionItem
          key={item._id || `${item.detail?.name}-${item.createdAt}`}
          item={item}
          timeConfig={timeConfig}
        />
      ))}
    </div>
  );
}

function UserRequestCard({ user, onApprove }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
        {user.name?.[0] || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-900 truncate">
          {user.name}
        </p>
        <p className="text-xs text-slate-500 truncate">{user.email}</p>
        {user.dateStart && (
          <p className="text-[11px] text-slate-400 mt-0.5">
            Gửi: {new Date(user.dateStart).toLocaleDateString("vi-VN")}
          </p>
        )}
      </div>
      <button
        onClick={() => onApprove && onApprove(user.bidderId)}
        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Chấp nhận
      </button>
    </div>
  );
}

function UpgradeRequestsSection({ requests, onApprove }) {
  if (!requests || requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-slate-500 text-sm">
        Không có yêu cầu mới
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((r) => (
        <UserRequestCard key={r.bidderId} user={r} onApprove={onApprove} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const axiosPrivate = useAxiosPrivate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    newProducts24h: 0,
    newUsers7d: 0,
    pendingRequestsCount: 0,
    recentAuctions: [],
    upgradeRequests: [],
  });
  const [timeConfig, setTimeConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const [statsData, timeData] = await Promise.all([
          getDashboardStats(axiosPrivate),
          getTimeConfigs(axiosPrivate),
        ]);
        if (isMounted) {
          setStats(statsData);
          setTimeConfig(timeData);
        }
      } catch (err) {
        console.error("Fetch dashboard stats failed", err);
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [axiosPrivate]);

  const handleApproveRequest = async (bidderId) => {
    if (!bidderId) return;
    try {
      await approveSellerRequest(axiosPrivate, bidderId);
      toast.success("Đã duyệt yêu cầu seller");
      setStats((prev) => ({
        ...prev,
        pendingRequestsCount: Math.max(0, (prev.pendingRequestsCount || 1) - 1),
        upgradeRequests: prev.upgradeRequests.filter(
          (r) => r.bidderId !== bidderId
        ),
      }));
    } catch (err) {
      console.error("Approve request failed", err);
      toast.error("Duyệt yêu cầu thất bại");
    }
  };

  const recent = stats.recentAuctions || [];
  const requests = Array.isArray(stats.upgradeRequests)
    ? stats.upgradeRequests
    : [];

  const insightStats = [
    {
      label: "Sản phẩm mới 24h",
      value: stats.newProducts24h.toLocaleString("vi-VN"),
      helper: "Được đăng trong 24 giờ qua",
    },
    {
      label: "Người dùng mới 7 ngày",
      value: stats.newUsers7d.toLocaleString("vi-VN"),
      helper: "Đăng ký trong 7 ngày",
    },
    {
      label: "Yêu cầu chờ duyệt",
      value: stats.pendingRequestsCount.toLocaleString("vi-VN"),
      helper: "Đang đợi xét duyệt seller",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <p className="text-sm text-slate-500">Tổng sản phẩm</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">
            {Number(stats.totalProducts || 0).toLocaleString("vi-VN")}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Tổng số sản phẩm hiện có trên sàn đấu giá
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {insightStats.map((stat) => (
            <InsightStat
              key={stat.label}
              label={stat.label}
              value={stat.value}
              helper={stat.helper}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Sản phẩm đấu giá gần đây
              </p>
              <p className="text-xs text-slate-500">
                {recent.length > 0
                  ? `${recent.length} sản phẩm mới hoàn tất`
                  : "Chưa có sản phẩm mới"}
              </p>
            </div>
            {loading && (
              <span className="text-xs text-blue-500">Đang cập nhật...</span>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            <RecentAuctionsSection items={recent} timeConfig={timeConfig} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Yêu cầu nâng cấp seller
              </p>
              <p className="text-xs text-slate-500">
                {stats.pendingRequestsCount > 0
                  ? `${stats.pendingRequestsCount} yêu cầu đang chờ`
                  : "Hiện không có yêu cầu chờ duyệt"}
              </p>
            </div>
            {loading && (
              <span className="text-xs text-blue-500">Đang cập nhật...</span>
            )}
          </div>
          <UpgradeRequestsSection
            requests={requests}
            onApprove={handleApproveRequest}
          />
        </div>
      </div>
    </div>
  );
}
