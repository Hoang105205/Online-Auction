import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Label, TextInput, Textarea, Checkbox } from "flowbite-react";
import { HiArrowLeft, HiX, HiPlus, HiSearch, HiCalendar } from "react-icons/hi";
import { addProduct } from "../../api/productService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

// Zod validation schema
const productSchema = z
  .object({
    productName: z.string().min(5, "Tên sản phẩm phải có ít nhất 5 ký tự"),
    startingPrice: z
      .string()
      .nonempty("Giá khởi điểm là bắt buộc")
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 1000, {
        message: "Giá khởi điểm phải lớn hơn 1,000 VND",
      }),
    step: z
      .string()
      .nonempty("Bước giá là bắt buộc")
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 1000, {
        message: "Bước giá phải lớn hơn 1,000 VND",
      }),
    hasBuyNowPrice: z.boolean(),
    buyNowPrice: z.string().optional(),
    autoExtend: z.boolean(),
    category: z
      .object({
        id: z.number(),
        name: z.string(),
        subcategories: z.array(z.any()),
      })
      .nullable()
      .refine((val) => val !== null, {
        message: "Vui lòng chọn danh mục",
      }),
    subcategory: z
      .object({
        id: z.number(),
        name: z.string(),
      })
      .nullable()
      .refine((val) => val !== null, {
        message: "Vui lòng chọn danh mục con",
      }),
    endDate: z
      .string()
      .nonempty("Ngày hết hạn là bắt buộc")
      .refine(
        (val) => {
          const selectedDate = new Date(val);
          const now = new Date();
          return selectedDate > now;
        },
        {
          message: "Ngày hết hạn phải sau thời điểm hiện tại",
        }
      ),
    description: z.string().min(20, "Mô tả phải có ít nhất 20 ký tự"),
  })
  .refine(
    (data) => {
      if (data.hasBuyNowPrice) {
        return (
          data.buyNowPrice &&
          !isNaN(Number(data.buyNowPrice)) &&
          Number(data.buyNowPrice) >= Number(data.startingPrice)
        );
      }
      return true;
    },
    {
      message: "Giá mua ngay phải lớn hơn hoặc bằng giá khởi điểm",
      path: ["buyNowPrice"],
    }
  );

// Mock categories data
const MOCK_CATEGORIES = [
  {
    id: 1,
    name: "Điện tử",
    subcategories: [
      { id: 11, name: "Điện thoại" },
      { id: 12, name: "Laptop" },
      { id: 13, name: "Máy tính bảng" },
      { id: 14, name: "Phụ kiện" },
    ],
  },
  {
    id: 2,
    name: "Thời trang",
    subcategories: [
      { id: 21, name: "Quần áo nam" },
      { id: 22, name: "Quần áo nữ" },
      { id: 23, name: "Giày dép" },
      { id: 24, name: "Túi xách" },
    ],
  },
  {
    id: 3,
    name: "Đồ gia dụng",
    subcategories: [
      { id: 31, name: "Nội thất" },
      { id: 32, name: "Đồ dùng nhà bếp" },
      { id: 33, name: "Trang trí" },
      { id: 34, name: "Đồ điện" },
    ],
  },
  {
    id: 4,
    name: "Xe cộ",
    subcategories: [
      { id: 41, name: "Ô tô" },
      { id: 42, name: "Xe máy" },
      { id: 43, name: "Xe đạp" },
      { id: 44, name: "Phụ tùng" },
    ],
  },
];

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [subcategorySearch, setSubcategorySearch] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const axiosPrivate = useAxiosPrivate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      startingPrice: "",
      step: "",
      hasBuyNowPrice: false,
      buyNowPrice: "",
      autoExtend: false,
      category: null,
      subcategory: null,
      endDate: "",
      description: "",
    },
  });

  const watchedFields = watch();
  const selectedCategory = watch("category");
  const hasBuyNowPrice = watch("hasBuyNowPrice");

  // Track if form is dirty
  useEffect(() => {
    const hasData = Object.values(watchedFields).some((value) => {
      if (typeof value === "boolean") return false;
      return value !== "" && value !== null;
    });
    setIsDirty(hasData || selectedImages.length > 0);
  }, [watchedFields, selectedImages]);

  const handleBack = () => {
    if (uploading) {
      alert(
        "Đang tải lên ảnh. Vui lòng đợi quá trình tải lên hoàn tất trước khi rời khỏi trang."
      );
      return;
    }

    if (isDirty) {
      const confirmed = window.confirm(
        "Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này?"
      );
      if (!confirmed) return;
    }
    navigate("/account/my-products");
  };

  // Prevent closing/refreshing the page while uploading images
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "Đang tải lên, bạn có chắc chắn muốn rời khỏi?";
      return "Đang tải lên, bạn có chắc chắn muốn rời khỏi?";
    };

    if (uploading) {
      window.addEventListener("beforeunload", handler);
    } else {
      window.removeEventListener("beforeunload", handler);
    }

    return () => window.removeEventListener("beforeunload", handler);
  }, [uploading]);

  // Format number with thousand separators for display (Vietnam locale)
  const formatThousand = (val) => {
    if (val === undefined || val === null || val === "") return "";
    const digitsOnly = String(val).replace(/\D/g, "");
    if (!digitsOnly) return "";
    return Number(digitsOnly).toLocaleString("vi-VN");
  };

  const onSubmit = async (data) => {
    // Validate images
    if (selectedImages.length < 3) {
      alert("Vui lòng tải lên ít nhất 3 ảnh");
      return;
    }

    try {
      setUploading(true);

      // Prepare product payload (convert numeric strings to numbers)
      const payload = {
        detail: {
          sellerID: "",
          name: data.productName,
          category: data.category?.id ?? null,
          subCategory: data.subcategory?.id ?? null,
          description: data.description,
          images: [],
          followers: 0,
        },
        auction: {
          startPrice: Number(data.startingPrice),
          stepPrice: Number(data.step),
          buyNowPrice: data.hasBuyNowPrice ? Number(data.buyNowPrice) : null,
          autoExtend: data.autoExtend,
          status: "pending",
          bidders: 0,
        },
        auctionHistory: {
          numberOfBids: 0,
          historyList: [],
        },
        chat: [],
      };

      //   name: data.productName,
      //   startingPrice: Number(data.startingPrice),
      //   step: Number(data.step),
      //   hasBuyNowPrice: data.hasBuyNowPrice,
      //   buyNowPrice: data.hasBuyNowPrice ? Number(data.buyNowPrice) : null,
      //   autoExtend: data.autoExtend,
      //   category: data.category?.id ?? null,
      //   subcategory: data.subcategory?.id ?? null,
      //   endDate: data.endDate,
      //   description: data.description,
      // };

      // Build FormData: include product info and all images so server can create product
      const productPayload = {
        productName: data.productName,
        startingPrice: data.startingPrice,
        step: data.step,
        hasBuyNowPrice: data.hasBuyNowPrice,
        buyNowPrice: data.buyNowPrice,
        autoExtend: data.autoExtend,
        category: data.category,
        subcategory: data.subcategory,
        endDate: data.endDate,
        description: data.description,
      };

      const fd = new FormData();
      fd.append("product", JSON.stringify(productPayload));
      selectedImages.forEach((img) => fd.append("images", img.file));

      setUploadProgress(0);
      let progress = 0;
      let isDone = false;
      const interval = setInterval(() => {
        if (isDone) {
          setUploadProgress(100);
          return;
        }
        progress += Math.random() * 1 + Math.random() * 3;
        if (progress >= 99) progress = 99;
        setUploadProgress(Math.round(progress));
      }, 150);

      const res = await addProduct(fd, axiosPrivate);

      isDone = true;
      clearInterval(interval);
      setUploadProgress(100);
      await new Promise((resolve) => requestAnimationFrame(resolve));

      setTimeout(() => {
        alert("Sản phẩm đã được tạo và ảnh đã được tải lên thành công!");
        navigate("/account/my-products");
      }, 0);
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi tạo sản phẩm hoặc tải ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      file,
    }));
    setSelectedImages([...selectedImages, ...newImages]);
  };

  const removeImage = (id) => {
    setSelectedImages(selectedImages.filter((img) => img.id !== id));
  };

  const filteredCategories = MOCK_CATEGORIES.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredSubcategories = selectedCategory
    ? selectedCategory.subcategories.filter((sub) =>
        sub.name.toLowerCase().includes(subcategorySearch.toLowerCase())
      )
    : [];

  return (
    <div className="p-6 md:p-8">
      {uploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
            <svg
              className="mx-auto mb-4 h-10 w-10 text-gray-700 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <div className="mb-2 font-medium text-gray-800">
              Đang đăng tải thông tin sản phẩm…
            </div>
            <div className="text-sm text-gray-600">
              Vui lòng không đóng hoặc rời khỏi trang.
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
                <div
                  className="bg-green-500 h-3"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-sm text-gray-700 mt-2">
                {uploadProgress}%
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          disabled={uploading}
          aria-disabled={uploading}
          className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Quay lại">
          <HiArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Đăng sản phẩm</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Name */}
            <div>
              <Label htmlFor="productName" value="Tên sản phẩm" />
              <TextInput
                id="productName"
                {...register("productName")}
                color={errors.productName ? "failure" : "gray"}
                placeholder="Nhập tên sản phẩm"
              />
              {errors.productName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.productName.message}
                </p>
              )}
            </div>

            {/* Starting Price */}
            <div>
              <Label htmlFor="startingPrice" value="Giá khởi điểm" />
              <Controller
                name="startingPrice"
                control={control}
                render={({ field }) => (
                  <TextInput
                    id="startingPrice"
                    type="text"
                    value={formatThousand(field.value)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      field.onChange(raw);
                    }}
                    color={errors.startingPrice ? "failure" : "gray"}
                    placeholder="Nhập giá khởi điểm (VND)"
                  />
                )}
              />
              {errors.startingPrice && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.startingPrice.message}
                </p>
              )}
            </div>

            {/* Step Price */}
            <div>
              <Label htmlFor="step" value="Bước giá" />
              <Controller
                name="step"
                control={control}
                render={({ field }) => (
                  <TextInput
                    id="step"
                    type="text"
                    value={formatThousand(field.value)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      field.onChange(raw);
                    }}
                    color={errors.step ? "failure" : "gray"}
                    placeholder="Nhập bước giá (VND)"
                  />
                )}
              />
              {errors.step && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.step.message}
                </p>
              )}
            </div>

            {/* Buy Now Price (Optional) */}
            <div>
              <Label
                htmlFor="hasBuyNowPrice"
                className="flex items-center gap-3 mb-2 cursor-pointer select-none">
                <Controller
                  name="hasBuyNowPrice"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="hasBuyNowPrice"
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        if (!e.target.checked) {
                          setValue("buyNowPrice", "");
                        }
                      }}
                    />
                  )}
                />
                <span className="text-sm font-medium text-gray-900">
                  Giá mua ngay (tùy chọn)
                </span>
              </Label>
              {hasBuyNowPrice && (
                <>
                  <Controller
                    name="buyNowPrice"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        id="buyNowPrice"
                        type="text"
                        value={formatThousand(field.value)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          field.onChange(raw);
                        }}
                        placeholder="Nhập giá mua ngay (VND)"
                        color={errors.buyNowPrice ? "failure" : "gray"}
                      />
                    )}
                  />
                  {errors.buyNowPrice && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.buyNowPrice.message}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Auto Extend */}
            <div>
              <Label
                htmlFor="autoExtend"
                className="flex items-start gap-3 cursor-pointer select-none">
                <Controller
                  name="autoExtend"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="autoExtend"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <span className="text-sm font-medium text-gray-900">
                  Tự động gia hạn
                </span>
              </Label>
              <p className="text-xs text-gray-500 mt-1 pl-7">
                Nếu có bất kỳ lượt đặt giá nào trong 5 phút cuối, hệ thống sẽ tự
                động gia hạn thêm 5 phút để đảm bảo công bằng.
              </p>
            </div>

            {/* Category Selection */}
            <div>
              <Label value="Chọn danh mục" />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full px-4 py-2.5 text-left border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                  <span className={selectedCategory ? "" : "text-gray-500"}>
                    {selectedCategory ? selectedCategory.name : "Chọn danh mục"}
                  </span>
                  <HiSearch className="text-gray-400" />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b sticky top-0 bg-white">
                      <TextInput
                        icon={HiSearch}
                        placeholder="Tìm kiếm..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                      />
                    </div>
                    <div className="p-2">
                      {filteredCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setValue("category", cat);
                            setValue("subcategory", null);
                            setShowCategoryDropdown(false);
                            setCategorySearch("");
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Subcategory Selection */}
            {selectedCategory && (
              <div>
                <Label value="Chọn danh mục con" />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowSubcategoryDropdown(!showSubcategoryDropdown)
                    }
                    className="w-full px-4 py-2.5 text-left border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                    <span
                      className={watch("subcategory") ? "" : "text-gray-500"}>
                      {watch("subcategory")
                        ? watch("subcategory").name
                        : "Chọn danh mục con"}
                    </span>
                    <HiSearch className="text-gray-400" />
                  </button>

                  {showSubcategoryDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      <div className="p-2 border-b sticky top-0 bg-white">
                        <TextInput
                          icon={HiSearch}
                          placeholder="Tìm kiếm..."
                          value={subcategorySearch}
                          onChange={(e) => setSubcategorySearch(e.target.value)}
                        />
                      </div>
                      <div className="p-2">
                        {filteredSubcategories.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              setValue("subcategory", sub);
                              setShowSubcategoryDropdown(false);
                              setSubcategorySearch("");
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* End Date */}
            <div>
              <Label htmlFor="endDate" value="Chọn ngày hết hạn" />
              <div className="relative">
                <TextInput
                  id="endDate"
                  type="datetime-local"
                  {...register("endDate")}
                  color={errors.endDate ? "failure" : "gray"}
                  icon={HiCalendar}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <Label value="Ảnh mô tả" />
              <p className="text-sm text-gray-500 mb-2">Tối thiểu 3 ảnh</p>
              <div className="grid grid-cols-3 gap-4">
                {/* Upload Button */}
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <HiPlus className="w-8 h-8 text-gray-400" />
                </label>

                {/* Preview Images */}
                {selectedImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square border border-gray-300 rounded-lg overflow-hidden group">
                    <img
                      src={img.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {selectedImages.length < 3 && (
                <p className="text-sm text-red-600 mt-2">
                  Vui lòng tải lên ít nhất 3 ảnh
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Description */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Label htmlFor="description" value="Mô tả sản phẩm" />
              <Textarea
                id="description"
                {...register("description")}
                rows={20}
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
                color={errors.description ? "failure" : "gray"}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <Button
            type="button"
            color="gray"
            size="lg"
            onClick={handleBack}
            disabled={uploading}>
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={uploading}
            className={`bg-green-500 hover:bg-green-600 ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            size="lg">
            {uploading ? "Đang tải..." : "Tạo mới"}
          </Button>
        </div>
      </form>
    </div>
  );
}
