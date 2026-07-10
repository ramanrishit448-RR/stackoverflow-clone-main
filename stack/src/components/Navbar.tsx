import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import NotificationDropdown from "./feed/NotificationDropdown";
import { Menu, Moon, Search, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Navbar = ({ handleslidein }: any) => {
  const { user, Logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [hasMounted, setHasMounted] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);
  const handlelogout = () => {
    Logout();
  };
  return (
    <div className="top-0 z-50 w-full min-h-[53px] bg-white dark:bg-gray-900 border-t-[3px] border-[#ef8236] shadow-[0_1px_5px_#00000033] dark:shadow-[0_1px_5px_#00000066] flex items-center justify-center transition-colors duration-300">
      <div className="w-[90%] max-w-[1440px] flex items-center justify-between mx-auto py-1">
        <button
          aria-label="Toggle sidebar"
          className="sm:block md:hidden p-2 rounded hover:bg-gray-100 transition"
          onClick={handleslidein}
        >
          <Menu className="w-5 h-5 text-gray-800" />
        </button>
        <div className="flex items-center gap-2 flex-grow">
          <Link href="/" className="px-3 py-1">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
          </Link>

          <div className="hidden sm:flex gap-1">
            {[
              { label: "About", href: "/about" },
              { label: "Products", href: "/products" },
              { label: "For Teams", href: "/teams" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-[#454545] font-medium px-4 py-2 rounded hover:bg-gray-200 transition"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); router.push(`/?search=${encodeURIComponent(search.trim())}`); }} className="hidden lg:block flex-grow relative px-3">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-[600px] pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <Search className="absolute left-4 top-2.5 h-4 w-4 text-gray-600" />
          </form>
        </div>
        <div className="flex items-center gap-2">
          {/* Dark / Light mode toggle */}
          <button
            id="theme-toggle"
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm"
          >
            <span
              className="absolute transition-all duration-300"
              style={{ opacity: theme === "dark" ? 1 : 0, transform: theme === "dark" ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0)" }}
            >
              <Sun className="w-4 h-4 text-yellow-400" />
            </span>
            <span
              className="absolute transition-all duration-300"
              style={{ opacity: theme === "light" ? 1 : 0, transform: theme === "light" ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0)" }}
            >
              <Moon className="w-4 h-4 text-gray-600" />
            </span>
          </button>

          {!hasMounted ? null : !user ? (
            <Link
              href="/auth"
              className="text-sm font-medium text-[#454545] dark:text-gray-200 bg-[#e7f8fe] dark:bg-gray-800 hover:bg-[#d3e4eb] dark:hover:bg-gray-700 border border-blue-500 dark:border-blue-400 px-4 py-1.5 rounded transition"
            >
              Log in
            </Link>
          ) : (
            <>
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-red-600 border border-red-300 px-3 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  Admin
                </Link>
              )}
              <NotificationDropdown />
              <Link
                href={`/users/${user._id}`}
                className="flex items-center justify-center bg-orange-600 text-white text-sm font-semibold w-9 h-9 rounded-full"
              >
                {user.name?.charAt(0).toUpperCase()}
              </Link>

              <button
                onClick={handlelogout}
                className="text-sm font-medium text-[#454545] dark:text-gray-200 bg-[#e7f8fe] dark:bg-gray-800 hover:bg-[#d3e4eb] dark:hover:bg-gray-700 border border-blue-500 dark:border-blue-400 px-4 py-1.5 rounded transition"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
