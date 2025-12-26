import React, { useMemo, useState, useEffect } from "react";
import {
  HiSearch,
  HiTrash,
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { listProducts, removeProduct } from "../../api/systemService";
import ProductImage from "../../components/ProductImage";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [openRows, setOpenRows] = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const pageSize = 6;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  // server-side pagination/search
  // We still sort the current page items client-side based on sortBy
  const paginated = useMemo(() => {
    const data = (products || []).slice();
    // helper: normalize price-like values to Number
    const parsePrice = (val) => {
      if (val === undefined || val === null) return 0;
      if (typeof val === "number") return val;
      // handle strings like "1.000.000", "1,000,000", "1000000₫"
      if (typeof val === "string") {
        // remove any non-digit, non-dot, non-minus characters
        const cleaned = val
          .replace(/[^0-9.-]+/g, "")
          .replace(/\.(?=.*\.)/g, "");
        const n = parseFloat(cleaned);
        return Number.isFinite(n) ? n : 0;
      }
      return 0;
    };
    if (sortBy === "name") {
      data.sort((a, b) => {
        const an = (a.detail && a.detail.name) || "";
        const bn = (b.detail && b.detail.name) || "";
        return String(an).localeCompare(String(bn), "vi", {
          sensitivity: "base",
        });
      });
    } else if (sortBy === "price") {
      data.sort((a, b) => {
        const aRaw =
          (a.auction && (a.auction.currentPrice || a.auction.buyNowPrice)) || 0;
        const bRaw =
          (b.auction && (b.auction.currentPrice || b.auction.buyNowPrice)) || 0;
        const aPrice = parsePrice(aRaw);
        const bPrice = parsePrice(bRaw);
        if (aPrice === bPrice) {
          // fallback to name for stable ordering
          const an = (a.detail && a.detail.name) || "";
          const bn = (b.detail && b.detail.name) || "";
          return String(an).localeCompare(String(bn));
        }
        return aPrice - bPrice;
      });
    } else {
      // date (default): show newest first
      data.sort((a, b) => {
        const ad = a.createdAt || a.createdAtAt || null;
        const bd = b.createdAt || b.createdAtAt || null;
        const at = ad ? new Date(ad).getTime() : 0;
        const bt = bd ? new Date(bd).getTime() : 0;
        return bt - at;
      });
    }
    return data;
  }, [products, sortBy]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await listProducts(axiosPrivate, {
          page,
          limit: pageSize,
          q: query,
          sortBy,
        });
        console.log("listProducts response:", res);
        if (!isMounted) return;
        setProducts(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(
          typeof res.total === "number" ? res.total : (res.data || []).length
        );
      } catch (err) {
        console.error("Fetch products failed", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [page, query, sortBy]);

  function goto(p) {
    const pp = Math.max(1, Math.min(totalPages, p));
    setPage(pp);
  }

  function toggleRow(id) {
    const s = new Set(openRows);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setOpenRows(s);
  }

  // edit functionality removed: only delete is allowed

  function handleDeleteClick(id) {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  }

  function performDelete(id) {
    if (!id) return;
    // call API to remove product, then update UI
    (async () => {
      try {
        setLoading(true);
        await removeProduct(axiosPrivate, id);
        setProducts((prev) => {
          const next = prev.filter((p) => (p._id || p.id) !== id);
          const newTotal = Math.max(1, Math.ceil(next.length / pageSize));
          if (page > newTotal) setPage(newTotal);
          return next;
        });
        setTotalCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error("Delete product failed", err);
        // optionally show error to user
      } finally {
        setShowDeleteModal(false);
        setDeleteTarget("");
        setLoading(false);
      }
    })();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Sản phẩm</h2>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg ring-1 ring-blue-100/60">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative max-w-xl">
              <HiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border rounded-full text-sm bg-white"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
            </select>

            {/* Add product button removed per request */}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-500 border-b">
                <th className="py-4 px-4">ID</th>
                <th className="py-4 px-4">Sản phẩm</th>
                <th className="py-4 px-4">Danh mục</th>
                <th className="py-4 px-4">Giá</th>
                <th className="py-4 px-4">Actions</th>
                <th className="py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : (
                paginated.map((p, idx) => (
                  <React.Fragment key={p._id || p.id}>
                    <tr
                      className={`text-sm text-gray-600 ${
                        idx % 2 === 0 ? "" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-4 px-4">{p._id || p.id}</td>
                      <td className="py-4 px-4 flex items-center gap-3">
                        {p.detail &&
                        p.detail.images &&
                        p.detail.images.length > 0 ? (
                          <ProductImage
                            url={p.detail.images[0]}
                            defaultWidth="40px"
                            defaultHeight="40px"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-200" />
                        )}
                        <div className="font-medium">
                          {(p.detail && p.detail.name) || "—"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {(p.detail && p.detail.category) || "—"}
                      </td>
                      <td className="py-4 px-4">
                        {(p.auction &&
                          (p.auction.currentPrice || p.auction.buyNowPrice)) ||
                          "—"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteClick(p._id || p.id)}
                            className="p-2 rounded-full bg-red-50 text-red-500"
                          >
                            <HiTrash />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => toggleRow(p._id || p.id)}
                          className={`p-1 rounded ${
                            openRows.has(p._id || p.id)
                              ? "bg-gray-100"
                              : "bg-white"
                          }`}
                        >
                          <HiChevronDown
                            className={`${
                              openRows.has(p._id || p.id)
                                ? "transform rotate-180"
                                : ""
                            }`}
                          />
                        </button>
                      </td>
                    </tr>

                    {openRows.has(p._id || p.id) && (
                      <tr className="text-sm text-gray-600 bg-gray-50">
                        <td className="py-3 px-4">&nbsp;</td>
                        <td colSpan={4} className="py-3 px-4">
                          <div className="grid grid-cols-12 gap-3 items-start">
                            <div className="col-span-7">
                              {p.detail &&
                                p.detail.images &&
                                p.detail.images.length > 0 && (
                                  <div className="flex gap-3 mb-3">
                                    {p.detail.images
                                      .slice(0, 3)
                                      .map((img, idx) => (
                                        <ProductImage
                                          key={idx}
                                          url={img}
                                          defaultWidth="64px"
                                          defaultHeight="64px"
                                        />
                                      ))}
                                  </div>
                                )}
                              <div className="font-medium">
                                {(p.detail && p.detail.name) || "—"}
                              </div>
                            </div>
                            <div className="col-span-3">
                              <div className="font-semibold text-gray-600">
                                Danh mục con:
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {p.detail && p.detail.subCategory
                                  ? p.detail.subCategory
                                  : "—"}
                              </div>
                            </div>
                            <div className="col-span-2">
                              <div className="font-semibold text-gray-600">
                                Giá cao nhất:
                              </div>
                              <div className="text-sm mt-1">
                                <span className="inline-block text-gray-600 px-2 py-1 rounded">
                                  {p.auction &&
                                  (p.auction.currentPrice ||
                                    p.auction.startPrice)
                                    ? p.auction.currentPrice ||
                                      p.auction.startPrice
                                    : "—"}{" "}
                                  ₫
                                </span>
                              </div>
                            </div>
                            <div className="col-span-7 mt-2">
                              <div className="font-semibold text-gray-600">
                                Người đang giữ giá cao nhất:
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {p.auction && p.auction.highestBidderId
                                  ? p.auction.highestBidderId.fullName ||
                                    p.auction.highestBidderId.email ||
                                    "—"
                                  : "—"}
                              </div>
                            </div>
                            <div className="col-span-5" />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">&nbsp;</td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Delete modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowDeleteModal(false)}
            />
            <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc muốn xóa sản phẩm "
                {products.find((p) => p.id === deleteTarget)?.name ||
                  deleteTarget}
                "?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded"
                >
                  Hủy
                </button>
                <button
                  onClick={() => performDelete(deleteTarget)}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer / pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-xs text-gray-400">
            Showing {(page - 1) * pageSize + (paginated.length ? 1 : 0)} to{" "}
            {(page - 1) * pageSize + paginated.length} of {totalCount} products
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goto(page - 1)}
              className="p-2 rounded-full bg-gray-100"
              disabled={page === 1}
            >
              <HiChevronLeft />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => goto(p)}
                  className={`w-8 h-8 rounded-full text-sm ${
                    p === page
                      ? "bg-purple-600 text-white"
                      : "bg-white border text-gray-600"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => goto(page + 1)}
              className="p-2 rounded-full bg-gray-100"
              disabled={page === totalPages}
            >
              <HiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
