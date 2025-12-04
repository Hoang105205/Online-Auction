import React, { useMemo, useState, useEffect } from "react";
import {
  HiSearch,
  HiPlus,
  HiPencilAlt,
  HiTrash,
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";

import { toast } from "react-toastify";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  getCategories,
  addCategory,
  updateCategory,
  removeCategory as apiRemoveCategory,
} from "../../api/systemService";

export default function CategoriesPage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [openRows, setOpenRows] = useState(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCount, setNewCount] = useState(0);
  const [newParent, setNewParent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCount, setEditCount] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const pageSize = 6;

  const axiosInstance = useAxiosPrivate();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await getCategories(axiosInstance);
        if (!mounted) return;
        let items = [];
        if (Array.isArray(res)) items = res;
        else if (res && res.data && Array.isArray(res.data.categories))
          items = res.data.categories;
        else if (res && Array.isArray(res.data)) items = res.data;
        else if (res && Array.isArray(res.categories)) items = res.categories;

        // normalize server categories to UI shape
        const norm = (items || []).map((c) => ({
          // prefer server-provided categoryId, fall back to _id if present
          id: String(c.categoryId || c._id || ""),
          name: c.categoryName || "",
          slug: c.slug || "",
          children: Array.isArray(c.subCategories)
            ? c.subCategories.map((s) => ({
                id: String(s.subCategoryId || s._id || ""),
                name: s.subCategoryName || s.name || "",
                slug: s.slug || "",
              }))
            : [],
          _raw: c,
        }));
        setCategories(norm);
      } catch (err) {
        console.error("Failed to load categories", err);
        toast.error(
          "Không thể tải danh mục: " +
            (err.response?.data?.message || err.message)
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    // only filter top-level categories; children are shown inline
    let data = categories.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
      );
    }
    // status currently not used (mock), placeholder for future
    if (sortBy === "name") data.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "count") data.sort((a, b) => b.count - a.count);
    return data;
  }, [query, sortBy, categories]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function goto(p) {
    const pp = Math.max(1, Math.min(totalPages, p));
    setPage(pp);
  }

  // Handlers for add / edit / delete (mock behavior)
  function handleAdd() {
    // open inline form
    setShowAddForm(true);
  }

  // Edit helpers: start edit, submit and cancel
  function findById(list, id) {
    for (const c of list) {
      if (c.id === id) return c;
      const found = findById(c.children || [], id);
      if (found) return found;
    }
    return null;
  }

  function startEdit(id) {
    const item = findById(categories, id);
    if (!item) return;
    setEditingId(id);
    setEditName(item.name);
    setEditCount(item.count || 0);
    // ensure add form hidden to avoid UI conflict
    setShowAddForm(false);
  }

  function slugify(text) {
    return String(text)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/Đ/g, "D")
      .replace(/đ/g, "d")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function findParentIdOf(childId) {
    for (const c of categories) {
      if (c.id === childId) return c.id;
      if (c.children && c.children.some((ch) => ch.id === childId)) return c.id;
    }
    return null;
  }

  function submitEdit() {
    if (!editingId) return;
    (async () => {
      setSubmitting(true);
      try {
        // Determine if editing a top-level category or a subcategory
        const parentId = findParentIdOf(editingId);
        if (!parentId) throw new Error("Parent not found");

        if (parentId === editingId) {
          // editing a top-level category
          const payload = {
            categoryName: editName.trim(),
            slug: slugify(editName.trim()),
          };
          const raw = categories.find((c) => c.id === parentId)?._raw || {};
          await updateCategory(
            axiosInstance,
            raw.categoryId || raw._id,
            payload
          );
        } else {
          const parent = categories.find((c) => c.id === parentId);
          if (!parent) throw new Error("Parent not found");
          const raw = parent._raw || {};
          const existing = Array.isArray(raw.subCategories)
            ? raw.subCategories
            : [];
          const updatedSubs = existing.map((s) => {
            const sid = String(s.subCategoryId || s._id || "");
            if (sid === editingId) {
              return {
                subCategoryId: s.subCategoryId || s._id,
                subCategoryName: editName.trim(),
                slug: slugify(editName.trim()),
              };
            }
            return {
              subCategoryId: s.subCategoryId || s._id,
              subCategoryName: s.subCategoryName || s.name || "",
              slug: s.slug || "",
            };
          });
          await updateCategory(axiosInstance, raw.categoryId || raw._id, {
            subCategories: updatedSubs,
          });
        }

        // refresh list from server
        const fresh = await getCategories(axiosInstance);
        let items = [];
        if (Array.isArray(fresh)) items = fresh;
        else if (fresh && fresh.data && Array.isArray(fresh.data.categories))
          items = fresh.data.categories;
        else if (fresh && Array.isArray(fresh.data)) items = fresh.data;
        else if (fresh && Array.isArray(fresh.categories))
          items = fresh.categories;
        else items = [];
        const norm = (items || []).map((c) => ({
          id: String(c.categoryId || c._id || ""),
          name: c.categoryName || "",
          slug: c.slug || "",
          children: Array.isArray(c.subCategories)
            ? c.subCategories.map((s) => ({
                id: String(s.subCategoryId || s._id || ""),
                name: s.subCategoryName || s.name || "",
                slug: s.slug || "",
              }))
            : [],
          _raw: c,
        }));
        setCategories(norm);
        toast.success("Cập nhật danh mục thành công");
      } catch (err) {
        console.error("Update category failed", err);
        toast.error(
          "Cập nhật thất bại: " + (err.response?.data?.message || err.message)
        );
      } finally {
        setSubmitting(false);
        setEditingId(null);
        setEditName("");
        setEditCount(0);
      }
    })();
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditCount(0);
  }

  function handleDeleteClick(id) {
    // normalize id to string to avoid falsy/undefined issues
    setDeleteTarget(id ? String(id) : null);
    setShowDeleteModal(true);
  }

  function performDelete(id) {
    // allow calling without id (use current state) to avoid stale/closure issues
    const targetId = id || deleteTarget;
    if (!targetId) return;
    (async () => {
      setSubmitting(true);
      try {
        const parentId = findParentIdOf(targetId);
        if (parentId && parentId !== targetId) {
          const parent = categories.find((c) => c.id === parentId);
          if (!parent || !parent._raw) throw new Error("Parent not found");
          const raw = parent._raw;
          const existing = Array.isArray(raw.subCategories)
            ? raw.subCategories
            : [];
          const updatedSubs = existing
            .map((s) => ({
              subCategoryId: s.subCategoryId || s._id,
              subCategoryName: s.subCategoryName || s.name || "",
              slug: s.slug || "",
            }))
            .filter(
              (s) => String(s.subCategoryId || s._id || "") !== String(targetId)
            );

          await updateCategory(axiosInstance, raw.categoryId || raw._id, {
            subCategories: updatedSubs,
          });
        } else {
          // top-level category
          const cat = categories.find((c) => c.id === targetId);
          if (!cat || !cat._raw) throw new Error("Category not found");
          const raw = cat._raw;
          await apiRemoveCategory(axiosInstance, raw.categoryId || raw._id);
        }

        // refresh
        const fresh = await getCategories(axiosInstance);
        let items = [];
        if (Array.isArray(fresh)) items = fresh;
        else if (fresh && fresh.data && Array.isArray(fresh.data.categories))
          items = fresh.data.categories;
        else if (fresh && Array.isArray(fresh.data)) items = fresh.data;
        else if (fresh && Array.isArray(fresh.categories))
          items = fresh.categories;
        else items = [];

        const norm = (items || []).map((c) => ({
          id: String(c.categoryId || c._id || ""),
          name: c.categoryName || "",
          slug: c.slug || "",
          children: Array.isArray(c.subCategories)
            ? c.subCategories.map((s) => ({
                id: String(s.subCategoryId || s._id || ""),
                name: s.subCategoryName || s.name || "",
                slug: s.slug || "",
              }))
            : [],
          _raw: c,
        }));
        setCategories(norm);
        setShowDeleteModal(false);
        setDeleteTarget(null);
        const filteredAfter = norm.filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.id.toLowerCase().includes(query.toLowerCase())
        );
        const newTotal = Math.max(
          1,
          Math.ceil(filteredAfter.length / pageSize)
        );
        if (page > newTotal) setPage(newTotal);
        toast.success("Xóa danh mục thành công");
      } catch (err) {
        console.error("Remove category failed", err);
        toast.error(
          "Xóa thất bại: " + (err.response?.data?.message || err.message)
        );
      } finally {
        setSubmitting(false);
      }
    })();
  }

  function toggleRow(id) {
    const s = new Set(openRows);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setOpenRows(s);
  }

  // Return true if editingId is this category or any descendant
  function isEditingInside(category) {
    if (!editingId) return false;
    if (category.id === editingId) return true;
    const stack = [...(category.children || [])];
    while (stack.length) {
      const cur = stack.pop();
      if (!cur) continue;
      if (cur.id === editingId) return true;
      if (cur.children && cur.children.length) stack.push(...cur.children);
    }
    return false;
  }

  function addChildToParent(list, parentId, child) {
    return list.map((c) => {
      if (c.id === parentId)
        return { ...c, children: [child, ...(c.children || [])] };
      return {
        ...c,
        children: addChildToParent(c.children || [], parentId, child),
      };
    });
  }

  async function handleAddFormSubmit(e) {
    e.preventDefault();
    if (!newName.trim()) return toast.error("Vui lòng nhập tên danh mục");
    setSubmitting(true);
    try {
      const name = newName.trim();
      const slug = slugify(name);

      if (!newParent) {
        // create top-level category
        await addCategory(axiosInstance, { categoryName: name, slug });
      } else {
        // add as subcategory to parent: fetch parent's raw, append to its subCategories
        const parent = categories.find((c) => c.id === newParent);
        if (!parent || !parent._raw) throw new Error("Parent not found");
        const raw = parent._raw;
        const existing = Array.isArray(raw.subCategories)
          ? raw.subCategories
          : [];
        const newSub = { subCategoryName: name, slug };
        const updatedSubs = existing.map((s) => ({
          subCategoryId: s.subCategoryId || s._id,
          subCategoryName: s.subCategoryName || s.name || "",
          slug: s.slug || "",
        }));
        updatedSubs.push(newSub);
        await updateCategory(axiosInstance, raw.categoryId || raw._id, {
          subCategories: updatedSubs,
        });
      }

      // refresh list
      const fresh = await getCategories(axiosInstance);
      let items = [];
      if (Array.isArray(fresh)) items = fresh;
      else if (fresh && fresh.data && Array.isArray(fresh.data.categories))
        items = fresh.data.categories;
      else if (fresh && Array.isArray(fresh.data)) items = fresh.data;
      else if (fresh && Array.isArray(fresh.categories))
        items = fresh.categories;
      else items = [];
      const norm = (items || []).map((c) => ({
        id: String(c.categoryId || c._id || ""),
        name: c.categoryName || "",
        slug: c.slug || "",
        children: Array.isArray(c.subCategories)
          ? c.subCategories.map((s) => ({
              id: String(s.subCategoryId || s._id || ""),
              name: s.subCategoryName || s.name || "",
              slug: s.slug || "",
            }))
          : [],
        _raw: c,
      }));
      setCategories(norm);
      setNewName("");
      setNewCount(0);
      setNewParent("");
      setShowAddForm(false);
      setPage(1);
      toast.success("Thêm danh mục thành công");
    } catch (err) {
      console.error("Add category failed", err);
      toast.error(
        "Thêm thất bại: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Danh mục</h2>
        <div className="hidden md:flex items-center gap-3 text-sm text-gray-500">
          {/* optional header actions */}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg ring-1 ring-blue-100/60">
        {/* Top controls */}
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
                placeholder="Search category..."
                className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-full text-sm bg-white"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="count">Sort by Count</option>
            </select>

            {/* removed unused chevron-only button (no action/label) */}

            <button
              onClick={() => setShowAddForm((s) => !s)}
              className="ml-2 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full text-sm"
            >
              <HiPlus />
              <span>Thêm danh mục</span>
            </button>
          </div>
        </div>

        {/* Inline Add Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddFormSubmit}
            className="mb-6 bg-white p-4 rounded-lg border"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-xs text-gray-500">Tên danh mục</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Số lượng</label>
                <input
                  type="number"
                  value={newCount}
                  onChange={(e) => setNewCount(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">
                  Danh mục cha (tùy chọn)
                </label>
                <select
                  value={newParent}
                  onChange={(e) => setNewParent(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded"
                >
                  <option value="">-- Root --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Thêm
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-100 rounded"
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-500 border-b">
                <th className="py-4 px-4">ID</th>
                <th className="py-4 px-4">Danh mục</th>
                <th className="py-4 px-4">Số lượng</th>
                <th className="py-4 px-4">Actions</th>
                <th className="py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c, idx) => (
                <React.Fragment key={c.id}>
                  <tr
                    className={`text-sm text-gray-600 ${
                      idx % 2 === 0 ? "" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-4 px-4">{c.id}</td>
                    {editingId === c.id ? (
                      <>
                        <td className="py-4 px-4">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input
                            type="number"
                            value={editCount}
                            onChange={(e) => setEditCount(e.target.value)}
                            className="w-24 px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={submitEdit}
                              className="px-3 py-1 bg-green-600 text-white rounded"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-gray-100 rounded"
                            >
                              Hủy
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-4">{c.name}</td>
                        <td className="py-4 px-4">{c.count}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(c.id)}
                              className="p-2 rounded-full bg-purple-50 text-purple-600"
                            >
                              <HiPencilAlt />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(c.id)}
                              className="p-2 rounded-full bg-red-50 text-red-500"
                            >
                              <HiTrash />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    <td className="py-4 px-4 text-right">
                      {c.children &&
                      c.children.length > 0 &&
                      !isEditingInside(c) ? (
                        <button
                          onClick={() => toggleRow(c.id)}
                          className={`p-1 rounded ${
                            openRows.has(c.id) ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          <HiChevronDown
                            className={`${
                              openRows.has(c.id) ? "transform rotate-180" : ""
                            }`}
                          />
                        </button>
                      ) : (
                        <div className="w-6 inline-block" />
                      )}
                    </td>
                  </tr>

                  {/* children rows */}
                  {c.children &&
                    c.children.length > 0 &&
                    openRows.has(c.id) &&
                    c.children.map((ch, chi) => (
                      <tr
                        key={ch.id}
                        className="text-sm text-gray-600 bg-gray-50"
                      >
                        {editingId === ch.id ? (
                          <>
                            <td className="py-3 px-4">{ch.id}</td>
                            <td className="py-3 px-4 pl-12">
                              <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                value={editCount}
                                onChange={(e) => setEditCount(e.target.value)}
                                className="w-24 px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={submitEdit}
                                  className="px-3 py-1 bg-green-600 text-white rounded"
                                >
                                  Lưu
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-3 py-1 bg-gray-100 rounded"
                                >
                                  Hủy
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">&nbsp;</td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4">{ch.id}</td>
                            <td className="py-3 px-4 pl-12">↳ {ch.name}</td>
                            <td className="py-3 px-4">{ch.count}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEdit(ch.id)}
                                  className="p-2 rounded-full bg-purple-50 text-purple-600"
                                >
                                  <HiPencilAlt />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(ch.id)}
                                  className="p-2 rounded-full bg-red-50 text-red-500"
                                >
                                  <HiTrash />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">&nbsp;</td>
                          </>
                        )}
                      </tr>
                    ))}
                </React.Fragment>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowDeleteModal(false)}
            />
            <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc muốn xóa danh mục "
                {findById(categories, deleteTarget)?.name || deleteTarget}"?
                Hành động này không thể hoàn tác.
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
                  className={`px-4 py-2 bg-red-600 text-white rounded ${
                    submitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={submitting}
                >
                  {submitting ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer / pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-xs text-gray-400">
            Showing {(page - 1) * pageSize + (paginated.length ? 1 : 0)} to{" "}
            {(page - 1) * pageSize + paginated.length} of {categories.length}{" "}
            danh mục
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
