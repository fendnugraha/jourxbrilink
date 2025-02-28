"use client";

import ResponsiveNavLink, { ResponsiveNavButton } from "@/components/ResponsiveNavLink";
import {
    MenuIcon,
    TrophyIcon,
    ChartAreaIcon,
    CircleDollarSignIcon,
    CirclePowerIcon,
    CogIcon,
    LayoutDashboardIcon,
    StoreIcon,
    ArrowRightLeftIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/libs/auth";
import { useEffect, useState } from "react";

import { mutate } from "swr";
import useGetProfit from "@/components/RankByProfit";

const Header = ({ title }) => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const { profit, loading, error } = useGetProfit();
    const [prayerTimes, setPrayerTimes] = useState(null);

    const pathname = usePathname();

    const userWarehouseId = user?.role?.warehouse_id;
    const userWarehouseName = user?.role?.warehouse?.name;
    const WarehouseRank = profit?.data?.findIndex((item) => Number(item.warehouse_id) === userWarehouseId) + 1 || 0;
    const toOrdinal = (number) => {
        const suffixes = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];
        const mod = number % 100;
        return suffixes[mod - 10] || suffixes[mod] || suffixes[0];
    };

    const hijrianDate = (date) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        const hijriDate = new Date(date).toLocaleDateString("ar-SA-u-nu-latn", options);
        return hijriDate;
    };
    // Imsak,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Sunset,Isha,Midnight
    const fetchPrayerTimes = async (date, latitude, longitude, method = 20, timezonestring = "Asia/Jakarta", tune = "3,3,3,3,4,7,3,2,3") => {
        try {
            const response = await fetch(
                `https://api.aladhan.com/v1/timingsByCity/${date}?city=Bandung&country=ID&state=Jawa%20Barat&latitude=${latitude}&longitude=${longitude}&method=${method}&shafaq=general&tune=${tune}&timezonestring=${timezonestring}&calendarMethod=UAQ`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const data = await response.json();
            setPrayerTimes(data.data.timings); // Mengambil waktu sholat saja
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }); // Format: YYYY-MM-DD
        const latitude = -6.9175; // Latitude Bandung
        const longitude = 107.6191; // Longitude Bandung
        fetchPrayerTimes(date, latitude, longitude);
    }, []);
    console.log(prayerTimes, new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }));
    return (
        <>
            <header className={`h-[72px] px-4 md:px-6 flex justify-between items-center border-b bg-blue-800`}>
                <h1 className="text-xl font-bold text-white">
                    {title}
                    <span className="text-xs font-normal p-0 block">
                        {hijrianDate(new Date())}, {"Imsak: " + prayerTimes?.Imsak}, {"Maghrib: " + prayerTimes?.Maghrib}
                    </span>
                </h1>
                <div className="flex items-center gap-2">
                    <div className="text-lg sm:text-md text-white flex flex-col justify-end items-end">
                        {WarehouseRank > 0 &&
                            (WarehouseRank === 1 ? (
                                <h1 className="flex items-center gap-2">
                                    <TrophyIcon size={26} strokeWidth={2} className="text-amber-200 inline" />{" "}
                                    <span className="hidden uppercase font-bold sm:inline">{userWarehouseName}</span>
                                </h1>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <h1 className="font-bold text-xl">
                                            #{WarehouseRank}
                                            <span className="text-sm hidden sm:inline">
                                                {""}
                                                <sup>{toOrdinal(WarehouseRank)}</sup>/{profit?.data?.length}
                                            </span>
                                        </h1>{" "}
                                        <span className="hidden sm:inline">{userWarehouseName}</span>
                                    </div>
                                </>
                            ))}
                    </div>
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
                <div className="flex justify-between py-2 bg-indigo-400 text-white items-center gap-2 px-4">
                    <h1 className="text-md font-bold">{user.role?.warehouse?.name}</h1>
                    <span className="text-sm">{user.role?.role}</span>
                </div>
                <ul className="space-y-2 pt-4">
                    <li className="">
                        <ResponsiveNavLink href="/dashboard" active={pathname === "/dashboard"}>
                            <LayoutDashboardIcon size={20} className="mr-2 inline" /> Dashboard
                        </ResponsiveNavLink>
                    </li>
                    <li className="">
                        <ResponsiveNavLink href="/transaction" active={pathname === "/transaction"}>
                            <ArrowRightLeftIcon size={20} className="mr-2 inline" /> Transaction
                        </ResponsiveNavLink>
                    </li>
                    <li className="">
                        <ResponsiveNavLink href="/store" active={pathname === "/store"}>
                            <StoreIcon size={20} className="mr-2 inline" /> Store
                        </ResponsiveNavLink>
                    </li>
                    {user.role?.role === "Administrator" && (
                        <>
                            <li className="">
                                <ResponsiveNavLink href="/finance" active={pathname === "/finance"}>
                                    <CircleDollarSignIcon size={20} className="mr-2 inline" /> Finance
                                </ResponsiveNavLink>
                            </li>
                            <li className="">
                                <ResponsiveNavLink href="/summary" active={pathname === "/summary"}>
                                    <ChartAreaIcon size={20} className="mr-2 inline" /> Summary
                                </ResponsiveNavLink>
                            </li>
                            <li className="border-t py-2">
                                <ResponsiveNavLink href="/setting" active={pathname.startsWith("/setting")}>
                                    <CogIcon size={20} className="mr-2 inline" /> Setting
                                </ResponsiveNavLink>
                            </li>
                        </>
                    )}
                    <li className="border-t py-4">
                        <ResponsiveNavButton onClick={logout}>
                            <CirclePowerIcon size={20} className="mr-2 inline" /> Logout ({user.email})
                        </ResponsiveNavButton>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Header;
