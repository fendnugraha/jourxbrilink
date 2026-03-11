import DropdownMenu from "@/components/DropdownMenu";
import { formatDateTime, formatNumber } from "@/libs/format";
import { Ellipsis } from "lucide-react";

export const JournalTableMobile = ({
    currentItems,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    warehouse,
    warehouses,
    notification,
    fetchJournalsByWarehouse,
    user,
    loading,
    hqCashBank,
    selectedAccount,
    warehouseCash,
    hqCashBankIds,
    setIsModalEditDepositOpen,
    setIsModalEditJournalOpen,
    setIsModalEditMutationJournalOpen,
    setIsModalDeleteJournalOpen,
    setSelectedJournalId,
    userRole,
}) => {
    return (
        <div className="px-2 w-full space-y-2">
            {currentItems.map((journal, index) => (
                <div key={index} className="bg-slate-100 dark:bg-slate-700 flex justify-between items-center px-3 py-2 rounded-lg">
                    <div className="font-bold text-xs block group-hover:text-lime-700 group-hover:dark:text-lime-400">
                        <span className="text-xs text-blue-700 dark:text-blue-300 group-hover:dark:text-blue-200 group-hover:text-blue-400 block">
                            {formatDateTime(journal.date_issued)}
                        </span>
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
                                {journal.cred?.warehouse?.id !== warehouse && (
                                    <span className="text-yellow-600 dark:text-yellow-300">({journal.cred?.warehouse?.code})</span>
                                )}
                                <span className="block ml-1">
                                    <span className="text-green-500 dark:text-green-300">
                                        {" "}
                                        {" → "}
                                        {journal.debt?.account_group}
                                    </span>{" "}
                                    {journal.debt?.warehouse?.id !== warehouse && (
                                        <span className="text-yellow-600 dark:text-yellow-300">({journal.debt?.warehouse?.code})</span>
                                    )}
                                </span>
                            </>
                        ) : Number(journal.debt_code) === warehouseCash ? (
                            journal.cred.account_group
                        ) : (
                            journal.debt.account_group
                        )}
                        {/* {journal.trx_type !== "Mutasi Kas" && ( */}
                        <span className="font-normal text-slate-500 dark:text-slate-300 block">{journal.description}</span>
                        {/* )} */}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end font-bold">
                            <span
                                className={`${Number(journal.debt_code) === Number(selectedAccount) ? "text-green-500 dark:text-green-400" : ""}
                                    ${Number(journal.cred_code) === Number(selectedAccount) ? "text-red-500 dark:text-red-400" : ""}
                                        text-base group-hover:text-sky-400 group-hover:dark:text-yellow-400 xl:text-lg`}
                            >
                                {formatNumber(journal.amount)}
                            </span>
                            {journal.fee_amount !== 0 && (
                                <span className="text-xs text-yellow-600 dark:text-yellow-400 group-hover:text-slate-600 group-hover:dark:text-white block">
                                    {formatNumber(journal.fee_amount)}
                                </span>
                            )}
                        </div>
                        <DropdownMenu
                            title={<Ellipsis size={14} />}
                            position="bottom end"
                            className={""}
                            items={[
                                {
                                    type: "button",
                                    attributes: {
                                        hidden: !["Deposit"].includes(journal.trx_type),
                                    },
                                    label: "Edit",
                                    onClick: () => {
                                        setSelectedJournalId(journal.id);
                                        setIsModalEditDepositOpen(true);
                                    },
                                },
                                {
                                    type: "button",
                                    attributes: {
                                        hidden: !["Transfer Uang", "Tarik Tunai"].includes(journal.trx_type),
                                    },
                                    label: "Edit",
                                    onClick: () => {
                                        setSelectedJournalId(journal.id);
                                        setIsModalEditJournalOpen(true);
                                    },
                                },
                                {
                                    type: "button",
                                    attributes: {
                                        hidden: !["Mutasi Kas"].includes(journal.trx_type) || hqCashBankIds.includes(journal.cred_code),
                                    },
                                    label: "Edit",
                                    onClick: () => {
                                        setSelectedJournalId(journal.id);
                                        setIsModalEditMutationJournalOpen(true);
                                    },
                                },
                                {
                                    type: "button",
                                    attributes: {
                                        disabled:
                                            ["Voucher & SP", "Accessories", null].includes(journal.trx_type) ||
                                            (userRole !== "Administrator" && hqCashBankIds.includes(journal.cred_code)),
                                    },
                                    label: "Hapus",
                                    onClick: () => {
                                        setSelectedJournalId(journal.id);
                                        setIsModalDeleteJournalOpen(true);
                                    },
                                },
                            ]}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
