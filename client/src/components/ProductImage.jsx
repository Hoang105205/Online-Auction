import { cld } from "../api/cloudinary";
import { AdvancedImage } from "@cloudinary/react";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";

const ProductImage = ({
  url,
  defaultWidth = "100%",
  defaultHeight = "100%",
}) => {
  const img = cld.image(url).format("auto").quality("auto");

  return (
    <AdvancedImage
      cldImg={img}
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
