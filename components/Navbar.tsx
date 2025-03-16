"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
      ? "bg-blue-700"
      : "";
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md print:hidden">
      <div className="container mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center py-4">
              <span className="font-bold text-xl">Power Tools Billing</span>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/dashboard"
                className={`py-4 px-3 hover:bg-blue-700 ${isActive(
                  "/dashboard"
                )}`}
              >
                Dashboard
              </Link>
              <Link
                href="/products"
                className={`py-4 px-3 hover:bg-blue-700 ${isActive(
                  "/products"
                )}`}
              >
                Products
              </Link>
              <Link
                href="/customers"
                className={`py-4 px-3 hover:bg-blue-700 ${isActive(
                  "/customers"
                )}`}
              >
                Customers
              </Link>
              <Link
                href="/entry"
                className={`py-4 px-3 hover:bg-blue-700 ${isActive("/entry")}`}
              >
                New Bill
              </Link>
              <Link
                href="/bills"
                className={`py-4 px-3 hover:bg-blue-700 ${isActive("/bills")}`}
              >
                Bills
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMobileMenu} className="p-2">
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                ) : (
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="flex flex-col">
            <Link
              href="/dashboard"
              className={`py-2 px-4 hover:bg-blue-700 ${isActive(
                "/dashboard"
              )}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/products"
              className={`py-2 px-4 hover:bg-blue-700 ${isActive("/products")}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/customers"
              className={`py-2 px-4 hover:bg-blue-700 ${isActive(
                "/customers"
              )}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Customers
            </Link>
            <Link
              href="/entry"
              className={`py-2 px-4 hover:bg-blue-700 ${isActive("/entry")}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              New Bill
            </Link>
            <Link
              href="/bills"
              className={`py-2 px-4 hover:bg-blue-700 ${isActive("/bills")}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Bills
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
