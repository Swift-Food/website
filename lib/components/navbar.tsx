"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Check if we're on the homepage for transparent navbar
  const isHomePage = pathname === "/";
  // Check if we're on pages that should have sticky navbar
  const isMenuPage = pathname === "/menu";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`z-50 transition-all duration-300 py-5  ${
          isHomePage
            ? `fixed top-0 left-0 right-0 ${isScrolled ? "bg-white/40 backdrop-blur-sm border-gray-200" : "bg-transparent border-transparent"}`
            : isMenuPage
              ? "sticky top-0 bg-white border-gray-200"
              : "relative bg-white border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0 group">
            <div
              className={`font-bold text-[#fa43ad] text-2xl md:text-4xl cursor-pointer ${styles.montFont} leading-none whitespace-nowrap`}
            >
              <span className={styles.logoTicker}>
                <span className={styles.logoTrack}>
                  <span>SWIFT FOOD</span>
                  <span className="text-lg md:text-2xl text-center">
                    SIMPLE, LOCAL, RELIABLE
                  </span>
                </span>
              </span>
              <span className="sr-only">Swift Food — Simple, Local, Reliable</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10 text-sm font-medium tracking-wide">
            <Link
              href="/menu"
              className="hover:text-[#fa43ad] transition-colors uppercase"
            >
              Menus
            </Link>
            <Link
              href="/contact"
              className="hover:text-[#fa43ad] transition-colors uppercase"
            >
              Contact Us
            </Link>
            <Link href="/event-order">
              <button className="bg-[#fa43ad] text-white px-6 py-2.5 rounded-none hover:bg-[#e03a9a] transition-all duration-300 active:scale-95 shadow-lg shadow-black/5 uppercase text-xs font-bold tracking-widest">
                Order Now
              </button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center md:hidden space-x-2">
            <Link href="/event-order">
              <button className="bg-[#fa43ad] text-white px-4 py-2 rounded-none text-[10px] font-bold tracking-widest uppercase">
                Order
              </button>
            </Link>
            <button
              className="text-black p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

      </nav>

      {/* Mobile Menu Slide-out Panel */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20"
          onClick={closeMobileMenu}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-64 bg-white/80 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Close Button */}
          <div className="flex justify-start p-4">
            <button
              onClick={closeMobileMenu}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col px-6 py-4 space-y-6">
            <Link
              href="/menu"
              className="text-lg font-medium tracking-wide hover:text-[#fa43ad] transition-colors"
              onClick={closeMobileMenu}
            >
              Menus
            </Link>
            <Link
              href="/contact"
              className="text-lg font-medium tracking-wide hover:text-[#fa43ad] transition-colors"
              onClick={closeMobileMenu}
            >
              Contact Us
            </Link>
            <Link
              href="/event-order"
              className="text-lg font-medium tracking-wide hover:text-[#fa43ad] transition-colors"
              onClick={closeMobileMenu}
            >
              Event Ordering
            </Link>
          </div>

          {/* Order Button at Bottom */}
          <div className="absolute bottom-8 left-6 right-6">
            <Link href="/event-order" onClick={closeMobileMenu}>
              <button className="w-full bg-[#fa43ad] text-white py-3 rounded-none hover:bg-[#e03a9a] transition-all duration-300 text-sm font-bold tracking-widest uppercase">
                Order Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
