import Input from "@/components/Input";
import Modal from "@/components/Modal";
import SimplePagination from "@/components/SimplePagination";
import StatusBadge from "@/components/StatusBadge";
import { MessageCircleWarningIcon, MoveRightIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import EditMutationJournal from "../../transaction/components/EditMutationJournal";
import { formatDateTime, formatDateTimeColumn, formatNumber } from "@/libs/format";
import axios from "@/libs/axios";

const BalanceMutationHistory = ({
    notification,
    warehouses,
    fetchJournalsByWarehouse,
    journalsByWarehouse,
    cashBank,
    userRole,
    warehouse,
    selectedWarehouse,
    currentPage,
    setCurrentPage,
}) => {
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(selectedWarehouse);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const [isModalEditMutationJournalOpen, setIsModalEditMutationJournalOpen] = useState(false);
    const [isModalDeleteJournalOpen, setIsModalDeleteJournalOpen] = useState(false);
    const closeModal = () => {
        setIsModalDeleteJournalOpen(false);
        setIsModalEditMutationJournalOpen(false);
    };
    const [selectedJournalId, setSelectedJournalId] = useState(null);

    const selectedAccountIds = cashBank
        ?.filter((cashBank) => selectedWarehouseId && cashBank.warehouse_id === Number(selectedWarehouseId))
        ?.map((cashBank) => cashBank.id);

    const filteredJournals = journalsByWarehouse.data?.filter((journal) => {
        const matchJournalType = journal.trx_type === "Mutasi Kas";

        const matchSearchTerm =
            !searchTerm ||
            (journal.trx_type === "Mutasi Kas" &&
                (journal.cred?.acc_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    journal.debt?.acc_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    journal.invoice?.toLowerCase().includes(searchTerm.toLowerCase()))) ||
            journal.amount?.toString().includes(searchTerm);

        const matchSelectedIds =
            !selectedAccountIds?.length || selectedAccountIds.includes(journal.debt_code) || selectedAccountIds.includes(journal.cred_code);

        return matchJournalType && matchSearchTerm && matchSelectedIds;
    });
    const filterSelectedJournalId = journalsByWarehouse?.data?.find((journal) => journal.id === selectedJournalId);

    const [itemsPerPage, setItemsPerPage] = useState(5); // Number of items per page
    const totalItems = filteredJournals?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredJournals?.length > 0 ? filteredJournals.slice(startIndex, startIndex + itemsPerPage) : [];

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDeleteJournal = async (id) => {
        try {
            const response = await axios.delete(`/api/journals/${id}`);
            notification({ type: "success", message: response.data.message });
            fetchJournalsByWarehouse();
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        }
    };

    const hqCashBankIds = cashBank?.filter((cashBank) => cashBank.warehouse_id === 1)?.map((cashBank) => cashBank.id);
    return (
        <>
            <div className="">
                {["Administrator", "Super Admin"].includes(userRole) && (
                    <select
                        onChange={(e) => {
                            setSelectedWarehouseId(e.target.value);
                            setCurrentPage(1);
                        }}
                        value={selectedWarehouseId}
                        className="form-select mb-2 block p-2.5"
                    >
                        <option value={""}>Semua</option>
                        {warehouses?.map((warehouse) => (
                            <option key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                            </option>
                        ))}
                    </select>
                )}
                <div className="flex gap-2 mb-2">
                    <select
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        value={itemsPerPage}
                        className="form-select !w-20 block p-2.5"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <Input type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-control" placeholder="Cari..." />
                </div>
                {currentItems?.length > 0 &&
                    currentItems.map((journal, index) => (
                        <div key={index} className="flex justify-between text-xs p-2 bg-white dark:bg-slate-800 rounded-xl mb-2 drop-shadow-sm">
                            <div>
                                <h1 className="font-bold overflow-x-hidden text-blue-600 dark:text-yellow-200">
                                    {journal.debt?.warehouse_id === Number(selectedWarehouse) ? journal.cred?.warehouse?.name : journal.debt?.warehouse?.name}
                                </h1>
                                <h1>{formatDateTime(journal.date_issued)}</h1>
                                <span className={`${journal.cred?.warehouse_id === Number(selectedWarehouse) ? "font-bold" : ""}`}>
                                    {journal.cred?.account_group ?? journal.cred?.acc_name}
                                </span>{" "}
                                {"->"}{" "}
                                <span className={`${journal.debt?.warehouse_id === Number(selectedWarehouse) ? "font-bold" : ""}`}>
                                    {journal.debt?.account_group ?? journal.debt?.acc_name}
                                </span>
                            </div>
                            <div className="text-right flex flex-col justify-between">
                                <h1
                                    className={`font-bold text-[1.1rem] text-nowrap ${
                                        journal.debt?.warehouse_id === Number(selectedWarehouse)
                                            ? "text-green-500 dark:text-green-300"
                                            : "text-red-500 dark:text-red-300"
                                    }`}
                                >
                                    {journal.debt?.warehouse_id === Number(selectedWarehouse) ? "+" : "-"} {formatNumber(journal.amount)}
                                </h1>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setIsModalEditMutationJournalOpen(true);
                                            setSelectedJournalId(journal.id);
                                        }}
                                        className="hover:underline"
                                        hidden={!["Administrator", "Super Admin"].includes(userRole)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="text-red-500 hover:underline"
                                        hidden={!["Administrator", "Super Admin"].includes(userRole)}
                                        disabled={!hqCashBankIds.includes(journal.cred_code)}
                                        onClick={() => {
                                            setIsModalDeleteJournalOpen(true);
                                            setSelectedJournalId(journal.id);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                {totalPages > 1 && (
                    <SimplePagination
                        className="w-full"
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                )}
                {/* <div className="overflow-x-auto">
                    <table className="table w-full text-xs">
                        <thead>
                            <tr>
                                <th>
                                    Dari <MoveRightIcon className="size-5 inline" /> Ke
                                </th>
                                <th className="hidden sm:table-cell">Jumlah</th>
                                <th className="hidden sm:table-cell">Status</th>
                                <th>Opsi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr className="text-center">
                                    <td colSpan={4}>Loading ...</td>
                                </tr>
                            ) : currentItems?.length === 0 ? (
                                <tr className="text-center">
                                    <td colSpan={4}>Tidak ada data</td>
                                </tr>
                            ) : (
                                currentItems.map((journal, index) => (
                                    <tr key={index}>
                                        <td className="">
                                            <span className="block font-bold text-slate-500 dark:text-yellow-200">
                                                {formatDateTime(journal.date_issued)} | {journal.invoice}
                                            </span>
                                            <span>{journal.cred?.acc_name}</span> <MoveRightIcon className="size-5 inline" />{" "}
                                            <span>{journal.debt?.acc_name}</span>
                                            <span className="block sm:hidden font-bold text-blue-500">{formatNumber(journal.amount)}</span>
                                        </td>
                                        <td
                                            className={`text-end hidden sm:table-cell text-lg font-bold ${
                                                journal.debt?.warehouse_id === warehouse
                                                    ? "text-green-600 dark:text-green-300"
                                                    : "text-red-600 dark:text-red-300"
                                            }`}
                                        >
                                            {formatNumber(journal.amount)}
                                        </td>
                                        <td className="text-center">
                                            <StatusBadge
                                                status={journal.status === 0 ? "In Progress" : "Completed"}
                                                statusText={journal.status === 0 ? "On Delivery" : "Delivered"}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className=" hover:scale-125 transtition-all duration-200"
                                                    hidden={!["Administrator", "Super Admin"].includes(userRole)}
                                                    onClick={() => {
                                                        setSelectedJournalId(journal.id);
                                                        setIsModalEditMutationJournalOpen(true);
                                                    }}
                                                >
                                                    <PencilIcon className="size-4 text-indigo-700 dark:text-indigo-300 group-hover:dark:text-white group-hover:text-slate-600" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedJournalId(journal.id);
                                                        setIsModalDeleteJournalOpen(true);
                                                    }}
                                                    hidden={!["Administrator", "Super Admin"].includes(userRole)}
                                                    disabled={!hqCashBankIds.includes(journal.cred_code)}
                                                    className="cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed text-red-600 dark:text-red-300 hover:scale-125 transition-all group-hover:text-white duration-200"
                                                >
                                                    <TrashIcon className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <SimplePagination
                            className="w-full px-2 sm:px-6 pb-6"
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div> */}
            </div>
            <Modal isOpen={isModalDeleteJournalOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                <div className="flex flex-col items-center justify-center gap-3 mb-4">
                    <MessageCircleWarningIcon size={72} className="text-red-600" />
                    <p className="text-sm">Apakah anda yakin ingin menghapus transaksi ini (ID: {selectedJournalId})?</p>
                </div>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => {
                            handleDeleteJournal(selectedJournalId);
                            setIsModalDeleteJournalOpen(false);
                        }}
                        className="btn-primary w-full"
                    >
                        Ya
                    </button>
                    <button
                        onClick={() => setIsModalDeleteJournalOpen(false)}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Tidak
                    </button>
                </div>
            </Modal>
            <Modal isOpen={isModalEditMutationJournalOpen} onClose={closeModal} modalTitle="Edit Mutasi Journal" maxWidth="max-w-2xl">
                <EditMutationJournal
                    isModalOpen={setIsModalEditMutationJournalOpen}
                    selectedWarehouse={selectedWarehouse}
                    journal={filterSelectedJournalId}
                    cashBank={cashBank}
                    notification={notification}
                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                />
            </Modal>
        </>
    );
};

export default BalanceMutationHistory;
