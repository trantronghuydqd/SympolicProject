import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiShoppingCart,
    FiMenu,
    FiX,
    FiUser,
    FiSearch,
    FiMessageCircle,
} from "react-icons/fi";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, loading, logout } = useUser();
    const { totalItems } = useCart();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const logoUrl =
        "https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/symbolicv3/symbolic%20logo.png";

    // Xử lý sự kiện scroll
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [scrolled]);

    // Xử lý tìm kiếm
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Xử lý đăng xuất
    const handleLogout = async () => {
        const { success } = await logout();
        if (success) {
            navigate("/auth");
        }
    };

    return (
        <nav className="fixed w-full z-[9999] top-0 px-4 py-2 bg-transparent">
            <div
                className={`max-w-7xl mx-auto backdrop-blur-sm rounded-full border border-[#93909f]/30 transition-colors duration-300 shadow-lg ${
                    scrolled ? "bg-[#93909f]/40" : "bg-[#a8a7b3]/30"
                }`}
            >
                <div className="flex items-center justify-between h-14 px-6">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/">
                            <img
                                className="h-8"
                                src={logoUrl}
                                alt="Symbolic Logo"
                            />
                        </Link>
                    </div>

                    {/* Menu desktop */}
                    <div className="hidden md:flex items-center space-x-1">
                        <Link
                            to="/"
                            className="text-[#0a0a0a] hover:text-black px-4 py-2 text-sm font-medium rounded-full hover:bg-[#93909f]/50"
                        >
                            Trang chủ
                        </Link>
                        <Link
                            to="/products"
                            className="text-[#0a0a0a] hover:text-black px-4 py-2 text-sm font-medium rounded-full hover:bg-[#93909f]/50"
                        >
                            Sản phẩm
                        </Link>
                        <Link
                            to="/about"
                            className="text-[#0a0a0a] hover:text-black px-4 py-2 text-sm font-medium rounded-full hover:bg-[#93909f]/50"
                        >
                            Giới thiệu
                        </Link>
                        <Link
                            to="/contact"
                            className="text-[#0a0a0a] hover:text-black px-4 py-2 text-sm font-medium rounded-full hover:bg-[#93909f]/50"
                        >
                            Liên hệ
                        </Link>
                        <Link
                            to="/manager"
                            className="text-[#0a0a0a] hover:text-black px-4 py-2 text-sm font-medium rounded-full hover:bg-[#93909f]/50"
                        >
                            Quản lý
                        </Link>
                    </div>

                    {/* Tìm kiếm, giỏ hàng và tài khoản */}
                    <div className="hidden md:flex items-center space-x-2">
                        {/* Form tìm kiếm */}
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="w-64 bg-[#93909f]/50 text-[#0a0a0a] px-4 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#858291] border border-[#93909f] placeholder-[#4d4d4d]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <FiSearch
                                    className="text-[#4d4d4d]"
                                    size={16}
                                />
                            </button>
                        </form>

                        {/* Chat */}
                        <button
                            className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50"
                            onClick={() => window.Tawk_API?.toggle()}
                        >
                            <FiMessageCircle className="h-5 w-5" />
                        </button>

                        {/* Giỏ hàng */}
                        <Link
                            to="/cart"
                            className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50 relative"
                        >
                            <FiShoppingCart className="h-5 w-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                                    {totalItems > 9 ? "9+" : totalItems}
                                </span>
                            )}
                        </Link>

                        {/* Tài khoản */}
                        {loading ? (
                            <div className="w-5 h-5 animate-pulse bg-gray-600 rounded-full"></div>
                        ) : user ? (
                            <div className="relative group">
                                <button className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50 flex items-center gap-2">
                                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs">
                                        {user.getFullName()?.charAt(0) ||
                                            user.email?.charAt(0) ||
                                            "U"}
                                    </div>
                                </button>
                                <div className="absolute right-0 w-48 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100 pt-3 mt-1 border border-[#93909f]/30">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#93909f]/30 hover:text-black"
                                    >
                                        Hồ sơ của tôi
                                    </Link>
                                    <Link
                                        to="/orders"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#93909f]/30 hover:text-black"
                                    >
                                        Đơn hàng
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-600"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/auth"
                                className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50"
                            >
                                <FiUser className="h-5 w-5" />
                            </Link>
                        )}
                    </div>

                    {/* Menu toggle for mobile */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50"
                        >
                            {isMenuOpen ? (
                                <FiX size={20} />
                            ) : (
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-[#858291] border border-[#93909f] rounded-2xl">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link
                                to="/"
                                className="text-[#0a0a0a] hover:text-black block px-3 py-2 text-base font-medium rounded-full hover:bg-[#93909f]/50"
                            >
                                Trang chủ
                            </Link>
                            <Link
                                to="/products"
                                className="text-[#0a0a0a] hover:text-black block px-3 py-2 text-base font-medium rounded-full hover:bg-[#93909f]/50"
                            >
                                Sản phẩm
                            </Link>
                            <Link
                                to="/about"
                                className="text-[#0a0a0a] hover:text-black block px-3 py-2 text-base font-medium rounded-full hover:bg-[#93909f]/50"
                            >
                                Giới thiệu
                            </Link>
                            <Link
                                to="/contact"
                                className="text-[#0a0a0a] hover:text-black block px-3 py-2 text-base font-medium rounded-full hover:bg-[#93909f]/50"
                            >
                                Liên hệ
                            </Link>
                        </div>
                        <div className="px-4 py-3 border-t border-[#93909f]">
                            <div className="flex items-center space-x-2">
                                <button
                                    className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50"
                                    onClick={() => window.Tawk_API?.toggle()}
                                >
                                    <FiMessageCircle className="h-5 w-5" />
                                </button>
                                <Link
                                    to="/cart"
                                    className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50 relative"
                                >
                                    <FiShoppingCart className="h-5 w-5" />
                                    {totalItems > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                                            {totalItems > 9 ? "9+" : totalItems}
                                        </span>
                                    )}
                                </Link>
                                {user ? (
                                    <Link
                                        to="/profile"
                                        className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50"
                                    >
                                        <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs">
                                            {user.getFullName()?.charAt(0) ||
                                                user.email?.charAt(0) ||
                                                "U"}
                                        </div>
                                    </Link>
                                ) : (
                                    <Link
                                        to="/auth"
                                        className="text-[#0a0a0a] hover:text-black p-2 rounded-full hover:bg-[#93909f]/50"
                                    >
                                        <FiUser className="h-5 w-5" />
                                    </Link>
                                )}
                            </div>
                            <div className="mt-3">
                                <form
                                    onSubmit={handleSearch}
                                    className="relative"
                                >
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm..."
                                        className="w-full bg-[#93909f]/50 text-[#0a0a0a] px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#858291] border border-[#93909f] placeholder-[#4d4d4d]"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        <FiSearch
                                            className="text-[#4d4d4d]"
                                            size={16}
                                        />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
