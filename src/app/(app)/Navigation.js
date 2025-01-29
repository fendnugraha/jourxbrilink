import NavLink from "@/components/NavLink";
import { useAuth } from "@/libs/auth";
import { BarChart, ChartAreaIcon, CogIcon, CoinsIcon, DockIcon, LandmarkIcon, LogOutIcon, MapIcon, ShoppingBag, StoreIcon, User2Icon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Navigation = ({ user }) => {
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };
    return (
        <nav className={`bg-white text-gray-600 hidden sm:block min-h-screen transition-all ${isOpen ? "w-64" : "w-16"} flex flex-col`}>
            <div className="h-[72px] px-4 text-gray-500 bg-blue-800 flex items-center justify-start gap-4 cursor-pointer border-b">
                <div className="h-full flex items-center" onClick={toggleNavbar}>
                    <BarChart className="w-5 h-5" />
                </div>
                <div
                    className={`transition-all duration-300 ease-in-out transform text-nowrap ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                    style={{ display: isOpen ? "inline" : "none" }}
                >
                    <h1 className="font-bold text-yellow-300">JOUR APPS</h1>
                </div>
            </div>
            <nav className="flex-1">
                <div className=" text-sm">
                    <div
                        className={`justify-center items-center p-4 border-b font-bold overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen ? "scale-100" : "scale-0"
                        }`}
                        style={{ display: isOpen ? "flex" : "none" }}
                    >
                        <MapIcon className="w-5 h-5 inline" /> {user?.role?.warehouse?.name}
                    </div>
                    <NavLink href="/dashboard" isOpen={isOpen} active={usePathname() === "/dashboard"}>
                        <div className="">
                            <ChartAreaIcon className="w-5 h-5" />
                        </div>
                        <span
                            className={`transition-all duration-300 ease-in-out transform text-nowrap ${
                                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                            }`}
                            style={{ display: isOpen ? "inline" : "none" }}
                        >
                            Dashboard
                        </span>
                    </NavLink>
                    <NavLink href="/transaction" isOpen={isOpen} active={usePathname() === "/transaction"}>
                        <div>
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <span
                            className={`transition-all duration-300 ease-in-out transform text-nowrap ${
                                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                            }`}
                            style={{ display: isOpen ? "inline" : "none" }}
                        >
                            Transaction
                        </span>
                    </NavLink>
                    <NavLink href="/store" isOpen={isOpen} active={usePathname() === "/store"}>
                        <div>
                            <StoreIcon className="w-5 h-5" />
                        </div>
                        <span
                            className={`transition-all duration-300 ease-in-out transform text-nowrap ${
                                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                            }`}
                            style={{ display: isOpen ? "inline" : "none" }}
                        >
                            Store
                        </span>
                    </NavLink>
                    <NavLink href="/finance" isOpen={isOpen} active={usePathname() === "/finance"}>
                        <div>
                            <LandmarkIcon className="w-5 h-5" />
                        </div>
                        <span
                            className={`transition-all duration-300 ease-in-out transform text-nowrap ${
                                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                            }`}
                            style={{ display: isOpen ? "inline" : "none" }}
                        >
                            Finance
                        </span>
                    </NavLink>
                    <NavLink href="/summary" isOpen={isOpen} active={usePathname() === "/summary"}>
                        <div>
                            <BarChart className="w-5 h-5" />
                        </div>
                        <span
                            className={`transition-all duration-300 ease-in-out transform text-nowrap ${
                                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                            }`}
                            style={{ display: isOpen ? "inline" : "none" }}
                        >
                            Summary
                        </span>
                    </NavLink>

                    {/* <NavLink href="/report" isOpen={isOpen} active={usePathname() === "/report"}>
                        <div>
                            <DockIcon className="w-5 h-5" />
                        </div>
                        <span
                            className={`transition-all duration-300 ease-in-out transform text-nowrap ${
                                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                            }`}
                            style={{ display: isOpen ? "inline" : "none" }}
                        >
                            Reports
                        </span>
                    </NavLink> */}
                </div>
                <hr className="my-4" />
                <ul className="mt-4 text-sm">
                    <NavLink href="/setting" isOpen={isOpen} active={usePathname().startsWith("/setting")}>
                        <div>
                            <CogIcon className="w-5 h-5" />
                        </div>
                        <span
                            className={`transition-all duration-300 ease-in-out transform text-nowrap ${
                                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                            }`}
                            style={{ display: isOpen ? "inline" : "none" }}
                        >
                            Settings
                        </span>
                    </NavLink>
                </ul>
            </nav>

            <div className="my-5">
                <button
                    onClick={logout}
                    className="px-4 py-4 w-full hover:bg-slate-500 border-y hover:text-white cursor-pointer flex items-center gap-4 justify-center"
                >
                    <div>
                        <LogOutIcon className="w-5 h-5" />
                    </div>
                    <span
                        className={`transition-all duration-300 ease-in-out transform text-nowrap ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                        style={{ display: isOpen ? "inline" : "none" }}
                    >
                        Logout
                    </span>
                </button>
            </div>
        </nav>
    );
};

export default Navigation;
