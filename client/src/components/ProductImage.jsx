import { cld } from "../api/cloudinary";
import { AdvancedImage } from "@cloudinary/react";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";

const ProductImage = ({ url }) => {
  const img = cld
    .image(url)
    .format("auto")
    .quality("auto")
    .resize(auto().gravity(autoGravity()).width(500).height(500));

  return <AdvancedImage cldImg={img} />;
};

export default ProductImage;
