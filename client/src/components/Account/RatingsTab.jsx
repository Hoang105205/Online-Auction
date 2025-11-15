import { useMemo, useState } from "react";
import { HiThumbUp, HiThumbDown } from "react-icons/hi";

// Mocked sample reviews. Replace with API data when backend is ready.
const SAMPLE_REVIEWS = [
  {
    id: 1,
    role: "bidder", // bidder | seller
    reviewer: "Liam K.",
    type: "up", // up | down
    comment: "Giao dịch nhanh chóng và rõ ràng. Sẽ hợp tác lần sau!",
    date: "2025-08-16",
  },
  {
    id: 2,
    role: "seller",
    reviewer: "Minh T.",
    type: "down",
    comment: "Phản hồi hơi chậm, nhưng cuối cùng vẫn hoàn thành giao dịch.",
    date: "2025-06-02",
  },
  {
    id: 3,
    role: "seller",
    reviewer: "Anh P.",
    type: "up",
    comment: "Mô tả sản phẩm chính xác, người mua rất nhiệt tình.",
    date: "2025-05-28",
  },
  {
    id: 4,
    role: "bidder",
    reviewer: "Quang D.",
    type: "up",
    comment: "Thanh toán nhanh, liên lạc dễ dàng.",
    date: "2025-03-12",
  },
];

export default function RatingsTab() {
  const [filter, setFilter] = useState("all"); // all | bidder | seller

  const filtered = useMemo(() => {
    if (filter === "all") return SAMPLE_REVIEWS;
    return SAMPLE_REVIEWS.filter((r) => r.role === filter);
  }, [filter]);

  const stats = useMemo(() => {
    const ups = filtered.filter((r) => r.type === "up").length;
    const downs = filtered.filter((r) => r.type === "down").length;
    const total = ups + downs;
    const avg = total ? ups / total : 0; // average = ups / total
    return { ups, downs, total, avg };
  }, [filtered]);

  return (
    <div className="p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Average score (approx 25%) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Điểm đánh giá trung bình
            </h2>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-5xl font-extrabold text-sky-600">
                {Math.round(stats.avg * 100)}%
              </span>
              <span className="text-gray-500 mb-1">
                ({stats.ups}/{stats.total})
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-sky-500"
                style={{ width: `${stats.avg * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-1 md:gap-2">
                <HiThumbUp className="text-green-600 text-base md:text-xl lg:text-2xl" />
                <span className="md:text-xl font-bold">{stats.ups}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <HiThumbDown className="text-red-600 text-base md:text-xl lg:text-2xl" />
                <span className="md:text-xl font-bold">{stats.downs}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Reviews list with filters */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Filter bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Đánh giá chi tiết
                <span className="block md:hidden font-semibold">
                  Với vai trò:
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="hidden md:block font-semibold">
                  Với vai trò:{" "}
                </span>
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "bidder", label: "Là người mua" },
                  { id: "seller", label: "Là người bán" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      filter === f.id
                        ? "bg-sky-50 text-sky-700 border-sky-200"
                        : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="divide-y">
              {filtered.length === 0 ? (
                <div className="p-6 text-gray-500">Chưa có đánh giá nào.</div>
              ) : (
                filtered.map((r) => (
                  <div key={r.id} className="p-4 flex gap-3 items-start">
                    {/* Icon / status */}
                    <div
                      className={`mt-1 inline-flex items-center justify-center h-8 w-8 rounded-full ${
                        r.type === "up" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {r.type === "up" ? (
                        <HiThumbUp className="text-green-600" />
                      ) : (
                        <HiThumbDown className="text-red-600" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {r.reviewer}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            r.role === "bidder"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {r.role === "bidder"
                            ? "là người mua"
                            : "là người bán"}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {new Date(r.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1 break-words">
                        {r.comment}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
