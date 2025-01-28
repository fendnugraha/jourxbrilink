"use client";

import { useAuth } from "@/libs/auth";
import { BarChart, MapIcon, User, UserIcon } from "lucide-react";

const Header = ({ title, isOpen }) => {
    const { user } = useAuth({ middleware: "auth" });
    return (
        <>
            <header className={`h-[72px] px-4 md:px-6 flex justify-between items-center border-b bg-blue-800`}>
                <h1 className="text-xl font-bold text-white">{title}</h1>
                <BarChart className="w-8 h-8 sm:hidden" onClick={isOpen} />
            </header>
            <div className="pt-1 px-4 sm:px-6 flex items-center justify-end">
                <span className="text-sm text-slate-700 font-bold">
                    <UserIcon className="w-5 h-5 inline" /> {user.name} <MapIcon className="w-5 h-5 inline" /> {user.role.warehouse.name}
                </span>
            </div>
            <div
                className={`transition-all duration-300 ease-in-out transform ${
                    isOpen ? "opacity-100 scale-y-100 h-auto" : "opacity-0 scale-y-0 h-0"
                } border-b origin-top sm:hidden sm:bg-none bg-white`}
            >
                <ul className="space-y-2">
                    <li className="py-2 px-6 hover:bg-slate-400 font-bold">
                        <a href="#">Home</a>
                    </li>
                    <li className="py-2 px-6 hover:bg-slate-400 font-bold">
                        <a href="#">About</a>
                    </li>
                    <li className="py-2 px-6 hover:bg-slate-400 font-bold">
                        <a href="#">Contact</a>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Header;
