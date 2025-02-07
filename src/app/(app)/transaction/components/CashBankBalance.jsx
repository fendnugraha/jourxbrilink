"use client";
import formatNumber from "@/libs/formatNumber";
import { ChevronDown, LoaderIcon, Settings } from "lucide-react";
import { useState } from "react";

const CashBankBalance = ({ accountBalance }) => {
    const summarizeBalance = accountBalance?.data?.reduce((total, account) => total + account.balance, 0);
    const [showBalances, setShowBalances] = useState(true);
    return (
        <div>
            <div className="flex justify-center items-center flex-col bg-amber-400 hover:bg-amber-300 py-4 rounded-t-2xl text-slate-800 shadow-lg">
                <h1 className="text-xs">Total Saldo Kas & Bank</h1>
                <h1 className="text-2xl font-black">{formatNumber(summarizeBalance ?? 0)}</h1>
            </div>

            <div
                className={`bg-indigo-500 px-2 shadow-lg transform ${
                    showBalances ? "opacity-100 scale-y-100 max-h-[500px] overflow-auto" : "opacity-0 scale-y-0 max-h-0 "
                } origin-top transition-all duration-300 ease-in-out`}
            >
                {accountBalance?.data?.map((account) => (
                    <div className="group border-b border-dashed last:border-none p-2" key={account.id}>
                        <div className="flex flex-col justify-between text-white">
                            <h1 className="text-xs">{account.acc_name}</h1>

                            <h1 className="text-sm sm:text-xl group-hover:scale-105 group-hover:text-yellow-200 font-bold text-end transition delay-100 duration-300 ease-out">
                                {formatNumber(account.balance)}
                            </h1>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => setShowBalances(!showBalances)} className="bg-indigo-500 hover:bg-indigo-600 w-full pb-1 rounded-b-2xl text-white">
                <ChevronDown className={`w-4 h-4 inline ${showBalances ? "rotate-180" : ""} transition delay-500 ease-in-out`} />
            </button>
        </div>
    );
};

export default CashBankBalance;
