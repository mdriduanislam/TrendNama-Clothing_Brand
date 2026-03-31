"use client";

import useAuthStore from "@/stores/authStore";
import useCartStore from "@/stores/cartStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SearchBar from "./SearchBar";
import { Home, PackageCheck } from "lucide-react";
import ShoppingCartIcon from "./ShoppingCartIcon";

const Navbar = () => {
  const router = useRouter();
  const { bootstrap, isAuthenticated, isLoading, logout, user } = useAuthStore();
  const { bootstrap: bootstrapCart, clearCart } = useCartStore();

  useEffect(() => {
    void bootstrap();
    void bootstrapCart();
  }, [bootstrap, bootstrapCart]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      void bootstrapCart();
    }
  }, [bootstrapCart, isAuthenticated, isLoading]);

  const handleLogout = async () => {
    await logout();
    await clearCart();
    router.refresh();
  };

  return (
    <nav className="w-full flex items-center justify-between border-b border-gray-200 pb-4">
      {/* LEFT */}
      <Link href="/" className="flex items-center">
        <Image
          src="/logo.svg"
          alt="TrendNama"
          width={36}
          height={36}
          className="w-6 h-6 md:w-9 md:h-9"
        />
        <p className="hidden md:block text-md font-medium tracking-wider">
          TRENDNAMA.
        </p>
      </Link>
      {/* RIGHT */}
      <div className="flex items-center gap-6">
        <SearchBar />
        <Link href="/">
          <Home className="w-4 h-4 text-gray-600" />
        </Link>
        <Link href="/orders" aria-label="Orders">
          <PackageCheck className="w-4 h-4 text-gray-600" />
        </Link>
        <ShoppingCartIcon />
        {!isLoading && isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-gray-600">
              Hi, {user?.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">Sign in</Link>
              <Link href="/register" className="text-sm">
                Register
              </Link>
            </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
