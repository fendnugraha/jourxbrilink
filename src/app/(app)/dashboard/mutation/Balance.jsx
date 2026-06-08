import { formatNumber } from "@/libs/format";
import { ArrowDown, ArrowUp, Landmark } from "lucide-react";
import { useState } from "react";

const Balance = ({ accountBalance, journalsByWarehouse }) => {
    const [showAccountName, setShowAccountName] = useState(false);
    const mutationInSumById = (acc_id) => {
        return journalsByWarehouse?.data?.reduce(
            (sum, journal) => (Number(journal.debt_code) === Number(acc_id) && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
            0,
        );
    };

    const mutationOutSumById = (acc_id) => {
        return journalsByWarehouse.data?.reduce(
            (sum, journal) => (Number(journal.cred_code) === Number(acc_id) && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
            0,
        );
    };

    const mutationInSum = accountBalance?.data?.chartOfAccounts?.reduce((sum, acc) => sum + mutationInSumById(acc.id), 0);

    const mutationOutSum = accountBalance?.data?.chartOfAccounts?.reduce((sum, acc) => sum + mutationOutSumById(acc.id), 0);
    return (
        <div className="space-y-2">
            {accountBalance?.data?.chartOfAccounts?.map((account) => (
                <div className="bg-white dark:bg-slate-700/90 backdrop-blur-sm rounded-3xl p-3" key={account?.id} hidden={account?.balance === 0}>
                    <div className="flex justify-between items-start gap-4">
                        <span className="flex items-center justify-center gap-2 bg-amber-500 dark:bg-amber-600 text-white rounded-full w-8 h-8">
                            <Landmark size={16} />
                        </span>
                        <div className="flex flex-col justify-end items-end overflow-x-hidden flex-1">
                            <h1 className="text-xs text-nowrap text-green-600 dark:text-green-300" onClick={() => setShowAccountName(!showAccountName)}>
                                {showAccountName ? <span className="font-bold">{account?.account_group}</span> : account?.acc_name}
                            </h1>
                            {/* <h1 className="text-[0.6rem] text-nowrap">{account?.acc_name}</h1> */}
                            <h1 className="text-md font-semibold text-right">{formatNumber(account?.balance)}</h1>
                            <div className="flex w-full justify-between bg-gray-300/50 dark:bg-gray-300/20 mt-2 py-1 px-2 rounded-lg">
                                <div className="flex items-center gap-1">
                                    <ArrowDown size={16} className="inline-block text-green-500" />
                                    <h1 className="text-xs">{formatNumber(mutationInSumById(account.id) ?? 0)}</h1>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ArrowUp size={16} className="inline-block text-red-500" />
                                    <h1 className="text-xs">{formatNumber(mutationOutSumById(account.id) ?? 0)}</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Balance;
