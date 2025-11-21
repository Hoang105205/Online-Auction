import {
  Footer as FlowbiteFooter,
  FooterBrand,
  FooterCopyright,
  FooterDivider,
  FooterLink,
  FooterLinkGroup,
} from "flowbite-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <FlowbiteFooter container className="bg-gray-700">
        <div className="w-full text-center">
          <div className="hidden md:w-full md:flex md:justify-center md:items-center ">
            {/* <FooterBrand
            src="/logo.png"
            alt="Auctify Logo"
            name="Auctify"
          /> */}
            <FooterLinkGroup className="gap-4">
              <Link to="/" className="text-white">
                Trang chủ
              </Link>
              <Link to="/account" className="text-white">
                Tài khoản của tôi
              </Link>
              <Link to="/account/auctions" className="text-white">
                Sản phẩm đang đấu giá
              </Link>
              <Link to="/account/win-auctions" className="text-white">
                Sản phẩm thắng
              </Link>
            </FooterLinkGroup>
          </div>
          <FooterDivider className="hidden md:block" />
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
