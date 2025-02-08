"use client";

import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import axios from "@/libs/axios";
import { useState } from "react";
import Pagination from "@/components/PaginateList";
import { ArrowRightIcon, FilterIcon, MessageCircleWarningIcon, PencilIcon, TrashIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import EditJournal from "./EditJournal";
import TimeAgo from "@/libs/formatDateDistance";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const JournalTable = ({ cashBank, journalsByWarehouse, warehouses, warehouse, warehouseId, notification, fetchJournalsByWarehouse, user }) => {
    const [selectedAccount, setSelectedAccount] = useState("");
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isModalFilterJournalOpen, setIsModalFilterJournalOpen] = useState(false);
    const [isModalDeleteJournalOpen, setIsModalDeleteJournalOpen] = useState(false);
    const [isModalEditJournalOpen, setIsModalEditJournalOpen] = useState(false);
    const [selectedJournalId, setSelectedJournalId] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const userRole = user?.role?.role;
    const warehouseCash = user?.role?.warehouse?.chart_of_account_id;
    const closeModal = () => {
        setIsModalFilterJournalOpen(false);
        setIsModalDeleteJournalOpen(false);
        setIsModalEditJournalOpen(false);
    };

    const handleDeleteJournal = async (id) => {
        try {
            const response = await axios.delete(`/api/journals/${id}`);
            notification(response.data.message);
            fetchJournalsByWarehouse();
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        }
    };

    const branchAccount = cashBank.filter((cashBank) => cashBank.warehouse_id === Number(selectedWarehouse));
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
            <div className="px-4 flex gap-2">
                <select
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="rounded-md hidden sm:block border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
                    value={selectedAccount}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
                                {warehouses.map((w) => (
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
            <div className="px-4">
                <h4 className="text-xs text-slate-500">
                    {warehouses.find((w) => w.id === Number(selectedWarehouse))?.name} Periode {startDate} s/d {endDate}
                </h4>
            </div>
            <div className="overflow-x-auto">
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
                                <tr key={index} className="hover:bg-slate-100">
                                    <td>
                                        <span className="text-xs text-slate-500 block">
                                            #{journal.id} {formatDateTime(journal.created_at)}{" "}
                                            <span className="font-bold hidden sm:inline">{journal.invoice}</span>
                                        </span>
                                        Note: {journal.description}
                                        <span className="font-bold text-xs block">
                                            {journal.debt_code === warehouseCash ? journal.cred.acc_name : journal.debt.acc_name}{" "}
                                        </span>
                                        <span className="text-xs block text-slate-500">
                                            Last update at <TimeAgo timestamp={journal.updated_at} />
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
                                                <PencilIcon className="size-4 text-indigo-700" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedJournalId(journal.id);
                                                    setIsModalDeleteJournalOpen(true);
                                                }}
                                                disabled={["Voucher & SP", "Accessories"].includes(journal.trx_type)}
                                                className=" disabled:text-slate-300 disabled:cursor-not-allowed text-red-600 hover:scale-125 transtition-all duration-200"
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
                    journal={selectedJournalId}
                    branchAccount={branchAccount}
                    notification={notification}
                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                />
            </Modal>
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
