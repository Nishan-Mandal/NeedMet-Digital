import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Container from "./Container";
import useAuth from "../../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import companyLogo from "../../assets/fevicon.png";
import play from "../../assets/play.png";
import onlyplay from "../../assets/onlyplay.png";

export default function Navbar() {

    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLoginRedirect = () => {
        navigate("/login", { state: { from: location.pathname } });
    };

    const handleLogout = async () => {
        setDropdownOpen(false);
        await signOut(auth);
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-50 h-16 sm:h-18 lg:h-20 border-b border-border/20 bg-background-secondary/80 backdrop-blur-md ">
            <Container className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity">
                    <img src={companyLogo} alt="NeedMet Logo" className="h-8 w-auto sm:h-9" />
                    <span className="font-heading text-lg sm:text-xl font-bold text-text">
                        NeedMet-Digital
                    </span>
                </Link>

                {/* Actions (Play Store and Profile) */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Play Store Button (Desktop style: text badge, Mobile style: icon button) */}
                    <a
                        href="https://play.google.com/store/apps/details?id=com.findon.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex items-center gap-2 rounded-xl transition-all "
                    >
                        <img src={play} alt="" className="h-8 w-auto sm:h-9" />
                    </a>

                    <a
                        href="https://play.google.com/store/apps/details?id=com.findon.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex sm:hidden h-8 w-8 items-center justify-center  transition-all "
                        aria-label="Get it on Play Store"
                    >
                        <img src={onlyplay} alt="" className="h-8 w-auto sm:h-9" />

                    </a>

                    {/* Profile Dropdown or Login */}
                    {currentUser ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                                aria-label="Open profile menu"
                            >
                              <i className="fa-solid fa-user"></i>
                            </button>

                            {/* Dropdown Panel */}
                            {dropdownOpen && (
                                <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-border/30 bg-white shadow-xl p-4 space-y-4">
                                    {/* User Info */}
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                            Logged in as
                                        </p>
                                        {currentUser.displayName && (
                                            <p className="text-sm font-semibold text-text truncate">
                                                {currentUser.displayName}
                                            </p>
                                        )}
                                        <p className="text-sm text-text-secondary truncate">
                                            {currentUser.phoneNumber || currentUser.email || "—"}
                                        </p>
                                    </div>

                                    <div className="border-t border-border/30" />

                                    {/* Logout */}
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base">logout</span>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleLoginRedirect}
                            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary text-white hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                            aria-label="Login"
                        >
                            <i className="fa-solid fa-user"></i>
                        </button>
                    )}
                </div>

            </Container>
        </header>
    );
}
