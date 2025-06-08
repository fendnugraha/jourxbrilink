"use client";

import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import axios from "@/libs/axios";
import { useState } from "react";
import Pagination from "@/components/PaginateList";
import { ArrowRightIcon, FilterIcon, LoaderCircleIcon, MessageCircleWarningIcon, PencilIcon, SearchIcon, TrashIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import EditJournal from "./EditJournal";
import TimeAgo from "@/libs/formatDateDistance";
import EditMutationJournal from "./EditMutationJournal";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const JournalTable = ({
    cashBank,
    journalsByWarehouse,
    warehouses,
    warehouse,
    warehouseId,
    notification,
    fetchJournalsByWarehouse,
    user,
    loading,
    hqCashBank,
}) => {
    const [selectedAccount, setSelectedAccount] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isModalFilterJournalOpen, setIsModalFilterJournalOpen] = useState(false);
    const [isModalDeleteJournalOpen, setIsModalDeleteJournalOpen] = useState(false);
    const [isModalEditJournalOpen, setIsModalEditJournalOpen] = useState(false);
    const [isModalEditMutationJournalOpen, setIsModalEditMutationJournalOpen] = useState(false);
    const [selectedJournalId, setSelectedJournalId] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const userRole = user?.role?.role;
    const warehouseCash = Number(user?.role?.warehouse?.chart_of_account_id);
    const closeModal = () => {
        setIsModalFilterJournalOpen(false);
        setIsModalDeleteJournalOpen(false);
        setIsModalEditJournalOpen(false);
        setIsModalEditMutationJournalOpen(false);
    };

    const filterSelectedJournalId = journalsByWarehouse?.data?.find((journal) => journal.id === selectedJournalId);

    const handleDeleteJournal = async (id) => {
        try {
            const response = await axios.delete(`/api/journals/${id}`);
            notification("success", response.data.message);
            fetchJournalsByWarehouse();
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
        }
    };

    const branchAccount = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === Number(selectedWarehouse));
    const filteredJournals =
        journalsByWarehouse?.data?.filter((journal) => {
            const matchAccount =
                selectedAccount && (Number(journal.cred_code) === Number(selectedAccount) || Number(journal.debt_code) === Number(selectedAccount));

            const matchSearchTerm =
                searchTerm &&
                ((journal.debt?.acc_name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.cred?.acc_name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.description ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.id ?? "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.invoice ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.amount ?? "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.transaction ?? []).some((t) => (t.product?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())));

            if (selectedAccount && searchTerm) {
                return matchAccount && matchSearchTerm;
            }

            if (selectedAccount) {
                return matchAccount;
            }

            if (searchTerm) {
                return matchSearchTerm;
            }

            return true;
        }) || [];

    const totalItems = filteredJournals?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredJournals.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const hqCashBankIds = hqCashBank.map((cashBank) => cashBank.id);

    const formatLongDate = (dateString) => {
        const tanggal = new Date(dateString);
        const formatted = new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(tanggal);

        return formatted;
    };
    return (
        <>
            <div className="relative w-full sm:max-w-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon className="w-6 h-6 text-gray-500" />
                </div>
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="block w-full text-sm mb-2 pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div className="flex gap-1">
                <select
                    onChange={(e) => {
                        setSelectedAccount(e.target.value);
                        setCurrentPage(1);
                    }}
                    value={selectedAccount}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                    <option value="">Semua Akun</option>
                    {branchAccount.map((account, index) => (
                        <option key={index} value={account.id}>
                            {account.acc_name}
                        </option>
                    ))}
                </select>
                <select
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <button
                    onClick={() => setIsModalFilterJournalOpen(true)}
                    className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400"
                >
                    <FilterIcon className="size-4" />
                </button>
                <Modal isOpen={isModalFilterJournalOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                    {userRole === "Administrator" && (
                        <div className="mb-4">
                            <Label>Cabang</Label>
                            <select
                                onChange={(e) => {
                                    setSelectedWarehouse(e.target.value);
                                    setCurrentPage(1);
                                }}
                                value={selectedWarehouse}
                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            >
                                <option value="">Semua Akun</option>
                                {warehouses?.data?.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                            <Label>Tanggal</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </div>
                        <div>
                            <Label>s/d</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                disabled={!startDate}
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            fetchJournalsByWarehouse(selectedWarehouse, startDate, endDate);
                            warehouseId(selectedWarehouse);

                            setIsModalFilterJournalOpen(false);
                            setSelectedAccount("");
                            setCurrentPage(1);
                        }}
                        className="btn-primary"
                    >
                        Submit
                    </button>
                </Modal>
            </div>
            <div className="pt-1">
                <h4 className="text-xs text-slate-500">
                    {warehouses?.data?.find((w) => w.id === Number(selectedWarehouse))?.name},{" "}
                    {startDate === endDate ? formatLongDate(endDate) : `${formatLongDate(startDate)} s/d ${formatLongDate(endDate)}`}
                </h4>
            </div>
            <div className="bg-white pb-4 rounded-2xl mt-2">
                <div className="overflow-x-auto">
                    <table className="table w-full text-xs">
                        <thead>
                            <tr>
                                <th>Deskripsi</th>
                                <th>Jumlah</th>
                                <th className="hidden sm:table-cell">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center">
                                        <span className="text-sm text-slate-500">{loading ? "Loading..." : "No data found."}</span>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((journal, index) => (
                                    <tr key={index} className="group hover:bg-slate-600 hover:text-white">
                                        <td>
                                            <span className="text-xs text-orange-500 group-hover:text-orange-300 block">
                                                #{journal.id} <span className="font-bold hidden sm:inline">{journal.invoice}</span>{" "}
                                                {formatDateTime(journal.created_at)}
                                            </span>
                                            <span className="font-bold text-xs block text-lime-600 group-hover:text-lime-300">
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
                                                ) : Number(journal.debt_code) === warehouseCash ? (
                                                    journal.cred.acc_name
                                                ) : (
                                                    journal.debt.acc_name
                                                )}
                                            </span>
                                            Note: {journal.description}
                                            <span className="text-xs block text-slate-500 group-hover:text-white">
                                                Last update at <TimeAgo timestamp={journal.updated_at} />
                                            </span>
                                        </td>
                                        <td className="font-bold text-end text-slate-600 ">
                                            <span
                                                className={`${Number(journal.debt_code) === Number(selectedAccount) ? "text-green-500" : ""}
                                    ${Number(journal.cred_code) === Number(selectedAccount) ? "text-red-500" : ""}
                                        text-sm group-hover:text-yellow-400 sm:text-base xl:text-lg`}
                                            >
                                                {formatNumber(journal.amount)}
                                            </span>
                                            {journal.fee_amount !== 0 && (
                                                <span className="text-xs text-yellow-600 group-hover:text-white block">{formatNumber(journal.fee_amount)}</span>
                                            )}
                                        </td>
                                        <td className="">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    className=" hover:scale-125 transtition-all duration-200"
                                                    hidden={!["Transfer Uang", "Tarik Tunai"].includes(journal.trx_type)}
                                                    onClick={() => {
                                                        setSelectedJournalId(journal.id);
                                                        setIsModalEditJournalOpen(true);
                                                    }}
                                                >
                                                    <PencilIcon className="size-4 text-indigo-700 group-hover:text-white" />
                                                </button>
                                                <button
                                                    className=" hover:scale-125 transtition-all duration-200"
                                                    hidden={!["Mutasi Kas"].includes(journal.trx_type) || hqCashBankIds.includes(journal.cred_code)}
                                                    onClick={() => {
                                                        setSelectedJournalId(journal.id);
                                                        setIsModalEditMutationJournalOpen(true);
                                                    }}
                                                >
                                                    <PencilIcon className="size-4 text-indigo-700 group-hover:text-white" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedJournalId(journal.id);
                                                        setIsModalDeleteJournalOpen(true);
                                                    }}
                                                    disabled={
                                                        ["Voucher & SP", "Accessories", null].includes(journal.trx_type) ||
                                                        (userRole !== "Administrator" && hqCashBankIds.includes(journal.cred_code))
                                                    }
                                                    className="disabled:text-slate-300 disabled:cursor-not-allowed text-red-600 hover:scale-125 transition-all group-hover:text-white duration-200"
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
                </div>

                {totalPages > 1 && (
                    <Pagination
                        className="w-full px-4"
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                )}
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
                <Modal isOpen={isModalEditJournalOpen} onClose={closeModal} modalTitle="Edit Journal" maxWidth="max-w-2xl">
                    <EditJournal
                        isModalOpen={setIsModalEditJournalOpen}
                        journal={filterSelectedJournalId}
                        branchAccount={branchAccount}
                        notification={notification}
                        fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                    />
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
            </div>
        </>
    );
};

export default JournalTable;
