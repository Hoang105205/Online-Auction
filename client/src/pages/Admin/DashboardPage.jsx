import React from "react";
import { HiSearch, HiBell } from "react-icons/hi";

// Small reusable stat card
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
      <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}

// Minimal bar chart using SVG and simple data
function BarChart({ data = [] }) {
  // data: [{ label, won, lost, wonColor, lostColor }]
  const max = Math.max(...data.map((d) => (d.won || 0) + (d.lost || 0)), 1);
  const barWidth = 10; // width per series
  const groupGap = 30; // gap between groups
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">Hoạt động người dùng</div>
        <div className="text-xs text-gray-500 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: "#10b981" }}
            />
            <span>Thắng</span>
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: "#ef4444" }}
            />
            <span>Thua</span>
          </span>
        </div>
      </div>
      <svg width="100%" height="180">
        {data.map((d, i) => {
          const total = (d.won || 0) + (d.lost || 0);
          const groupX = 30 + i * (groupGap + barWidth * 2);
          const wonH = ((d.won || 0) / max) * 120;
          const lostH = ((d.lost || 0) / max) * 120;
          const yBase = 150;
          return (
            <g key={d.label}>
              {/* won bar (left) */}
              <rect
                x={groupX}
                y={yBase - wonH}
                width={barWidth}
                height={wonH}
                fill={d.wonColor || "#10b981"}
                rx="3"
              />
              {/* lost bar (right) */}
              <rect
                x={groupX + barWidth + 4}
                y={yBase - lostH}
                width={barWidth}
                height={lostH}
                fill={d.lostColor || "#ef4444"}
                rx="3"
              />
              <text
                x={groupX + barWidth}
                y={yBase + 14}
                fontSize="10"
                textAnchor="middle"
                fill="#6b7280"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function RecentAuctionItem({ item }) {
  return (
    <div className="flex items-center gap-3 p-3 border-b last:border-b-0">
      <img
        src={item.image}
        alt="thumb"
        className="w-12 h-12 rounded-md object-cover"
      />
      <div className="flex-1">
        <div className="font-medium">{item.title}</div>
        <div className="text-xs text-gray-500">{item.date}</div>
      </div>
      <div className="text-sm text-red-500 font-semibold">{item.price}</div>
    </div>
  );
}

// Simple pie chart placeholder
/* PieChart removed per request (not used) */

function UserRequestCard({ user }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-3">
      <img
        src={user.avatar}
        alt="av"
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="font-medium">{user.name}</div>
        <div className="text-xs text-gray-500">Yêu cầu nâng cấp</div>
      </div>
      <button className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
        Chấp nhận
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const stats = [
    { title: "Tổng sản phẩm", value: "2000" },
    { title: "Đang đấu giá", value: "150" },
    { title: "Đã kết thúc", value: "1000" },
    { title: "Tổng tiền", value: "10.000.000₫" },
  ];

  const barData = [
    // mock won/lost counts per day
    {
      label: "Sat",
      won: 60,
      lost: 40,
      wonColor: "#10b981",
      lostColor: "#ef4444",
    },
    {
      label: "Sun",
      won: 30,
      lost: 90,
      wonColor: "#10b981",
      lostColor: "#ef4444",
    },
    {
      label: "Mon",
      won: 120,
      lost: 80,
      wonColor: "#10b981",
      lostColor: "#ef4444",
    },
    {
      label: "Tue",
      won: 200,
      lost: 280,
      wonColor: "#10b981",
      lostColor: "#ef4444",
    },
    {
      label: "Wed",
      won: 90,
      lost: 120,
      wonColor: "#10b981",
      lostColor: "#ef4444",
    },
    {
      label: "Thu",
      won: 160,
      lost: 190,
      wonColor: "#10b981",
      lostColor: "#ef4444",
    },
    {
      label: "Fri",
      won: 180,
      lost: 200,
      wonColor: "#10b981",
      lostColor: "#ef4444",
    },
  ];

  const recent = [
    {
      title: "Breed Dry Dog Food",
      date: "28 January 2021",
      price: "100000₫",
      image: "/auth-images/dog-food.jpg",
    },
    {
      title: "Breed Dry Dog Food",
      date: "28 January 2021",
      price: "100000₫",
      image: "/auth-images/dog-food.jpg",
    },
    {
      title: "Breed Dry Dog Food",
      date: "28 January 2021",
      price: "100000₫",
      image: "/auth-images/dog-food.jpg",
    },
  ];

  // slices removed (pie chart removed)

  const requests = [
    { name: "Luu Huy Hoang", avatar: "/auth-images/avatar1.jpg" },
    { name: "Thuan", avatar: "/auth-images/avatar2.jpg" },
    { name: "Gia Huy", avatar: "/auth-images/avatar3.jpg" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-semibold">Administrator</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              className="pl-10 pr-4 py-2 rounded-full border bg-white text-sm w-full max-w-xs md:max-w-md"
              placeholder="Search for something"
            />
            <HiSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <HiBell className="text-gray-500 text-xl" />
          <img
            src="/auth-images/avatar1.jpg"
            alt="me"
            className="w-9 h-9 rounded-full"
          />
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 space-y-6 h-full">
          <BarChart data={barData} />

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm font-semibold mb-3">Yêu cầu nâng cấp</div>
            <div className="flex flex-col md:flex-row md:gap-3 gap-3">
              {requests.map((r) => (
                <UserRequestCard key={r.name} user={r} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 h-full">
          <div className="bg-white rounded-xl shadow-sm p-4 h-full flex flex-col">
            <div className="text-sm font-semibold mb-3">
              Sản phẩm đấu giá gần đây
            </div>
            <div className="flex-1 overflow-auto">
              {recent.map((it, idx) => (
                <RecentAuctionItem key={idx} item={it} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
