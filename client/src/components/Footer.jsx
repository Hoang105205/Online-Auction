import {
  Footer as FlowbiteFooter,
  FooterBrand,
  FooterCopyright,
  FooterDivider,
  FooterLink,
  FooterLinkGroup,
} from "flowbite-react";

const Footer = () => {
  return (
    <>
      <FlowbiteFooter container className="bg-gray-700">
        <div className="w-full text-center">
          <div className="w-full flex justify-center items-center">
            {/* <FooterBrand
            src="/logo.png"
            alt="Auctify Logo"
            name="Auctify"
          /> */}
            <FooterLinkGroup>
              <FooterLink href="#" className="text-white">
                Trang chủ
              </FooterLink>
              <FooterLink href="#" className="text-white">
                Sản phẩm đang đấu giá
              </FooterLink>
              <FooterLink href="#" className="text-white">
                Sản phẩm thắng
              </FooterLink>
              <FooterLink href="#" className="text-white">
                Tài khoản của tôi
              </FooterLink>
            </FooterLinkGroup>
          </div>
          <FooterDivider />
          <FooterCopyright
            href="#"
            className="text-white"
            by="Auctify"
            year={2025}
          />
        </div>
      </FlowbiteFooter>
    </>
  );
};

export default Footer;
