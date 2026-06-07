import Modal from "@/components/Modal";
import SimplePagination from "@/components/SimplePagination";
import { formatDateTime, formatNumber } from "@/libs/format";
import { ArrowBigRight, ArrowRight, MessageCircleWarning, Pencil, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import EditMutationJournal from "../../transaction/components/EditMutationJournal";
import InputGroup from "@/components/InputGroup";

const MutationTable = ({ journals, warehouse, warehouses, userRole, cashBank, notification, fetchJournalsByWarehouse }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedJournalId, setSelectedJournalId] = useState(null);
    const [isModalEditMutationJournalOpen, setIsModalEditMutationJournalOpen] = useState(false);
    const [isModalDeleteJournalOpen, setIsModalDeleteJournalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouse);
    const selectedAccountIds = cashBank?.data
        ?.filter((cashBank) => selectedWarehouseId && cashBank.warehouse_id === Number(selectedWarehouseId))
        ?.map((cashBank) => cashBank.id);

    const closeModal = () => {
        setIsModalDeleteJournalOpen(false);
        setIsModalEditMutationJournalOpen(false);
    };

    const filteredJournals = journals?.data?.filter((journal) => {
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

    const filterSelectedJournalId = journals?.data?.find((journal) => journal.id === selectedJournalId);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Number of items per page
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

    const hqCashBankIds = cashBank?.data?.filter((cashBank) => cashBank.warehouse_id === 1)?.map((cashBank) => cashBank.id);
    return (
        <div className="flex flex-col gap-4 col-span-2">
            <div className="flex items-center justify-between gap-2">
                <InputGroup
                    icon={<Search size={20} />}
                    type="search"
                    placeholder="Cari Mutasi Kas"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {["Administrator", "Super Admin"].includes(userRole) && (
                    <select
                        onChange={(e) => {
                            setSelectedWarehouseId(e.target.value);
                            setCurrentPage(1);
                        }}
                        value={selectedWarehouseId}
                        className="bg-slate-300 dark:bg-slate-700 rounded-2xl p-2.5 disabled:cursor-not-allowed disabled:text-slate-400 text-sm appearance-none"
                    >
                        <option value={""}>Semua</option>
                        {warehouses?.data?.map((warehouse) => (
                            <option key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                            </option>
                        ))}
                    </select>
                )}
                <select
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    value={itemsPerPage}
                    className="bg-slate-300 dark:bg-slate-700 rounded-2xl p-2.5 disabled:cursor-not-allowed disabled:text-slate-400 text-sm appearance-none"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
            <div className="overflow-x-auto bg-white dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600">
                <table className="w-full text-xs">
                    <thead className="text-xs text-gray-700 uppercase bg-white dark:bg-gray-700 dark:text-gray-400 rounded-2xl">
                        <tr>
                            <th className="text-center p-4">Tanggal</th>
                            <th className="text-center p-4">Deskripsi</th>
                            <th className="text-center p-4">Jumlah</th>
                            <th className="text-center p-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems?.length > 0 ? (
                            currentItems?.map((journal) => (
                                <tr
                                    key={journal?.id}
                                    className="bg-white border-b dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    <td className="text-center p-3">{formatDateTime(journal?.date_issued)}</td>
                                    <td className="p-3 font-bold">
                                        {journal?.cred?.account_group}{" "}
                                        {journal.cred?.warehouse?.id !== warehouse && (
                                            <span className="text-yellow-600 dark:text-yellow-300">
                                                ({journal.cred?.warehouse?.name.replace(/^konter\s*/i, "")})
                                            </span>
                                        )}{" "}
                                        <ArrowBigRight size={14} className="inline-block" fill="yellow" /> {journal?.debt?.account_group}{" "}
                                        {journal.debt?.warehouse?.id !== warehouse && (
                                            <span className="text-yellow-600 dark:text-yellow-300">
                                                ({journal.debt?.warehouse?.name.replace(/^konter\s*/i, "")})
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-right p-3 text-xl font-bold">
                                        <h1
                                            className={`font-bold text-nowrap ${
                                                journal.debt?.warehouse_id === Number(selectedWarehouse)
                                                    ? "text-green-500 dark:text-green-300"
                                                    : "text-red-500 dark:text-red-300"
                                            }`}
                                        >
                                            {journal.debt?.warehouse_id === Number(selectedWarehouse) ? "+" : "-"}
                                            {formatNumber(journal.amount)}
                                        </h1>
                                    </td>
                                    <td className="text-center p-3 flex gap-2 items-center justify-center">
                                        <button
                                            onClick={() => {
                                                setIsModalEditMutationJournalOpen(true);
                                                setSelectedJournalId(journal.id);
                                            }}
                                            className="hover:underline"
                                            hidden={!["Administrator", "Super Admin"].includes(userRole)}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="text-red-500 hover:underline"
                                            hidden={!["Administrator", "Super Admin"].includes(userRole)}
                                            // disabled={!hqCashBankIds.includes(journal?.cred?.id)}
                                            onClick={() => {
                                                setIsModalDeleteJournalOpen(true);
                                                setSelectedJournalId(journal.id);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center p-3">
                                    Tidak ada data yang tersedia
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="px-4 pb-4">
                    {totalPages > 1 && (
                        <SimplePagination
                            className="w-full"
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
                <Modal isOpen={isModalDeleteJournalOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                    <div className="flex flex-col items-center justify-center gap-3 mb-4">
                        <MessageCircleWarning size={72} className="text-red-600" />
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
                        cashBank={cashBank?.data}
                        notification={notification}
                        fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                    />
                </Modal>
            </div>
            {/* <div className="fixed bottom-12 right-12 bg-amber-200 px-4 py-2 text-sm">
                <div>
                    <h1>BCA (CABANG 1)</h1>
                    <h1>Rp 10.000.000</h1>
                </div>
            </div> */}
        </div>
    );
};

export default MutationTable;
