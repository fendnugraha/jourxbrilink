"use client";

import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import axios from "@/libs/axios";
import { useState } from "react";
import Pagination from "@/components/PaginateList";
import { ArrowRightIcon, FilterIcon, PencilIcon, TrashIcon } from "lucide-react";
import Modal from "@/components/Modal";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const JournalTable = ({ cashBank, journalsByWarehouse, notification, fetchJournalsByWarehouse, user }) => {
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isModalFilterJournalOpen, setIsModalFilterJournalOpen] = useState(false);

    const closeModal = () => {
        setIsModalFilterJournalOpen(false);
    };

    const warehouse = user.role?.warehouse_id;
    const warehouseCash = user.role.warehouse.chart_of_account_id;

    const handleDeleteJournal = async (id) => {
        try {
            const response = await axios.delete(`/api/journals/${id}`);
            notification(response.data.message);
            fetchJournalsByWarehouse();
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        }
    };

    const branchAccount = cashBank.filter((cashBank) => cashBank.warehouse_id === warehouse);
    const filteredJournals = selectedAccount
        ? journalsByWarehouse?.data?.filter(
              (journal) => Number(journal.cred_code) === Number(selectedAccount) || Number(journal.debt_code) === Number(selectedAccount)
          )
        : journalsByWarehouse?.data || [];

    const totalItems = filteredJournals?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredJournals.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <div className="px-4 mb-4 flex justify-start items-center gap-2 w-full">
                <select
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <select
                    onChange={(e) => {
                        setSelectedAccount(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="rounded-md flex-1 border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                    <option value="">Semua Akun</option>
                    {branchAccount.map((account, index) => (
                        <option key={index} value={account.id}>
                            {account.acc_name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => setIsModalFilterJournalOpen(true)}
                    className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400"
                >
                    <FilterIcon className="size-4" />
                </button>
                <Modal isOpen={isModalFilterJournalOpen} onClose={closeModal} modalTitle="Filter Tanggal">
                    <div className="flex flex-col gap-2"></div>
                </Modal>
            </div>

            <table className="table w-full text-xs">
                <thead>
                    <tr>
                        <th>Keterangan</th>
                        <th>Jumlah</th>
                        <th className="hidden sm:table-cell">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="3" className="text-center">
                                <span className="text-sm text-slate-500">Loading...</span>
                            </td>
                        </tr>
                    ) : currentItems.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="text-center">
                                <span className="text-sm text-slate-500">Tidak ada transaksi</span>
                            </td>
                        </tr>
                    ) : (
                        currentItems.map((journal, index) => (
                            <tr key={index}>
                                <td>
                                    <span className="text-xs text-slate-500 block">
                                        {journal.invoice} | {formatDateTime(journal.created_at)}
                                    </span>
                                    Note: {journal.description}
                                    <span className="block font-bold text-xs">
                                        {journal.cred.acc_name} <ArrowRightIcon className="size-4 inline" /> {journal.debt.acc_name}
                                    </span>
                                </td>
                                <td className="font-bold text-end">
                                    <span
                                        className={`${Number(journal.debt_code) === Number(selectedAccount) ? "text-green-500" : ""}
                                    ${Number(journal.cred_code) === Number(selectedAccount) ? "text-red-500" : ""}
                                        text-sm md:text-base sm:text-lg`}
                                    >
                                        {formatNumber(journal.amount)}
                                    </span>
                                    {journal.fee_amount !== 0 && <span className="text-xs text-blue-600 block">{formatNumber(journal.fee_amount)}</span>}
                                </td>
                                <td className="hidden sm:table-cell">
                                    <div className="flex justify-center gap-3">
                                        <button className="">
                                            <PencilIcon className="size-4 text-indigo-700 hover:scale-125 transtition-all duration-200" />
                                        </button>
                                        <button onClick={() => handleDeleteJournal(journal.id)} className="">
                                            <TrashIcon className="size-4 text-red-600 hover:scale-125 transtition-all duration-200" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {totalPages > 1 && (
                <Pagination
                    className="w-full px-4"
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default JournalTable;
