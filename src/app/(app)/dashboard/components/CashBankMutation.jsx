"use client";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import Modal from "@/components/Modal";
import CreateMutationFromHq from "./CreateMutationFromHq";
import Pagination from "@/components/PaginateList";
import { FilterIcon, LoaderCircleIcon, MessageCircleWarningIcon, MoveRightIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import CreateJournal from "./CreateJournal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import useCashBankBalance from "@/libs/cashBankBalance";
import { mutate } from "swr";
import StatusBadge from "@/components/StatusBadge";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const CashBankMutation = ({ warehouse, warehouses, userRole, notification }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [cashBank, setCashBank] = useState([]);
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [journalsByWarehouse, setJournalsByWarehouse] = useState([]);
    const [isModalCreateMutationFromHqOpen, setIsModalCreateMutationFromHqOpen] = useState(false);
    const [isModalCreateJournalOpen, setIsModalCreateJournalOpen] = useState(false);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const [selectedJournalId, setSelectedJournalId] = useState(null);
    const [isModalDeleteJournalOpen, setIsModalDeleteJournalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const closeModal = () => {
        setIsModalCreateMutationFromHqOpen(false);
        setIsModalCreateJournalOpen(false);
        setIsModalFilterDataOpen(false);
        setIsModalDeleteJournalOpen(false);
    };

    const fetchCashBank = async () => {
        try {
            const response = await axios.get(`/api/get-cash-and-bank`);
            setCashBank(response.data.data); // Commented out as it's not used
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        }
    };

    useEffect(() => {
        fetchCashBank();
    }, []);

    const { accountBalance, error: accountBalanceError, loading: isValidating } = useCashBankBalance(selectedWarehouse, endDate);

    const fetchJournalsByWarehouse = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-journal-by-warehouse/${selectedWarehouse}/${endDate}/${endDate}`);
            setJournalsByWarehouse(response.data);
        } catch (error) {
            console.error(error);
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    const mutationInSumById = (acc_id) => {
        return journalsByWarehouse?.data?.reduce(
            (sum, journal) => (Number(journal.debt_code) === Number(acc_id) && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
            0
        );
    };

    const mutationOutSumById = (acc_id) => {
        return journalsByWarehouse.data?.reduce(
            (sum, journal) => (Number(journal.cred_code) === Number(acc_id) && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
            0
        );
    };

    useEffect(() => {
        fetchJournalsByWarehouse();
    }, [selectedWarehouse, endDate]);

    useEffect(() => {
        mutate(`/api/get-cash-bank-balance/${selectedWarehouse}/${endDate}`);
    }, [journalsByWarehouse, endDate]);

    const mutationInSum = accountBalance?.data?.chartOfAccounts?.reduce((sum, acc) => sum + mutationInSumById(acc.id), 0);

    const mutationOutSum = accountBalance?.data?.chartOfAccounts?.reduce((sum, acc) => sum + mutationOutSumById(acc.id), 0);

    const [searchTerm, setSearchTerm] = useState("");
    const [checkedAccounts, setCheckedAccounts] = useState(null);
    const filteredJournals = journalsByWarehouse.data?.filter((journal) => {
        if (!searchTerm) {
            return journal.trx_type === "Mutasi Kas";
        }
        return (
            journal.trx_type === "Mutasi Kas" &&
            (journal.cred.acc_name.toLowerCase().includes(searchTerm) || journal.debt.acc_name.toLowerCase().includes(searchTerm))
        );
    });

    const [currentPage, setCurrentPage] = useState(1);
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
            notification(response.data.message);
            fetchJournalsByWarehouse();
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        }
    };

    const hqCashBankIds = cashBank?.filter((cashBank) => cashBank.warehouse_id === 1)?.map((cashBank) => cashBank.id);

    return (
        <>
            <div className="mb-4 card">
                {loading || (isValidating && <LoaderCircleIcon size={20} className="animate-spin absolute top-2 text-slate-400 left-2" />)}
                <div className="px-4 sm:px-6 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <h1 className="card-title">
                        Mutasi Saldo
                        <span className="card-subtitle text-nowrap">Periode: {endDate}</span>
                    </h1>
                    <div className="sm:flex gap-2 w-full sm:col-span-2 h-fit">
                        {["Administrator", "Super Admin"].includes(userRole) && (
                            <div className="gap-2 sm:flex grid grid-cols-2 mb-2 sm:mb-0">
                                <button
                                    onClick={() => setIsModalCreateJournalOpen(true)}
                                    className="bg-indigo-500 text-sm sm:text-xs min-w-36 hover:bg-indigo-600 text-white py-4 sm:py-2 px-2 sm:px-6 rounded-lg"
                                >
                                    Jurnal Umum <PlusCircleIcon className="size-4 inline" />
                                </button>
                                <button
                                    onClick={() => setIsModalCreateMutationFromHqOpen(true)}
                                    className="bg-indigo-500 text-sm sm:text-xs min-w-36 hover:bg-indigo-600 text-white py-4 sm:py-2 px-2 sm:px-6 rounded-lg"
                                >
                                    Mutasi Saldo <PlusCircleIcon className="size-4 inline" />
                                </button>
                            </div>
                        )}
                        <div className="w-full flex justify-end gap-2 mb-2 sm:mb-0">
                            {["Administrator", "Super Admin"].includes(userRole) && (
                                <select
                                    value={selectedWarehouse}
                                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                                    className="form-select block w-fit p-2.5"
                                >
                                    {warehouses?.data?.map((warehouse) => (
                                        <option key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <button onClick={() => setIsModalFilterDataOpen(true)} className="small-button">
                                <FilterIcon className="size-4" />
                            </button>
                            <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                                <div className="mb-4">
                                    <Label className="font-bold">Tanggal</Label>
                                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control" />
                                </div>
                                <button
                                    onClick={() => {
                                        fetchJournalsByWarehouse();
                                        setIsModalFilterDataOpen(false);
                                    }}
                                    className="btn-primary"
                                >
                                    Submit
                                </button>
                            </Modal>
                        </div>
                    </div>
                    <Modal isOpen={isModalCreateMutationFromHqOpen} onClose={closeModal} maxWidth={"max-w-lg"} modalTitle="Penambahan Saldo Kas & Bank">
                        <CreateMutationFromHq
                            cashBank={cashBank}
                            isModalOpen={setIsModalCreateMutationFromHqOpen}
                            notification={notification}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                            warehouses={warehouses?.data}
                        />
                    </Modal>
                    <Modal isOpen={isModalCreateJournalOpen} onClose={closeModal} modalTitle="Jurnal umum">
                        <CreateJournal
                            cashBank={cashBank}
                            isModalOpen={setIsModalCreateJournalOpen}
                            notification={notification}
                            warehouses={warehouses?.data}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                        />
                    </Modal>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full text-xs">
                        <thead>
                            <tr>
                                <th>Nama akun</th>
                                <th className="hidden sm:table-cell">Saldo Akhir</th>
                                <th>Masuk</th>
                                <th>Keluar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accountBalance?.data?.chartOfAccounts?.map((account, index) => (
                                <tr key={index}>
                                    <td>
                                        {account.acc_name}
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold block sm:hidden">
                                            {formatNumber(account.balance)}
                                        </span>
                                    </td>
                                    <td className="text-end font-bold hidden sm:table-cell">{formatNumber(account.balance ?? 0)}</td>
                                    <td className="text-end">{formatNumber(mutationInSumById(account.id) ?? 0)}</td>
                                    <td className="text-end">{formatNumber(mutationOutSumById(account.id) ?? 0)}</td>
                                </tr>
                            ))}
                            <tr>
                                <td className="font-bold ">{Number(selectedWarehouse) === 1 ? "Penambahan saldo ke Cabang" : "Penambahan saldo dari HQ"}</td>
                                <td className="text-end font-bold hidden sm:table-cell"></td>
                                <td className="text-end font-bold"></td>
                                <td className="text-end font-bold">
                                    {(() => {
                                        const remaining = mutationInSum - mutationOutSum;

                                        if (remaining === 0) {
                                            return <span className="text-green-600">Completed</span>;
                                        }

                                        if (loading || isValidating) {
                                            return "...";
                                        }

                                        return <span className="text-red-600 dark:text-red-400">{formatNumber(remaining)}</span>;
                                    })()}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="">
                                <th>
                                    Total{" "}
                                    <span className="font-bold text-blue-500 block sm:hidden">
                                        {loading ||
                                            (isValidating && formatNumber(accountBalance?.data?.chartOfAccounts?.reduce((sum, acc) => sum + acc.balance, 0)))}
                                    </span>
                                </th>
                                <th className="text-end font-bold hidden sm:table-cell">
                                    {loading || isValidating
                                        ? "..."
                                        : formatNumber(accountBalance?.data?.chartOfAccounts?.reduce((sum, acc) => sum + acc.balance, 0))}
                                </th>
                                <th className="text-end">{loading || isValidating ? "..." : formatNumber(mutationInSum)}</th>
                                <th className="text-end">{loading || isValidating ? "..." : formatNumber(mutationOutSum)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="mb-4 card">
                <h1 className="px-2 sm:px-6 pt-6 font-bold text-xl text-green-600">History Mutasi Kas</h1>
                <div className="px-2 sm:px-6 pt-2 flex gap-2">
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
                <div className="overflow-x-auto">
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
                                    <td colSpan={2}>Loading ...</td>
                                </tr>
                            ) : currentItems?.length === 0 ? (
                                <tr className="text-center">
                                    <td colSpan={3}>Tidak ada data</td>
                                </tr>
                            ) : (
                                currentItems.map((journal, index) => (
                                    <tr key={index}>
                                        <td className="">
                                            <span className="block font-bold text-slate-500 dark:text-yellow-200">
                                                {formatDateTime(journal.created_at)} | {journal.invoice}
                                            </span>
                                            {journal.cred.acc_name} <MoveRightIcon className="size-5 inline" /> {journal.debt.acc_name}
                                            <span className="block sm:hidden font-bold text-blue-500">{formatNumber(journal.amount)}</span>
                                        </td>
                                        <td className="text-end hidden sm:table-cell text-lg font-bold">{formatNumber(journal.amount)}</td>
                                        <td className="text-center">
                                            <StatusBadge
                                                status={journal.status === 0 ? "In Progress" : "Completed"}
                                                statusText={journal.status === 0 ? "Dalam Pengiriman" : "Sudah Diterima"}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedJournalId(journal.id);
                                                    setIsModalDeleteJournalOpen(true);
                                                }}
                                                hidden={userRole !== "Administrator"}
                                                disabled={!hqCashBankIds.includes(journal.cred_code)}
                                                className="cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed text-red-600 hover:scale-125 transition-all group-hover:text-white duration-200"
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <Pagination
                            className="w-full px-2 sm:px-6 pb-6"
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
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
        </>
    );
};

export default CashBankMutation;
