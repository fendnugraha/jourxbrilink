"use client";
import { CirclePowerIcon, GemIcon, LayoutDashboardIcon, MenuIcon, TrophyIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ResponsiveNavLink, { ResponsiveNavButton } from "@/components/ResponsiveNavLink";
import { usePathname } from "next/navigation";
import { useAuth } from "@/libs/auth";
import useGetProfit from "@/components/RankByProfit";
import formatNumber from "@/libs/formatNumber";

const MainPage = ({ children, headerTitle }) => {
    const { user } = useAuth({ middleware: "auth" });
    const [isOpen, setIsOpen] = useState(false);
    const { profit, loading, error } = useGetProfit();

    const pathname = usePathname();
    const drawerReff = useRef();

    const userWarehouseId = user?.role?.warehouse_id;
    const userWarehouseName = user?.role?.warehouse?.name;
    const WarehouseRank = profit?.data?.findIndex((item) => Number(item.warehouse_id) === Number(userWarehouseId)) + 1 || 0;
    const WarehouseRankProfit = profit?.data?.find((item) => Number(item.warehouse_id) === Number(userWarehouseId))?.total || 0;
    const toOrdinal = (number) => {
        const suffixes = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];
        const mod = number % 100;
        return suffixes[mod - 10] || suffixes[mod] || suffixes[0];
    };
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const longMonthName = today.toLocaleDateString("id-ID", { month: "long" });
        const day = String(today.getDate()).padStart(2, "0");
        const dayName = today.toLocaleDateString("id-ID", { weekday: "long" });
        return `${dayName}, ${day} ${longMonthName} ${year}`;
    };

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
            <header className="w-full h-20 flex items-center justify-between px-4 sm:px-12 py-2">
                <h1 className="text-md sm:text-2xl font-bold text-slate-500">
                    {headerTitle}
                    <span className="text-xs font-normal p-0 block">{getCurrentDate()}</span>
                </h1>
                <div className="flex items-center justify-end gap-4">
                    {WarehouseRank > 0 && (
                        <div className="text-lg sm:text-md drop-shadow-xs bg-white rounded-full px-4 sm:px-6 py-2 flex flex-col justify-end items-end">
                            {WarehouseRank === 1 ? (
                                <div className="flex items-center gap-2">
                                    <TrophyIcon size={30} strokeWidth={2} className="text-yellow-400 inline" />{" "}
                                    <h1 className="hidden uppercase text-sm font-bold sm:inline">
                                        {userWarehouseName}
                                        <span className="hidden text-end font-light text-xs text-slate-500 sm:block ">
                                            {" "}
                                            <GemIcon className="w-3 h-3 inline" /> {formatNumber(WarehouseRankProfit)}
                                        </span>
                                    </h1>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <h1 className="font-bold text-3xl text-lime-500">
                                            #{WarehouseRank}
                                            <span className="text-sm hidden sm:inline text-slate-400">
                                                {""}
                                                <sup>{toOrdinal(WarehouseRank)}</sup>/{profit?.data?.length}
                                            </span>
                                        </h1>{" "}
                                        <h1 className="hidden text-sm uppercase sm:inline">
                                            {userWarehouseName}
                                            <span className="hidden text-end font-light text-xs text-slate-500 sm:block ">
                                                {" "}
                                                <GemIcon className="w-3 h-3 inline" /> {formatNumber(WarehouseRankProfit)}
                                            </span>
                                        </h1>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    <button className="sm:hidden">
                        {!isOpen ? <MenuIcon size={30} onClick={() => setIsOpen(!isOpen)} /> : <XIcon size={30} onClick={() => setIsOpen(!isOpen)} />}
                    </button>
                </div>
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
            <main className="h-[calc(100vh-80px)] overflow-auto">{children}</main>
        </>
    );
};

export default MainPage;
