"use client";
import { CirclePowerIcon, LayoutDashboardIcon, MenuIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ResponsiveNavLink, { ResponsiveNavButton } from "@/components/ResponsiveNavLink";
import { usePathname } from "next/navigation";
import { useAuth } from "@/libs/auth";

const MainPage = ({ children, headerTitle }) => {
    const { user } = useAuth({ middleware: "auth" });
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const drawerReff = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerReff.current && !drawerReff.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);
    return (
        <>
            <header className="w-full h-20 flex items-center justify-between px-4 py-2">
                <h1 className="text-md sm:text-2xl font-bold text-slate-700">{headerTitle}</h1>
                <button className="sm:hidden">
                    {!isOpen ? <MenuIcon size={24} onClick={() => setIsOpen(!isOpen)} /> : <XIcon size={24} onClick={() => setIsOpen(!isOpen)} />}
                </button>
            </header>
            <div
                ref={drawerReff}
                className={`mt-2 transform ${
                    isOpen ? "opacity-100 scale-y-100 h-auto" : "opacity-0 scale-y-0 h-0"
                } sm:hidden transition-all origin-top duration-200 ease-in`}
            >
                <div className="bg-white rounded-2xl">
                    <ul className="space-y-2 py-2">
                        <li className="flex items-center justify-between px-4 py-2">
                            <h1 className="text-md font-bold">{user?.role?.warehouse?.name}</h1>
                            <span className="text-sm">{user?.role?.role}</span>
                        </li>
                        <li className="">
                            <ResponsiveNavLink href="/dashboard" active={pathname === "/dashboard"}>
                                <LayoutDashboardIcon size={20} className="mr-2 inline" /> Dashboard
                            </ResponsiveNavLink>
                        </li>
                        <li className="">
                            <ResponsiveNavLink href="/dashboard" active={pathname === "/dashboard"}>
                                <LayoutDashboardIcon size={20} className="mr-2 inline" /> Transaction
                            </ResponsiveNavLink>
                        </li>
                        <li className="">
                            <ResponsiveNavLink href="/dashboard" active={pathname === "/dashboard"}>
                                <LayoutDashboardIcon size={20} className="mr-2 inline" /> Store
                            </ResponsiveNavLink>
                        </li>
                        <li className="border-t border-slate-300 pt-2">
                            <ResponsiveNavButton>
                                <CirclePowerIcon size={20} className="mr-2 inline" /> Logout
                            </ResponsiveNavButton>
                        </li>
                    </ul>
                </div>
            </div>
            <main className="h-[calc(100vh-80px)] overflow-auto bg-gray-100">{children}</main>
        </>
    );
};

export default MainPage;
