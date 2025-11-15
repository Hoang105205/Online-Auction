import { useEffect, useRef, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import Header from "../components/Header";
import AccountSidebar from "../components/Account/AccountSidebar";
import { HiOutlineBars3BottomLeft } from "react-icons/hi2";
import { HiX } from "react-icons/hi";

// Layout wrapping all /account/* pages. Provides sidebar + mobile drawer.
export default function AccountLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const openBtnRef = useRef(null);
  const drawerRef = useRef(null);

  // When drawer opens, move focus inside; when it closes, return focus
  useEffect(() => {
    if (mobileOpen) {
      // Focus first focusable item in drawer (a, button, input)
      const focusable = drawerRef.current?.querySelector(
        'a, button, input, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    } else {
      // Return focus to the opener button
      openBtnRef.current?.focus();
    }
  }, [mobileOpen]);

  // Basic focus trap when drawer is open (Tab cycles within panel)
  useEffect(() => {
    if (!mobileOpen) return;
    function handleKey(e) {
      if (e.key !== "Tab") return;
      const focusableEls = drawerRef.current?.querySelectorAll(
        'a, button, input, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableEls || focusableEls.length === 0) return;
      const list = Array.from(focusableEls);
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">My Account</span>
        </div>

        {/* Mobile header with menu button */}
        <div className="flex items-center justify-between lg:hidden mb-4">
          <button
            ref={openBtnRef}
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
          >
            <HiOutlineBars3BottomLeft className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <AccountSidebar onItemClick={() => {}} />
          </div>
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${
          mobileOpen ? "" : "pointer-events-none"
        }`}
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen || undefined}
        inert={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          ref={drawerRef}
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transition-transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="rounded-md p-2 hover:bg-gray-100"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>
          <div className="p-2">
            <AccountSidebar onItemClick={() => setMobileOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
