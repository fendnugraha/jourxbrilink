import SimplePagination from "@/components/SimplePagination";
import { calculateFee, formatDateTime, formatNumber } from "@/libs/format";
import { CheckCheck, CheckIcon, CircleAlert, FileWarning, Loader2, Scale, ThumbsUp, XIcon } from "lucide-react";

const TransactionTable = ({
    accountBalance,
    isValidating,
    filteredJournals,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    selectedarehouseCashId,
    selectedAccount,
    selectedJournalIds,
    setSelectedJournalIds,
    cashBank,
    loading,
}) => {
    const hqCashBank = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === 1);
    const bankAccount = hqCashBank.filter((cashBank) => Number(cashBank.account_id) === 2);
    const totalItems = filteredJournals?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredJournals?.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const totalDebt = (filteredJournals || []).reduce(
        (total, journal) => total + (Number(journal.debt_code) === Number(selectedAccount) ? journal.amount : 0),
        0,
    );

    const totalCredit = (filteredJournals || []).reduce(
        (total, journal) => total + (Number(journal.cred_code) === Number(selectedAccount) ? journal.amount : 0),
        0,
    );

    return (
        <>
            <h1 className="text-xs text-slate-500 mb-2">
                Balance Check:{" "}
                <span className={`font-bold ${totalDebt - totalCredit === 0 ? "text-green-600 dark:text-green-300" : "text-red-600 dark:text-red-300"}`}>
                    {totalDebt - totalCredit === 0 ? "OK" : formatNumber(totalDebt - totalCredit)}
                </span>
            </h1>
            <div className="flex gap-2">
                <div className="overflow-x-autos w-full sm:w-3/4 bg-slate-100 dark:bg-slate-800 py-2 rounded-3xl">
                    <table className="table w-full text-xs">
                        <tbody>
                            {currentItems?.length > 0 ? (
                                currentItems.map((journal) => (
                                    <tr key={journal.id} className={`${selectedJournalIds.includes(journal.id) ? "bg-green-200! dark:bg-green-800!" : ""}`}>
                                        <td>
                                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 group-hover:dark:text-blue-200 group-hover:text-blue-400 block">
                                                #{journal.id} {formatDateTime(journal.date_issued)}{" "}
                                                {journal.is_confirmed ? (
                                                    <span className="inline-flex items-center gap-1 text-green-500  dark:text-green-400">
                                                        <CheckCheck size={12} />
                                                    </span>
                                                ) : (
                                                    ""
                                                )}
                                            </span>
                                            <span className="font-bold text-xs block text-lime-600 dark:text-lime-300 group-hover:text-lime-700 group-hover:dark:text-lime-400">
                                                {journal.trx_type === "Voucher & SP" || journal.trx_type === "Accessories" ? (
                                                    <ul className="list-disc font-normal scale-95">
                                                        {journal.transaction.map((trx) => (
                                                            <li key={trx.id}>
                                                                {trx.product.name} x {trx.quantity * -1}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : journal.trx_type === "Mutasi Kas" ? (
                                                    <>
                                                        {journal.cred?.account_group}{" "}
                                                        <span className="text-slate-500 dark:text-slate-300">
                                                            ({journal.cred?.warehouse?.name.replace(/^konter\s*/i, "")})
                                                        </span>
                                                        {" → "}
                                                        {journal.debt?.account_group}{" "}
                                                        <span className="text-slate-500 dark:text-slate-300">
                                                            ({journal.debt?.warehouse?.name.replace(/^konter\s*/i, "")})
                                                        </span>
                                                    </>
                                                ) : Number(journal.debt_code) === selectedarehouseCashId ? (
                                                    <>
                                                        {journal.cred?.account_group}{" "}
                                                        <span className="text-slate-500 dark:text-slate-300">
                                                            ({journal.cred?.warehouse?.name.replace(/^konter\s*/i, "")})
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        {journal.debt?.account_group}{" "}
                                                        <span className="text-slate-500 dark:text-slate-300">
                                                            ({journal.debt?.warehouse?.name.replace(/^konter\s*/i, "")})
                                                        </span>
                                                    </>
                                                )}
                                                <span className="font-normal hidden sm:block text-slate-500 dark:text-slate-300">
                                                    Note: {journal.description}
                                                </span>
                                            </span>
                                        </td>
                                        <td>
                                            {["Transfer Uang", "Tarik Tunai"].includes(journal.trx_type) ? (
                                                journal.fee_amount === calculateFee(journal.amount ?? 0) ? (
                                                    <ThumbsUp size={28} className="text-green-500 dark:text-green-400" />
                                                ) : (
                                                    <CircleAlert size={28} className="text-red-500 dark:text-red-400 font-normal animate-bounce" />
                                                )
                                            ) : (
                                                ""
                                            )}
                                        </td>
                                        <td className="font-bold text-end text-slate-600 dark:text-slate-300 ">
                                            <span
                                                className={`${Number(journal.debt_code) === Number(selectedAccount) ? "text-green-500 dark:text-green-400" : ""}
                                                    ${Number(journal.cred_code) === Number(selectedAccount) ? "text-red-500 dark:text-red-400" : ""}
                                                        text-sm group-hover:text-sky-400 group-hover:dark:text-yellow-400 sm:text-base xl:text-lg`}
                                            >
                                                {formatNumber(journal.amount)}
                                            </span>
                                            {(journal.fee_amount ?? 0) !== 0 && (
                                                <h1 className="text-xs text-yellow-600 group-hover:text-slate-600 group-hover:dark:text-white block">
                                                    {formatNumber(journal.fee_amount ?? 0)}
                                                </h1>
                                            )}
                                        </td>
                                        <td className="text-center w-12">
                                            <button
                                                onClick={() =>
                                                    setSelectedJournalIds(
                                                        (prev) =>
                                                            prev.includes(journal.id)
                                                                ? prev.filter((id) => id !== journal.id) // kalau ada → hapus
                                                                : [...prev, journal.id], // kalau tidak ada → tambah
                                                    )
                                                }
                                                hidden={
                                                    journal.is_confirmed === 1 ||
                                                    bankAccount.includes(journal.cred_code) ||
                                                    bankAccount.includes(journal.debt_code)
                                                }
                                                className={`hover:scale-110 transtition-all duration-200 ${
                                                    selectedJournalIds?.includes(journal.id) ? "bg-red-500" : "bg-green-500"
                                                } p-2 rounded-full cursor-pointer`}
                                            >
                                                {selectedJournalIds?.includes(journal.id) ? (
                                                    <XIcon size={24} className="text-white" />
                                                ) : (
                                                    <CheckIcon size={24} className="text-white" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center">
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex-1">
                    {isValidating ? (
                        <h1 className="text-xs">Loading data..</h1>
                    ) : (
                        accountBalance?.data?.chartOfAccounts
                            ?.filter((acc) => acc.account_id === 2)
                            .map((acc) => (
                                <div key={acc.id} className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 mb-1">
                                    <h1 className="font-bold text-xs text-amber-500 dark:text-amber-300">{acc.account_group}</h1>
                                    <h1 className="font-bold text-sm">{formatNumber(acc.balance)}</h1>
                                </div>
                            ))
                    )}
                </div>
            </div>

            {totalPages > 1 && (
                <SimplePagination
                    className="w-full sm:w-3/4 px-4"
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            )}
        </>
    );
};

export default TransactionTable;
