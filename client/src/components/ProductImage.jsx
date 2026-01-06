import { cld } from "../api/cloudinary";
import { AdvancedImage } from "@cloudinary/react";

const ProductImage = ({
  url,
  defaultWidth = "100%",
  defaultHeight = "100%",
  className = "", // Thêm className để dễ style
}) => {
  // 1. Trường hợp là URL đầy đủ (Seed data hoặc ảnh bên ngoài)
  if (url && (url.startsWith("http") || url.startsWith("https"))) {
    return (
      <img
        src={url}
        alt="Product"
        className={className}
        style={{
          width: defaultWidth,
          height: defaultHeight,
          objectFit: "contain",
          objectPosition: "center",
        }}
      />
    );
  }

  // 2. Trường hợp là Cloudinary Public ID (Ảnh upload thật sau này)
  // Chỉ tạo instance nếu url tồn tại
  const img = url ? cld.image(url).format("auto").quality("auto") : null;

  if (!img) return null; // Hoặc render ảnh placeholder

  return (
    <AdvancedImage
      cldImg={img}
      className={className}
      style={{
        width: defaultWidth,
        height: defaultHeight,
        objectFit: "contain",
        objectPosition: "center",
      }}
    />
  );
};

export default ProductImage;