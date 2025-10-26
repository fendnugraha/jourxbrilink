import SimplePagination from "@/components/SimplePagination";
import { calculateFee, formatDateTime, formatNumber } from "@/libs/format";
import { CheckCheck, CheckIcon, Loader2, Scale, XIcon } from "lucide-react";

const TransactionTable = ({
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

    const totalDebt = (filteredJournals || []).reduce((total, journal) => total + (journal.debt_code === selectedAccount ? journal.amount : 0), 0);

    const totalCredit = (filteredJournals || []).reduce((total, journal) => total + (journal.cred_code === selectedAccount ? journal.amount : 0), 0);
    return (
        <>
            <h1 className="text-sm text-slate-500 font-bold">Balance Check: {totalDebt + totalCredit === 0 ? "OK" : formatNumber(totalDebt + totalCredit)}</h1>
            <div className="overflow-x-auto">
                <table className="table w-full text-xs">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Amount</th>
                            <th className="text-center">
                                <CheckCheck />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems?.length > 0 ? (
                            currentItems.map((journal) => (
                                <tr key={journal.id} className={`${selectedJournalIds.includes(journal.id) ? "!bg-green-200 dark:!bg-green-800" : ""}`}>
                                    <td>
                                        <span className="text-xs text-blue-700 dark:text-blue-300 group-hover:dark:text-blue-200 group-hover:text-blue-400 block">
                                            #{journal.id} <span className="font-bold hidden sm:inline">{journal.invoice}</span>{" "}
                                            {formatDateTime(journal.date_issued)}{" "}
                                            {journal.is_confirmed ? (
                                                <span className="font-bold bg-green-300 text-green-700 rounded-full px-1 inline-flex gap-1 items-center">
                                                    <CheckCheck size={12} />
                                                    Clear
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
                                                journal.cred.acc_name + " -> " + journal.debt.acc_name
                                            ) : Number(journal.debt_code) === selectedarehouseCashId ? (
                                                journal.cred.acc_name
                                            ) : (
                                                journal.debt.acc_name
                                            )}
                                            <span className="font-normal hidden sm:block text-slate-500 dark:text-slate-300">Note: {journal.description}</span>
                                        </span>
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
                                                {formatNumber(journal.fee_amount ?? 0)}{" "}
                                                {["Transfer Uang", "Tarik Tunai"].includes(journal.trx_type) ? (
                                                    journal.fee_amount >= calculateFee(journal.amount ?? 0) ? (
                                                        <span className="text-green-500 dark:text-green-400 font-normal">OK</span>
                                                    ) : (
                                                        <span className="text-red-500 dark:text-red-400 font-normal animate-pulse">Check!!</span>
                                                    )
                                                ) : (
                                                    ""
                                                )}
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
                                                            : [...prev, journal.id] // kalau tidak ada → tambah
                                                )
                                            }
                                            hidden={
                                                journal.is_confirmed === 1 || bankAccount.includes(journal.cred_code) || bankAccount.includes(journal.debt_code)
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
            {totalPages > 1 && (
                <SimplePagination
                    className="w-full px-4"
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
