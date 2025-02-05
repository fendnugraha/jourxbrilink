"use client";

import ResponsiveNavLink, { ResponsiveNavButton } from "@/components/ResponsiveNavLink";
import { useAuth } from "@/libs/auth";
import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Header = ({ title }) => {
    const { logout } = useAuth();
    const { user } = useAuth({ middleware: "auth" });
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <header className={`h-[72px] px-4 md:px-6 flex justify-between items-center border-b bg-blue-800`}>
                <h1 className="text-xl font-bold text-white">{title}</h1>
                <button className=" text-white sm:hidden">
                    <MenuIcon className="w-8 h-8" onClick={() => setIsOpen(!isOpen)} />
                </button>
            </header>
            <div
                className={`transition-all duration-300 ease-in-out transform ${
                    isOpen ? "opacity-100 scale-y-100 h-auto" : "opacity-0 scale-y-0 h-0"
                } border-b origin-top sm:hidden sm:bg-none bg-white`}
            >
                <ul className="space-y-2">
                    <li className="">
                        <ResponsiveNavLink href="/dashboard" active={usePathname() === "/dashboard"}>
                            Dashboard
                        </ResponsiveNavLink>
                    </li>
                    <li className="">
                        <ResponsiveNavLink href="/transaction" active={usePathname() === "/transaction"}>
                            Transaction
                        </ResponsiveNavLink>
                    </li>
                    <li className="">
                        <ResponsiveNavLink href="/store" active={usePathname() === "/store"}>
                            Store
                        </ResponsiveNavLink>
                    </li>
                    <li className="">
                        <ResponsiveNavLink href="/finance" active={usePathname() === "/finance"}>
                            Finance
                        </ResponsiveNavLink>
                    </li>
                    <li className="">
                        <ResponsiveNavLink href="/summary" active={usePathname() === "/summary"}>
                            Summary
                        </ResponsiveNavLink>
                    </li>
                    <li className="border-t py-2">
                        <ResponsiveNavLink href="/setting" active={usePathname().startsWith("/setting")}>
                            Setting
                        </ResponsiveNavLink>
                    </li>
                    <li className="border-t py-4">
                        <ResponsiveNavButton onClick={logout}>Logout</ResponsiveNavButton>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Header;
