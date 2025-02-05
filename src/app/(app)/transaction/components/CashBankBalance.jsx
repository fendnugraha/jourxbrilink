"use client";
import formatNumber from "@/libs/formatNumber";
import { Settings } from "lucide-react";

const CashBankBalance = ({ accountBalance }) => {
    const summarizeBalance = accountBalance?.reduce((total, account) => total + account.balance, 0);

    return (
        <div>
            <div className="flex justify-center items-center mb-3 flex-col bg-amber-400 hover:bg-amber-300 py-4 border rounded-2xl text-slate-800">
                <h1 className="text-xs">Total Saldo Kas & Bank</h1>
                <h1 className="text-2xl font-black">{formatNumber(summarizeBalance)}</h1>
            </div>
            {accountBalance?.length > 0 ? (
                accountBalance?.map((account) => (
                    <div className="rounded-lg group" key={account.id}>
                        <div className="mb-1">
                            <div className="flex flex-col justify-between py-2 px-4 rounded-2xl shadow-sm text-white hover:shadow-lg bg-slate-800 hover:bg-slate-700t">
                                <h1 className="text-xs mb-2">{account.acc_name}</h1>

                                <h1 className="text-2xl group-hover:scale-105 group-hover:text-amber-300 font-bold text-end transition duration-300 ease-out">
                                    {formatNumber(account.balance)}
                                </h1>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex justify-center items-center mb-3 flex-col bg-sky-950 hover:bg-sky-900 p-2 rounded-2xl text-orange-300 hover:text-white">
                    <h1>No data</h1>
                </div>
            )}
        </div>
    );
};

export default CashBankBalance;
