import {
  Button,
  MegaMenu,
  MegaMenuDropdown,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";

import { Link } from "react-router-dom";
const Header = () => {
  return (
    <div className="border-b border-black/20 bg-white">
      <MegaMenu>
        <NavbarBrand href="/" className="flex items-center">
          <img alt="" src="/logo.png" className="mr-3 h-8 sm:h-12" />
          <span className="self-center whitespace-nowrap text-lg md:text-3xl font-semibold dark:text-white">
            Auctify
          </span>
        </NavbarBrand>
        <div className="order-2 hidden items-center md:flex">
          <Link
            to="#"
            className="md:text-xl mr-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 md:mr-2 md:px-5 md:py-2.5 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800"
          >
            Login
          </Link>
          <Button href="#" className="md:text-xl">
            Sign up
          </Button>
        </div>
        <NavbarToggle />
        <NavbarCollapse>
          <NavbarLink href="#">Trang chủ</NavbarLink>
          <NavbarLink href="#">Sản phẩm đang đấu giá</NavbarLink>
          <NavbarLink href="#">Sản phẩm thắng</NavbarLink>
        </NavbarCollapse>
      </MegaMenu>
    </div>
  );
};
export default Header;
