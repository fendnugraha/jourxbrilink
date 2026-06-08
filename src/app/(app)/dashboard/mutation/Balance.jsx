import { formatNumber } from "@/libs/format";
import { ArrowDown, ArrowUp, Landmark } from "lucide-react";

const Balance = ({ accountBalance, journalsByWarehouse }) => {
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
                <div className="bg-slate-700 p-3 rounded-3xl" key={account?.id} hidden={account?.balance === 0}>
                    <div className="flex justify-between items-start gap-4">
                        <span className="flex items-center justify-center gap-2 bg-slate-500 rounded-full w-8 h-8">
                            <Landmark size={16} />
                        </span>
                        <div className="flex flex-col justify-end items-end overflow-x-hidden flex-1">
                            {/* <h1 className="text-xs font-bold text-nowrap">{account?.account_group}</h1> */}
                            <h1 className="text-xs text-nowrap">{account?.acc_name}</h1>
                            <h1 className="text-sm font-bold text-right">{formatNumber(account?.balance)}</h1>
                            <div className="flex w-full justify-between bg-slate-800 mt-2 py-1 px-2 rounded-lg">
                                <div className="flex items-center gap-1">
                                    <ArrowUp size={16} className="inline-block text-green-500" />
                                    <h1 className="text-xs">{formatNumber(mutationInSumById(account.id) ?? 0)}</h1>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ArrowDown size={16} className="inline-block text-red-500" />
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
