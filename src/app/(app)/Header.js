"use client";

import ResponsiveNavLink, { ResponsiveNavButton } from "@/components/ResponsiveNavLink";
import { MenuIcon, TrophyIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/libs/auth";
import { useEffect, useState } from "react";
import RankByProfit from "@/components/RankByProfit";
import { mutate } from "swr";

const Header = ({ title }) => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const { profit, loading, error } = RankByProfit();

    const userWarehouseId = user?.role?.warehouse_id;
    const userWarehouseName = user?.role?.warehouse?.name;
    const WarehouseRank = profit?.data?.findIndex((item) => Number(item.warehouse_id) === userWarehouseId) + 1 || 0;

    useEffect(() => {
        mutate();
    });

    return (
        <>
            <header className={`h-[72px] px-4 md:px-6 flex justify-between items-center border-b bg-blue-800`}>
                <h1 className="text-xl font-bold text-white">{title}</h1>
                <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-md text-white">
                        {WarehouseRank > 0 &&
                            (WarehouseRank === 1 ? (
                                <>
                                    <TrophyIcon className="w-5 h-5 text-amber-200 inline" /> <span className="hidden sm:inline">{userWarehouseName}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-amber-200 font-bold">#{WarehouseRank}</span>{" "}
                                    <span className="hidden sm:inline">{userWarehouseName}</span>
                                </>
                            ))}
                    </h1>
                    <button className=" text-white sm:hidden">
                        <MenuIcon className="w-8 h-8" onClick={() => setIsOpen(!isOpen)} />
                    </button>
                </div>
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
