"use client";
import {
    ArrowLeftRightIcon,
    ChartAreaIcon,
    DollarSignIcon,
    HomeIcon,
    LayoutDashboardIcon,
    Menu,
    PowerCircleIcon,
    ReceiptIcon,
    SettingsIcon,
    StoreIcon,
    User,
    UserIcon,
} from "lucide-react";
import { useState } from "react";
import NavLink from "@/components/NavLink";
import { usePathname } from "next/navigation";
import { useAuth } from "@/libs/auth";

const Navigation = () => {
    const { logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathName = usePathname();
    return (
        <>
            <nav className={`hidden sm:flex sm:flex-col ${isMenuOpen ? "w-64" : "w-16"} h-screen justify-between transition-all duration-200 ease-in`}>
                {/* Header */}
                <button className="flex items-center mb-4 sm:mb-8 cursor-pointer text-blue-500" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {/* Tombol Toggle */}
                    <span className="w-16 h-20 flex items-center justify-center flex-shrink-0">
                        <Menu size={24} />
                    </span>

                    {/* Logo Text */}
                    <h1 className={`text-xl font-bold transition-all duration-300 origin-left ${isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        AgenBRI<span className="text-orange-400">Link</span>
                    </h1>
                </button>
                {/* Middle Menu */}
                <div className="flex-1">
                    <div className="bg-white rounded-3xl hover:drop-shadow-sm">
                        <ul className="space-y-2">
                            <li>
                                <NavLink href="/dashboard" active={pathName.startsWith("/dashboard")}>
                                    <span className="w-16 h-14 flex items-center justify-center flex-shrink-0 text-white">
                                        <LayoutDashboardIcon size={20} className="text-slate-700" />
                                    </span>
                                    <span
                                        className={`text-sm transition-all duration-300 origin-left ${
                                            isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                        }`}
                                    >
                                        Dashboard
                                    </span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink href="/transaction" active={pathName.startsWith("/transaction")}>
                                    <span className="w-16 h-14 flex items-center justify-center flex-shrink-0 text-white">
                                        <ArrowLeftRightIcon size={20} className="text-slate-700" />
                                    </span>
                                    <span
                                        className={`text-sm transition-all duration-300 origin-left ${
                                            isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                        }`}
                                    >
                                        Transaction
                                    </span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink href="/store" active={pathName.startsWith("/store")}>
                                    <span className="w-16 h-14 flex items-center justify-center flex-shrink-0 text-white">
                                        <StoreIcon size={20} className="text-slate-700" />
                                    </span>
                                    <span
                                        className={`text-sm transition-all duration-300 origin-left ${
                                            isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                        }`}
                                    >
                                        Store
                                    </span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink href="/finance" active={pathName.startsWith("/finance")}>
                                    <span className="w-16 h-14 flex items-center justify-center flex-shrink-0 text-white">
                                        <DollarSignIcon size={20} className="text-slate-700" />
                                    </span>
                                    <span
                                        className={`text-sm transition-all duration-300 origin-left ${
                                            isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                        }`}
                                    >
                                        Finance
                                    </span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink href="/summary" active={pathName.startsWith("/summary")}>
                                    <span className="w-16 h-14 flex items-center justify-center flex-shrink-0 text-white">
                                        <ChartAreaIcon size={20} className="text-slate-700" />
                                    </span>
                                    <span
                                        className={`text-sm transition-all duration-300 origin-left ${
                                            isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                        }`}
                                    >
                                        Summary
                                    </span>
                                </NavLink>
                            </li>
                        </ul>
                        <ul className="mt-4 border-t border-slate-300 pt-4">
                            <li>
                                <NavLink href="/setting" active={pathName.startsWith("/setting")}>
                                    <span className="w-16 h-14 flex items-center justify-center flex-shrink-0 text-white">
                                        <SettingsIcon size={20} className="text-slate-700" />
                                    </span>
                                    <span
                                        className={`text-sm transition-all duration-300 origin-left ${
                                            isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                        }`}
                                    >
                                        Setting
                                    </span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                {/* <NavLink href="/user/profile" active={pathName.startsWith("/user/profile")}>
                        <span className="w-16 h-14 flex items-center justify-center flex-shrink-0 text-white">
                            <UserIcon size={20} className="text-slate-700" />
                        </span>
                        <span
                            className={`text-sm text-nowrap transition-all duration-300 origin-left ${
                                isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                            }`}
                        >
                            My Profile
                        </span>
                    </NavLink> */}
                <button onClick={logout} className="flex items-center cursor-pointer hover:drop-shadow-sm bg-red-500 rounded-2xl">
                    {/* Tombol Toggle */}
                    <span className="w-16 h-14 flex items-center justify-center flex-shrink-0 text-white">
                        <PowerCircleIcon size={24} />
                    </span>

                    {/* Logo Text */}
                    <h1 className={`text-sm transition-all duration-300 text-white origin-left ${isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        Logout
                    </h1>
                </button>
            </nav>
        </>
    );
};

export default Navigation;
