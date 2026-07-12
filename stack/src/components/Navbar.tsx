import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import { useLanguage, Language } from "@/lib/LanguageContext";
import NotificationDropdown from "./feed/NotificationDropdown";
import { Menu, Moon, Search, Sun, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "fr", name: "Français", flag: "🇫🇷" }
];

const Navbar = ({ handleslidein }: any) => {
  const { user, Logout, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguageState, t } = useLanguage();

  const [hasMounted, setHasMounted] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // OTP Verification Modal States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [verificationMethod, setVerificationMethod] = useState("");
  const [verificationRecipient, setVerificationRecipient] = useState("");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handlelogout = () => {
    Logout();
  };

  const handleLanguageChange = async (newLang: Language) => {
    if (newLang === language) return;

    if (!user) {
      toast.info("Please log in to change language settings.");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      const res = await axiosInstance.post("/user/request-language-otp", { language: newLang });
      if (res.data) {
        setSelectedLanguage(newLang);
        setVerificationMethod(res.data.method);
        setVerificationRecipient(res.data.recipient);
        setOtp("");
        setShowOtpModal(true);
        toast.info(res.data.message);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to send verification OTP";
      toast.error(errMsg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits.");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      const res = await axiosInstance.post("/user/verify-language-otp", { otp });
      if (res.data) {
        setLanguageState(selectedLanguage);
        setShowOtpModal(false);
        toast.success("Verification successful! Language updated.");
        await refreshUser();
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Invalid or expired OTP.";
      setOtpError(errMsg);
    } finally {
      setOtpLoading(false);
    }
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
                className="text-sm text-[#454545] dark:text-gray-200 font-medium px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition"
              >
                {t(item.label)}
              </Link>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); router.push(`/?search=${encodeURIComponent(search.trim())}`); }} className="hidden lg:block flex-grow relative px-3">
            <input
              type="text"
              placeholder={t("Search...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-[600px] pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <Search className="absolute left-4 top-2.5 h-4 w-4 text-gray-600" />
          </form>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative flex items-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:border-orange-500 transition-colors">
            <span className="pl-2.5 pr-1 flex items-center text-gray-500 pointer-events-none">
              <Globe className="w-4 h-4" />
            </span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              className="appearance-none bg-transparent pl-1 pr-7 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer pr-8"
              style={{ paddingRight: "2rem" }}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="dark:bg-gray-800">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <div className="absolute right-2 pointer-events-none text-gray-500 flex items-center">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

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
              {t("Log in")}
            </Link>
          ) : (
            <>
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-red-600 border border-red-300 px-3 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  {t("Admin")}
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
                {t("Log out")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative scale-95 transition-transform duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-orange-500" />
              {t("Verify Language Change")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {verificationMethod === "email"
                ? `An OTP has been sent to your registered email: ${verificationRecipient}.`
                : `An OTP has been sent to your registered mobile number: ${verificationRecipient}.`}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  {t("Enter 6-digit OTP")}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setOtp(val);
                  }}
                  placeholder="------"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              {otpError && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {otpError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otp.length !== 6}
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center min-w-[80px]"
                >
                  {otpLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    t("Verify")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
