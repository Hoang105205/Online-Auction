import {
  Button,
  MegaMenu,
  MegaMenuDropdown,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";

const Header = () => {
  return (
    <>
      <MegaMenu>
        <NavbarBrand href="/">
          <img alt="" src="/logo.png" className="mr-3 h-6 sm:h-20" />
          <span className="self-center whitespace-nowrap md:text-3xl font-semibold dark:text-white">
            Auctify
          </span>
        </NavbarBrand>
        <div className="order-2 hidden items-center md:flex">
          <a
            href="#"
            className="md:text-xl mr-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 md:mr-2 md:px-5 md:py-2.5 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800"
          >
            Login
          </a>
          <Button href="#" className="md:text-xl">
            Sign up
          </Button>
        </div>
        <NavbarToggle />
        <NavbarCollapse>
          {/* Trang chủ */}
          <NavbarLink href="/" className="md:text-xl">
            Trang chủ
          </NavbarLink>
          <li className="md:text-xl">
            <MegaMenuDropdown toggle={<>Hoạt động</>}>
              <ul className="grid grid-cols-3">
                <div className="space-y-4 p-4">
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      Sản phẩm đang đấu giá
                    </a>
                  </li>
                  {/* <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      Library
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      Resources
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      Pro Version
                    </a>
                  </li> */}
                </div>
                <div className="space-y-4 p-4">
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      Sản phầm đã thắng
                    </a>
                  </li>
                  {/* <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      Support Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      Terms
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      Blog
                    </a>
                  </li> */}
                </div>
                <div className="space-y-4 p-4">
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      Watch List
                    </a>
                  </li>
                  {/* <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      Playground
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 dark:hover:text-primary-500"
                    >
                      License
                    </a>
                  </li> */}
                </div>
              </ul>
            </MegaMenuDropdown>
          </li>
        </NavbarCollapse>
      </MegaMenu>
    </>
  );
};

export default Header;
