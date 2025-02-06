"use client";
import formatNumber from "@/libs/formatNumber";
import { Settings } from "lucide-react";

const CashBankBalance = ({ accountBalance }) => {
    const summarizeBalance = accountBalance?.data?.reduce((total, account) => total + account.balance, 0);

    return (
        <div>
            <div className="flex justify-center items-center mb-3 flex-col bg-amber-400 hover:bg-amber-300 py-4 border rounded-2xl text-slate-800">
                <h1 className="text-xs">Total Saldo Kas & Bank</h1>
                <h1 className="text-2xl font-black">{formatNumber(summarizeBalance ?? 0)}</h1>
            </div>
            <div className="rounded-2xl bg-slate-800 hover:bg-slate-700 p-2">
                {accountBalance?.data?.length > 0 ? (
                    accountBalance?.data?.map((account) => (
                        <div className="group border-b border-dashed last:border-none p-2" key={account.id}>
                            <div className="flex flex-col justify-between shadow-sm text-white">
                                <h1 className="text-xs">{account.acc_name}</h1>

                                <h1 className="text-sm sm:text-2xl group-hover:scale-105 group-hover:text-amber-300 font-bold text-end transition duration-300 ease-out">
                                    {formatNumber(account.balance)}
                                </h1>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex justify-center items-center mb-3 flex-col bg-sky-950 hover:bg-sky-900 p-2 rounded-2xl text-orange-300 hover:text-white">
                        <h1>No data</h1>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashBankBalance;
