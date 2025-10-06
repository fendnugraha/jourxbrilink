"use client";
import {
    ArrowLeftRightIcon,
    ChartAreaIcon,
    CirclePowerIcon,
    DollarSignIcon,
    GemIcon,
    LayoutDashboardIcon,
    LoaderIcon,
    MenuIcon,
    StoreIcon,
    XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ResponsiveNavLink, { ResponsiveNavButton } from "@/components/ResponsiveNavLink";
import { usePathname } from "next/navigation";
import { useAuth } from "@/libs/auth";
import useGetProfit from "@/components/RankByProfit";
import formatNumber from "@/libs/formatNumber";
import { mutate } from "swr";
import useLiveClock from "@/components/useLiveClock";
import DarkModeToggle from "@/components/DarkModeToggle";
import { navMenu } from "../constants/NavMenu";

const MainPage = ({ children, headerTitle }) => {
    const { user, logout } = useAuth({ middleware: "auth" });
    const [isOpen, setIsOpen] = useState(false);
    const { profit, loading: profitLoading, error } = useGetProfit();

    const { dayName, date, time, raw } = useLiveClock();

    const pathName = usePathname();
    const drawerReff = useRef();
    const userRole = user?.role?.role;

    const userWarehouseId = user?.role?.warehouse_id;
    const userWarehouseName = user?.role?.warehouse?.name;
    const WarehouseRank = profit?.data?.findIndex((item) => Number(item.warehouse_id) === Number(userWarehouseId)) + 1 || 0;
    const WarehouseRankProfit = profit?.data?.find((item) => Number(item.warehouse_id) === Number(userWarehouseId))?.total || 0;
    const toOrdinal = (number) => {
        const suffixes = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];
        const mod = number % 100;
        return suffixes[mod - 10] || suffixes[mod] || suffixes[0];
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
                <h1 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-white">
                    {headerTitle}
                    <span className="text-xs font-normal p-0 sm:block hidden">
                        {userWarehouseName} | {dayName}, {date} {time}
                    </span>
                </h1>
                <div className="flex items-center justify-end sm:gap-4">
                    {WarehouseRank > 0 && (
                        <div className="text-lg sm:text-md drop-shadow-xs sm:bg-white dark:sm:bg-slate-800 shadow rounded-full px-4 sm:ps-1 sm:pe-6 py-1 flex flex-col justify-end items-end">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => mutate("/api/get-rank-by-profit")}
                                    className="font-bold cursor-pointer text-2xl text-lime-700 w-12 h-12 rounded-full bg-lime-200"
                                >
                                    {WarehouseRank}
                                    <span className="text-xs scale-50 hidden sm:inline text-slate-400">
                                        {""}
                                        <sup>{toOrdinal(WarehouseRank)}</sup>
                                    </span>
                                </button>{" "}
                                <h1 className="hidden text-sm uppercase sm:inline">
                                    {userWarehouseName}
                                    <span className="hidden text-end font-light text-xs text-slate-500 dark:text-yellow-400 sm:block ">
                                        {" "}
                                        {profitLoading ? <LoaderIcon className="w-3 h-3 animate-spin inline" /> : <GemIcon className="w-3 h-3 inline" />}{" "}
                                        {formatNumber(WarehouseRankProfit)}
                                    </span>
                                </h1>
                            </div>
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
                <div className="bg-white dark:bg-slate-700 rounded-2xl">
                    <ul className="space-y-2 py-2">
                        <li className="flex items-center justify-between px-4 py-2">
                            <div className="flex items-center gap-2">
                                <DarkModeToggle />
                                <h1 className="text-md font-bold">{user?.role?.warehouse?.name}</h1>
                            </div>
                            <span className="text-sm">{user?.role?.role}</span>
                        </li>
                        {navMenu.mainMenu
                            .filter((item) => item.role.includes(userRole))
                            .map((item, index) => (
                                <li className="" key={index}>
                                    <ResponsiveNavLink href={item.href} active={pathName === item.path}>
                                        <item.icon size={20} className="mr-2 inline" /> {item.name}
                                    </ResponsiveNavLink>
                                </li>
                            ))}
                        <li className="border-t border-slate-300 pt-2" onClick={logout}>
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
